/**
 * Content Intel Hub — App Logic (v4)
 */

// ── HELPERS ──────────────────────────────────────────────────────────────────

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`;
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

const KPI_COLOR_MAP = {
  blue:   { text: '#2563eb', bg: 'rgba(37,99,235,.07)' },
  indigo: { text: '#4f46e5', bg: 'rgba(79,70,229,.07)' },
  teal:   { text: '#0891b2', bg: 'rgba(8,145,178,.07)' },
  green:  { text: '#16a34a', bg: 'rgba(22,163,74,.07)' },
  orange: { text: '#ea580c', bg: 'rgba(234,88,12,.07)' },
  red:    { text: '#dc2626', bg: 'rgba(220,38,38,.07)' },
  violet: { text: '#7c3aed', bg: 'rgba(124,58,237,.07)' },
  pink:   { text: '#db2777', bg: 'rgba(219,39,119,.07)' },
};

// Priority config: color swatch + label
const PRIORITY_MAP = {
  high:  { dot: '#ef4444', badge: '#fef2f2', badgeBorder: '#fecaca', badgeText: '#b91c1c', icon: '🔴', label: '立即关注' },
  watch: { dot: '#f59e0b', badge: '#fffbeb', badgeBorder: '#fde68a', badgeText: '#92400e', icon: '🟡', label: '持续跟踪' },
  new:   { dot: '#6366f1', badge: '#eef2ff', badgeBorder: '#c7d2fe', badgeText: '#3730a3', icon: '🟣', label: '新机会' },
  trend: { dot: '#0891b2', badge: '#ecfeff', badgeBorder: '#a5f3fc', badgeText: '#155e75', icon: '🔵', label: '结构趋势' },
  risk:  { dot: '#ea580c', badge: '#fff7ed', badgeBorder: '#fed7aa', badgeText: '#9a3412', icon: '🟠', label: '风险预警' },
};

// ── WEEKLY REPORTS ADAPTER ────────────────────────────────────────────────────

function buildWeeklyList() {
  if (typeof WEEKLY_REPORTS !== 'undefined' && WEEKLY_REPORTS.length) {
    return WEEKLY_REPORTS.filter(w => w && w.week);
  }
  const byWeek = {};
  const gameReports  = (typeof REPORTS_BY_INDUSTRY !== 'undefined') ? (REPORTS_BY_INDUSTRY.game  || []) : [];
  const dramaReports = (typeof REPORTS_BY_INDUSTRY !== 'undefined') ? (REPORTS_BY_INDUSTRY.drama || []) : [];
  gameReports.forEach(r => {
    if (!byWeek[r.week]) byWeek[r.week] = { week: r.week, period: r.period, publishedAt: r.publishedAt };
    byWeek[r.week].game = r;
  });
  dramaReports.forEach(r => {
    if (!byWeek[r.week]) byWeek[r.week] = { week: r.week, period: r.period, publishedAt: r.publishedAt };
    byWeek[r.week].drama = r;
  });
  return Object.values(byWeek).sort((a, b) => b.week.localeCompare(a.week));
}

// ── INDEX PAGE ────────────────────────────────────────────────────────────────

function initIndexPage() {
  const list = buildWeeklyList();
  const container = document.getElementById('report-list');
  const label = document.getElementById('report-count-label');
  const tocChips = document.getElementById('toc-chips');

  // 渲染 TOC 导航
  if (tocChips && list.length) {
    tocChips.innerHTML = list.slice(0, 12).map((w, i) => {
      const isLatest = i === 0;
      return `<a href="report.html?week=${encodeURIComponent(w.week)}" class="toc-chip ${isLatest ? 'latest' : ''}">${w.week}${isLatest ? ' · 最新' : ''}</a>`;
    }).join('');
  }

  if (!container) return;

  if (label) label.textContent = `📋 历史报告归档（共 ${list.length} 期）`;

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#9ca3af;padding:40px">暂无报告</div>`;
    return;
  }

  container.innerHTML = list.map((w, i) => {
    const game  = w.game;
    const drama = w.drama;
    const summary = game ? game.summary : (drama ? drama.summary : '');
    const isLatest = i === 0;

    return `
      <a href="report.html?week=${encodeURIComponent(w.week)}" class="report-card">
        <div class="report-card-left">
          <div class="report-card-title-row">
            <span class="report-card-week">${w.week}</span>
            ${isLatest ? '<span class="badge-latest">最新</span>' : ''}
          </div>
          <div class="report-card-summary">${summary}</div>
        </div>
        <div class="report-card-right">
          <span class="report-card-date">${w.period || ''}</span>
          <div class="report-card-industries">
            ${game  ? '<span class="ind-tag">🎮 游戏</span>' : ''}
            ${drama ? '<span class="ind-tag">📖 短剧漫剧</span>' : ''}
          </div>
        </div>
      </a>
    `;
  }).join('');
}

// ── REPORT DETAIL PAGE ────────────────────────────────────────────────────────

function initReportPage() {
  try {
    const weekParam = getParam('week');
    const idParam   = getParam('id');
    let weekly = null;

    // 获取周报列表
    const list = buildWeeklyList();
    
    if (!list || list.length === 0) {
      console.error('buildWeeklyList返回空数组');
      const t = document.getElementById('hero-title');
      if (t) t.textContent = '数据加载失败';
      return;
    }

    if (weekParam) {
      weekly = list.find(w => w.week === weekParam);
      if (!weekly) {
        console.log(`未找到周报: ${weekParam}, 使用最新一期`);
        weekly = list[0];
      }
    } else if (idParam) {
      weekly = list.find(w =>
        (w.game  && w.game.id  === idParam) ||
        (w.drama && w.drama.id === idParam)
      );
      if (!weekly) {
        console.log(`未找到报告ID: ${idParam}, 使用最新一期`);
        weekly = list[0];
      }
    } else {
      weekly = list[0];
    }

    if (!weekly) {
      console.error('weekly对象为空');
      const t = document.getElementById('hero-title');
      if (t) t.textContent = '报告未找到';
      return;
    }

    console.log(`成功加载周报: ${weekly.week}`);
    renderHero(weekly);
    renderReportBody(weekly);
  } catch (error) {
    console.error('initReportPage错误:', error);
    const t = document.getElementById('hero-title');
    if (t) t.textContent = '页面加载失败';
  }
}

function renderHero(w) {
  const el = id => document.getElementById(id);
  const title = el('hero-title');
  const meta  = el('hero-meta');
  const tags  = el('hero-tags');

  document.title = `${w.week} 内容消费周报 | Content Intel Hub`;
  if (title) title.textContent = `${w.week} 内容消费行业资讯周报`;
  if (meta) {
    meta.innerHTML = `<span>${w.period || ''}</span><span>发布于 ${formatDate(w.publishedAt)}</span>`;
  }
  if (tags) {
    const allTags = [
      ...((w.game  && w.game.tags)  || []),
      ...((w.drama && w.drama.tags) || [])
    ].slice(0, 8);
    tags.innerHTML = allTags.map(t => `<span class="hero-tag">${t}</span>`).join('');
  }
}

function renderReportBody(w) {
  const body = document.getElementById('report-body');
  if (!body) return;

  let html = renderInsightBanner(w);
  if (w.game)  html += renderIndustrySection(w.game,  'game',  '🎮', '游戏行业',   '手游 · 开放世界 · 出海');
  if (w.drama) html += renderIndustrySection(w.drama, 'drama', '📖', '短剧漫剧', 'AI短剧 · 漫剧 · 监管政策');

  body.innerHTML = html;

  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    body.querySelectorAll('.md-placeholder').forEach(el => {
      el.innerHTML = postProcessMd(marked.parse(el.getAttribute('data-md') || ''));
      el.classList.remove('md-placeholder');
    });
  } else {
    body.querySelectorAll('.md-placeholder').forEach(el => {
      el.innerHTML = `<pre style="white-space:pre-wrap;font-size:13px">${el.getAttribute('data-md') || ''}</pre>`;
      el.classList.remove('md-placeholder');
    });
  }
}

// ── INSIGHT BANNER ────────────────────────────────────────────────────────────

function renderInsightBanner(w) {
  const gameItems  = Array.isArray(w.game  && w.game.insight)  ? w.game.insight  : null;
  const dramaItems = Array.isArray(w.drama && w.drama.insight) ? w.drama.insight : null;

  if (!gameItems && !dramaItems) {
    return renderLegacyInsightBanner(w);
  }

  // Priority sort order: high > risk > watch > new > trend
  const PRIORITY_ORDER = { high: 0, risk: 1, watch: 2, new: 3, trend: 4 };
  const sortCards = arr => arr.sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
  );

  const sortedGame  = sortCards([...(gameItems  || [])].map(c => ({ ...c, _sector: 'game' })));
  const sortedDrama = sortCards([...(dramaItems || [])].map(c => ({ ...c, _sector: 'drama' })));

  const gameCardsHtml  = sortedGame.map(card  => renderInsightCard(card)).join('');
  const dramaCardsHtml = sortedDrama.map(card => renderInsightCard(card)).join('');

  return `
    <div class="insight-banner">
      <div class="insight-banner-header">
        <span class="insight-banner-icon">⭐</span>
        <div class="insight-banner-titles">
          <span class="insight-banner-title">核心结论 · 分析师研判</span>
          <span class="insight-banner-sub">广告媒体平台视角 · 按优先级排序</span>
        </div>
      </div>

      <div class="insight-sector-block">
        <div class="insight-sector-header insight-sector-header--game">
          <span class="insight-sector-icon">🎮</span>
          <span class="insight-sector-label">游戏行业</span>
          <span class="insight-sector-count">${sortedGame.length} 条结论</span>
        </div>
        <div class="insight-grid">
          ${gameCardsHtml}
        </div>
      </div>

      <div class="insight-sector-block">
        <div class="insight-sector-header insight-sector-header--drama">
          <span class="insight-sector-icon">📖</span>
          <span class="insight-sector-label">短剧 · 漫剧</span>
          <span class="insight-sector-count">${sortedDrama.length} 条结论</span>
        </div>
        <div class="insight-grid">
          ${dramaCardsHtml}
        </div>
      </div>
    </div>
  `;
}

function renderInsightCard(card) {
  const pm = PRIORITY_MAP[card.priority] || PRIORITY_MAP.watch;
  const sectorClass = card._sector === 'game' ? 'insight-card--game' : 'insight-card--drama';
  const sectorIcon  = card._sector === 'game' ? '🎮' : '📖';

  return `
    <div class="insight-card ${sectorClass}">
      <div class="insight-card-head">
        <div class="insight-card-priority-row">
          <span class="insight-priority-dot" style="background:${pm.dot}"></span>
          <span class="insight-priority-badge" style="background:${pm.badge};border-color:${pm.badgeBorder};color:${pm.badgeText}">${pm.label}</span>
          <span class="insight-card-label">${card.label || ''}</span>
          <span class="insight-sector-icon">${sectorIcon}</span>
        </div>
        <div class="insight-card-title">${card.title}</div>
      </div>
      <div class="insight-card-body">${card.body}</div>
      ${card.action ? `
        <div class="insight-card-action">
          <span class="insight-action-arrow">→</span>
          <span>${card.action}</span>
        </div>
      ` : ''}
    </div>
  `;
}

function renderLegacyInsightBanner(w) {
  const gameItems  = (w.game  && w.game.highlights)  || [];
  const dramaItems = (w.drama && w.drama.highlights) || [];

  let sectionsHtml = '';
  if (gameItems.length) {
    sectionsHtml += `
      <div class="insight-section">
        <div class="insight-section-label insight-section-label--game">
          <span class="insight-dot insight-dot--game"></span>🎮 游戏行业要点
        </div>
        <ul class="insight-items">
          ${gameItems.map(h => `<li class="insight-item">${h}</li>`).join('')}
        </ul>
      </div>`;
  }
  if (dramaItems.length) {
    sectionsHtml += `
      <div class="insight-section">
        <div class="insight-section-label insight-section-label--drama">
          <span class="insight-dot insight-dot--drama"></span>📖 短剧漫剧要点
        </div>
        <ul class="insight-items">
          ${dramaItems.map(h => `<li class="insight-item">${h}</li>`).join('')}
        </ul>
      </div>`;
  }
  return `
    <div class="insight-banner">
      <div class="insight-banner-header">
        <span class="insight-banner-icon">⭐</span>
        <div class="insight-banner-titles">
          <span class="insight-banner-title">本周要点</span>
          <span class="insight-banner-sub">${w.week}</span>
        </div>
      </div>
      ${sectionsHtml}
    </div>`;
}

// ── INDUSTRY SECTION ──────────────────────────────────────────────────────────

function renderIndustrySection(r, type, icon, name, sub) {
  const isGame = type === 'game';
  const anchor = `section-${type}`;
  const kpiHtml = buildKpiRow(r.kpis, type);

  const calloutText = r.callout || r.summary || '';
  const calloutHtml = calloutText ? `
    <div class="section-callout ${isGame ? '' : 'section-callout--drama'}">
      <div class="section-callout-icon">👔</div>
      <div class="section-callout-body">
        <div class="section-callout-label">小结</div>
        <div>${calloutText}</div>
      </div>
    </div>` : '';

  return `
    <div class="industry-section section-${type}" id="${anchor}">
      <div class="industry-header ${isGame ? '' : 'industry-header--drama'}">
        <span class="industry-icon">${icon}</span>
        <div class="industry-info">
          <div class="industry-name">${name}</div>
          <div class="industry-sub">${sub}</div>
        </div>
        <span class="industry-pill ${isGame ? '' : 'industry-pill--drama'}">${r.week}</span>
      </div>
      ${kpiHtml}
      ${calloutHtml}
      <div class="markdown-body md-placeholder" data-md="${escapeAttr(r.content || '')}"></div>
    </div>`;
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildKpiRow(kpis, type) {
  if (!kpis || kpis.length === 0) return '';
  const cards = kpis.map(k => {
    const c = KPI_COLOR_MAP[k.color] || KPI_COLOR_MAP.blue;
    return `
      <div class="kpi-card" style="--kpi-color:${c.text};--kpi-bg:${c.bg}">
        <div class="kpi-value" style="color:${c.text}">${k.value}</div>
        <div class="kpi-label">${k.label}</div>
        ${k.delta ? `<div class="kpi-delta">${k.delta}</div>` : ''}
      </div>`;
  }).join('');
  return `<div class="kpi-row">${cards}</div>`;
}

function postProcessMd(html) {
  // 📌 blockquotes → amber callout
  html = html.replace(
    /<blockquote>\s*<p>📌\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
    '<div class="md-callout"><span>📌</span><p>$1</p></div>'
  );
  // Hide ⭐ 核心结论 / 综合研判 section (already in banner)
  html = html.replace(
    /<h2[^>]*>[^<]*(?:⭐|核心结论|综合研判)[^<]*<\/h2>([\s\S]*?)(?=<h2|$)/g,
    '<hr>'
  );
  
  // 选择性加粗逻辑
  // 1. bullet point冒号前的内容加粗
  html = html.replace(
    /<li>([^:]+):([^<]*)/g,
    (match, beforeColon, afterColon) => {
      // 跳过已经包含strong标签的
      if (beforeColon.includes('<strong>')) return match;
      return `<li><strong>${beforeColon}</strong>:${afterColon}`;
    }
  );
  
  // 2. 表格第一列加粗（不包括标题行）
  // 创建临时DOM来操作
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // 处理所有表格
  doc.querySelectorAll('table').forEach(table => {
    // 获取所有行（跳过标题行）
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      // 跳过标题行（第一行）
      if (rowIndex === 0) return;
      
      // 获取第一列单元格
      const firstCell = row.querySelector('td:first-child');
      if (firstCell) {
        const text = firstCell.textContent.trim();
        if (text && !firstCell.innerHTML.includes('<strong>')) {
          firstCell.innerHTML = `<strong>${text}</strong>`;
        }
      }
    });
  });
  
  // 将处理后的HTML转换回字符串
  const serializer = new XMLSerializer();
  const processedHtml = serializer.serializeToString(doc.body);
  
  // 提取body内容（去掉body标签）
  const bodyContent = processedHtml.replace(/^<body>|<\/body>$/g, '');
  
  return bodyContent;
}

// ── BOOT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const isReport = document.getElementById('report-body') !== null;
  if (isReport) initReportPage();
  else initIndexPage();
});
