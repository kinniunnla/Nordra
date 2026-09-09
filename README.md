# Nordra Prototype — Deployment Guide (no coding required)

This folder is a ready-to-deploy version of the Nordra app prototype. Follow these steps exactly and you'll have a live, shareable link in about 10 minutes.

## Step 1 — Put this project on GitHub

1. Go to [github.com](https://github.com) and create a free account (skip if you have one).
2. Click the **+** icon top-right → **New repository**.
3. Name it `nordra-prototype`, leave it Public, click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Drag every file and folder from this project into the upload box (including the `src` folder).
6. Click **Commit changes** at the bottom.

## Step 2 — Deploy it with Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up using your GitHub account (one click, no separate password needed).
2. Click **Add New… → Project**.
3. Find `nordra-prototype` in the list and click **Import**.
4. Vercel will auto-detect this is a Vite project — leave all settings as default.
5. Click **Deploy**.
6. Wait about a minute. You'll get a live link like `nordra-prototype.vercel.app` — that's your shareable app.

## That's it

Anyone with that link can open Nordra on their phone or computer, right in their browser — no app store, no install. Every time you want to update the app (new screens, new colors), just upload the changed file to GitHub the same way — Vercel automatically re-deploys within a minute.

## If something doesn't work

Take a screenshot of any error message Vercel shows during deployment and share it — most issues at this stage are one-line fixes.
