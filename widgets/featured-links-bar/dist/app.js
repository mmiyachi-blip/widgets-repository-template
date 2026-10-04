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

// Only accept #rgb / #rrggbb colors so values can't inject CSS.
function safeColor(raw, fallback) {
  return /^#[0-9a-f]{3,8}$/i.test(String(raw || '').trim()) ? raw.trim() : fallback
}

function setTarget(a, newTab) {
  if (newTab) {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener noreferrer')
  } else {
    a.removeAttribute('target')
    a.removeAttribute('rel')
  }
}

export async function init(sdk) {
  await sdk.whenReady()

  const root = sdk.$('.flb')
  const head = sdk.$('.flb-head')
  const headIcon = sdk.$('.flb-head-icon')
  const headText = sdk.$('.flb-head-text')
  const list = sdk.$('.flb-list')
  const more = sdk.$('.flb-more')

  const applyProps = (props = {}) => {
    const p = props || {}
    root.style.setProperty('--head-color', safeColor(p.head_color, '#2F8CF0'))

    head.hidden = !p.head_text && !p.head_icon
    headIcon.textContent = p.head_icon || ''
    headIcon.hidden = !p.head_icon
    headText.textContent = p.head_text || ''

    list.textContent = ''
    for (let i = 1; i <= MAX_ITEMS; i++) {
      const title = (p[`item${i}_title`] || '').trim()
      if (!title) continue

      const li = document.createElement('li')
      const a = document.createElement('a')
      a.className = 'flb-pill'
      a.setAttribute('href', safeHref(p[`item${i}_url`]))
      a.style.setProperty('--c', safeColor(p[`item${i}_color`], '#2F8CF0'))
      setTarget(a, p[`item${i}_new_tab`])

      const icon = p[`item${i}_icon`]
      if (icon) {
        const span = document.createElement('span')
        span.className = 'flb-pill-icon'
        span.setAttribute('aria-hidden', 'true')
        span.textContent = icon
        a.appendChild(span)
      } else {
        a.classList.add('no-icon')
      }
      a.appendChild(document.createTextNode(title))
      li.appendChild(a)
      list.appendChild(li)
    }

    more.hidden = !p.more_text
    more.textContent = p.more_text ? `${p.more_text} →` : ''
    more.setAttribute('href', safeHref(p.more_url))
    setTarget(more, p.more_new_tab)
  }

  applyProps(sdk.getProps())
  sdk.on('propsChanged', applyProps)
}
