# ashik0025.github.io

Personal website of **Ashik Ahmed** — electrical engineer, writer, photographer.

Live at: [https://ashik0025.github.io](https://ashik0025.github.io)

---

## How it works

The site uses the **GitHub Contents API** to automatically list files in the
`blogs/` and `photos/` folders. There is NO `index.json` to maintain and NO
GitHub Actions required. Push a file → it appears on the site within ~60 seconds.

---

## 📁 Folder Structure

```
ashik0025.github.io/
├── index.html
├── style.css
├── app.js
├── assets/
│   └── favicon.svg
├── blogs/
│   ├── 001.txt          ← my blog/poetry files
│   └── 002.txt
└── photos/
    ├── 001.jpg          ← cover photo for blogs/001.txt
    └── citynight.jpg    ← no matching blog → appears in Gallery
```

**No index.json. No GitHub Actions. Just push your files.**

---

## ✍️ Adding a Blog Post or Poem

Create a `.txt` file in `blogs/` with this format:

```
Title: The Weight of Copper
Date: 2024-11-08
Type: poetry

---

Your content here.

A blank line = new paragraph.
For poetry, every line break is preserved.
```

- `Type: poetry` → italic, large serif, line breaks preserved
- `Type: blog`   → standard prose paragraphs

Push to GitHub → appears on site in ~60 seconds.

---

## 📷 Adding Photos

### Cover photo for a post
Name the photo identically to the blog file:

| Blog file           | Photo file            |
|---------------------|-----------------------|
| `blogs/003.txt`     | `photos/003.jpg`      |
| `blogs/monsoon.txt` | `photos/monsoon.jpg`  |

### Gallery-only photo
Name it anything that doesn't match a blog file:
`photos/powerlines.jpg` → Gallery

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

---

## 🚀 First-Time Setup

1. Create a GitHub repo named exactly `ashik0025.github.io`
2. Push all files to the `main` branch — keep the repo **public**
3. Go to Settings → Pages → Deploy from branch → main / root
4. Live at `https://ashik0025.github.io` within minutes

> The repo must be **public**. The GitHub API needs public access
> to list your files without a login token.

---

*Between voltage and verse.*
