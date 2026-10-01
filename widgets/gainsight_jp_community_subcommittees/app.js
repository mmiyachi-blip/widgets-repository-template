const PIECES = [
  { key: 'piece_1', category: 'AI', defaultColor: '#4E86D6', icon: 'ai' },
  { key: 'piece_2', category: 'Operations', defaultColor: '#1F9D7C', icon: 'ops' },
  { key: 'piece_3', category: 'Digital', defaultColor: '#E08A3C', icon: 'digital' },
  { key: 'piece_4', category: 'Strategy', defaultColor: '#D9A62B', icon: 'strategy' },
  { key: 'piece_5', category: 'Community', defaultColor: '#D45C9C', icon: 'community' },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function cardHtml(def, props, iconUrl) {
  const title = props[`${def.key}_title`] || '';
  const desc = props[`${def.key}_desc`] || '';
  const link = props[`${def.key}_link`] || '#';
  const color = props[`${def.key}_color`] || def.defaultColor;
  const target = props.open_in_new_tab ? ' target="_blank" rel="noopener"' : '';

  return `
    <a class="card" style="--card-color: ${escapeHtml(color)}" href="${escapeHtml(link)}"${target} aria-label="${escapeHtml(title)} ${escapeHtml(desc)}">
      <div class="icon-blob"><img class="card-icon" src="${escapeHtml(iconUrl || '')}" alt="" /></div>
      <span class="card-category">${escapeHtml(def.category)}</span>
      <span class="card-title">${escapeHtml(title)}</span>
      <span class="card-desc">${escapeHtml(desc)}</span>
      <span class="arrow-badge" aria-hidden="true">&#8594;</span>
    </a>
  `;
}

export async function init(sdk) {
  await sdk.whenReady();

  // Resolved by the platform's publish-time rewrite of the <link> hrefs
  // declared statically in index.html — see the comment there.
  const iconUrls = {
    ai: sdk.$('#icon-src-ai')?.href || '',
    ops: sdk.$('#icon-src-ops')?.href || '',
    digital: sdk.$('#icon-src-digital')?.href || '',
    strategy: sdk.$('#icon-src-strategy')?.href || '',
    community: sdk.$('#icon-src-community')?.href || '',
  };

  const row = sdk.$('.cards-row');

  function render(props) {
    row.innerHTML = PIECES.map((def) => cardHtml(def, props, iconUrls[def.icon])).join('');
  }

  render(sdk.getProps());
  sdk.on('propsChanged', (newProps) => render(newProps));
}
