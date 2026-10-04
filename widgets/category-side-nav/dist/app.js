const MAX_ITEMS = 10

// Only allow http(s), site-relative and anchor links; anything else
// (e.g. javascript:) falls back to "#".
function safeHref(raw) {
  const url = String(raw || '').trim()
  if (!url) return '#'
  if (/^(https?:|\/|#|\.{1,2}\/)/i.test(url)) return url
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '#'
  return url
}

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

// An item is "active" when its URL points at the page currently open.
function isCurrent(href) {
  if (href === '#') return false
  try {
    const target = new URL(href, window.location.href)
    return (
      target.origin === window.location.origin &&
      normalizePath(target.pathname) === normalizePath(window.location.pathname)
    )
  } catch {
    return false
  }
}

export async function init(sdk) {
  await sdk.whenReady()

  const head = sdk.$('.csn-head')
  const list = sdk.$('.csn-list')

  const applyProps = (props = {}) => {
    const p = props || {}

    head.hidden = !p.head_text
    head.textContent = p.head_text || ''

    list.textContent = ''
    for (let i = 1; i <= MAX_ITEMS; i++) {
      const title = (p[`item${i}_title`] || '').trim()
      if (!title) continue

      const href = safeHref(p[`item${i}_url`])
      const li = document.createElement('li')
      const a = document.createElement('a')
      a.className = 'csn-link'
      a.setAttribute('href', href)
      a.textContent = title
      if (isCurrent(href)) {
        a.classList.add('is-active')
        a.setAttribute('aria-current', 'page')
      }
      li.appendChild(a)
      list.appendChild(li)
    }
  }

  applyProps(sdk.getProps())
  sdk.on('propsChanged', applyProps)
}
