# pantry-tracker

![Status](https://img.shields.io/badge/status-in_development-yellow)

> This project is currently under active development. Expect frequent changes and incomplete features.

![AI Assisted](https://img.shields.io/badge/flag-AI_Assisted-8A2BE2)

> This project was partially developed with the assistance of AI tools.  

---

## 📖 Overview

A simple vibe-coded utility application for tracking stored food. It aims to diminish food waste by helping keep users aware of what food they have at home. This application uses [Grist](https://github.com/gristlabs/grist-core) to manage data. 

---

## 🧩 Planned Features

- Streamline Food Entry

---

## 🚀 Current Progress

- [x] Fully integrate backend with Grist Spreadsheets

- [x] Integrate AI Chat
      
- [x] Implement Automatic Photo Analysis

---

## 🛠️ Tech Stack

Languages: HTML, JS, CSS

Frameworks/Libraries: [Axios](https://github.com/axios/), [ExpressJS](https://github.com/expressjs/)

Tools/Platforms: [Grist](https://github.com/gristlabs/grist-core)

---

## ⚙️ Setup

Prerequistes: 

- Docker

- Grist

Configure Grist Document with the following structure:

```
Document:
PantryTracker
-- Pages:
-- Food
-- -- Tables:
-- -- Locations
-- -- Food
```

Set Env Variables:

```
# GRIST SECRETS
GRIST_BASE_URL="<your-grist-url>"
GRIST_API_KEY="<your-grist-api-key>"
GRIST_DOC_ID="<your-grist-document-id>"

# AI SECRETS (Depends on [ai-module](https://github.com/jjlukose55/ai-module))
AI_SERVICE_URL="<ai-microservice-instance>"
AI_PROVIDER="<"selfhosted" or "openai">"
AI_API_BASE="<the-ai-host-address>"
AI_API_KEY="<your-api-key>"
IMAGE_MODEL="qwen3-vl:2b"
CHAT_MODEL="qwen3:8b"
```

---

## 📸 Screenshots

Images: 

![Preview Image](./assets/demo/preview_image_1.png)

---

## 💬 Contact

Author: Justin Lukose

🌐 jjluk.net

✉️ [jjlukose55@gmail.com]

---
