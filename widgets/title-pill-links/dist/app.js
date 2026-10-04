const MAX_ITEMS = 6

// Only allow http(s)/mailto/tel, site-relative and anchor links; anything
// else (e.g. javascript:) falls back to "#".
function safeHref(raw) {
  const url = String(raw || '').trim()
  if (!url) return '#'
  if (/^(https?:|mailto:|tel:|\/|#|\.{1,2}\/)/i.test(url)) return url
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '#'
  return url
}

// Only accept #hex colors so values can't inject CSS.
function safeColor(raw, fallback) {
  return /^#[0-9a-f]{3,8}$/i.test(String(raw || '').trim()) ? raw.trim() : fallback
}

export async function init(sdk) {
  await sdk.whenReady()

  const root = sdk.$('.tpl')
  const title = sdk.$('.tpl-title')
  const list = sdk.$('.tpl-list')
  const wrap = sdk.$('.tpl-wrap')

  const applyProps = (props = {}) => {
    const p = props || {}
    root.style.setProperty('--bg', safeColor(p.background_color, '#F0F2F7'))
    root.style.setProperty('--card', safeColor(p.card_color, '#ffffff'))
    root.style.setProperty('--title', safeColor(p.title_color, '#14407A'))
    root.dataset.size = ['s', 'm', 'l'].includes(p.title_size) ? p.title_size : 'm'
    root.dataset.align = p.align === 'center' ? 'center' : 'left'

    title.textContent = p.title || ''
    title.hidden = !p.title

    list.textContent = ''
    for (let i = 1; i <= MAX_ITEMS; i++) {
      const text = (p[`item${i}_title`] || '').trim()
      if (!text) continue

      const li = document.createElement('li')
      const a = document.createElement('a')
      a.className = 'tpl-btn'
      a.setAttribute('href', safeHref(p[`item${i}_url`]))
      a.style.setProperty('--c', safeColor(p[`item${i}_color`], '#2F8CF0'))
      if (p[`item${i}_new_tab`]) {
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
      }

      const icon = p[`item${i}_icon`]
      if (icon) {
        const span = document.createElement('span')
        span.className = 'tpl-icon'
        span.setAttribute('aria-hidden', 'true')
        span.textContent = icon
        a.appendChild(span)
      } else {
        a.classList.add('no-icon')
      }
      a.appendChild(document.createTextNode(text))
      li.appendChild(a)
      list.appendChild(li)
    }
    wrap.hidden = !list.children.length
  }

  applyProps(sdk.getProps())
  sdk.on('propsChanged', applyProps)
}
