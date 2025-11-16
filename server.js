// server.js
// -------------------- IMPORTS --------------------
import express from 'express';           // Web framework
import cors from 'cors';                 // Cross-Origin Resource Sharing
import axios from 'axios';               // HTTP client to call Grist API
import multer from 'multer';             // Handle file uploads
import dotenv from 'dotenv';             // Load .env variables
import FormData from 'form-data';        // Multipart form for attachments
import path from 'path';                 
import { fileURLToPath } from 'url';     
import fetch from "node-fetch"; // make sure to install node-fetch

dotenv.config(); // Load environment variables from .env

// -------------------- SETUP --------------------
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grist API config
const gristApiKey = process.env.GRIST_API_KEY;
const gristBaseUrl = process.env.GRIST_BASE_URL;
const gristDocId = process.env.GRIST_DOC_ID;

// The API base can point to Ollama or OpenAI.
// For Ollama, default is http://localhost:11434/v1
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3000";
const AI_PROVIDER = process.env.AI_PROVIDER || "selfhosted";
const AI_API_BASE = process.env.AI_API_BASE || "http://localhost:11434";
const AI_API_KEY = process.env.AI_API_KEY || "ollama"; // dummy key (Ollama doesn’t need one)
const IMAGE_MODEL = process.env.IMAGE_MODEL || "gpt-4o-mini";
const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-4o-mini";

// Exit if critical variables are missing
if (!gristApiKey || !gristBaseUrl || !gristDocId) {
  console.error("Missing GRIST environment variables");
  process.exit(1);
}

// Default Axios config with Authorization header
const axiosConfig = {
  headers: {
    Authorization: `Bearer ${gristApiKey}`,
    "Content-Type": "application/json"
  }
};

// Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());          // Allow cross-origin requests
app.use(express.json());  // Parse JSON request bodies
app.use(express.static(__dirname)); // Serve static files (optional)

// Multer for handling attachments in memory
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- HELPER --------------------
// Wraps data in Grist 'records' array if not already
function wrapRecords(data) {
  if (Array.isArray(data.records)) return data;           // Already wrapped
  if (Array.isArray(data)) return { records: data.map(f => ({ fields: f })) };
  return { records: [{ fields: data }] };
}

// -------------------- LOCATIONS --------------------

// GET /locations
// Output: JSON array of location records
app.get("/api/locations", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Locations/records`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /locations
// Input: JSON object with fields, e.g., { Name: "Pantry" }
// Output: JSON object of created record
app.post("/api/locations", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Locations/records`;
    const body = wrapRecords(req.body);
    const response = await axios.post(url, body, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- FOOD --------------------

// GET /food
// Output: JSON array of food records
app.get("/api/food", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /food
// Input: JSON object with fields, e.g., { Name: "Bananas", Location: 1, Quantity: 6, Owner: "Justin" }
// Output: JSON object of created food record
app.post("/api/food", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records`;
    const body = wrapRecords(req.body);
    const response = await axios.post(url, body, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /food/:id
// Input: URL param :id of the food record, JSON body with fields to update
// Example: { Quantity: 12 }
// Output: JSON object of updated record
app.patch("/api/food/:id", async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const body = { records: [{ id: recordId, fields: req.body }] };
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records`;
    const response = await axios.patch(url, body, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /food/:id
// Deletes a single food record and cleans up unused attachments
app.delete("/api/food/:id", async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);

    // 1️⃣ Delete the food record
    const deleteUrl = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/data/delete`;
    const deleteBody = [recordId]; // Grist expects a plain array of IDs
    await axios.post(deleteUrl, deleteBody, axiosConfig);

    // 2️⃣ Remove unused attachments
    const removeUnusedUrl = `${gristBaseUrl}/api/docs/${gristDocId}/attachments/removeUnused`;
    await axios.post(removeUnusedUrl, null, {
      headers: {
        // Only send the Authorization header, NOT the Content-Type
        Authorization: `Bearer ${gristApiKey}`
      }
    });

    res.json({ success: true, deletedId: recordId, attachmentsCleaned: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ATTACHMENTS --------------------

// GET /attachments
// Output: JSON array of attachments
app.get("/api/attachments", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/attachments`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /attachments
// Form field: file
// Input: multipart/form-data with "file" field
// Output: JSON object of uploaded attachment ID
app.post("/api/attachments", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = `${gristBaseUrl}/api/docs/${gristDocId}/attachments`;
    const formData = new FormData();
    formData.append("upload", req.file.buffer, req.file.originalname);

    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${gristApiKey}`,
        ...formData.getHeaders()  // required for multipart/form-data
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- AI ENDPOINTS --------------------

// POST /api/analyzeImage
// Input: multipart/form-data with "image" field
// Output: A pre-parsed JSON object: { item: "...", expiration_days: ... }
app.post("/api/analyzeImage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    // 1. Define the exact JSON schema Ollama should use
    const aiJsonSchema = {
      type: "object",
      properties: {
        item: { 
          type: "string",
          description: "The name of the grocery item. Example: Apple"
        },
        expiration_days: {
          type: "integer",
          description: "The average number of days the item is good for. Example: 7"
        },
        notes: {
          type: ["string", "null"],
          description: "A brief note about the item, or null if no notes."
        }
      },
      required: ["item", "expiration_days", "notes"]
    };

    // 2. Define the AI payload for the microservice
    const payload = {
        model: IMAGE_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content: "You are a vision model. You identify grocery items from images and estimate their expiration. " +
                     "You MUST respond ONLY with a valid JSON object that strictly adheres to the provided schema. " +
                     "Do not include any other text or markdown. "
          },
          {
            role: "user",
            content: "Analyze the item in this image and provide the structured JSON response."
          }
        ],
        providerType: AI_PROVIDER,
        apiKey: AI_API_KEY || null,
        modelUrl: AI_API_BASE || null,
        format: aiJsonSchema,
        
        think: false,
        temperature: 0.2, // Low temp is good for JSON
        maxTokens: 1000   // Give it enough room for the JSON
    };

    // 3. Create FormData to send to the microservice
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    formData.append('image', req.file.buffer, req.file.originalname);

    // 4. Call the microservice's unified /api/chat endpoint
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || `AI microservice error: ${response.status}`);
    }

    // 5. Get the microservice's JSON response
    const data = await response.json();
    console.log("Raw response from AI microservice (image):", data);

    // 6. --- CLEANING & PARSING LOGIC ---
    let jsonString = data.content.trim();
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }

    // Parse the cleaned string *on the server*
    const aiJson = JSON.parse(jsonString);
    
    // 7. Send the *clean, pre-parsed JSON object* to the frontend
    res.json(aiJson);

  } catch (err) {
    console.error("Error proxying image analysis:", err.message || err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

// Conversational completion using food items as context
app.post("/api/pantryChat", async (req, res) => {
  try {
    // 1. We receive JSON from index.html
    const { items, message } = req.body;
    if (!items || !message) return res.status(400).json({ error: "Missing items or message" });

    // 2. Build context and payload for the microservice
    const context = items
      .map(i => `${i.Name} (x${i.Quantity}) expiring on ${new Date(i.Expiration * 1000).toDateString()}`)
      .join("\n");

    // We hardcode 'stream: true' because this endpoint is always streaming
    const payload = {
      providerType: AI_PROVIDER,
      model: CHAT_MODEL,
      messages: [
              {
                role: "system",
                content: `You are a helpful pantry assistant. Pantry contents:\n${context}`
              },
              { role: "user", content: message }
            ],
      stream: true,
      apiKey: AI_API_KEY || null,
      modelUrl: AI_API_BASE || null,
      think: true,
      temperature: 0.7,
      maxTokens: 4000
    };

    // 3. Create FormData to send to the microservice
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    // We send no image for this endpoint

    // 4. Call the microservice's unified /api/chat endpoint
    const response = await fetch(AI_SERVICE_URL + "/api/chat", {
        method: 'POST',
        headers: formData.getHeaders(),
        body: formData
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }

    // 5. Pipe the streaming response directly back to index.html
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Transfer-Encoding', 'chunked');
    response.body.pipe(res);

  } catch (err) {
    console.error("Error in pantryChat:", err.response?.data || err.message || err);
    if (!res.headersSent) {
      res.status(500).json({ error: `AI service call failed: ${err.message}` });
    }
  }
});

// -------------------- START SERVER --------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
