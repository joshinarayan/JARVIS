import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/ask", async (req, res) => {
  const prompt = req.body.prompt;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer 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`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const j = await r.json();
  res.json({ reply: j.choices[0].message.content });
});

app.listen(3000, () => console.log("Jarvis online"));
