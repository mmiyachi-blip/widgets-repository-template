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

function pickNextMeeting(topics, today) {
  const todayMid = startOfDay(today);
  const candidates = [];
  for (const topic of topics || []) {
    const parsed = parseMeetingFromTitle(topic && topic.title, today);
    if (!parsed || parsed.date < todayMid) continue;
    candidates.push({ topic, parsed });
  }
  candidates.sort((a, b) => {
    const byDate = a.parsed.date - b.parsed.date;
    if (byDate !== 0) return byDate;
    return new Date(a.topic.createdAt || 0) - new Date(b.topic.createdAt || 0);
  });
  return candidates[0] || null;
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
    dateText: sdk.$('.nm-date-text'),
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

  function showFoundState(next) {
    els.status.style.display = 'none';
    els.card.style.display = '';
    els.foundState.style.display = '';
    els.emptyState.style.display = 'none';

    const { parsed, topic } = next;
    els.dateText.textContent = `${parsed.month}月${parsed.day}日（${WEEKDAY_LABELS[parsed.date.getDay()]}）`;
    els.timeText.textContent = `${parsed.startTime} - ${parsed.endTime}`;
    els.locationText.textContent = props.location_label || 'オンライン開催';

    const url = resolveTopicUrl(topic) || props.category_url || '';
    setLink(url);
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

  function setLink(url) {
    els.linkText.textContent = props.link_label || '詳細を見る';
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

    try {
      const wsdk = new window.WidgetServiceSDK();
      const data = await wsdk.connectors.execute({
        permalink: 'cc-category-topics',
        method: 'GET',
        queryParams: {
          categoryId,
          tags: props.tag || '次回開催',
          pageSize: String(props.lookback_count || 25),
        },
      });

      const topics = extractTopics(data);
      const next = pickNextMeeting(topics, new Date());
      if (!next) {
        showEmptyState();
        return;
      }
      showFoundState(next);
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
