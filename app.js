/**
 * 内容消费行业资讯 — Application Logic
 * Handles both index.html (industry panels) and report.html (detail).
 */

// ── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`;
}

const TAG_COLORS_GAME  = ['tag--blue',   'tag--teal',   'tag--green', 'tag--orange', 'tag--indigo'];
const TAG_COLORS_DRAMA = ['tag--violet', 'tag--pink',   'tag--indigo','tag--teal',   'tag--orange'];

function buildTags(tags, industry, max = 99) {
  const colors = industry === 'drama' ? TAG_COLORS_DRAMA : TAG_COLORS_GAME;
  return tags.slice(0, max).map((t, i) =>
    `<span class="tag ${colors[i % colors.length]}">${t}</span>`
  ).join('');
}

function getReportIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

// ── TICKER ──────────────────────────────────────────────────────────────────

function buildTicker() {
  const el = document.getElementById('ticker');
  if (!el) return;
  const all = [
    ...REPORTS_BY_INDUSTRY.game.flatMap(r => r.highlights || []),
    ...REPORTS_BY_INDUSTRY.drama.flatMap(r => r.highlights || [])
  ];
  const html = [...all, ...all].map(h => `<span class="ticker-item">${h}</span>`).join('');
  el.innerHTML = html;
}

// ── INDEX PAGE ───────────────────────────────────────────────────────────────

function initIndexPage() {
  buildTicker();
  buildHeroStats();
  buildInsights();
  buildSpecialReports();
  buildIndustryPanel('game');
  buildIndustryPanel('drama');
  initSearch();
}

function buildHeroStats() {
  const el = document.getElementById('hero-stats');
  if (!el) return;
  const gameCount  = REPORTS_BY_INDUSTRY.game.length;
  const dramaCount = REPORTS_BY_INDUSTRY.drama.length;
  const allReports = [...REPORTS_BY_INDUSTRY.game, ...REPORTS_BY_INDUSTRY.drama];
  const latestDate = allReports
    .map(r => r.publishedAt)
    .sort()
    .reverse()[0];

  el.innerHTML = `
    <div class="hero-stat animate-in animate-in--delay-1">
      <span class="hero-stat-value">${gameCount + dramaCount}</span>
      <span class="hero-stat-label">期报告</span>
    </div>
    <div class="hero-stat animate-in animate-in--delay-2">
      <span class="hero-stat-value">2</span>
      <span class="hero-stat-label">行业覆盖</span>
    </div>
    <div class="hero-stat animate-in animate-in--delay-3">
      <span class="hero-stat-value">每周一</span>
      <span class="hero-stat-label">更新周期</span>
    </div>
  `;
}

function buildIndustryPanel(industry) {
  const reports = REPORTS_BY_INDUSTRY[industry] || [];

  // count badge
  const badge = document.getElementById(`${industry}-count-badge`);
  if (badge) badge.textContent = `${reports.length} 期`;

  // latest card
  const latestEl = document.getElementById(`${industry}-latest-card`);
  if (latestEl) {
    if (reports.length === 0) {
      latestEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div>暂无报告</div>`;
    } else {
      const r = reports[0];
      latestEl.innerHTML = `
        <div class="latest-card">
          <div class="latest-card-header">
            <span class="latest-week">${r.week}</span>
            <span class="latest-period">${r.period}</span>
          </div>
          <div class="latest-title">${r.week} 资讯报告</div>
          <p class="latest-summary">${r.summary}</p>
          <ul class="highlights-inline">
            ${r.highlights.slice(0, 3).map(h => `<li>${h}</li>`).join('')}
          </ul>
          <div class="latest-footer">
            <div class="latest-tags">${buildTags(r.tags, industry, 4)}</div>
            <a href="report.html?id=${r.id}" class="btn-read">
              阅读完整报告
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      `;
    }
  }

  // archive list (skip first = latest)
  const archiveEl = document.getElementById(`${industry}-archive-list`);
  if (archiveEl) {
    const archiveList = reports.slice(1);
    if (archiveList.length === 0) {
      archiveEl.innerHTML = `<div class="empty-state" style="padding:20px 0;font-size:12px;">暂无历史报告</div>`;
    } else {
      archiveEl.innerHTML = archiveList.map(r => `
        <a href="report.html?id=${r.id}" class="report-list-item">
          <div class="rli-left">
            <span class="rli-week">${r.week}</span>
            <span class="rli-summary">${r.summary}</span>
          </div>
          <div class="rli-right">
            <span class="rli-date">${formatDate(r.publishedAt)}</span>
            <span class="rli-arrow">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </a>
      `).join('');
    }
  }
}

// ── REPORT DETAIL PAGE ───────────────────────────────────────────────────────

function initReportPage() {
  const id = getReportIdFromUrl();
  const found = findReportById(id);

  let report, industry;
  if (found) {
    report   = found.report;
    industry = found.industry;
  } else {
    // fallback to first game report
    report   = REPORTS_BY_INDUSTRY.game[0];
    industry = 'game';
  }

  // Apply industry theme to body
  document.body.setAttribute('data-industry', industry);

  // Page title
  const industryLabel = industry === 'drama' ? '短剧漫剧小说' : '游戏';
  document.title = `${report.week} ${industryLabel}周报 | Content Intel Hub`;

  buildReportHero(report, industry);
  buildHighlights(report, industry);
  buildReportContent(report);
  buildTOC(industry);
  buildFooterNav(report, industry);
}

function buildReportHero(r, industry) {
  const badge = document.getElementById('report-week-badge');
  const title = document.getElementById('report-title');
  const meta  = document.getElementById('report-meta-row');
  const tags  = document.getElementById('report-tags');

  const industryLabel = industry === 'drama' ? '短剧漫剧小说' : '游戏';

  if (badge) badge.textContent = r.week;
  if (title) title.textContent = `${r.week} ${industryLabel}行业资讯报告`;
  if (meta) {
    meta.innerHTML = `
      <span class="report-meta-item">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.2"/>
          <path d="M5 1v2M9 1v2M2 5h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        ${r.period}
      </span>
      <span class="report-meta-item">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M7 4.5V7l2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        发布于 ${formatDate(r.publishedAt)}
      </span>
      <span class="report-meta-item" style="color:${industry === 'drama' ? 'var(--industry-drama)' : 'var(--industry-game)'}">
        ${industry === 'drama' ? '📖 短剧漫剧小说' : '🎮 游戏'}
      </span>
    `;
  }
  if (tags) tags.innerHTML = buildTags(r.tags, industry);
}

function buildHighlights(r, industry) {
  const el = document.getElementById('highlights-list');
  if (!el) return;
  el.innerHTML = r.highlights.map(h => `<li>${h}</li>`).join('');
}

function buildReportContent(r) {
  const el = document.getElementById('report-content');
  if (!el) return;

  const rawContent = r.content || '# 报告内容待填充\n\n请调用「通用行业研究」Skill 生成报告后，将 Markdown 内容粘贴到 `data.js` 对应条目的 `content` 字段。';

  if (typeof marked === 'undefined') {
    el.innerHTML = `<pre style="white-space:pre-wrap;font-size:14px;color:var(--text-secondary)">${rawContent}</pre>`;
    return;
  }

  marked.setOptions({ breaks: true, gfm: true });

  // Try to extract "市场变化快评" section (##-level heading)
  const takeawayMatch = rawContent.match(
    /(?:^|\n)(#{1,2}\s*市场变化快评\s*\n)([\s\S]*?)(?=\n#{1,2}\s|\n---\s*\n#{1,2}\s|$)/
  );

  if (takeawayMatch) {
    const takeawayMd = takeawayMatch[2].replace(/^\n---\n?/, '').trim();
    const restMd = rawContent
      .replace(takeawayMatch[0], '')
      .replace(/\n---\n\s*（以下为本期完整资讯）/, '')
      .trim();

    const takeawayHtml = marked.parse(takeawayMd);
    const mainHtml = marked.parse(restMd);

    const industryLabel = document.body.getAttribute('data-industry') === 'drama' ? '短剧小说' : '游戏';

    el.innerHTML = `
      <div class="key-takeaway">
        <div class="key-takeaway-header">
          <span class="key-takeaway-icon">💡</span>
          <span class="key-takeaway-label">Key Takeaway · 市场变化快评</span>
        </div>
        <div class="key-takeaway-body">${takeawayHtml}</div>
      </div>
      ${mainHtml}
    `;
  } else {
    el.innerHTML = marked.parse(rawContent);
  }
}

function buildTOC(industry) {
  const content = document.getElementById('report-content');
  const nav = document.getElementById('toc-nav');
  if (!content || !nav) return;
  const headings = content.querySelectorAll('h2, h3');
  if (headings.length === 0) return;
  headings.forEach((h, i) => {
    const slug = `section-${i}`;
    h.id = slug;
    const link = document.createElement('a');
    link.href = `#${slug}`;
    link.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-link--h3' : '');
    link.textContent = h.textContent;
    nav.appendChild(link);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const id = e.target.getAttribute('id');
      const link = nav.querySelector(`a[href="#${id}"]`);
      if (link) link.classList.toggle('active', e.isIntersecting);
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  headings.forEach(h => observer.observe(h));
}

function buildFooterNav(currentReport, industry) {
  const el = document.getElementById('report-footer-nav');
  if (!el) return;
  const list = REPORTS_BY_INDUSTRY[industry] || [];
  const idx = list.findIndex(r => r.id === currentReport.id);
  const prev = list[idx + 1];
  const next = list[idx - 1];
  let html = '';
  if (prev) {
    html += `<a href="report.html?id=${prev.id}" class="nav-btn">
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ← ${prev.week}
    </a>`;
  } else { html += `<span></span>`; }
  html += `<a href="index.html" class="nav-btn nav-btn--back">返回首页</a>`;
  if (next) {
    html += `<a href="report.html?id=${next.id}" class="nav-btn">
      ${next.week} →
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>`;
  } else { html += `<span></span>`; }
  el.innerHTML = html;
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────────

function buildInsights() {
  const grid = document.getElementById('insights-grid');
  const updated = document.getElementById('insights-updated');
  if (!grid) return;

  if (updated && SITE_INSIGHTS.updatedAt) {
    updated.textContent = '更新于 ' + formatDate(SITE_INSIGHTS.updatedAt);
  }

  const ACCENT_COLORS = [
    { bg: 'rgba(37,99,235,.07)',   border: 'rgba(37,99,235,.2)',   num: 'var(--accent-blue)',   tag: '游戏 & 漫剧' },
    { bg: 'rgba(124,58,237,.07)',  border: 'rgba(124,58,237,.2)',  num: 'var(--accent-violet)', tag: '平台生态' },
    { bg: 'rgba(8,145,178,.07)',   border: 'rgba(8,145,178,.2)',   num: 'var(--accent-teal)',   tag: '出海' },
    { bg: 'rgba(5,150,105,.07)',   border: 'rgba(5,150,105,.2)',   num: 'var(--accent-green)',  tag: '漫剧' },
  ];

  grid.innerHTML = SITE_INSIGHTS.insights.map((ins, i) => {
    const c = ACCENT_COLORS[i % ACCENT_COLORS.length];
    return `
      <div class="insight-card" style="--ins-bg:${c.bg};--ins-border:${c.border};--ins-num:${c.num}">
        <div class="insight-card-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="insight-card-body">
          <div class="insight-card-title">${ins.title}</div>
          <p class="insight-card-text">${ins.body}</p>
        </div>
      </div>
    `;
  }).join('');
}

function buildSpecialReports() {
  const grid = document.getElementById('special-grid');
  if (!grid) return;

  if (!SPECIAL_REPORTS || SPECIAL_REPORTS.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div>暂无专项研究</div>`;
    return;
  }

  grid.innerHTML = SPECIAL_REPORTS.map(r => {
    const isGame = r.industry === 'game';
    const industryLabel = isGame ? '🎮 游戏' : '📖 短剧漫剧';
    const accentColor = isGame ? 'var(--industry-game)' : 'var(--industry-drama)';
    const accentBg = isGame ? 'rgba(37,99,235,.07)' : 'rgba(124,58,237,.07)';
    const accentBorder = isGame ? 'rgba(37,99,235,.2)' : 'rgba(124,58,237,.2)';
    const tags = (r.tags || []).slice(0, 4).map(t =>
      `<span class="tag" style="color:${accentColor};background:${accentBg};border-color:${accentBorder}">${t}</span>`
    ).join('');
    return `
      <a href="${r.path}" target="_blank" class="special-card" style="--sp-accent:${accentColor};--sp-bg:${accentBg};--sp-border:${accentBorder}">
        <div class="special-card-accent-bar"></div>
        <div class="special-card-body">
          <div class="special-card-meta">
            <span class="special-card-industry" style="color:${accentColor};background:${accentBg};border-color:${accentBorder}">${industryLabel}</span>
            <span class="special-card-date">${formatDate(r.publishedAt)}</span>
          </div>
          <div class="special-card-title">${r.title}</div>
          <p class="special-card-subtitle">${r.subtitle || ''}</p>
          <p class="special-card-summary">${r.summary}</p>
          <div class="special-card-footer">
            <div class="special-card-tags">${tags}</div>
            <span class="special-card-cta">
              阅读报告
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// ── SEARCH ────────────────────────────────────────────────────────────────────

function buildSearchIndex() {
  const items = [];
  // Weekly reports
  for (const [industry, reports] of Object.entries(REPORTS_BY_INDUSTRY)) {
    const industryLabel = industry === 'drama' ? '短剧漫剧小说' : '游戏';
    for (const r of reports) {
      items.push({
        type: 'weekly',
        industry,
        industryLabel,
        id: r.id,
        title: `${r.week} ${industryLabel}周报`,
        summary: r.summary,
        tags: r.tags || [],
        highlights: r.highlights || [],
        week: r.week,
        period: r.period,
        url: `report.html?id=${r.id}`,
        searchText: [r.week, r.summary, ...(r.tags || []), ...(r.highlights || [])].join(' ').toLowerCase()
      });
    }
  }
  // Special reports
  for (const r of (SPECIAL_REPORTS || [])) {
    const industryLabel = r.industry === 'drama' ? '短剧漫剧小说' : '游戏';
    items.push({
      type: 'special',
      industry: r.industry,
      industryLabel,
      id: r.id,
      title: r.title,
      summary: r.summary,
      subtitle: r.subtitle || '',
      tags: r.tags || [],
      url: r.path,
      searchText: [r.title, r.subtitle || '', r.summary, ...(r.tags || [])].join(' ').toLowerCase()
    });
  }
  return items;
}

function initSearch() {
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  if (!input || !resultsEl) return;

  const index = buildSearchIndex();
  let activeIdx = -1;

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      activeIdx = -1;
      return;
    }

    const hits = index.filter(item => item.searchText.includes(q)).slice(0, 8);
    if (hits.length === 0) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = `<div class="search-empty">没有找到与「${query}」相关的报告</div>`;
      activeIdx = -1;
      return;
    }

    resultsEl.hidden = false;
    activeIdx = -1;
    resultsEl.innerHTML = hits.map((item, i) => {
      const isGame = item.industry === 'game';
      const accentColor = isGame ? 'var(--industry-game)' : 'var(--industry-drama)';
      const typeLabel = item.type === 'special' ? '专项研究' : '周报';
      const typeBadgeStyle = item.type === 'special'
        ? `color:var(--accent-teal);background:rgba(8,145,178,.08);border-color:rgba(8,145,178,.2)`
        : `color:${accentColor};background:${isGame ? 'rgba(37,99,235,.07)' : 'rgba(124,58,237,.07)'};border-color:${isGame ? 'rgba(37,99,235,.2)' : 'rgba(124,58,237,.2)'}`;
      const target = item.type === 'special' ? ' target="_blank"' : '';
      return `
        <a href="${item.url}"${target} class="search-hit" data-idx="${i}">
          <div class="search-hit-top">
            <span class="search-hit-badge" style="${typeBadgeStyle}">${typeLabel}</span>
            <span class="search-hit-industry" style="color:${accentColor}">${item.industryLabel}</span>
          </div>
          <div class="search-hit-title">${highlight(item.title, query)}</div>
          <div class="search-hit-summary">${highlight(item.summary.slice(0, 80) + (item.summary.length > 80 ? '…' : ''), query)}</div>
        </a>
      `;
    }).join('');
  }

  input.addEventListener('input', () => renderResults(input.value));

  input.addEventListener('keydown', e => {
    const hits = resultsEl.querySelectorAll('.search-hit');
    if (e.key === 'Escape') {
      input.value = '';
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      activeIdx = -1;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, hits.length - 1);
      hits.forEach((h, i) => h.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      hits.forEach((h, i) => h.classList.toggle('active', i === activeIdx));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      hits[activeIdx]?.click();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) {
      resultsEl.hidden = true;
      activeIdx = -1;
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) renderResults(input.value);
  });
}

// ── SCROLL REVEAL ────────────────────────────────────────────────────────────

function initScrollReveal() {
  const items = document.querySelectorAll('.industry-panel, .about-card, .insight-card, .special-card');
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeInUp .55s cubic-bezier(0.22,1,0.36,1) both';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });
  items.forEach(el => obs.observe(el));
}

// ── BOOT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const isReportPage = document.body.classList.contains('report-page');
  if (isReportPage) {
    initReportPage();
  } else {
    initIndexPage();
  }
  initScrollReveal();
});
