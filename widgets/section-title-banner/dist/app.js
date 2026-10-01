// Decorative patterns for the left side (viewBox 0 0 400 120). The right side
// is the same SVG mirrored with CSS, so each pattern only needs to be drawn once.
const STAR = 'M0 -11 L3.2 -3.6 L11 -3.4 L5 1.8 L7 9.6 L0 5.4 L-7 9.6 L-5 1.8 L-11 -3.4 L-3.2 -3.6 Z'
const SPARKLE = 'M0 -12 C1 -4 4 -1 12 0 C4 1 1 4 0 12 C-1 4 -4 1 -12 0 C-4 -1 -1 -4 0 -12 Z'

const DECOS = {
  wave_star: `
    <path d="M70 100 C150 108 200 66 270 62 C320 60 370 72 396 82" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <g transform="translate(62 40) rotate(-12) scale(1.5)" fill="currentColor"><path d="${STAR}"/></g>
    <g fill="currentColor">
      <circle cx="14" cy="52" r="4"/><circle cx="34" cy="68" r="4.5"/>
      <circle cx="92" cy="72" r="3"/><circle cx="108" cy="80" r="2.6"/><circle cx="124" cy="86" r="2.2"/><circle cx="140" cy="90" r="1.8"/>
    </g>`,
  wave_dots: `
    <path d="M30 88 C90 60 140 112 200 84 C260 56 320 100 396 70" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <g fill="currentColor" opacity="0.8">
      <circle cx="30" cy="44" r="6"/><circle cx="62" cy="30" r="4"/><circle cx="96" cy="40" r="3"/>
      <circle cx="140" cy="32" r="2.4"/><circle cx="188" cy="36" r="2"/>
    </g>
    <g fill="currentColor" opacity="0.5">
      <circle cx="60" cy="104" r="3"/><circle cx="110" cy="108" r="2.4"/><circle cx="160" cy="100" r="2"/>
    </g>`,
  sparkles: `
    <g fill="currentColor">
      <g transform="translate(70 36) scale(1.9)"><path d="${SPARKLE}"/></g>
      <g transform="translate(170 78) scale(1.3)" opacity="0.8"><path d="${SPARKLE}"/></g>
      <g transform="translate(36 92) scale(0.9)" opacity="0.6"><path d="${SPARKLE}"/></g>
      <g transform="translate(250 40) scale(0.8)" opacity="0.5"><path d="${SPARKLE}"/></g>
      <circle cx="120" cy="30" r="3.5" opacity="0.7"/><circle cx="214" cy="52" r="2.6" opacity="0.6"/>
      <circle cx="300" cy="86" r="2.2" opacity="0.4"/><circle cx="96" cy="100" r="2.6" opacity="0.5"/>
    </g>`,
  confetti: `
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="40" cy="38" r="9"/>
      <path d="M110 24 l11 18 h-22 z" opacity="0.8"/>
      <path d="M170 86 q8 -14 16 0 t16 0" opacity="0.8"/>
      <rect x="236" y="30" width="16" height="16" rx="3" transform="rotate(20 244 38)" opacity="0.6"/>
      <path d="M70 94 l14 0 M77 87 l0 14" opacity="0.7"/>
    </g>
    <g fill="currentColor">
      <circle cx="148" cy="52" r="4"/><circle cx="214" cy="78" r="3"/><circle cx="280" cy="58" r="2.4" opacity="0.6"/><circle cx="20" cy="84" r="3" opacity="0.7"/>
    </g>`,
  leaf: `
    <path d="M10 96 C90 96 160 84 240 56 C290 40 340 40 396 52" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <g fill="currentColor">
      <path d="M70 94 C60 76 70 62 88 58 C96 74 88 88 70 94 Z" opacity="0.85"/>
      <path d="M120 92 C128 108 146 112 160 106 C154 90 138 86 120 92 Z" opacity="0.7"/>
      <path d="M180 78 C172 58 184 44 204 42 C210 60 200 74 180 78 Z" opacity="0.85"/>
      <path d="M232 62 C242 78 260 80 272 72 C264 56 248 54 232 62 Z" opacity="0.6"/>
      <path d="M296 44 C290 28 300 16 316 14 C322 28 314 40 296 44 Z" opacity="0.7"/>
    </g>`,
  none: '',
}

const TITLE_SIZES = { s: '30px', m: '40px', l: '52px' }

// Only allow http(s)/mailto/tel, site-relative and anchor links; anything
// else (e.g. javascript:) falls back to "#".
function safeHref(raw) {
  const url = String(raw || '').trim()
  if (!url) return '#'
  if (/^(https?:|mailto:|tel:|\/|#|\.{1,2}\/)/i.test(url)) return url
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '#'
  return url
}

// Renders text with *highlighted* segments as DOM nodes (no innerHTML).
function renderMarkedText(el, text) {
  el.textContent = ''
  String(text || '').split('*').forEach((part, i) => {
    if (!part) return
    if (i % 2 === 1) {
      const span = document.createElement('span')
      span.className = 'stb-hl'
      span.textContent = part
      el.appendChild(span)
    } else {
      el.appendChild(document.createTextNode(part))
    }
  })
}

export async function init(sdk) {
  await sdk.whenReady()

  const root = sdk.$('.stb')
  const line1 = sdk.$('.stb-line1')
  const line2 = sdk.$('.stb-line2')
  const btnWrap = sdk.$('.stb-btn-wrap')
  const btn = sdk.$('.stb-btn')
  const btnIcon = sdk.$('.stb-btn-icon')
  const btnText = sdk.$('.stb-btn-text')
  const decoLeft = sdk.$('.stb-deco-left')
  const decoRight = sdk.$('.stb-deco-right')
  const bursts = [sdk.$('.stb-burst-left'), sdk.$('.stb-burst-right')]

  const decoSvg = (key) => {
    const body = DECOS[key] ?? DECOS.wave_star
    return body ? `<svg viewBox="0 0 400 120" aria-hidden="true">${body}</svg>` : ''
  }

  const applyProps = (props = {}) => {
    const p = props || {}
    root.style.setProperty('--title-color', p.title_color || '#1F2A44')
    root.style.setProperty('--hl-color', p.highlight_color || '#2F8CF0')
    root.style.setProperty('--btn-color', p.button_color || '#2F8CF0')
    root.style.setProperty('--deco-color', p.deco_color || '#3D9BF5')
    root.style.setProperty('--title-size', TITLE_SIZES[p.title_size] || TITLE_SIZES.m)
    root.style.background = p.background_color || '#FFFFFF'

    renderMarkedText(line1, p.title_line1)
    renderMarkedText(line2, p.title_line2)
    line1.hidden = !p.title_line1
    line2.hidden = !p.title_line2

    const showButton = p.show_button !== false && !!p.button_text
    btnWrap.hidden = !showButton
    btnText.textContent = p.button_text || ''
    btnIcon.textContent = p.button_icon || ''
    btnIcon.hidden = !p.button_icon
    btn.setAttribute('href', safeHref(p.button_link))
    if (p.button_new_tab) {
      btn.setAttribute('target', '_blank')
      btn.setAttribute('rel', 'noopener noreferrer')
    } else {
      btn.removeAttribute('target')
      btn.removeAttribute('rel')
    }

    const markup = decoSvg(p.deco_style)
    decoLeft.innerHTML = markup
    decoRight.innerHTML = markup
    decoLeft.hidden = decoRight.hidden = !markup

    bursts.forEach((b) => { b.hidden = p.show_burst === false })
  }

  applyProps(sdk.getProps())
  sdk.on('propsChanged', applyProps)
}
