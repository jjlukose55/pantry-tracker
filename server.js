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

dotenv.config(); // Load environment variables from .env

// -------------------- SETUP --------------------
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grist API config
const gristApiKey = process.env.GRIST_API_KEY;
const gristBaseUrl = process.env.GRIST_BASE_URL;
const gristDocId = process.env.GRIST_DOC_ID;

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
app.get("/locations", async (req, res) => {
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
app.post("/locations", async (req, res) => {
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
app.get("/food", async (req, res) => {
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
app.post("/food", async (req, res) => {
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
app.patch("/food/:id", async (req, res) => {
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
app.delete("/food/:id", async (req, res) => {
  try {
    const recordId = parseInt(req.params.id);

    // 1️⃣ Delete the food record
    const deleteUrl = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/data/delete`;
    const deleteBody = [recordId]; // Grist expects a plain array of IDs
    await axios.post(deleteUrl, deleteBody, axiosConfig);

    // 2️⃣ Remove unused attachments
    const removeUnusedUrl = `${gristBaseUrl}/api/docs/${gristDocId}/attachments/removeUnused`;
    await axios.post(removeUnusedUrl, '', axiosConfig); // Empty body

    res.json({ success: true, deletedId: recordId, attachmentsCleaned: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ATTACHMENTS --------------------

// GET /attachments
// Output: JSON array of attachments
app.get("/attachments", async (req, res) => {
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
app.post("/attachments", upload.single("file"), async (req, res) => {
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

// -------------------- START SERVER --------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
