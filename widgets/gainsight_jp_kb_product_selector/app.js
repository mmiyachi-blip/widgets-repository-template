const PRODUCT_COUNT = 5;
const TAB_SLOTS = 4;
const GOAL_COUNT = 8;
const FALLBACK_LABEL = ['CS', 'CC', 'SJ', 'ST', 'AI'];
const PHASE_COLORS = [
  ['#e6f4fa', '#1a8fb8'],
  ['#e5f6ee', '#1e9a6b'],
  ['#fff4dc', '#e0951a'],
  ['#fceaf2', '#c2418a'],
];
const PERSON_SVG =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" aria-hidden="true"><circle cx="12" cy="9" r="4.2"/><path d="M3.8 21c.6-4.4 4-6.6 8.2-6.6s7.6 2.2 8.2 6.6z"/></svg>';
const DOC_SVG =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="#163e5e" aria-hidden="true"><path d="M6 2h8l6 6v14H6z M14 2v6h6" fill-opacity=".95"/><path d="M9 13h8M9 17h8M9 9h3" stroke="#fff" stroke-width="1.6" fill="none"/></svg>';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

// 検索結果から作成者を取り出す。項目名は取得結果の形に合わせて数か所を見る
function authorOf(item) {
  const a = item.author || item.firstPost?.author || item.firstPost?.user || item.user || null;
  if (!a) return null;
  return { name: a.username || a.name || '', avatar: a.avatar || '' };
}

function timeOf(item) {
  const t = Date.parse(item.publishedAt || item.createdAt || item.firstPost?.created || '');
  return Number.isNaN(t) ? 0 : t;
}

export async function init(sdk) {
  await sdk.whenReady();

  // 公開時にプラットフォームが書き換えた <link> の href（index.html のコメント参照）
  const imgUrl = (id) => sdk.$(`#${id}`)?.href || '';

  const wrap = sdk.$('.wrap');
  const tabsEl = sdk.$('.tabs');
  const panelEl = sdk.$('.panel');
  let selected = 0;
  let selectedTab = 0;
  let props = sdk.getProps();
  const cache = new Map(); // `${cats}|${limit}` -> 記事の配列
  let loadToken = 0;

  const icon = (id, fallback) =>
    `<span class="pic"><img src="${escapeHtml(imgUrl(id))}" alt="" data-fb="${escapeHtml(fallback)}"></span>`;

  function linkAttrs(url) {
    const target = props.open_in_new_tab ? ' target="_blank" rel="noopener"' : '';
    return `href="${escapeHtml(url || '#')}"${target}`;
  }

  // 画像が未配置・読み込み失敗のときは、代わりに文字を表示する
  function bindImageFallback(root) {
    root.querySelectorAll('img[data-fb]').forEach((img) => {
      const swap = () => img.replaceWith(document.createTextNode(img.dataset.fb));
      img.addEventListener('error', swap, { once: true });
      if (!img.getAttribute('src')) swap();
    });
  }

  // 製品n の有効なタブ（タイトルが空のものは除く）
  function tabsOf(n) {
    const list = [];
    for (let t = 1; t <= TAB_SLOTS; t += 1) {
      const title = (props[`p${n}_t${t}_title`] || '').trim();
      if (!title) continue;
      list.push({
        slot: t,
        title,
        desc: props[`p${n}_t${t}_desc`] || '',
        cats: String(props[`p${n}_t${t}_cats`] || '')
          .split(/[,、\s]+/)
          .map((v) => Number(v))
          .filter((v) => Number.isInteger(v) && v > 0),
        guide: props[`p${n}_t${t}_guide`],
      });
    }
    return list;
  }

  function renderTabs() {
    tabsEl.innerHTML = Array.from({ length: PRODUCT_COUNT }, (_, i) => {
      const n = i + 1;
      return `<button type="button" class="tab" role="tab" data-index="${i}" aria-selected="${i === selected}" tabindex="${i === selected ? 0 : -1}">
        ${icon(`img-product-${n}`, FALLBACK_LABEL[i])}
        <span class="txt"><b>${escapeHtml(props[`p${n}_name`])}</b><small>${escapeHtml(props[`p${n}_sub`])}</small></span>
      </button>`;
    }).join('');
    bindImageFallback(tabsEl);
  }

  function articleHtml(item) {
    const author = authorOf(item);
    const avatar = author?.avatar
      ? `<span class="av"><img src="${escapeHtml(author.avatar)}" alt=""></span>`
      : `<span class="av av-fb">${PERSON_SVG}</span>`;
    const meta = author?.name
      ? `<small class="meta">記事作成者${avatar}${escapeHtml(author.name)}</small>`
      : '';
    return `<a class="item" ${linkAttrs(item.url)}>
      <span class="doc">${DOC_SVG}</span>
      <span class="label"><b>${escapeHtml(item.title)}</b>${meta}</span>
    </a>`;
  }

  function emptyHtml(guideUrl) {
    return `<p class="empty">このフェーズの記事は準備中です。公開されると、ここに自動で表示されます。</p>${footHtml(guideUrl)}`;
  }

  function footHtml(guideUrl) {
    return `<div class="foot"><a class="catlink" ${linkAttrs(guideUrl)}>教材も含めた学習ガイドを見る →</a></div>`;
  }

  async function fetchArticles(cats, limit) {
    const key = `${cats.join(',')}|${limit}`;
    if (cache.has(key)) return cache.get(key);
    const sdkWeb = window.ChWebSdk;
    if (!sdkWeb?.Content?.search) throw new Error('ChWebSdk unavailable');
    const res = await sdkWeb.Content.search('', {
      contentType: 'article',
      categoryIds: cats,
      limit,
      fetchMetadata: true,
    });
    const items = (Array.isArray(res) ? res : res?.results || res?.hits || [])
      .filter((r) => r && r.title && r.url)
      .sort((a, b) => timeOf(b) - timeOf(a))
      .slice(0, limit);
    cache.set(key, items);
    return items;
  }

  async function renderList(n) {
    const listEl = sdk.$('.plist');
    if (!listEl) return;
    const tab = tabsOf(n)[selectedTab];
    if (!tab) { listEl.innerHTML = ''; return; }
    if (!tab.cats.length) { listEl.innerHTML = emptyHtml(tab.guide); return; }

    const limit = Math.min(20, Math.max(1, Number(props.articles_per_tab) || 8));
    const token = (loadToken += 1);
    listEl.innerHTML = '<p class="empty">読み込み中…</p>';
    try {
      const items = await fetchArticles(tab.cats, limit);
      if (token !== loadToken) return; // 別のタブに切り替わった
      listEl.innerHTML = items.length
        ? items.map(articleHtml).join('') + footHtml(tab.guide)
        : emptyHtml(tab.guide);
    } catch (err) {
      if (token !== loadToken) return;
      console.warn('[kb-product-selector] 記事を取得できませんでした', err);
      listEl.innerHTML = `<p class="empty">記事一覧を表示できませんでした。</p>${footHtml(tab.guide)}`;
    }
    bindAvatarFallback(listEl);
  }

  // アイコン画像が読めないときは人物シルエットにする
  function bindAvatarFallback(root) {
    root.querySelectorAll('.av img').forEach((img) => {
      img.addEventListener('error', () => {
        const span = img.parentElement;
        span.classList.add('av-fb');
        span.innerHTML = PERSON_SVG;
      }, { once: true });
    });
  }

  function renderPanel() {
    const n = selected + 1;
    const name = props[`p${n}_name`] || '';
    const tabs = tabsOf(n);
    if (selectedTab >= tabs.length) selectedTab = 0;

    const tabCards = tabs.map((t, i) => {
      const [tint, color] = PHASE_COLORS[i] || PHASE_COLORS[0];
      return `<button type="button" class="card phase" role="tab" data-tab="${i}" aria-selected="${i === selectedTab}" tabindex="${i === selectedTab ? 0 : -1}" style="--tint:${tint};--c:${color}">
        ${icon(`img-phase-${i + 1}`, `0${i + 1}`)}
        <span class="t"><b>0${i + 1}　${escapeHtml(t.title)}</b><small>${escapeHtml(t.desc)}</small></span>
      </button>`;
    }).join('');

    const goals = Array.from({ length: GOAL_COUNT }, (_, i) => {
      const g = i + 1;
      return `<a class="card goal" ${linkAttrs(props[`goal${g}_link`])}>
        ${icon(`img-goal-${g}`, String(g))}
        <span class="t"><b>${escapeHtml(props[`goal${g}_title`])}</b><small>${escapeHtml(props[`goal${g}_desc`])}</small></span>
        <span class="arw" aria-hidden="true">→</span>
      </a>`;
    }).join('');

    panelEl.innerHTML = `
      <div class="phead">
        ${icon(`img-product-${n}`, FALLBACK_LABEL[selected])}
        <div class="ptext">
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(props[`p${n}_desc`])}</p>
          <a class="catlink" ${linkAttrs(props[`p${n}_cat_link`])}>${escapeHtml(name)} のTips・カテゴリ一覧へ →</a>
        </div>
        <div class="part"><img src="${escapeHtml(imgUrl(`img-hero-${n}`))}" alt=""></div>
      </div>
      <div class="pbody">
        <h4>${escapeHtml(props.phases_heading)}</h4>
        <div class="grid4 ptabs" role="tablist" aria-label="フェーズ" style="--n:${Math.max(1, tabs.length)}">${tabCards}</div>
        <div class="plist" role="tabpanel"></div>
        <h4>${escapeHtml(props.goals_heading)}</h4>
        <div class="grid4">${goals}</div>
      </div>`;
    bindImageFallback(panelEl);
    // イラストは任意。未配置なら欄ごと消す
    panelEl.querySelectorAll('.part img').forEach((img) => {
      img.addEventListener('error', () => img.remove(), { once: true });
      if (!img.getAttribute('src')) img.remove();
    });
    renderList(n);
  }

  function render() {
    wrap.style.setProperty('--accent', props.accent_color || '#1565b8');
    renderTabs();
    renderPanel();
  }

  function selectProduct(i, focus) {
    selected = (i + PRODUCT_COUNT) % PRODUCT_COUNT;
    selectedTab = 0;
    render();
    if (focus) tabsEl.querySelector(`[data-index="${selected}"]`)?.focus();
  }

  function selectTab(i, focus) {
    const count = tabsOf(selected + 1).length;
    if (!count) return;
    selectedTab = (i + count) % count;
    renderPanel();
    if (focus) sdk.$(`.ptabs [data-tab="${selectedTab}"]`)?.focus();
  }

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-index]');
    if (tab) selectProduct(Number(tab.dataset.index), false);
  });
  tabsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); selectProduct(selected + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); selectProduct(selected - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); selectProduct(0, true); }
    else if (e.key === 'End') { e.preventDefault(); selectProduct(PRODUCT_COUNT - 1, true); }
  });

  panelEl.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) selectTab(Number(tab.dataset.tab), false);
  });
  panelEl.addEventListener('keydown', (e) => {
    const cur = e.target.closest?.('[data-tab]');
    if (!cur) return;
    const i = Number(cur.dataset.tab);
    if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(i + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(i - 1, true); }
  });

  render();
  sdk.on('propsChanged', (newProps) => {
    props = newProps;
    cache.clear();
    render();
  });
}
