import { supabase } from "./supabase";

// Couche d'abstraction : Supabase si disponible, localStorage sinon
export const db = {
  async getFavoris() {
    if (supabase) {
      const { data } = await supabase.from("favoris").select("*").order("created_at", { ascending: false });
      return data || [];
    }
    try { return JSON.parse(localStorage.getItem("bf-favs") || "[]"); } catch { return []; }
  },

  async addFavori(vehicle) {
    if (supabase) {
      const { data } = await supabase.from("favoris").insert([{ ...vehicle, created_at: new Date().toISOString() }]).select();
      return data?.[0];
    }
    const favs = await this.getFavoris();
    favs.unshift({ ...vehicle, id: Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem("bf-favs", JSON.stringify(favs));
    return vehicle;
  },

  async removeFavori(key) {
    if (supabase) {
      await supabase.from("favoris").delete().eq("key", key);
      return;
    }
    const favs = await this.getFavoris();
    localStorage.setItem("bf-favs", JSON.stringify(favs.filter(f => f.key !== key)));
  },

  async getPurchases() {
    if (supabase) {
      const { data } = await supabase.from("purchases").select("*").order("created_at", { ascending: false });
      return data || [];
    }
    try { return JSON.parse(localStorage.getItem("bf-purchases") || "[]"); } catch { return []; }
  },

  async addPurchase(purchase) {
    if (supabase) {
      const { data } = await supabase.from("purchases").insert([{ ...purchase, created_at: new Date().toISOString() }]).select();
      return data?.[0];
    }
    const purchases = await this.getPurchases();
    purchases.unshift({ ...purchase, id: Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem("bf-purchases", JSON.stringify(purchases));
    return purchase;
  },

  async removePurchase(id) {
    if (supabase) {
      await supabase.from("purchases").delete().eq("id", id);
      return;
    }
    const purchases = await this.getPurchases();
    localStorage.setItem("bf-purchases", JSON.stringify(purchases.filter(p => p.id !== id)));
  },

  async getScanHistory() {
    if (supabase) {
      const { data } = await supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(20);
      return data || [];
    }
    try { return JSON.parse(localStorage.getItem("bf-scans") || "[]"); } catch { return []; }
  },

  async saveScan(results) {
    const scan = { vehicle_count: results.length, top_deals: results.filter(r => r.sc >= 70).length, created_at: new Date().toISOString() };
    if (supabase) {
      await supabase.from("scans").insert([scan]);
    } else {
      const scans = await this.getScanHistory();
      scans.unshift(scan);
      localStorage.setItem("bf-scans", JSON.stringify(scans.slice(0, 20)));
    }
  },
};
