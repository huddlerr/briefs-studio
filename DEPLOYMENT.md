# 🚀 Deploying Briefs Studio to Persistent Cloud Servers

This guide details how to host **Briefs Studio** as a persistent, fully collaborative SaaS platform on cloud providers like **Railway.app** or **Render.com** (Option B). 

By hosting the Express server continuously in a containerized environment, **any visitor in the world** can visit the directory, incubate new strategy maps, and have them permanently written to the database and page registry in real time for all future visitors to see!

---

## 🛠️ Prerequisites
1. A **GitHub**, **GitLab**, or **Bitbucket** repository holding your rebranded `briefs-studio` codebase.
2. An account on [Railway.app](https://railway.app) or [Render.com](https://render.com).

---

## ⚡ Deployment Path 1: Railway (Recommended — 2 Minutes)

Railway is highly recommended because of its automatic Dockerfile detection, fast build speeds, and native support for persistent storage disks.

### Step 1: Connect your Git Repo
1. Go to your [Railway Dashboard](https://railway.app) and click **"New Project"**.
2. Select **"Deploy from GitHub repo"** and choose your `briefs-studio` repository.

### Step 2: Configure Environment Variables
Click **"Add Variables"** and insert your active API keys to power the Story Forensics model:
* `OPENAI_API_KEY` (Required for neural semantic vector comparisons and vector-based prompt matching)
* `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` (Optional, if you prefer utilizing Claude or Gemini as the underlying reframing engines)
* `PORT` = `4000` (Railway will automatically route public web traffic to this port)

### Step 3: Attach Persistent Storage (Ensures Briefs are Saved Forever)
Because cloud servers restart occasionally during code updates, we attach a persistent volume to preserve generated HTML maps and our vector database:
1. In your Railway project, click on the **briefs-studio** service block.
2. Select the **"Volumes"** tab and click **"Add Volume"**.
3. Name the volume (e.g., `briefs-data`) and set the **Mount Path** to `/app`. 
   *(This ensures that any HTML briefs generated in `/app/active/` or modifications to `/app/index.html` and `/app/briefs.json` are permanently written to a persistent cloud drive and survive all server updates.)*

### Step 4: Expose your Public Domain
1. Select your service block, click on the **"Settings"** tab.
2. Under the **"Networking"** section, click **"Generate Domain"** or link your own custom domain.
3. Railway will generate a secure `https://briefs-studio.up.railway.app` URL. Share it with your clients!

---

## ☁️ Deployment Path 2: Render.com (Native Web Service)

Render is another popular developer hosting platform that natively supports continuous Node.js apps and Docker containers.

### Step 1: Create a Web Service
1. Go to your [Render Dashboard](https://render.com) and click **"New +"** ➔ **"Web Service"**.
2. Connect your Git provider and select your `briefs-studio` repository.

### Step 2: Configure Build Settings
Render will automatically detect the repository configurations. Choose the following settings:
* **Runtime:** `Docker` (Render will build your secure container using our root `Dockerfile` automatically)
* **Instance Type:** `Free` or `Starter`

### Step 3: Add Advanced Configs & Disks
1. Under **"Environment Variables"**, click **"Add Environment Variable"** and define your `OPENAI_API_KEY`, `PORT` (`4000`), and other LLM keys.
2. Scroll to the **"Disks"** section, click **"Add Disk"**:
   * **Name:** `briefs-storage`
   * **Mount Path:** `/app`
   * **Size:** `1 GB` (More than enough for thousands of custom strategy briefs)

### Step 4: Deploy Service
1. Click **"Create Web Service"**.
2. Once Render finishes building, your custom live URL (e.g., `https://briefs-studio.onrender.com`) will be active and public!

---

## 🧪 Verifying the Deployment
1. Navigate to your live public link.
2. Open the **AI Sandbox Incubator** drawer.
3. Enter a raw client transcript and select a style archetype.
4. Click **🧬 Incubate Strategy Map**.
5. Once complete, refresh the browser page. The new bento card will remain loaded in the main directory grid for *every single user* visiting your site globally, and the digital strategy map will be fully operational and publicly shareable!
