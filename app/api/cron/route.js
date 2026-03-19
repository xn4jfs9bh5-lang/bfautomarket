// =============================================
// CRON JOB — /api/cron
// Scan automatique chaque matin à 7h
// Appelé par Vercel Cron ou un service externe
// =============================================

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export async function GET(request) {
  try {
    // Vérifier la clé secrète du cron
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY manquante" }, { status: 500 });
    }

    console.log("[CRON] Scan automatique démarré:", new Date().toISOString());

    // Scan les sites principaux
    const queries = [
      "Toyota Hilux diesel occasion moins 10000 EUR Allemagne Belgique",
      "Toyota RAV4 diesel occasion moins 10000 EUR Allemagne",
      "beforward.jp Toyota Hilux diesel LHD under $7000",
    ];

    let allVehicles = [];

    for (const q of queries) {
      try {
        const res = await fetch(ANTHROPIC_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 4000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{
              role: "user",
              content: `Sourcing auto Burkina. ${q}. Annonces réelles avec prix. JSON: {"vehicles":[{"source":"","title":"","price_eur":0,"year":0,"km":0,"fuel":"diesel","location":"","link":""}]}`
            }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
          try {
            const match = text.replace(/```json\s*/gi, "").replace(/```/g, "").match(/(\{[\s\S]*\})/);
            if (match) {
              const parsed = JSON.parse(match[1]);
              if (parsed.vehicles) allVehicles.push(...parsed.vehicles);
            }
          } catch {}
        }
      } catch (e) {
        console.error("[CRON] Erreur scan:", e.message);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`[CRON] ${allVehicles.length} véhicule(s) trouvé(s)`);

    // TODO: Sauvegarder dans Supabase + envoyer notification email
    // si opportunité avec marge > 3000€

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      vehiclesFound: allVehicles.length,
      vehicles: allVehicles.slice(0, 10), // max 10 dans la réponse
    });

  } catch (error) {
    console.error("[CRON] Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
