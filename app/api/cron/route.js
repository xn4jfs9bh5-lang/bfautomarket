export async function GET(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ error: "No key" }, { status: 500 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: "Find Toyota Hilux diesel under 10000 EUR in Germany Belgium. Real listings with prices. JSON: {\"vehicles\":[{\"title\":\"\",\"price_eur\":0,\"location\":\"\",\"link\":\"\"}]}" }],
      }),
    });

    const data = await res.json();
    return Response.json({ success: true, timestamp: new Date().toISOString(), data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
