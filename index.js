import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-site.github.io",
          "X-Title": "Jarvis"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are JARVIS, Tony Stark's AI assistant. You respond confidently, intelligently, and concisely. You ALWAYS respond."
            },
            { role: "user", content: prompt }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "I am online, sir."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Backend failure, sir." });
  }
});

app.listen(3000, () => console.log("Jarvis backend running"));
