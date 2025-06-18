const express = require("express");
const cors = require("cors");
const app = express();
const router = express.Router();
const PORT = 4000;
const API_KEY = "V5M8SFxH.2dOAo6JEqtu6z1eWY85CLPPraR6ph32h";
const AGENT = "30b037c8-c62f-4f99-8274-56e409304d9d";

// Store the latest summary
let latestSummary = '';

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

router.post("/send-worksheet", async (req, res) => {
  try{
    const { worksheet } = req.body;
    console.log(worksheet);
    
    // Send the worksheet data to the frontend via WebSocket or store it for retrieval
    // For now, we'll store it in a global variable that can be accessed by a GET endpoint
    global.currentWorksheet = worksheet;
    
    res.status(200).json({ message: "Worksheet sent" });
  } catch (err) {
    console.error("Proxy server error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// Add a GET endpoint to retrieve the worksheet
router.get("/get-worksheet", async (req, res) => {
  try {
    if (global.currentWorksheet) {
      res.status(200).json({ worksheet: global.currentWorksheet });
    } else {
      res.status(404).json({ message: "No summary available" });
    }
  } catch (err) {
    console.error("Error retrieving summary:", err);
    res.status(500).json({ error: "Error retrieving summary", details: err.message });
  }
});

// New endpoint to receive conversation summaries
app.post("/summary", async (req, res) => {
  try {
    console.log("Received conversation summary:", req.body);
    latestSummary = req.body.summary || 'No summary provided';
    res.status(200).json({ success: true, message: "Summary received" });
  } catch (err) {
    console.error("Error handling summary:", err);
    res.status(500).json({ error: "Summary error", details: err.message });
  }
});

// Endpoint to get the latest summary
app.get("/get-summary", async (req, res) => {
  try {
    res.status(200).json({ summary: latestSummary });
  } catch (err) {
    console.error("Error getting summary:", err);
    res.status(500).json({ error: "Get summary error", details: err.message });
  }
});

module.exports = router;

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
