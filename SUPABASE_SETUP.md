# Supabase Persistent Cloud Storage Setup Guide

Upgrade the Briefs Studio platform to support **zero-configuration persistent cloud storage** in less than 1 minute. Follow the simple steps below to provision a free database and sync your entire briefs network.

---

## 🚀 1. Provision a Free Supabase Database
1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click **New Project** and name it (e.g., `briefs-studio`).
3. Set a database password, select your closest region, and hit **Create New Project**.

---

## 💾 2. Run the Table Setup SQL Schema
1. In the Supabase Sidebar, click on **SQL Editor**.
2. Click **New Query** to create a blank script workspace.
3. Copy, paste, and run the following SQL block to create your `briefs` table:

```sql
-- 1. Enable the pgvector extension to store high-stakes semantic embeddings
create extension if not exists vector;

-- 2. Create the unified briefs table supporting vectors, structured narrative components, and bespoke styling
create table if not exists public.briefs (
    id text primary key,
    title text not null,
    client text not null,
    path text not null,
    type text not null,
    date text not null,
    description text not null,
    tags jsonb not null default '[]'::jsonb,
    style jsonb not null default '{}'::jsonb,
    notes text,
    archetype text,
    structured jsonb,
    embedding vector(1536) -- Handles text-embedding-3-small vectors
);

-- 3. Disable Row Level Security (RLS) for instant zero-configuration read/write access
-- (Alternatively, you can keep RLS enabled and use the policy rules below)
alter table public.briefs disable row level security;
```

> [!TIP]
> **Optional Security Policies (If keeping RLS Enabled)**:
> If you prefer to keep RLS active for production safety, run these additional queries instead of disabling RLS:
> ```sql
> alter table public.briefs enable row level security;
> 
> create policy "Allow public read access" on public.briefs for select using (true);
> create policy "Allow public insert" on public.briefs for insert with check (true);
> create policy "Allow public update" on public.briefs for update using (true) with check (true);
> ```

---

## 🔑 3. Configure Your Environment Variables
To connect Briefs Studio to your new database, retrieve your credentials from the Supabase dashboard (**Project Settings ➔ API**):
- **Project URL**: `SUPABASE_URL`
- **API Key (anon/public)**: `SUPABASE_ANON_KEY`

### Local Development
Create or modify your `server/.env` file in the root workspace folder:
```env
# Supabase Persistent Cloud Storage
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-public-key

# AI Model Configuration (Optional but recommended)
OPENAI_API_KEY=your-openai-api-key
```

### Vercel / Production Serverless Setup
Add these variables directly in your Vercel or Render hosting dashboards:
1. `SUPABASE_URL`
2. `SUPABASE_ANON_KEY`

---

## 🧠 4. Pure Luxury: Zero-Configuration Auto-Seeding!
You don't need to manually populate or export records. The database adapter file `server/db-adapter.js` features **automatic self-seeding**:
1. When you load the directory dashboard for the first time with Supabase connected, the adapter detects a fresh, empty table.
2. It automatically reads your 38 pre-existing client assets and vector maps from `briefs.json` and `server/db-vectors.json`.
3. It performs a seamless batch insert, populating your cloud database instantly with the entire library.

---

## 🌐 5. Dual-Runtime Offline Resilience
If Supabase is offline, running on a local workspace without internet, or loading via the `file://` protocol:
* The platform automatically falls back to local disk-writing (`briefs.json`, `db-vectors.json`, and `index.html`) to keep everything functional.
* Browser-side simulations ensure the strategy sandbox works seamlessly regardless of environment connectivity.
