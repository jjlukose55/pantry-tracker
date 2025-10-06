import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grist API key, base URL, and doc ID
const gristApiKey = process.env.GRIST_API_KEY;
const gristBaseUrl = process.env.GRIST_BASE_URL;
const gristDocId = process.env.GRIST_DOC_ID;

// Check if critical environment variables are set
if (!gristApiKey || !gristBaseUrl || !gristDocId) {
    console.error('Error: GRIST_API_KEY, GRIST_BASE_URL, or GRIST_DOC_ID not found.');
    process.exit(1);
}

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to proxy all Grist API requests (GET, POST, PATCH, DELETE)
// This endpoint will use the secure GRIST_DOC_ID from the environment, ignoring the one from the URL.
app.all('/api/docs/:docId/tables/:tableId/records/:recordId?', async (req, res) => {
    const { tableId, recordId } = req.params;
    const gristUrl = `${gristBaseUrl}/api/docs/${gristDocId}/tables/${tableId}/records${recordId ? `/${recordId}` : ''}`;
    const method = req.method;
    const headers = {
        'Authorization': `Bearer ${gristApiKey}`,
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
    };
    
    let body;
    if (method === 'POST' || method === 'PATCH') {
        body = JSON.stringify(req.body);
    } else if (method === 'DELETE' && req.body.ids) {
        body = JSON.stringify({ ids: req.body.ids });
    }

    try {
        const response = await fetch(gristUrl, { method, headers, body });
        console.log(response)
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy request failed:', error);

        res.status(500).json({ error: 'Failed to proxy request to Grist' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
