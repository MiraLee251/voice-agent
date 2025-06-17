const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

const API_KEY = "V5M8SFxH.2dOAo6JEqtu6z1eWY85CLPPraR6ph32h";

app.use(cors());
app.use(express.json());

app.post("/create-call", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`https://api.ultravox.ai/api/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({systemPrompt: req.body.systemPrompt, model: req.body.model, voice: req.body.voice}),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ultravox API error:", data);
      return res.status(response.status).json(data);
    }
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy server error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
