# ashik0025.github.io

Personal website of **Ashik Ahmed** — electrical engineer, writer, photographer.

---

## How it works (the reliable way)

```
You push files
     │
     ▼
GitHub Actions runs bake-content.yml
     │
     ▼
Python reads every .txt in blogs/ and every image in photos/
     │
     ▼
Generates content-index.js  ←  ALL content embedded as a JS variable
     │
     ▼
GitHub Pages serves the site
     │
     ▼
Browser loads content-index.js — no fetching, no API, no cache issues
```

`window.SITE_CONTENT` is set before `app.js` runs.
`app.js` reads it directly. **Zero network requests for content.**

---

## 📁 Structure

```
ashik0025.github.io/
├── index.html
├── style.css
├── app.js
├── content-index.js         ← AUTO-GENERATED, do not edit manually
├── assets/
│   └── favicon.svg
├── blogs/
│   ├── 001.txt
│   └── 002.txt
├── photos/
│   ├── 001.jpg              ← cover for blogs/001.txt
│   └── citynight.jpg        ← no matching blog → Gallery
└── .github/
    └── workflows/
        └── bake-content.yml ← runs on every push
```

---

## ✍️ Adding a Post or Poem

Create a `.txt` in `blogs/` with this format:

```
Title: Your Title Here
Date: 2024-03-15
Type: poetry

---

Your content here.

Blank line = new paragraph.
For poetry, every line break is preserved as-is.
```

Push → GitHub Actions bakes it into `content-index.js` → live within ~90 seconds.

---

## 📷 Adding Photos

### Cover photo for a post
Name the photo the **same** as the blog file:

| Blog              | Cover photo         |
|-------------------|---------------------|
| `blogs/003.txt`   | `photos/003.jpg`    |
| `blogs/rain.txt`  | `photos/rain.jpg`   |

### Gallery-only photo
Name it anything that has no matching blog:

```
photos/rooftop.jpg      → Gallery page only
photos/powerlines.jpg   → Gallery page only
```

Supported formats: `.jpg` `.jpeg` `.png` `.webp`

---

## 🚀 First-Time Setup

1. Create a repo named **exactly** `ashik0025.github.io` — keep it **public**
2. Push all these files to `main`
3. **Settings → Pages → Deploy from branch → main / root**
4. Site is live at `https://ashik0025.github.io`

On every subsequent push, the Action rebuilds `content-index.js` automatically.
No manual steps. No index files to maintain.

---

## 🛠 Troubleshooting

**Content not updating after push?**
- Go to your repo → **Actions** tab → confirm the "Bake Content Index" job ran successfully (green ✓)
- If it failed, click the failed run to read the error log
- Hard-refresh the site: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

**Action never ran?**
- Make sure `.github/workflows/bake-content.yml` was committed to `main`
- Check Settings → Actions → General → ensure Actions are enabled

---

*Between voltage and verse.*
