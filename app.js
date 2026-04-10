/**
 * Ashik Ahmed — Personal Site
 * Uses GitHub Contents API to list blog/photo files automatically.
 * No index.json or GitHub Actions required.
 */

const REPO  = 'ashik0025/ashik0025.github.io';
const API   = `https://api.github.com/repos/${REPO}/contents`;
const RAW   = `https://raw.githubusercontent.com/${REPO}/main`;

// ─────────────────────────────────────────────
// DATA FETCHING via GitHub API
// ─────────────────────────────────────────────

async function getBlogSlugs() {
  try {
    const r = await fetch(`${API}/blogs`, { cache: 'no-store' });
    if (!r.ok) return [];
    const files = await r.json();
    if (!Array.isArray(files)) return [];
    return files
      .filter(f => f.type === 'file' && f.name.endsWith('.txt'))
      .map(f => f.name.replace(/\.txt$/, ''))
      .sort();
  } catch { return []; }
}

async function getPhotoFiles() {
  try {
    const r = await fetch(`${API}/photos`, { cache: 'no-store' });
    if (!r.ok) return [];
    const files = await r.json();
    if (!Array.isArray(files)) return [];
    return files
      .filter(f => f.type === 'file' && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
      .map(f => f.name)
      .sort();
  } catch { return []; }
}

async function fetchBlogText(slug) {
  // Fetch directly from raw GitHub — always fresh
  const r = await fetch(`${RAW}/blogs/${slug}.txt`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Cannot load blogs/${slug}.txt`);
  return r.text();
}

function photoExists(photoFiles, slug) {
  for (const f of photoFiles) {
    const name = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    if (name === slug) return f;
  }
  return null;
}

// ─────────────────────────────────────────────
// TXT FILE PARSER
// Format:
//   Title: My Title
//   Date: 2024-03-15
//   Type: poetry | blog
//   ---
//   Content...
// ─────────────────────────────────────────────
function parseBlogTxt(raw, slug) {
  const lines = raw.split('\n');
  const meta = { title: slug, date: '', type: 'blog' };
  let contentStart = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') { contentStart = i + 1; break; }
    const m = lines[i].match(/^(\w+)\s*:\s*(.+)$/);
    if (m) meta[m[1].toLowerCase()] = m[2].trim();
  }

  const content = lines.slice(contentStart).join('\n').trim();
  return { ...meta, content, slug };
}

function getExcerpt(content, len = 140) {
  const clean = content.replace(/\n+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len) + '…' : clean;
}

// ─────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────
const app = document.getElementById('app');

async function route() {
  const hash = window.location.hash || '#home';
  const [page, ...rest] = hash.replace('#', '').split('/');
  const activePage = page || 'home';

  document.querySelectorAll('.nav-link, .mob-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activePage);
  });

  app.innerHTML = `<div class="loading">
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
    <div class="loading-dot"></div>
  </div>`;

  try {
    switch (activePage) {
      case 'home':    await renderHome();           break;
      case 'writing': await renderWriting();        break;
      case 'gallery': await renderGallery();        break;
      case 'about':   renderAbout();                break;
      case 'post':    await renderPost(rest[0]);    break;
      default:        await renderHome();
    }
  } catch (e) {
    console.error(e);
    app.innerHTML = `<div class="empty-state"><p>Something went wrong. Try refreshing.</p></div>`;
  }

  app.querySelector(':first-child')?.classList.add('page-enter');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  route();
  const toggle    = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  toggle?.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav?.querySelectorAll('.mob-link').forEach(l =>
    l.addEventListener('click', () => mobileNav.classList.remove('open'))
  );
});

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────
async function renderHome() {
  const [slugs, photos] = await Promise.all([getBlogSlugs(), getPhotoFiles()]);
  const recentSlugs = [...slugs].reverse().slice(0, 3);

  const posts = [];
  for (const slug of recentSlugs) {
    try { posts.push(parseBlogTxt(await fetchBlogText(slug), slug)); }
    catch { /* skip */ }
  }

  const cardsHTML = posts.length === 0
    ? `<div class="empty-state">
        <div class="empty-state-icon">✦</div>
        <p>No writing yet.</p>
        <p>Add <code>.txt</code> files to the <code>blogs/</code> folder and push.</p>
       </div>`
    : `<div class="posts-grid">${posts.map(p => postCard(p, photos)).join('')}</div>`;

  app.innerHTML = `
    <div>
      <section class="hero">
        <div class="hero-circuit" aria-hidden="true">${heroCircuitSVG()}</div>
        <p class="hero-eyebrow">Electrical Engineer · Writer</p>
        <h1 class="hero-name">Ashik<br/><em>Ahmed</em></h1>
        <div class="hero-divider"></div>
        <p class="hero-tagline">
          Between the silence of circuits and the noise of solitude,<br/>I write.
        </p>
        <p class="hero-desc">
          An electrical engineer navigating the vast loneliness of existence —
          through poetry, prose, and photographs.
        </p>
        <div class="hero-actions">
          <a href="#writing" class="btn btn-primary">Read Writing</a>
          <a href="#gallery" class="btn btn-ghost">View Gallery</a>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Recent Writing</h2>
          <a href="#writing" class="section-link">All writing →</a>
        </div>
        ${cardsHTML}
      </section>
    </div>`;

  bindCardClicks();
}

// ─────────────────────────────────────────────
// WRITING
// ─────────────────────────────────────────────
async function renderWriting() {
  const [slugs, photos] = await Promise.all([getBlogSlugs(), getPhotoFiles()]);

  if (slugs.length === 0) {
    app.innerHTML = `
      <div>
        <div class="writing-hero">
          <p class="hero-eyebrow">Writing</p>
          <h1 class="page-title">Words &amp; <em>Verse</em></h1>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">✦</div>
          <p>No writing yet. Add <code>blogs/001.txt</code> and push.</p>
        </div>
      </div>`;
    return;
  }

  const posts = [];
  for (const slug of [...slugs].reverse()) {
    try { posts.push(parseBlogTxt(await fetchBlogText(slug), slug)); }
    catch { /* skip */ }
  }

  app.innerHTML = `
    <div>
      <div class="writing-hero">
        <p class="hero-eyebrow">Writing</p>
        <h1 class="page-title">Words &amp; <em>Verse</em></h1>
        <p class="page-subtitle">${posts.length} piece${posts.length !== 1 ? 's' : ''} — blogs, poetry &amp; thoughts</p>
      </div>
      <div class="posts-list">
        <div class="posts-grid">${posts.map(p => postCard(p, photos)).join('')}</div>
      </div>
    </div>`;

  bindCardClicks();
}

// ─────────────────────────────────────────────
// SINGLE POST
// ─────────────────────────────────────────────
async function renderPost(slug) {
  if (!slug) { window.location.hash = '#writing'; return; }

  let raw;
  try { raw = await fetchBlogText(slug); }
  catch {
    app.innerHTML = `<div class="post-page"><div class="empty-state"><p>Post not found.</p></div></div>`;
    return;
  }

  const post   = parseBlogTxt(raw, slug);
  const photos = await getPhotoFiles();
  const photo  = photoExists(photos, slug);

  const coverHTML = photo
    ? `<img class="post-cover-full" src="photos/${photo}" alt="${post.title}" />`
    : '';

  const formattedDate = post.date
    ? new Date(post.date + 'T00:00:00').toLocaleDateString('en-US',
        { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const isPoetry    = post.type?.toLowerCase() === 'poetry';
  const contentHTML = isPoetry
    ? `<div class="post-content poetry"><p>${post.content}</p></div>`
    : `<div class="post-content">${
        post.content.split(/\n{2,}/).map(p =>
          `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
      }</div>`;

  app.innerHTML = `
    <div>
      <article class="post-page">
        <button class="post-back" onclick="history.back()">Back</button>
        ${coverHTML}
        <div class="post-meta">
          <span class="post-type-badge">${post.type || 'blog'}</span>
          ${formattedDate ? `<span class="post-date">${formattedDate}</span>` : ''}
        </div>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-divider"></div>
        ${contentHTML}
      </article>
    </div>`;
}

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────
async function renderGallery() {
  const [slugs, photos] = await Promise.all([getBlogSlugs(), getPhotoFiles()]);

  const galleryPhotos = photos.filter(f => {
    const name = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return !slugs.includes(name);
  });

  const gridHTML = galleryPhotos.length === 0
    ? `<div class="empty-state">
        <div class="empty-state-icon">◎</div>
        <p>No gallery photos yet.</p>
        <p>Photos whose names don't match a blog file appear here.<br/>
        <code>photos/citynight.jpg</code></p>
       </div>`
    : `<div class="gallery-grid">
        ${galleryPhotos.map(f => `
          <div class="gallery-item" data-src="photos/${f}">
            <img src="photos/${f}" alt="${f}" loading="lazy" />
            <div class="gallery-item-label">${f}</div>
          </div>`).join('')}
       </div>`;

  app.innerHTML = `
    <div class="gallery-page">
      <div class="writing-hero" style="padding: 0 0 3rem;">
        <p class="hero-eyebrow">Gallery</p>
        <h1 class="page-title">Frames of <em>Solitude</em></h1>
        <p class="page-subtitle">Photographs not tied to any writing</p>
      </div>
      ${gridHTML}
    </div>`;

  app.querySelectorAll('.gallery-item').forEach(item =>
    item.addEventListener('click', () => openLightbox(item.dataset.src))
  );
}

function openLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<span class="lightbox-close">✕ Close</span><img src="${src}" alt="" />`;
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);
}

// ─────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────
function renderAbout() {
  app.innerHTML = `
    <div class="about-page">
      <div class="about-header">
        <h1 class="about-name">Ashik<br/><em>Ahmed</em></h1>
        <p class="about-role">Electrical Engineer · Writer · Photographer</p>
      </div>
      <div class="about-body">
        <div class="about-text">
          <p>I am an electrical engineer by training — someone who understands
          how the world moves through wires, how current finds its path,
          how silence hums at the right frequency.</p>
          <p>I write because the equations never quite explain
          <em>why the room feels empty</em> at 2 a.m., or why a photograph
          of a power line against a grey sky can make you feel
          impossibly small and strangely alive.</p>
          <p>This is my corner of the internet — for poetry, for reflections,
          for photographs taken during long walks through a world
          I am still trying to understand.</p>
          <p><em>Unbearably lonely. Endlessly curious.</em></p>
        </div>
        <div class="about-facts">
          <div class="fact-item">
            <div class="fact-label">Discipline</div>
            <div class="fact-value">Electrical Engineering</div>
          </div>
          <div class="fact-item">
            <div class="fact-label">Writing</div>
            <div class="fact-value">Poetry &amp; Prose</div>
          </div>
          <div class="fact-item">
            <div class="fact-label">Currently</div>
            <div class="fact-value">Somewhere quiet</div>
          </div>
          <div class="fact-item">
            <div class="fact-label">State of mind</div>
            <div class="fact-value">Pensive, always</div>
          </div>
        </div>
      </div>
      <div class="about-circuit">${aboutCircuitSVG()}</div>
    </div>`;
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function postCard(post, photos) {
  const photo = photoExists(photos, post.slug);
  const coverHTML = photo
    ? `<img class="post-card-cover" src="photos/${photo}" alt="${post.title}" loading="lazy" />`
    : `<div class="post-card-cover-placeholder"></div>`;

  const formattedDate = post.date
    ? new Date(post.date + 'T00:00:00').toLocaleDateString('en-US',
        { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  return `
    <article class="post-card" data-slug="${post.slug}" tabindex="0" role="button" aria-label="Read: ${post.title}">
      ${coverHTML}
      <div class="post-card-body">
        <div class="post-card-type">${post.type || 'blog'}</div>
        <h3 class="post-card-title">${post.title}</h3>
        ${formattedDate ? `<div class="post-card-date">${formattedDate}</div>` : ''}
        <p class="post-card-excerpt">${getExcerpt(post.content)}</p>
      </div>
      <div class="post-card-arrow">→</div>
    </article>`;
}

function bindCardClicks() {
  app.querySelectorAll('.post-card[data-slug]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = `#post/${card.dataset.slug}`;
    });
  });
}

// ─────────────────────────────────────────────
// SVG DECORATIONS
// ─────────────────────────────────────────────
function heroCircuitSVG() {
  return `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#c9a84c" stroke-width="1">
    <rect x="10" y="10" width="300" height="300" stroke-dasharray="4 8" opacity="0.3"/>
    <line x1="10" y1="160" x2="80" y2="160" opacity="0.5"/>
    <circle cx="80" cy="160" r="4" fill="#c9a84c" opacity="0.5"/>
    <line x1="80" y1="160" x2="80" y2="80" opacity="0.4"/>
    <line x1="80" y1="80" x2="160" y2="80" opacity="0.4"/>
    <circle cx="160" cy="80" r="6" opacity="0.4"/>
    <line x1="166" y1="80" x2="240" y2="80" opacity="0.3"/>
    <line x1="240" y1="80" x2="240" y2="160" opacity="0.3"/>
    <line x1="240" y1="160" x2="310" y2="160" opacity="0.3"/>
    <line x1="160" y1="86" x2="160" y2="160" opacity="0.35"/>
    <rect x="140" y="160" width="40" height="20" rx="2" opacity="0.35"/>
    <line x1="160" y1="180" x2="160" y2="240" opacity="0.3"/>
    <circle cx="160" cy="240" r="8" opacity="0.3"/>
    <line x1="168" y1="240" x2="240" y2="240" opacity="0.25"/>
    <line x1="240" y1="160" x2="240" y2="240" opacity="0.25"/>
    <circle cx="240" cy="160" r="4" fill="#3d7a8c" opacity="0.5"/>
    <circle cx="80" cy="240" r="4" opacity="0.25"/>
    <line x1="80" y1="160" x2="80" y2="240" opacity="0.2"/>
    <line x1="84" y1="240" x2="152" y2="240" opacity="0.2"/>
    <rect x="100" y="110" width="50" height="30" rx="2" opacity="0.2"/>
    <line x1="110" y1="110" x2="110" y2="100" opacity="0.2"/>
    <line x1="125" y1="110" x2="125" y2="100" opacity="0.2"/>
    <line x1="140" y1="110" x2="140" y2="100" opacity="0.2"/>
    <line x1="110" y1="140" x2="110" y2="150" opacity="0.2"/>
    <line x1="125" y1="140" x2="125" y2="150" opacity="0.2"/>
    <line x1="140" y1="140" x2="140" y2="150" opacity="0.2"/>
  </svg>`;
}

function aboutCircuitSVG() {
  return `<svg class="circuit-diagram" viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#c9a84c" stroke-width="0.8">
    <line x1="0" y1="40" x2="60" y2="40"/>
    <circle cx="60" cy="40" r="3" fill="#c9a84c"/>
    <line x1="60" y1="40" x2="60" y2="15"/>
    <line x1="60" y1="15" x2="120" y2="15"/>
    <rect x="120" y="8" width="30" height="14" rx="2"/>
    <line x1="150" y1="15" x2="200" y2="15"/>
    <line x1="200" y1="15" x2="200" y2="40"/>
    <circle cx="200" cy="40" r="3" fill="#c9a84c"/>
    <line x1="200" y1="40" x2="260" y2="40"/>
    <circle cx="290" cy="40" r="12" stroke="#3d7a8c"/>
    <line x1="302" y1="40" x2="360" y2="40"/>
    <circle cx="360" cy="40" r="3" fill="#c9a84c"/>
    <line x1="360" y1="40" x2="360" y2="65"/>
    <line x1="340" y1="65" x2="380" y2="65"/>
    <line x1="344" y1="70" x2="376" y2="70"/>
    <line x1="348" y1="75" x2="372" y2="75"/>
    <line x1="360" y1="40" x2="420" y2="40"/>
    <circle cx="420" cy="40" r="3" fill="#c9a84c"/>
    <line x1="420" y1="40" x2="420" y2="15"/>
    <line x1="420" y1="15" x2="480" y2="15"/>
    <line x1="480" y1="15" x2="480" y2="65"/>
    <line x1="460" y1="65" x2="500" y2="65"/>
    <line x1="464" y1="59" x2="496" y2="59"/>
    <line x1="480" y1="40" x2="600" y2="40"/>
    <circle cx="480" cy="40" r="3" fill="#c9a84c"/>
  </svg>`;
}
