# Mock Mode Limitations

## The Problem

Your app is currently running in **Mock Mode** (using localStorage instead of Supabase database). This means:

- ❌ Trip data is stored **only in each user's browser**
- ❌ When you share an invite link, other users **cannot see your trip data**
- ❌ Each user sees their own localStorage data (or the Barcelona demo as fallback)
- ❌ Members tab shows mock data (Sarah, Mike, Chloe) instead of real users

## Why This Happens

localStorage is **per-browser, per-user**. When you create a "Paris" trip:
1. It's saved in YOUR browser's localStorage
2. When friend clicks invite link, they open it in THEIR browser
3. Their browser doesn't have your Paris trip data
4. App falls back to showing Barcelona demo trip

## The Solution: Enable Supabase Backend

To enable real multi-user trip sharing, you need to configure Supabase:

### Step 1: Check Your Supabase Configuration

Open `src/lib/supabaseClient.js` and check if you have valid Supabase credentials:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Step 2: Set Up Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Project Settings → API
5. Copy your:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY`

### Step 4: Set Up Database

Run the SQL scripts in the `database/` folder:
1. `schema.sql` - Creates tables
2. `rls_policies.sql` - Sets up security
3. `seed.sql` - (Optional) Adds demo data

### Step 5: Add to GitHub Secrets

For deployment to work, add these to GitHub:
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Step 6: Restart Development Server

```bash
npm run dev
```

## After Setup

Once Supabase is configured:
- ✅ Trips are stored in cloud database
- ✅ Invite links work across different users/browsers
- ✅ Real-time collaboration
- ✅ Members tab shows actual users
- ✅ All users see the same trip data

## Current Workaround (Mock Mode)

If you want to continue using mock mode for testing:
- All users must use the **same browser/device**
- Or manually recreate trips in each browser
- This is only suitable for single-user testing, not real collaboration
