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
    label: sdk.$('.cal-month-label'),
    grid: sdk.$('.cal-grid'),
    prev: sdk.$('.cal-prev'),
    next: sdk.$('.cal-next'),
    todayBtn: sdk.$('.cal-today'),
    status: sdk.$('.cal-status'),
    legend: sdk.$('.cal-legend'),
  };

  function applyStyleVars() {
    const host = sdk.getContainer().host;
    const accent = props.accent_color || '#F2789F';
    host.style.setProperty('--w-accent', accent);
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
      state.events = Array.isArray(data) ? data : [];
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

      html += `<div class="cal-cell${isToday ? ' cal-cell--today' : ''}">`;
      html += `<span class="cal-date">${d}</span>`;
      html += '<div class="cal-badges">';

      dayEvents.slice(0, 2).forEach((ev) => {
        const category = resolveCategory(ev.colorId, props);
        const title = escapeHtml(ev.title || '(無題)');
        const timeLabel = ev.time ? `${escapeHtml(ev.time)} ` : '';
        const href = safeHref(ev.url);
        const iconHtml = renderIcon(category.icon, 'cal-badge-icon');
        const tooltip = category.label ? `${escapeHtml(category.label)}: ${title}` : title;
        html += `<a class="cal-badge" style="background:${escapeHtml(category.color)}" href="${href}" target="_blank" rel="noopener noreferrer" title="${tooltip}">${iconHtml}<span class="cal-badge-text">${timeLabel}${title}</span></a>`;
      });

      if (dayEvents.length > 2) {
        html += `<span class="cal-more">+${dayEvents.length - 2}件</span>`;
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
