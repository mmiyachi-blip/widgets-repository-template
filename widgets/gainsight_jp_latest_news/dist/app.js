// Soft pastel badge palette; a label always maps to the same color.
const BADGE_COLORS = [
  { bg: '#DBEAFE', fg: '#1D4ED8' },
  { bg: '#EDE4FF', fg: '#6D28D9' },
  { bg: '#D7F5E6', fg: '#0F766E' },
  { bg: '#FFE9CC', fg: '#C2610C' },
  { bg: '#FFE0E3', fg: '#BE123C' },
  { bg: '#E0F2FE', fg: '#0369A1' },
]

function colorFor(label) {
  let h = 0
  for (const ch of String(label)) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return BADGE_COLORS[h % BADGE_COLORS.length]
}

// Only allow http(s), site-relative and anchor links; javascript: etc. are dropped.
function safeHref(raw) {
  const url = String(raw || '').trim()
  if (!url) return ''
  if (/^(https?:|\/|#)/i.test(url)) return url
  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? '' : url
}

function extractTopics(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.result)) return data.result
  return []
}

// The topics API doesn't return a URL, so build one from the public id; the
// community redirects topic/show?tid&fid to the post's canonical address.
function topicUrl(topic, baseUrl, fallbackCategoryId) {
  const given = topic.seoCommunityUrl || topic.url || topic.permalink
  if (given) return safeHref(given)
  if (!topic.publicId) return ''
  const base = String(baseUrl || 'https://communities.gainsight.com').replace(/\/+$/, '')
  const fid = encodeURIComponent(topic.categoryId || fallbackCategoryId || '')
  return `${base}/topic/show?tid=${encodeURIComponent(topic.publicId)}&fid=${fid}`
}

function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  // Always render in JST so the date doesn't shift with the viewer's timezone.
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(d)
  const get = (t) => parts.find((p) => p.type === t)?.value || ''
  return `${get('year')}年${get('month')}月${get('day')}日`
}

function badgeLabel(topic, mode, filterTags) {
  if (mode === 'none') return ''
  if (mode === 'category_name') return topic.categoryName || ''
  const tags = Array.isArray(topic.tags) ? topic.tags : []
  const own = tags.find((t) => !filterTags.includes(String(t).toLowerCase()))
  return own || ''
}

export async function init(sdk) {
  await sdk.whenReady()
  let props = sdk.getProps()

  const root = sdk.$('.ln')
  const els = {
    heading: sdk.$('.ln-heading'),
    sub: sdk.$('.ln-sub'),
    more: sdk.$('.ln-more'),
    moreText: sdk.$('.ln-more-text'),
    status: sdk.$('.ln-status'),
    list: sdk.$('.ln-list'),
  }

  function showStatus(message) {
    els.list.replaceChildren()
    els.status.textContent = message
    els.status.style.display = ''
  }

  function renderHeader() {
    els.heading.textContent = props.heading || ''
    els.sub.textContent = props.subheading || ''
    els.sub.style.display = props.subheading ? '' : 'none'

    const href = safeHref(props.more_url)
    if (props.more_text && href) {
      els.moreText.textContent = props.more_text
      els.more.setAttribute('href', href)
      if (props.more_new_tab) {
        els.more.setAttribute('target', '_blank')
        els.more.setAttribute('rel', 'noopener noreferrer')
      } else {
        els.more.removeAttribute('target')
        els.more.removeAttribute('rel')
      }
      els.more.style.display = ''
    } else {
      els.more.style.display = 'none'
    }
  }

  function buildItem(topic, categoryId, filterTags) {
    const href = topicUrl(topic, props.community_base_url, categoryId)
    const li = document.createElement('li')
    li.className = 'ln-item'

    const row = document.createElement('a')
    row.className = 'ln-row'
    if (href) row.setAttribute('href', href)
    if (props.open_new_tab) {
      row.setAttribute('target', '_blank')
      row.setAttribute('rel', 'noopener noreferrer')
    }

    if (props.show_avatar !== false) {
      const author = topic.author || {}
      const avatarUrl = safeHref(author.avatar)
      if (avatarUrl) {
        const img = document.createElement('img')
        img.className = 'ln-avatar'
        img.src = avatarUrl
        img.alt = ''
        img.loading = 'lazy'
        img.addEventListener('error', () => img.remove())
        row.appendChild(img)
      } else {
        const ph = document.createElement('span')
        ph.className = 'ln-avatar'
        ph.textContent = String(author.username || '?').charAt(0).toUpperCase()
        row.appendChild(ph)
      }
    }

    const badgeCell = document.createElement('span')
    badgeCell.className = 'ln-badge-cell'
    const label = badgeLabel(topic, props.badge_mode || 'first_tag', filterTags)
    if (label) {
      const c = colorFor(label)
      const badge = document.createElement('span')
      badge.className = 'ln-badge'
      badge.style.setProperty('--bg', c.bg)
      badge.style.setProperty('--fg', c.fg)
      badge.textContent = label
      badgeCell.appendChild(badge)
    }
    row.appendChild(badgeCell)

    const title = document.createElement('span')
    title.className = 'ln-item-title'
    title.textContent = topic.title || ''
    row.appendChild(title)

    const date = document.createElement('span')
    date.className = 'ln-date'
    date.textContent = formatDate(topic.createdAt)
    row.appendChild(date)

    const chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    chev.setAttribute('class', 'ln-chevron')
    chev.setAttribute('viewBox', '0 0 24 24')
    chev.setAttribute('fill', 'none')
    chev.setAttribute('stroke', 'currentColor')
    chev.setAttribute('stroke-width', '2.5')
    chev.setAttribute('stroke-linecap', 'round')
    chev.setAttribute('stroke-linejoin', 'round')
    chev.setAttribute('aria-hidden', 'true')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M9 5l7 7-7 7')
    chev.appendChild(path)
    row.appendChild(chev)

    li.appendChild(row)
    return li
  }

  async function load() {
    renderHeader()
    root.classList.toggle('ln-no-avatar', props.show_avatar === false)

    const categoryIds = String(props.category_id || '')
      .split(/[,、，\s]+/).map((v) => v.trim()).filter(Boolean)
    const categoryId = categoryIds[0] || ''
    if (!categoryId) {
      showStatus('ウィジェット設定で「対象カテゴリID」を指定してください。')
      return
    }

    const count = Math.min(Math.max(parseInt(props.item_count, 10) || 5, 1), 10)
    const tag = String(props.tag || '').trim()
    const filterTags = tag.split(/[,、，]/).map((t) => t.trim().toLowerCase()).filter(Boolean)

    showStatus('読み込み中...')
    try {
      const wsdk = new window.WidgetServiceSDK()
      // The topics API's categoryId takes a single id, so query each id
      // separately and merge, newest first.
      const results = await Promise.allSettled(categoryIds.map((id) => {
        const queryParams = { categoryId: id, pageSize: String(count) }
        if (tag) queryParams.tags = tag
        return wsdk.connectors.execute({ permalink: 'cc-latest-topics', method: 'GET', queryParams })
      }))
      const failed = results.filter((r) => r.status === 'rejected')
      failed.forEach((r) => console.error('[latest-news] connector error', r.reason))
      if (failed.length === results.length) throw failed[0].reason
      const seen = new Set()
      const topics = results
        .flatMap((r) => (r.status === 'fulfilled' ? extractTopics(r.value) : []))
        .filter((t) => !seen.has(t.id || t.publicId) && seen.add(t.id || t.publicId))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, count)
      if (topics.length === 0) {
        showStatus(props.empty_message || '現在お知らせはありません。')
        return
      }
      els.status.style.display = 'none'
      els.list.replaceChildren(...topics.map((t) => buildItem(t, categoryId, filterTags)))
    } catch (err) {
      console.error('[latest-news] connector error', err)
      showStatus('情報を読み込めませんでした。')
    }
  }

  sdk.on('propsChanged', (newProps) => {
    props = newProps
    load()
  })

  await load()
}
