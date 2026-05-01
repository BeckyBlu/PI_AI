import express from "express";
import fetch from "node-fetch";
import { spawn } from "node:child_process";

const app = express();
app.use(express.json());
app.use(express.static("../app"));

const PORT = Number(process.env.PORT || 3000);
const API_ENDPOINT = process.env.CLOUDFLARE_API_ENDPOINT || "YOUR_API_ENDPOINT";
const API_KEY = process.env.CLOUDFLARE_API_KEY || "YOUR_KEY";

function runSherlock(username) {
  return new Promise((resolve, reject) => {
    const child = spawn("python", ["-m", "sherlock_project", username], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true, output: stdout.trim() });
      } else {
        resolve({ ok: false, code, output: stdout.trim(), error: stderr.trim() });
      }
    });
  });
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "A string `message` is required." });
    }

    const sherlockMatch = userMessage.match(/^\s*\/sherlock\s+([A-Za-z0-9._-]+)\s*$/i);
    if (sherlockMatch) {
      const username = sherlockMatch[1];
      const result = await runSherlock(username);
      return res.json({
        tool: "sherlock_project",
        username,
        result,
      });
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Upstream API request failed.",
        details: errorText,
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
