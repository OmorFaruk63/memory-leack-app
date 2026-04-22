# Deployment Guide — memory.omorfarukdev.me

This guide explains how to deploy the Memory Leak App to the subdomain **memory.omorfarukdev.me** using **GitHub Pages** (primary) or **Vercel / Netlify** (alternatives).

---

## 1. GitHub Pages (Recommended)

### How it works

- Every push to the `main` branch triggers the workflow in `.github/workflows/deploy.yml`.
- Vite builds the app into the `dist/` folder.
- GitHub Pages serves the `dist/` folder.
- The `public/CNAME` file tells GitHub Pages to use `memory.omorfarukdev.me` as the custom domain.

### One-time GitHub setup

1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, choose **GitHub Actions**.
4. Push to `main` once — the workflow runs and GitHub Pages activates automatically.

### One-time Namecheap DNS setup

1. Log in to [Namecheap](https://www.namecheap.com) and open **Domain List → omorfarukdev.me → Manage → Advanced DNS**.
2. Add the following DNS records (they allow GitHub Pages to verify and serve your subdomain):

   | Type  | Host   | Value                   | TTL  |
   |-------|--------|-------------------------|------|
   | CNAME | memory | OmorFaruk63.github.io.  | Auto |

   > Replace `OmorFaruk63` with your actual GitHub username if it differs.

3. Optionally, add GitHub Pages' IP addresses as **A records** on the apex domain for redundancy (only needed if you also serve the root domain from GitHub Pages):

   | Type | Host | Value          | TTL  |
   |------|------|----------------|------|
   | A    | @    | 185.199.108.153 | Auto |
   | A    | @    | 185.199.109.153 | Auto |
   | A    | @    | 185.199.110.153 | Auto |
   | A    | @    | 185.199.111.153 | Auto |

4. DNS changes can take up to **48 hours** to propagate worldwide (usually much faster).

### Enable HTTPS

After DNS propagates:

1. Go to **Settings → Pages** in your repository.
2. Tick **Enforce HTTPS** — GitHub provisions a free TLS certificate via Let's Encrypt automatically.

---

## 2. Vercel (Alternative)

1. Import your repository at [vercel.com/new](https://vercel.com/new).
2. Vercel auto-detects Vite — no extra configuration needed.
3. After the first deployment, go to **Project → Settings → Domains**.
4. Click **Add Domain** and enter `memory.omorfarukdev.me`.
5. Vercel will show the required DNS record. In **Namecheap → Advanced DNS** add:

   | Type  | Host   | Value                   | TTL  |
   |-------|--------|-------------------------|------|
   | CNAME | memory | cname.vercel-dns.com.   | Auto |

6. Wait for DNS propagation, then click **Verify** in the Vercel dashboard.
7. Vercel provisions HTTPS automatically.

---

## 3. Netlify (Alternative)

1. Import your repository at [app.netlify.com](https://app.netlify.com).
2. Set the **Build command** to `npm run build` and the **Publish directory** to `dist`.
3. After the first deployment, go to **Site Settings → Domain Management → Add custom domain**.
4. Enter `memory.omorfarukdev.me` and follow the instructions.
5. In **Namecheap → Advanced DNS** add:

   | Type  | Host   | Value                              | TTL  |
   |-------|--------|------------------------------------|------|
   | CNAME | memory | `<your-site>.netlify.app.`         | Auto |

   > Replace `<your-site>` with the Netlify subdomain shown in your site settings.

6. Netlify provisions HTTPS automatically via Let's Encrypt.

---

## Files added to this repository

| File | Purpose |
|------|---------|
| `public/CNAME` | Tells GitHub Pages to serve this app on `memory.omorfarukdev.me` |
| `.github/workflows/deploy.yml` | Builds and deploys the app to GitHub Pages on every push to `main` |
| `DEPLOYMENT.md` | This guide |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404 on the subdomain | DNS has not propagated yet — wait up to 48 hours and retry |
| "Domain not verified" in GitHub Pages | Make sure the CNAME record value ends with `.github.io` and matches your GitHub username |
| HTTPS certificate pending | GitHub Pages can take up to 24 h to issue a certificate after DNS is verified |
| Build fails in Actions | Check the **Actions** tab in GitHub for the error log; usually a missing dependency |
