const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

// Matches "【10/16(水) 14:00-15:00】タイトル本文" — the agreed posting convention
// for a "次回開催" announcement. Anything that doesn't match this shape is
// skipped: without a parsed date we can't tell whether it's still upcoming.
const TITLE_PATTERN = /^【\s*(\d{1,2})\/(\d{1,2})\([^)]*\)\s*(\d{1,2}):(\d{2})\s*[-〜~]\s*(\d{1,2}):(\d{2})\s*】\s*(.*)$/;

// Matches the palette already used for these 5 categories in the
// subcommittee navigation widget, so colors stay consistent across pages.
const THEME_COLORS = {
  ai: '#4E86D6',
  ops: '#3FA772',
  digital: '#E08A3C',
  strategy: '#D9A62B',
  community: '#D45C9C',
};

const KNOWN_THEMES = Object.keys(THEME_COLORS);

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Parses the title's embedded date against `today`, assuming the current
// year, and rolling forward to next year if that date has already passed —
// so a post made in December for a January meeting doesn't get excluded.
function parseMeetingFromTitle(title, today) {
  const m = TITLE_PATTERN.exec(String(title || '').trim());
  if (!m) return null;

  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const todayMid = startOfDay(today);
  let year = today.getFullYear();
  let date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date < todayMid) {
    year += 1;
    date = new Date(year, month - 1, day);
  }

  return {
    date,
    year,
    month,
    day,
    startTime: `${m[3].padStart(2, '0')}:${m[4]}`,
    endTime: `${m[5].padStart(2, '0')}:${m[6]}`,
    title: m[7].trim(),
  };
}

// 「次回開催」投稿のうち、タイトルの日付がカレンダー予定の日付と一致するものを探す。
// 投稿はカレンダーより後に作られるので、見つからなければ null(=詳細待ち)。
function findTopicForDate(topics, eventDate, today) {
  const target = startOfDay(eventDate).getTime();
  const matches = [];
  for (const topic of topics || []) {
    const parsed = parseMeetingFromTitle(topic && topic.title, today);
    if (parsed && startOfDay(parsed.date).getTime() === target) matches.push(topic);
  }
  matches.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  return matches[0] || null;
}

function parseTitleFilters(raw) {
  return String(raw || '')
    .split(/[,、，]/)
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);
}

function localDateString(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// カレンダー予定(コネクター gcal-events のレスポンス)から、タイトルに
// いずれかのキーワードを含み、日付が今日以降でいちばん近い1件を選ぶ。
function pickNextCalendarEvent(events, filters, today) {
  const todayStr = localDateString(today);
  const candidates = (Array.isArray(events) ? events : []).filter((ev) => {
    if (!ev || !/^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') || ev.date < todayStr) return false;
    const title = String(ev.title || '').toLowerCase();
    return filters.some((f) => title.includes(f));
  });
  candidates.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return String(a.time || '').localeCompare(String(b.time || ''));
  });
  const ev = candidates[0];
  if (!ev) return null;

  const [year, month, day] = ev.date.split('-').map(Number);
  return {
    date: new Date(year, month - 1, day),
    year,
    month,
    day,
    startTime: ev.time || '',
    endTime: ev.endTime || '',
    isAllDay: Boolean(ev.isAllDay),
    title: ev.title || '',
  };
}

function resolveTopicUrl(topic) {
  return (topic && (topic.seoCommunityUrl || topic.url || topic.permalink)) || '';
}

function extractTopics(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.result)) return data.result;
  return [];
}

function resolveTheme(theme) {
  return KNOWN_THEMES.includes(theme) ? theme : 'ai';
}

export async function init(sdk) {
  await sdk.whenReady();

  let props = sdk.getProps();

  // Resolved by the platform's publish-time rewrite of the <link> hrefs
  // declared statically in index.html — see the comment there.
  const mascotUrls = {
    ai: sdk.$('#mascot-src-ai')?.href || '',
    ops: sdk.$('#mascot-src-ops')?.href || '',
    digital: sdk.$('#mascot-src-digital')?.href || '',
    strategy: sdk.$('#mascot-src-strategy')?.href || '',
    community: sdk.$('#mascot-src-community')?.href || '',
  };

  const els = {
    status: sdk.$('.nm-status'),
    card: sdk.$('.nm-card'),
    headingText: sdk.$('.nm-heading-text'),
    foundState: sdk.$('.nm-found-state'),
    emptyState: sdk.$('.nm-empty-state'),
    year: sdk.$('.nm-year'),
    date: sdk.$('.nm-date'),
    weekday: sdk.$('.nm-weekday'),
    timeText: sdk.$('.nm-time-text'),
    locationText: sdk.$('.nm-location-text'),
    emptyHeadline: sdk.$('.nm-empty-headline'),
    emptySubmessage: sdk.$('.nm-empty-submessage'),
    subscribeNotice: sdk.$('.nm-subscribe-notice'),
    subscribeText: sdk.$('.nm-subscribe-text'),
    link: sdk.$('.nm-link'),
    linkText: sdk.$('.nm-link-text'),
    mascot: sdk.$('.nm-mascot'),
  };

  function applyStaticProps() {
    const host = sdk.getContainer().host;
    const theme = resolveTheme(props.theme);
    host.style.setProperty('--nm-accent', THEME_COLORS[theme]);
    els.headingText.textContent = props.heading_text || '次回の注目イベント';

    const mascotUrl = mascotUrls[theme];
    if (mascotUrl) {
      els.mascot.style.display = '';
      els.mascot.setAttribute('src', mascotUrl);
      els.mascot.setAttribute('alt', props.subcommittee_name || '');
      els.mascot.onerror = () => { els.mascot.style.display = 'none'; };
    } else {
      els.mascot.style.display = 'none';
    }
  }

  function showStatus(message) {
    els.card.style.display = 'none';
    els.status.textContent = message;
    els.status.style.display = 'block';
  }

  function showFoundState(parsed, topic) {
    els.status.style.display = 'none';
    els.card.style.display = '';
    els.foundState.style.display = '';
    els.emptyState.style.display = 'none';

    els.year.textContent = String(parsed.year);
    els.date.textContent = `${parsed.month}.${parsed.day}`;
    els.weekday.textContent = `${WEEKDAY_LABELS[parsed.date.getDay()]}曜`;
    els.timeText.textContent = parsed.isAllDay || !parsed.startTime
      ? '終日'
      : `${parsed.startTime} - ${parsed.endTime}`;
    els.locationText.textContent = props.location_label || 'オンライン開催';

    // 日程はカレンダーで先に決まり、告知投稿は後から出る。投稿があればそのURL、
    // なければ押せない「詳細をお待ちください」を出す。
    const url = resolveTopicUrl(topic);
    if (url) {
      setLink(url);
    } else {
      setPendingLink();
    }
  }

  function showEmptyState() {
    els.status.style.display = 'none';
    els.card.style.display = '';
    els.foundState.style.display = 'none';
    els.emptyState.style.display = '';

    els.emptyHeadline.innerHTML = '';
    const mark = document.createElement('mark');
    mark.textContent = props.empty_message || '現在、次回開催予定を調整中です。';
    els.emptyHeadline.appendChild(mark);
    els.emptySubmessage.textContent = props.empty_submessage || 'もう少々お待ちください。';

    if (props.show_subscribe_notice === false) {
      els.subscribeNotice.style.display = 'none';
    } else {
      els.subscribeNotice.style.display = '';
      els.subscribeText.textContent = props.subscribe_notice_text || '';
    }

    setLink(props.category_url || '');
  }

  function setPendingLink() {
    els.linkText.textContent = props.pending_label || '詳細をお待ちください';
    els.link.style.display = '';
    els.link.removeAttribute('href');
    els.link.classList.add('nm-link--pending');
    els.link.setAttribute('aria-disabled', 'true');
  }

  function setLink(url) {
    els.link.classList.remove('nm-link--pending');
    els.link.removeAttribute('aria-disabled');
    els.linkText.textContent = props.link_label || '詳細はこちら';
    if (url) {
      els.link.style.display = '';
      els.link.setAttribute('href', url);
    } else {
      els.link.style.display = 'none';
    }
  }

  async function load() {
    applyStaticProps();
    showStatus('読み込み中...');

    const categoryId = String(props.category_id || '').trim();
    if (!categoryId) {
      showStatus('ウィジェット設定で「対象カテゴリID」を指定してください。');
      return;
    }

    const filters = parseTitleFilters(props.calendar_title_filter);
    if (filters.length === 0) {
      showStatus('ウィジェット設定で「カレンダーのタイトルキーワード」を指定してください。');
      return;
    }

    try {
      const wsdk = new window.WidgetServiceSDK();
      const now = new Date();
      const rangeEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

      // カレンダーが日程の正。投稿の取得に失敗しても日程は出したいので別扱い。
      const [calendarData, topicsData] = await Promise.all([
        wsdk.connectors.execute({
          permalink: 'gcal-events',
          method: 'GET',
          queryParams: {
            timeMin: startOfDay(now).toISOString(),
            timeMax: rangeEnd.toISOString(),
            maxResults: '250',
          },
        }),
        wsdk.connectors.execute({
          permalink: 'cc-category-topics',
          method: 'GET',
          queryParams: {
            categoryId,
            tags: props.tag || '次回開催',
            pageSize: String(props.lookback_count || 25),
          },
        }).catch((err) => {
          console.error('[subcommittee-next-meeting] topics connector error', err);
          return null;
        }),
      ]);

      const topics = extractTopics(topicsData);
      const event = pickNextCalendarEvent(calendarData, filters, now);
      if (!event) {
        showEmptyState();
        return;
      }
      showFoundState(event, findTopicForDate(topics, event.date, now));
    } catch (err) {
      console.error('[subcommittee-next-meeting] connector error', err);
      showStatus('情報を読み込めませんでした。');
    }
  }

  sdk.on('propsChanged', (newProps) => {
    props = newProps;
    load();
  });

  await load();
}
