# 🚀 COD E-Commerce Platform - Supabase Edition

A professional, high-performance Cash on Delivery (COD) E-Commerce store management and storefront platform with direct **Supabase (PostgreSQL)** database integration.

---

## 🏗️ Architecture Summary
- **Frontend**: React 18+ with Vite, Tailwind CSS, and Lucide icons.
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`).
- **Integrations**: Multi-Google Sheets webhooks, CodZoss API, Facebook Pixel, TikTok Pixel, Google Ads Pixel.

---

## ⚙️ Supabase Configuration

### 1. Environment Variables (`.env` or `.env.example`)
Set the following environment variables:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Admin Panel Setup
1. Log in to the Admin Panel (`/admin` or via the top navigation bar).
2. Go to **Intégrations ➔ Supabase**.
3. Enter your **Project URL** and **Anon Key**.
4. Click **Tester Connexion** to verify connection.
5. Click **Copier Script SQL** and execute it in your Supabase Dashboard **SQL Editor** to create the `orders` and `products` tables automatically.
