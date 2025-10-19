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

- Streamlined uploads of food items

- AI integration for recipe generation

---

## 🚀 Current Progress

- [x] Fully integrate backend with Grist Spreadsheets

- [ ] Integrate AI Chat

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
GRIST_BASE_URL="<your-grist-url>"
GRIST_API_KEY="<your-grist-api-key>"
GRIST_DOC_ID="<your-grist-document-id>"
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
