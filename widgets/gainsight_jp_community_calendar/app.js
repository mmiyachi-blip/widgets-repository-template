// Google Calendar's standard 11 event colors (colorId 1-11).
// Admins can override label/icon/color per colorId via widget config (cat{N}_label/icon/color).
const CATEGORY_DEFAULTS = {
  '1': { label: 'ラベンダー', icon: '💜', color: '#7986CB' },
  '2': { label: 'セージ', icon: '🌿', color: '#33B679' },
  '3': { label: 'グレープ', icon: '🍇', color: '#8E24AA' },
  '4': { label: 'フラミンゴ', icon: '🦩', color: '#E67C73' },
  '5': { label: 'トレーニング/ハンズオン', icon: '🎓', color: '#F6BF26' },
  '6': { label: 'タンジェリン', icon: '🍊', color: '#F4511E' },
  '7': { label: '分科会', icon: '👥', color: '#039BE5' },
  '8': { label: 'グラファイト', icon: '⚙️', color: '#616161' },
  '9': { label: 'ブルーベリー', icon: '🫐', color: '#3F51B5' },
  '10': { label: 'Office Hour', icon: '🙋', color: '#0B8043' },
  '11': { label: 'リリース情報', icon: '🚀', color: '#D50000' },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeHref(url) {
  return typeof url === 'string' && /^https:\/\//.test(url) ? url : '#';
}

function isImageUrl(value) {
  return typeof value === 'string' && /^https:\/\//.test(value);
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;

function isSafeHref(href) {
  return typeof href === 'string' && /^https?:\/\//i.test(href);
}

// Splits a plain-text node's content on bare URLs, turning each into its own
// clickable <a>. Used only on text that isn't already inside an <a>.
function linkifyTextNode(text) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(text))) {
    if (match.index > lastIndex) nodes.push(document.createTextNode(text.slice(lastIndex, match.index)));
    const a = document.createElement('a');
    a.setAttribute('href', match[0]);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = match[0];
    nodes.push(a);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(document.createTextNode(text.slice(lastIndex)));
  if (nodes.length === 0) nodes.push(document.createTextNode(text));
  return nodes;
}

// Google Calendar event descriptions are rich-text HTML (real <br>/<a>/<u> tags),
// not plain text. Parses it and rebuilds only an allowlisted subset in the
// widget's own document, dropping everything else (scripts, styles, unknown
// tags/attributes) so the community-managed calendar can't inject anything
// unsafe. Bare URLs in text nodes not already inside an <a> are auto-linked.
const DESCRIPTION_ALLOWED_TAGS = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV', 'SPAN', 'UL', 'OL', 'LI', 'BLOCKQUOTE']);
const DESCRIPTION_STRIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED']);

function sanitizeNode(node, insideAnchor) {
  if (node.nodeType === Node.TEXT_NODE) {
    return insideAnchor ? [document.createTextNode(node.textContent)] : linkifyTextNode(node.textContent);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const tag = node.tagName;
  if (DESCRIPTION_STRIPPED_TAGS.has(tag)) return [];

  const childInsideAnchor = insideAnchor || tag === 'A';
  const children = [];
  node.childNodes.forEach((child) => {
    children.push(...sanitizeNode(child, childInsideAnchor));
  });

  if (!DESCRIPTION_ALLOWED_TAGS.has(tag)) return children; // unwrap unknown tags, keep their content

  if (tag === 'A') {
    const href = node.getAttribute('href') || '';
    if (!isSafeHref(href)) return children; // unwrap unsafe/relative links
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    children.forEach((c) => a.appendChild(c));
    return [a];
  }

  const clean = document.createElement(tag.toLowerCase());
  children.forEach((c) => clean.appendChild(c));
  return [clean];
}

function sanitizeDescriptionHtml(rawHtml) {
  if (!rawHtml) return '';
  const parsed = new DOMParser().parseFromString(rawHtml, 'text/html');
  const wrapper = document.createElement('div');
  Array.from(parsed.body.childNodes).forEach((child) => {
    sanitizeNode(child, false).forEach((n) => wrapper.appendChild(n));
  });
  return wrapper.innerHTML;
}

function descriptionToPlainText(rawHtml) {
  if (!rawHtml) return '';
  const withBreaks = rawHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n');
  return new DOMParser().parseFromString(withBreaks, 'text/html').body.textContent || '';
}

function to12hParts(hhmm) {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const period = h < 12 ? '午前' : '午後';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { period, h: String(h12), m: mStr };
}

function formatTimeRange(startHHMM, endHHMM) {
  if (!startHHMM) return '';
  const start = to12hParts(startHHMM);
  if (!endHHMM) return `${start.period}${start.h}:${start.m}`;
  const end = to12hParts(endHHMM);
  if (end.period === start.period) {
    return `${start.period}${start.h}:${start.m}〜${end.h}:${end.m}`;
  }
  return `${start.period}${start.h}:${start.m}〜${end.period}${end.h}:${end.m}`;
}

function formatEventDateTime(ev) {
  const d = new Date(`${ev.date}T00:00:00`);
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAY_LABELS[d.getDay()]}曜日)`;
  if (!ev.time) return dateLabel;
  return `${dateLabel} ・ ${formatTimeRange(ev.time, ev.endTime)}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toGoogleUtcStamp(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

// Builds Google Calendar's public "quick add" URL (no OAuth needed) so a
// viewer can add the event to their own Google Calendar — the closest
// equivalent to Google's native "add to my calendar" for a third-party site.
function buildAddToCalendarUrl(ev) {
  let datesParam;
  if (ev.isAllDay) {
    const startStamp = (ev.date || '').replace(/-/g, '');
    const endStamp = (ev.endDate || ev.date || '').replace(/-/g, '');
    if (!startStamp || !endStamp) return '';
    datesParam = `${startStamp}/${endStamp}`;
  } else if (ev.startDateTime && ev.endDateTime) {
    const start = toGoogleUtcStamp(ev.startDateTime);
    const end = toGoogleUtcStamp(ev.endDateTime);
    if (!start || !end) return '';
    datesParam = `${start}/${end}`;
  } else {
    return '';
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.title || '',
    dates: datesParam,
    details: descriptionToPlainText(ev.description || ''),
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function renderIcon(iconValue, className) {
  if (isImageUrl(iconValue)) {
    return `<span class="${className}"><img src="${escapeHtml(iconValue)}" alt="" loading="lazy" /></span>`;
  }
  return `<span class="${className}">${escapeHtml(iconValue || '📅')}</span>`;
}

// Resolves an event's Google Calendar colorId to {label, icon, color},
// falling back to the widget's accent color for events with no colorId.
function resolveCategory(colorId, props) {
  const defaults = CATEGORY_DEFAULTS[colorId];
  if (!defaults) {
    return { label: '', icon: '📅', color: props.accent_color || '#F2789F' };
  }
  return {
    label: props[`cat${colorId}_label`] || defaults.label,
    icon: props[`cat${colorId}_icon`] || defaults.icon,
    color: props[`cat${colorId}_color`] || defaults.color,
  };
}

function renderLegendDot(category) {
  const iconMarkup = isImageUrl(category.icon)
    ? `<img src="${escapeHtml(category.icon)}" alt="" loading="lazy" />`
    : escapeHtml(category.icon || '📅');
  return `<span class="cal-legend-dot" style="background:${escapeHtml(category.color)}">${iconMarkup}</span>`;
}

export async function init(sdk) {
  await sdk.whenReady();

  let props = sdk.getProps();

  const today = new Date();
  const state = {
    year: today.getFullYear(),
    month: today.getMonth(), // 0-indexed
    events: [],
  };

  const els = {
    wrap: sdk.$('.cal-wrap'),
    title: sdk.$('.cal-title'),
    label: sdk.$('.cal-month-label'),
    grid: sdk.$('.cal-grid'),
    prev: sdk.$('.cal-prev'),
    next: sdk.$('.cal-next'),
    todayBtn: sdk.$('.cal-today'),
    status: sdk.$('.cal-status'),
    legend: sdk.$('.cal-legend'),
    modalOverlay: sdk.$('.cal-modal-overlay'),
    modalClose: sdk.$('.cal-modal-close'),
    modalDot: sdk.$('.cal-modal-dot'),
    modalTitle: sdk.$('.cal-modal-title'),
    modalDatetime: sdk.$('.cal-modal-datetime'),
    modalDescription: sdk.$('.cal-modal-description'),
    modalLink: sdk.$('.cal-modal-link'),
    modalAddLink: sdk.$('.cal-modal-add-link'),
  };

  function openModal(ev) {
    const category = resolveCategory(ev.colorId, props);
    els.modalDot.style.background = category.color;
    els.modalTitle.textContent = ev.title || '(無題)';
    els.modalDatetime.textContent = formatEventDateTime(ev);

    const description = (ev.description || '').trim();
    els.modalDescription.innerHTML = description ? sanitizeDescriptionHtml(description) : '';
    els.modalDescription.style.display = description ? 'block' : 'none';

    const href = safeHref(ev.url);
    if (href === '#') {
      els.modalLink.style.display = 'none';
    } else {
      els.modalLink.style.display = 'inline-block';
      els.modalLink.setAttribute('href', href);
    }

    const addUrl = buildAddToCalendarUrl(ev);
    if (addUrl) {
      els.modalAddLink.style.display = 'inline-block';
      els.modalAddLink.setAttribute('href', addUrl);
    } else {
      els.modalAddLink.style.display = 'none';
    }

    els.modalOverlay.hidden = false;
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
  }

  els.modalClose.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  const onKeydown = (e) => {
    if (e.key === 'Escape' && !els.modalOverlay.hidden) closeModal();
  };
  document.addEventListener('keydown', onKeydown);
  sdk.on('destroy', () => document.removeEventListener('keydown', onKeydown));

  els.grid.addEventListener('click', (e) => {
    const badge = e.target.closest('.cal-badge');
    if (!badge) return;
    e.preventDefault();
    const id = badge.getAttribute('data-event-id');
    const ev = state.events.find((item) => item.id === id);
    if (ev) openModal(ev);
  });

  function applyStyleVars() {
    const host = sdk.getContainer().host;
    const accent = props.accent_color || '#F2789F';
    host.style.setProperty('--w-accent', accent);
    host.style.setProperty('--w-nav', props.nav_color || accent);
    els.title.textContent = props.calendar_title || 'Gainsight JAPAN カレンダー';
    els.wrap.classList.toggle('cal-compact', props.display_size === 'compact');
  }

  // Comma-separated list of title keywords from config. Empty/absent means
  // no filtering — keep every event, same as before this feature existed.
  function parseTitleFilters(raw) {
    return String(raw || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  function filterEventsByTitle(events, raw) {
    const filters = parseTitleFilters(raw);
    if (filters.length === 0) return events;
    return events.filter((ev) => {
      const title = String((ev && ev.title) || '').toLowerCase();
      return filters.some((f) => title.includes(f));
    });
  }

  function showStatus(message) {
    if (!message) {
      els.status.style.display = 'none';
      els.status.textContent = '';
      return;
    }
    els.status.textContent = message;
    els.status.style.display = 'block';
  }

  async function fetchEvents(year, month) {
    showStatus('読み込み中...');

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 1));

    try {
      const wsdk = new window.WidgetServiceSDK();
      const data = await wsdk.connectors.execute({
        permalink: 'gcal-events',
        method: 'GET',
        queryParams: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          maxResults: String(props.max_results || 250),
        },
      });
      state.events = filterEventsByTitle(Array.isArray(data) ? data : [], props.title_filters);
      showStatus('');
    } catch (err) {
      console.error('[community-calendar] connector error', err);
      state.events = [];
      showStatus('イベントを読み込めませんでした。');
    }

    render();
  }

  function render() {
    const { year, month } = state;
    els.label.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    const eventsByDate = {};
    state.events.forEach((ev) => {
      if (!ev || !ev.date) return;
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });

    let html = '';

    for (let i = 0; i < startWeekday; i++) {
      html += '<div class="cal-cell cal-cell--empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = eventsByDate[dateStr] || [];
      const isToday = dateStr === todayStr;

      const hasEvent = dayEvents.length > 0;
      const eventColor = hasEvent ? resolveCategory(dayEvents[0].colorId, props).color : '';
      const classes = `cal-cell${isToday ? ' cal-cell--today' : ''}${hasEvent ? ' cal-cell--has-event' : ''}`;
      const styleAttr = hasEvent ? ` style="--ev-color:${escapeHtml(eventColor)}"` : '';
      html += `<div class="${classes}"${styleAttr}>`;
      html += `<span class="cal-date">${d}</span>`;
      html += '<div class="cal-badges">';

      dayEvents.slice(0, 3).forEach((ev) => {
        const category = resolveCategory(ev.colorId, props);
        const title = escapeHtml(ev.title || '(無題)');
        const timeLabel = ev.time ? `${escapeHtml(ev.time)} ` : '';
        const iconHtml = renderIcon(category.icon, 'cal-badge-icon');
        const tooltip = category.label ? `${escapeHtml(category.label)}: ${title}` : title;
        html += `<a class="cal-badge" style="background:${escapeHtml(category.color)}" href="#" data-event-id="${escapeHtml(ev.id)}" title="${tooltip}">${iconHtml}<span class="cal-badge-text">${timeLabel}${title}</span></a>`;
      });

      if (dayEvents.length > 3) {
        html += `<span class="cal-more">+${dayEvents.length - 3}件</span>`;
      }

      html += '</div></div>';
    }

    els.grid.innerHTML = html;
    renderLegend();
  }

  function renderLegend() {
    const seen = new Map();
    state.events.forEach((ev) => {
      const category = resolveCategory(ev.colorId, props);
      if (!category.label) return; // skip the unlabeled/no-color fallback bucket
      const key = ev.colorId || 'default';
      if (!seen.has(key)) seen.set(key, category);
    });

    if (seen.size === 0) {
      els.legend.innerHTML = '';
      return;
    }

    let html = '';
    seen.forEach((category) => {
      html += `<span class="cal-legend-item">${renderLegendDot(category)}${escapeHtml(category.label)}</span>`;
    });
    els.legend.innerHTML = html;
  }

  els.prev.addEventListener('click', () => {
    state.month -= 1;
    if (state.month < 0) {
      state.month = 11;
      state.year -= 1;
    }
    fetchEvents(state.year, state.month);
  });

  els.next.addEventListener('click', () => {
    state.month += 1;
    if (state.month > 11) {
      state.month = 0;
      state.year += 1;
    }
    fetchEvents(state.year, state.month);
  });

  els.todayBtn.addEventListener('click', () => {
    const now = new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth();
    fetchEvents(state.year, state.month);
  });

  applyStyleVars();

  sdk.on('propsChanged', (newProps) => {
    props = newProps;
    applyStyleVars();
    render();
  });

  await fetchEvents(state.year, state.month);
}
