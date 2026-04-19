/**
 * আশিক আহমেদ | Ashik Ahmed — Personal Site
 * Reads from window.SITE_CONTENT baked by GitHub Actions.
 * Zero runtime fetching.
 */

// ── Data helpers ─────────────────────────────────────────────────────────────

const data = () => window.SITE_CONTENT || { posts: [], photos: [], thoughts: [] };
const posts    = () => data().posts    || [];
const photos   = () => data().photos   || [];
const thoughts = () => data().thoughts || [];

function photoFor(slug) {
  return photos().find(f => f.replace(/\.(jpg|jpeg|png|webp)$/i, '') === slug) || null;
}
function tagClass(type) {
  const t = (type || '').toLowerCase();
  if (t === 'poetry') return 'tag-poetry';
  if (t === 'vlog')   return 'tag-vlog';
  if (t === 'blog')   return 'tag-blog';
  return 'tag-default';
}
function excerpt(text, len = 130) {
  const s = text.replace(/\n+/g, ' ').trim();
  return s.length > len ? s.slice(0, len) + '…' : s;
}
function fmtDate(str, style = 'long') {
  if (!str) return '';
  try {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-GB', style === 'long'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' }
    );
  } catch { return str; }
}
function placeholderEmoji(slug) {
  const e = ['✦','◈','◉','◇','◆','▲','●','◐'];
  let n = 0;
  for (let i = 0; i < slug.length; i++) n += slug.charCodeAt(i);
  return e[n % e.length];
}

// ── Router ───────────────────────────────────────────────────────────────────

const app = document.getElementById('app');

function route() {
  const hash  = window.location.hash || '#home';
  const parts = hash.replace(/^#/, '').split('/');
  const page  = parts[0] || 'home';

  document.querySelectorAll('.nav-link, .mob-link').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page)
  );

  switch (page) {
    case 'home':     renderHome();             break;
    case 'writing':  renderWriting();          break;
    case 'thoughts': renderThoughts();         break;
    case 'gallery':  renderGallery();          break;
    case 'about':    renderAbout();            break;
    case 'post':     renderPost(parts[1]);     break;
    default:         renderHome();
  }

  app.querySelector(':first-child')?.classList.add('page-enter');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', () => {
  route();

  const burger    = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');
  burger?.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  mobileNav?.querySelectorAll('.mob-link').forEach(l =>
    l.addEventListener('click', () => mobileNav.classList.remove('open'))
  );
});

// ── Home ─────────────────────────────────────────────────────────────────────

function renderHome() {
  const recent   = posts().slice().reverse().slice(0, 3);
  const recentTh = thoughts().slice().reverse().slice(0, 2);

  app.innerHTML = `
    <div>
      <!-- HERO -->
      <section class="hero">
        <div class="hero-kicker">Writer &amp; Amateur Photographer</div>
        <h1 class="hero-name">
          Ashik Ahmed
          <span class="hero-name-bn">আশিক আহমেদ</span>
        </h1>
        <div class="hero-line">
          <div class="hero-line-bar"></div>
          <p class="hero-tagline">
            Words, snaps, and the quiet moments between.<br/>
            লেখা, ছবি, আর কিছু নিশ্চুপ মুহূর্ত।
          </p>
        </div>
        <div class="hero-actions">
          <a href="#writing"  class="btn btn-coral">Read Writing</a>
          <a href="#thoughts" class="btn btn-outline">Thoughts</a>
        </div>
      </section>

      <!-- RECENT WRITING -->
      <section class="sec">
        <div class="sec-header">
          <h2 class="sec-title">Recent Writing</h2>
          <a href="#writing" class="sec-more">All writing</a>
        </div>
        ${recent.length
          ? `<div class="cards-grid">${recent.map(p => cardHTML(p)).join('')}</div>`
          : emptyHTML('No writing yet.', 'Add .txt files to blogs/')
        }
      </section>

      <!-- RECENT THOUGHTS -->
      ${recentTh.length ? `
      <section class="sec" style="padding-top:0">
        <div class="sec-header">
          <h2 class="sec-title">Recent Thoughts</h2>
          <a href="#thoughts" class="sec-more">All thoughts</a>
        </div>
        <div style="max-width:660px">
          <div class="thoughts-feed">
            ${recentTh.map(t => thoughtItemHTML(t)).join('')}
          </div>
        </div>
      </section>` : ''}
    </div>`;

  bindCards();
}

// ── Writing ──────────────────────────────────────────────────────────────────

function renderWriting() {
  const all = posts().slice().reverse();

  app.innerHTML = `
    <div>
      <div class="page-head">
        <div class="page-head-eyebrow">Writing</div>
        <h1 class="page-head-title">Words &amp; <em>Verse</em></h1>
        <p class="page-head-sub">${all.length} piece${all.length !== 1 ? 's' : ''} — blogs, poetry &amp; more</p>
      </div>
      <div class="sec" style="padding-top:0">
        ${all.length
          ? `<div class="cards-grid">${all.map(p => cardHTML(p)).join('')}</div>`
          : emptyHTML('No writing yet.', 'Add .txt files to the blogs/ folder and push.')
        }
      </div>
    </div>`;

  bindCards();
}

// ── Single Post ───────────────────────────────────────────────────────────────

function renderPost(slug) {
  if (!slug) { window.location.hash = '#writing'; return; }

  const post = posts().find(p => p.slug === slug);
  if (!post) {
    app.innerHTML = `<div class="post-page">${emptyHTML('Post not found.', '')}</div>`;
    return;
  }

  const photo    = photoFor(slug);
  const isPoetry = (post.type || '').toLowerCase() === 'poetry';

  const bodyHTML = isPoetry
    ? `<div class="post-body poetry"><p>${post.content}</p></div>`
    : `<div class="post-body">${
        post.content.split(/\n{2,}/)
          .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('')
      }</div>`;

  app.innerHTML = `
    <div>
      <article class="post-page">
        <button class="back-btn" onclick="history.back()">Back</button>
        ${photo ? `<img class="post-cover" src="photos/${photo}" alt="${post.title}"/>` : ''}
        <div class="post-meta-row">
          <span class="card-tag ${tagClass(post.type)}">${post.type || 'blog'}</span>
          ${post.date ? `<span class="post-date">${fmtDate(post.date)}</span>` : ''}
        </div>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-rule"></div>
        ${bodyHTML}
      </article>
    </div>`;
}

// ── Thoughts ─────────────────────────────────────────────────────────────────

function renderThoughts() {
  const all = thoughts().slice().reverse();

  app.innerHTML = `
    <div>
      <div class="page-head">
        <div class="page-head-eyebrow">Thoughts</div>
        <h1 class="page-head-title">ভাবনা &amp; <em>Musings</em></h1>
        <p class="page-head-sub">Unfiltered. No strings attached. Just thoughts.</p>
      </div>
      <div class="thoughts-page">
        ${all.length
          ? `<div class="thoughts-feed">${all.map(t => thoughtItemHTML(t)).join('')}</div>`
          : emptyHTML(
              'No thoughts yet.',
              'Add .txt files to the thoughts/ folder and push.<br/>Format: first line <code>Date: 2025-01-15</code>, then your text.'
            )
        }
      </div>
    </div>`;
}

function thoughtItemHTML(t) {
  const display = t.date ? fmtDate(t.date, 'long') : (t.slug || '');
  return `
    <div class="thought-item">
      <div class="thought-date">${display}</div>
      <div class="thought-text">${t.content.replace(/\n/g, '<br>')}</div>
    </div>`;
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function renderGallery() {
  const slugSet = new Set(posts().map(p => p.slug));
  const orphans = photos().filter(f => {
    const name = f.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    return !slugSet.has(name);
  });

  app.innerHTML = `
    <div>
      <div class="page-head">
        <div class="page-head-eyebrow">Gallery</div>
        <h1 class="page-head-title">Photo <em>Gallery</em></h1>
        <p class="page-head-sub">${orphans.length} photograph${orphans.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="gallery-page">
        ${orphans.length
          ? `<div class="gallery-masonry">
               ${orphans.map(f => `
                 <div class="gallery-brick" data-src="photos/${f}">
                   <img src="photos/${f}" alt="${f}" loading="lazy"/>
                   <div class="gallery-brick-overlay">
                     <span class="gallery-brick-name">${f}</span>
                   </div>
                 </div>`).join('')}
             </div>`
          : emptyHTML(
              'No gallery photos yet.',
              'Photos whose names don\'t match any blog file appear here.<br/><code>photos/cityscape.jpg</code>'
            )
        }
      </div>
    </div>`;

  app.querySelectorAll('.gallery-brick').forEach(el =>
    el.addEventListener('click', () => lightbox(el.dataset.src))
  );
}

function lightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<span class="lightbox-x">✕ close</span><img src="${src}" alt=""/>`;
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);
}

// ── About ─────────────────────────────────────────────────────────────────────

function renderAbout() {
  app.innerHTML = `
    <div>
      <div class="page-head">
        <div class="page-head-eyebrow">About</div>
        <h1 class="page-head-title">Ashik <em>Ahmed</em></h1>
      </div>
      <div class="about-page">
        <div class="about-grid">
          <div class="about-text">
            <p>
              I am <strong>Ashik Ahmed</strong> — a writer, photographer, and
              someone who thinks too much at odd hours.
            </p>
            <p>
              This is my space on the internet. I write in English and Bengali,
              photograph things that catch my eye, and occasionally publish the
              half-finished thoughts that pile up in my head.
            </p>
            <p class="bn">
              আমি লিখি কারণ কিছু কথা না বললে মাথার ভেতরে পাক খেতে থাকে।
              ছবি তুলি কারণ মুহূর্তগুলো চলে যায় — ধরে না রাখলে কেউ জানবে না
              সেদিন আলো কতটা সুন্দর ছিল।
            </p>
            <p>
              <em>Unbearably honest. Endlessly curious.</em>
            </p>
            <div class="about-color-row">
              <div class="color-dot" style="background:var(--coral)"></div>
              <div class="color-dot" style="background:var(--saffron)"></div>
              <div class="color-dot" style="background:var(--teal)"></div>
              <div class="color-dot" style="background:var(--violet)"></div>
              <div class="color-dot" style="background:var(--rose)"></div>
            </div>
          </div>
          <div class="about-aside">
            <div class="aside-block">
              <div class="aside-label">Name</div>
              <div class="aside-value">Ashik Ahmed</div>
              <div class="aside-value bn" style="margin-top:0.2rem;font-size:0.95rem;color:var(--ink-muted)">আশিক আহমেদ</div>
            </div>
            <div class="aside-block">
              <div class="aside-label">Writing in</div>
              <div class="aside-value">English &amp; বাংলা</div>
            </div>
            <div class="aside-block">
              <div class="aside-label">Currently</div>
              <div class="aside-value">Somewhere quiet</div>
            </div>
            <div class="aside-block">
              <div class="aside-label">Interests</div>
              <div class="aside-value" style="font-size:0.95rem;font-weight:400;color:var(--ink-muted)">
                Writing · Photography · Long walks · Late nights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Shared HTML helpers ──────────────────────────────────────────────────────

function cardHTML(post) {
  const photo = photoFor(post.slug);
  const tag   = post.type || 'blog';
  return `
    <article class="card" data-slug="${post.slug}" tabindex="0" role="button" aria-label="Read: ${post.title}">
      <div class="card-img-wrap">
        ${photo
          ? `<img class="card-img" src="photos/${photo}" alt="${post.title}" loading="lazy"/>`
          : `<div class="card-placeholder">${placeholderEmoji(post.slug)}</div>`
        }
      </div>
      <div class="card-body">
        <span class="card-tag ${tagClass(tag)}">${tag}</span>
        ${post.date ? `<div class="card-date">${fmtDate(post.date, 'short')}</div>` : ''}
        <h3 class="card-title">${post.title}</h3>
        <p class="card-excerpt">${excerpt(post.content)}</p>
      </div>
    </article>`;
}

function bindCards() {
  app.querySelectorAll('.card[data-slug]').forEach(card =>
    card.addEventListener('click', () => {
      window.location.hash = `#post/${card.dataset.slug}`;
    })
  );
}

function emptyHTML(headline, detail) {
  return `<div class="empty">
    <div class="empty-icon">✦</div>
    <p>${headline}</p>
    ${detail ? `<p style="font-family:var(--font-mono);font-size:0.8rem;font-style:normal">${detail}</p>` : ''}
  </div>`;
}
