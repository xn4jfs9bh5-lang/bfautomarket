// =============================================
// API ROUTE SÉCURISÉE — /api/agent
// La clé API Anthropic est UNIQUEMENT côté serveur
// Le frontend n'y a JAMAIS accès
// =============================================

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// Rate limiting en mémoire (par IP)
const rateLimits = new Map();
const MAX_REQUESTS = 30; // par heure par IP
const WINDOW = 3600000;  // 1 heure

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip) || { count: 0, reset: now + WINDOW };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + WINDOW; }
  entry.count++;
  rateLimits.set(ip, entry);
  if (entry.count > MAX_REQUESTS) return false;
  return true;
}

export async function POST(request) {
  try {
    // Vérifier la clé API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 });
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return Response.json({ error: "Trop de requêtes. Attends un peu." }, { status: 429 });
    }

    // Lire le body
    const body = await request.json();

    // Sécurité : limiter les tokens
    const maxTokens = Math.min(body.max_tokens || 4000, 4000);

    // Construire la requête Anthropic
    const anthropicBody = {
      model: body.model || MODEL,
      max_tokens: maxTokens,
      messages: body.messages || [],
    };

    // Ajouter les outils si présents
    if (body.tools) anthropicBody.tools = body.tools;
    if (body.mcp_servers) anthropicBody.mcp_servers = body.mcp_servers;

    // Appel à Anthropic
    const response = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic error:", response.status, error);
      return Response.json(
        { error: `Erreur API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error("Agent API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
