const PRODUCT_COUNT = 5;
const PHASE_COUNT = 4;
const GOAL_COUNT = 8;
const FALLBACK_LABEL = ['CS', 'CC', 'CE', 'ST', 'AI'];
const PHASE_COLORS = [
  ['#e6f4fa', '#1a8fb8'],
  ['#e5f6ee', '#1e9a6b'],
  ['#fff4dc', '#e0951a'],
  ['#fceaf2', '#c2418a'],
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export async function init(sdk) {
  await sdk.whenReady();

  // 公開時にプラットフォームが書き換えた <link> の href（index.html のコメント参照）
  const imgUrl = (id) => sdk.$(`#${id}`)?.href || '';

  const wrap = sdk.$('.wrap');
  const tabsEl = sdk.$('.tabs');
  const panelEl = sdk.$('.panel');
  let selected = 0;
  let props = sdk.getProps();

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

  function renderPanel() {
    const n = selected + 1;
    const name = props[`p${n}_name`] || '';

    const phases = Array.from({ length: PHASE_COUNT }, (_, i) => {
      const p = i + 1;
      const [tint, color] = PHASE_COLORS[i];
      return `<a class="card phase" style="--tint:${tint};--c:${color}" ${linkAttrs(props[`p${n}_phase${p}_link`])}>
        ${icon(`img-phase-${p}`, `0${p}`)}
        <span class="t"><b>0${p}　${escapeHtml(props[`phase${p}_title`])}</b><small>${escapeHtml(props[`phase${p}_desc`])}</small></span>
        <span class="arw" aria-hidden="true">→</span>
      </a>`;
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
        <div class="grid4">${phases}</div>
        <h4>${escapeHtml(props.goals_heading)}</h4>
        <div class="grid4">${goals}</div>
      </div>`;
    bindImageFallback(panelEl);
    // イラストは任意。未配置なら欄ごと消す
    panelEl.querySelectorAll('.part img').forEach((img) => {
      img.addEventListener('error', () => img.remove(), { once: true });
      if (!img.getAttribute('src')) img.remove();
    });
  }

  function render() {
    wrap.style.setProperty('--accent', props.accent_color || '#1565b8');
    tabsEl.setAttribute('aria-label', '製品');
    renderTabs();
    renderPanel();
  }

  function select(i, focus) {
    selected = (i + PRODUCT_COUNT) % PRODUCT_COUNT;
    render();
    if (focus) tabsEl.querySelector(`[data-index="${selected}"]`)?.focus();
  }

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-index]');
    if (tab) select(Number(tab.dataset.index), false);
  });
  tabsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); select(selected + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); select(selected - 1, true); }
    else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    else if (e.key === 'End') { e.preventDefault(); select(PRODUCT_COUNT - 1, true); }
  });

  render();
  sdk.on('propsChanged', (newProps) => {
    props = newProps;
    render();
  });
}
