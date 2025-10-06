// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

dotenv.config();

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grist API configuration
const gristApiKey = process.env.GRIST_API_KEY;
const gristBaseUrl = process.env.GRIST_BASE_URL;
const gristDocId = process.env.GRIST_DOC_ID;

if (!gristApiKey || !gristBaseUrl || !gristDocId) {
    console.error('Error: GRIST_API_KEY, GRIST_BASE_URL, or GRIST_DOC_ID not found.');
    process.exit(1);
}

const axiosConfig = {
  headers: {
    "Authorization": `Bearer ${gristApiKey}`,
    "Content-Type": "application/json"
  }
};

// Initialize app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Optional static folder

// Multer setup for attachments
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- Locations Endpoints --------------------

// Fetch Locations
app.get("/locations", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Locations/records`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Location
app.post("/locations", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Locations/records`;
    const response = await axios.post(url, { fields: req.body }, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Food Endpoints --------------------

// Fetch Food Items
app.get("/food", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Food Item
app.post("/food", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records`;
    const response = await axios.post(url, { fields: req.body }, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Food Item
app.patch("/food/:id", async (req, res) => {
  try {
    const recordId = req.params.id;
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records/${recordId}`;
    const response = await axios.patch(url, { fields: req.body }, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Food Item
app.delete("/food/:id", async (req, res) => {
  try {
    const recordId = req.params.id;
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/tables/Food/records/${recordId}`;
    const response = await axios.delete(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Attachments Endpoints --------------------

// Fetch Attachments
app.get("/attachments", async (req, res) => {
  try {
    const url = `${gristBaseUrl}/api/docs/${gristDocId}/attachments`;
    const response = await axios.get(url, axiosConfig);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Attachment
app.post("/attachments", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = `${gristBaseUrl}/api/docs/${gristDocId}/attachments`;
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(url, formData, {
      headers: {
        ...axiosConfig.headers,
        ...formData.getHeaders()
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Start Server --------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
