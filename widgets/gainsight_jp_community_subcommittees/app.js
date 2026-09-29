const PIECES = [
  { key: 'piece_1', category: 'AI', defaultColor: '#4E86D6', icon: 'ai' },
  { key: 'piece_2', category: 'Operations', defaultColor: '#1F9D7C', icon: 'ops' },
  { key: 'piece_3', category: 'Digital', defaultColor: '#E08A3C', icon: 'digital' },
  { key: 'piece_4', category: 'Strategy', defaultColor: '#D9A62B', icon: 'strategy' },
  { key: 'piece_5', category: 'Community', defaultColor: '#D45C9C', icon: 'community' },
];

function iconMarkup(kind) {
  switch (kind) {
    case 'ai':
      return `
        <rect x="14" y="20" width="36" height="28" rx="10" />
        <line x1="32" y1="20" x2="32" y2="10" />
        <circle cx="32" cy="8" r="3.2" fill="currentColor" stroke="none" />
        <circle cx="25" cy="34" r="3.6" fill="currentColor" stroke="none" />
        <circle cx="39" cy="34" r="3.6" fill="currentColor" stroke="none" />
        <line x1="24" y1="44" x2="40" y2="44" />
      `;
    case 'ops':
      return `
        <circle cx="22" cy="36" r="10" />
        <circle cx="22" cy="36" r="3.2" fill="currentColor" stroke="none" />
        ${gearTeeth(22, 36, 15.5, 11, 8)}
        <line x1="40" y1="46" x2="40" y2="36" />
        <line x1="46" y1="46" x2="46" y2="24" />
        <line x1="52" y1="46" x2="52" y2="30" />
      `;
    case 'digital':
      return `
        <rect x="10" y="16" width="32" height="22" rx="3" />
        <path d="M10 16 L26 29 L42 16" />
        <path d="M40 12 L54 18 L40 24 L44 18 Z" fill="currentColor" stroke="none" />
      `;
    case 'strategy':
      return `
        <path d="M8 48 L22 26 L30 36 L40 18 L56 48 Z" />
        <line x1="40" y1="18" x2="40" y2="6" />
        <path d="M40 6 L51 10 L40 14 Z" fill="currentColor" stroke="none" />
      `;
    case 'community':
      return `
        <circle cx="18" cy="28" r="6" />
        <circle cx="44" cy="28" r="6" />
        <circle cx="31" cy="20" r="7" />
        <path d="M8 48 Q18 36 28 48" />
        <path d="M34 48 Q44 36 54 48" />
        <path d="M18 48 Q31 32 44 48" />
      `;
    default:
      return '';
  }
}

function gearTeeth(cx, cy, rOuter, rInner, count) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const rad = ((i / count) * 360 * Math.PI) / 180;
    const x1 = cx + rInner * Math.cos(rad);
    const y1 = cy + rInner * Math.sin(rad);
    const x2 = cx + rOuter * Math.cos(rad);
    const y2 = cy + rOuter * Math.sin(rad);
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
  }
  return s;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function cardHtml(def, props) {
  const title = props[`${def.key}_title`] || '';
  const desc = props[`${def.key}_desc`] || '';
  const link = props[`${def.key}_link`] || '#';
  const color = props[`${def.key}_color`] || def.defaultColor;
  const target = props.open_in_new_tab ? ' target="_blank" rel="noopener"' : '';

  return `
    <a class="card" style="--card-color: ${escapeHtml(color)}" href="${escapeHtml(link)}"${target} aria-label="${escapeHtml(title)} ${escapeHtml(desc)}">
      <div class="icon-blob"><svg class="card-icon" viewBox="0 0 64 64">${iconMarkup(def.icon)}</svg></div>
      <span class="card-category">${escapeHtml(def.category)}</span>
      <span class="card-title">${escapeHtml(title)}</span>
      <span class="card-desc">${escapeHtml(desc)}</span>
      <span class="arrow-badge" aria-hidden="true">&#8594;</span>
    </a>
  `;
}

export async function init(sdk) {
  await sdk.whenReady();

  const row = sdk.$('.cards-row');

  function render(props) {
    row.innerHTML = PIECES.map((def) => cardHtml(def, props)).join('');
  }

  render(sdk.getProps());
  sdk.on('propsChanged', (newProps) => render(newProps));
}
