const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const CX = 350;
const CY = 350;
const R_OUT = 345;
const R_IN = 122;
const BUMP_H = 9;

// Fixed visual layout: angle 0 = 12 o'clock, increasing clockwise. Reading
// order matches the reference circle (top-left, then clockwise).
const PIECES = [
  { key: 'piece_1', category: 'AI', a0: -72, a1: 0, defaultColor: '#4E86D6', icon: 'ai' },
  { key: 'piece_2', category: 'Operations', a0: 0, a1: 72, defaultColor: '#3FA772', icon: 'ops' },
  { key: 'piece_3', category: 'Digital', a0: 72, a1: 144, defaultColor: '#E08A3C', icon: 'digital' },
  { key: 'piece_4', category: 'Strategy', a0: 144, a1: 216, defaultColor: '#D9A62B', icon: 'strategy' },
  { key: 'piece_5', category: 'Community', a0: 216, a1: 288, defaultColor: '#D45C9C', icon: 'community' },
];

// The content card (icon + text) sits at one anchor point per piece rather
// than being spread across several concentric radial bands: a band-per-line
// layout looked fine for the top/bottom pieces, but for the side-facing ones
// (whose "outward" direction runs nearly horizontal, same as the text's own
// width axis) the bands crept in far enough to collide with the center
// circle. A single anchor, chosen so the card's half-diagonal clears both
// the center circle and the outer edge at every angle, works uniformly.
const ANCHOR_R = 232;
const CARD_W = 148;
const CARD_H = 132;

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
}

// A radial edge (inner radius -> outer radius, or reversed) with a small
// circular-arc bump partway along it, so adjacent pieces read as interlocking
// puzzle pieces rather than a plain pie chart. Traversal direction flips the
// sweep flag, which keeps the bump on the same physical curve regardless of
// which of the two adjacent pieces is drawing it (forward = tab, backward =
// the matching notch on the neighbor).
function bumpEdge(deg, rFrom, rTo) {
  const rad = (deg * Math.PI) / 180;
  const ux = Math.sin(rad);
  const uy = -Math.cos(rad);
  const span = rTo - rFrom;
  const f0 = 0.4;
  const f1 = 0.6;
  const pA = { x: CX + (rFrom + f0 * span) * ux, y: CY + (rFrom + f0 * span) * uy };
  const pB = { x: CX + (rFrom + f1 * span) * ux, y: CY + (rFrom + f1 * span) * uy };
  const end = { x: CX + rTo * ux, y: CY + rTo * uy };
  const chord = Math.abs(f1 - f0) * span;
  const Rb = (chord * chord / 4 + BUMP_H * BUMP_H) / (2 * BUMP_H);
  const sweep = rTo > rFrom ? 1 : 0;
  return `L ${pA.x.toFixed(2)} ${pA.y.toFixed(2)} A ${Rb.toFixed(2)} ${Rb.toFixed(2)} 0 0 ${sweep} ${pB.x.toFixed(2)} ${pB.y.toFixed(2)} L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function piecePath(a0, a1) {
  const pStart = polar(R_IN, a0);
  const outerA1 = polar(R_OUT, a1);
  const innerA0 = polar(R_IN, a0);
  return [
    `M ${pStart.x.toFixed(2)} ${pStart.y.toFixed(2)}`,
    bumpEdge(a0, R_IN, R_OUT),
    `A ${R_OUT} ${R_OUT} 0 0 1 ${outerA1.x.toFixed(2)} ${outerA1.y.toFixed(2)}`,
    bumpEdge(a1, R_OUT, R_IN),
    `A ${R_IN} ${R_IN} 0 0 0 ${innerA0.x.toFixed(2)} ${innerA0.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function el(tag, attrs, html) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (html != null) node.innerHTML = html;
  return node;
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
        <circle cx="24" cy="34" r="11" />
        <circle cx="24" cy="34" r="3.5" fill="currentColor" stroke="none" />
        ${gearTeeth(24, 34, 17, 12, 8)}
        <line x1="42" y1="46" x2="42" y2="34" />
        <line x1="48" y1="46" x2="48" y2="26" />
        <line x1="54" y1="46" x2="54" y2="38" />
      `;
    case 'digital':
      return `
        <rect x="12" y="18" width="34" height="24" rx="3" />
        <path d="M12 18 L29 32 L46 18" />
        <rect x="41" y="34" width="14" height="22" rx="3" />
        <line x1="45" y1="50" x2="51" y2="50" />
      `;
    case 'strategy':
      return `
        <path d="M10 48 L24 26 L32 36 L42 18 L56 48 Z" />
        <line x1="42" y1="18" x2="42" y2="6" />
        <path d="M42 6 L53 10 L42 14 Z" fill="currentColor" stroke="none" />
      `;
    case 'community':
      return `
        <circle cx="20" cy="28" r="6" />
        <circle cx="44" cy="28" r="6" />
        <circle cx="32" cy="20" r="7" />
        <path d="M10 48 Q20 36 30 48" />
        <path d="M34 48 Q44 36 54 48" />
        <path d="M20 48 Q32 32 44 48" />
      `;
    default:
      return '';
  }
}

let measureCtx = null;
function getMeasureCtx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  return measureCtx;
}

function wrapText(text, font, maxWidth) {
  const ctx = getMeasureCtx();
  ctx.font = font;
  const lines = [];
  const paragraphs = String(text || '').split('\n');
  for (const para of paragraphs) {
    let line = '';
    for (const ch of para) {
      const test = line + ch;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

function textElement(text, { x, y, cls, font, maxWidth, lineHeight }) {
  const lines = wrapText(text, font, maxWidth);
  const t = el('text', { class: cls, x, y, 'text-anchor': 'middle' });
  const startDy = -((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    const tspan = document.createElementNS(SVG_NS, 'tspan');
    tspan.setAttribute('x', x);
    tspan.setAttribute('dy', i === 0 ? startDy : lineHeight);
    tspan.textContent = line;
    t.appendChild(tspan);
  });
  return t;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function renderPiece(def, props) {
  const title = props[`${def.key}_title`] || '';
  const desc = props[`${def.key}_desc`] || '';
  const link = props[`${def.key}_link`] || '#';
  const color = props[`${def.key}_color`] || def.defaultColor;
  const mid = (def.a0 + def.a1) / 2;

  const a = el('a', { class: 'piece', href: link });
  a.setAttributeNS(XLINK_NS, 'xlink:href', link);
  if (props.open_in_new_tab) a.setAttribute('target', '_blank');
  a.setAttribute('tabindex', '0');
  a.setAttribute('aria-label', `${title} ${desc}`.trim());

  const group = el('g', { class: 'piece-group' });

  const shape = el('path', { class: 'piece-shape', d: piecePath(def.a0, def.a1), stroke: color });
  group.appendChild(shape);

  const anchor = polar(ANCHOR_R, mid);
  const fo = el('foreignObject', {
    x: (anchor.x - CARD_W / 2).toFixed(1),
    y: (anchor.y - CARD_H / 2).toFixed(1),
    width: CARD_W,
    height: CARD_H,
  });
  const div = document.createElement('div');
  div.className = 'piece-card';
  div.innerHTML = `
    <svg class="piece-icon" viewBox="0 0 64 64" stroke="${escapeHtml(color)}">${iconMarkup(def.icon)}</svg>
    <span class="piece-category" style="color:${escapeHtml(color)}">${escapeHtml(def.category)}</span>
    <span class="piece-title">${escapeHtml(title)}</span>
    <span class="piece-desc">${escapeHtml(desc)}</span>
  `;
  fo.appendChild(div);
  group.appendChild(fo);

  a.appendChild(group);
  return a;
}

function renderCenter(props) {
  const g = el('g', { class: 'center' });
  g.appendChild(el('circle', { class: 'center-circle', cx: CX, cy: CY, r: R_IN - 4 }));
  g.appendChild(textElement(props.center_text || '', {
    x: CX, y: CY, cls: 'center-text', font: 'bold 20px sans-serif', maxWidth: R_IN * 1.55, lineHeight: 26,
  }));
  return g;
}

export async function init(sdk) {
  await sdk.whenReady();

  const piecesLayer = sdk.$('.pieces');
  const centerLayer = sdk.$('.center');

  function render(props) {
    piecesLayer.innerHTML = '';
    PIECES.forEach((def) => piecesLayer.appendChild(renderPiece(def, props)));
    centerLayer.innerHTML = '';
    centerLayer.appendChild(renderCenter(props));
  }

  render(sdk.getProps());
  sdk.on('propsChanged', (newProps) => render(newProps));
}
