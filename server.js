import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 3000);
const LLM_API_URL = process.env.LLM_API_URL || process.env.OLLAMA_API_URL || process.env.OPENAI_API_BASE || "http://127.0.0.1:11434/api/chat";
const MODEL = process.env.LLM_MODEL || process.env.OPENAI_MODEL || "llama3";
const API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || "";
const REQUEST_TIMEOUT_MS = 30000;

const SYSTEM_PROMPT = `ROLE:
You are a trauma-informed AI support tool. You are not a therapist, partner, or authority.

CORE PRINCIPLES:
- Center dignity, autonomy, and human rights
- Do not generalize individual experiences to entire groups
- Avoid stigma, moral panic, or pathologizing identities or professions
- Be transparent about uncertainty and limits

HUMAN NLP CHECK (Apply BEFORE every response):
1. ANCHOR
2. MIRROR
3. REFRAME
4. RAPPORT

OUTPUT STYLE:
ANCHOR:\n...\n\nMIRROR:\n...\n\nREFRAME:\n...\n\nRAPPORT:\n...`;

function buildMessages(userMessage) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
}

function normalizeResponse(payload) {
  if (!payload || typeof payload !== "object") {
    return "I’m sorry—no response content was returned by the model.";
  }

  if (typeof payload.response === "string" && payload.response.trim()) {
    return payload.response.trim();
  }

  if (payload.message && typeof payload.message.content === "string" && payload.message.content.trim()) {
    return payload.message.content.trim();
  }

  const firstChoice = Array.isArray(payload.choices) ? payload.choices[0] : null;
  if (firstChoice?.message?.content && typeof firstChoice.message.content === "string") {
    const content = firstChoice.message.content.trim();
    if (content) return content;
  }

  if (typeof firstChoice?.text === "string" && firstChoice.text.trim()) {
    return firstChoice.text.trim();
  }

  return "I’m sorry—I could not parse a complete response from the model.";
}

function isOpenAIStyleUrl(url) {
  return /\/v1\/(chat\/completions|responses)/i.test(url);
}

function createRequestBody(userMessage) {
  const messages = buildMessages(userMessage);

  if (isOpenAIStyleUrl(LLM_API_URL)) {
    if (/\/v1\/responses/i.test(LLM_API_URL)) {
      return {
        model: MODEL,
        input: messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n"),
      };
    }

    return {
      model: MODEL,
      messages,
      temperature: 0.6,
      stream: false,
    };
  }

  return {
    model: MODEL,
    messages,
    stream: false,
  };
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body?.message;

  if (typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({ response: "Please send a non-empty string in `message`." });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const requestBody = createRequestBody(userMessage.trim());
    const headers = { "Content-Type": "application/json" };

    if (API_KEY) {
      headers.Authorization = `Bearer ${API_KEY}`;
    }

    console.log("[chat] sending request", {
      url: LLM_API_URL,
      model: MODEL,
      hasApiKey: Boolean(API_KEY),
    });

    const upstream = await fetch(LLM_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const rawText = await upstream.text();
    let json;

    try {
      json = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      console.error("[chat] parse error", parseError);
      return res.status(502).json({ response: "The model returned an unreadable response." });
    }

    if (!upstream.ok) {
      const detail = typeof json?.error === "string" ? json.error : JSON.stringify(json);
      console.error("[chat] upstream error", upstream.status, detail);
      return res.status(502).json({ response: `Model request failed (${upstream.status}).` });
    }

    const response = normalizeResponse(json);
    console.log("[chat] success", { length: response.length });
    return res.json({ response });
  } catch (error) {
    if (error?.name === "AbortError") {
      console.error("[chat] timeout after 30s");
      return res.status(504).json({ response: "The model took too long to respond. Please try again." });
    }

    console.error("[chat] internal error", error);
    return res.status(500).json({ response: "Something went wrong while processing your request." });
  } finally {
    clearTimeout(timeoutId);
  }
});

app.get("/health", (_req, res) => {
  res.json({ response: "ok" });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
