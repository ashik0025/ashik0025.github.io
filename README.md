# ashik0025.github.io

Personal site of **Ashik Ahmed** — আশিক আহমেদ

---

## Folder structure

```
ashik0025.github.io/
├── index.html
├── style.css
├── app.js
├── content-index.js       ← AUTO-GENERATED, never edit manually
├── assets/
│   └── favicon.svg
├── blogs/
│   └── 001.txt            ← Blog posts & poetry
├── thoughts/
│   └── 001.txt            ← Short thoughts / musings
├── photos/
│   └── 001.jpg            ← 001.jpg = cover for blogs/001.txt
└── .github/workflows/
    └── bake-content.yml   ← Runs on every push
```

---

## ✍️ Adding a blog post or poem

Create a `.txt` in `blogs/`:

```
Title: Your Title
Date: 2025-04-19
Type: poetry

---

Your content here.

Blank line = new paragraph.
Type can be: blog, poetry, vlog
```

---

## 💭 Adding a thought

Create a `.txt` in `thoughts/`:

```
Date: 2025-04-19

Just write here. No title needed.
Can be in English or বাংলা or both.
```

The date line is optional — if missing, the filename is used as the date label.

---

## 📷 Adding photos

| Want | Do |
|---|---|
| Cover for a post | Name photo same as post: `blogs/003.txt` → `photos/003.jpg` |
| Gallery only | Name it anything else: `photos/sky.jpg` |

Formats: `.jpg` `.jpeg` `.png` `.webp`

---

## How it works

Every push triggers GitHub Actions → Python reads all files → bakes everything into `content-index.js` → stamps a cache-busting hash into `index.html` → commits back → site updates in ~90 seconds.

**No manual index files. No API calls. Just push and it works.**

---

## First-time setup

1. Create repo named `ashik0025.github.io` (public)
2. Push all files to `main`
3. Settings → Pages → Deploy from branch → main / root
4. Settings → Actions → General → Workflow permissions → Read and write

---
