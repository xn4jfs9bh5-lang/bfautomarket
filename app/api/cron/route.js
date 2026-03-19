const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

export async function GET(request) {
  try {
    const urlSecret = new URL(request.url).searchParams.get("secret");
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const urlSecret = new URL(request.url).searchParams.get("secret");
if (cronSecret && authHeader !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return Response.json({ error: "Non autorise" }, { status: 401 });
    }
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ error: "API key manquante" }, { status: 500 });
    const queries = [
      "Toyota Hilux diesel occasion moins 10000 EUR Allemagne Belgique",
      "Toyota RAV4 diesel occasion moins 10000 EUR Allemagne",
      "beforward.jp Toyota Hilux diesel LHD under 7000",
    ];
    let allVehicles = [];
    for (const q of queries) {
      try {
        const res = await fetch(ANTHROPIC_API, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: MODEL, max_tokens: 4000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: Sourcing auto Burkina. . JSON: {"vehicles":[{"source":"","title":"","price_eur":0,"location":"","link":""}]} }] }) });
        if (res.ok) { const data = await res.json(); const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || ""; try { const match = text.match(/(\{[\s\S]*\})/); if (match) { const parsed = JSON.parse(match[1]); if (parsed.vehicles) allVehicles.push(...parsed.vehicles); } } catch {} }
      } catch {}
      await new Promise(r => setTimeout(r, 2000));
    }
    return Response.json({ success: true, timestamp: new Date().toISOString(), vehiclesFound: allVehicles.length, vehicles: allVehicles.slice(0, 10) });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}
