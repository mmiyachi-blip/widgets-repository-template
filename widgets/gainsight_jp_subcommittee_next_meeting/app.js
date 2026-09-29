const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

// Matches "【10/16(水) 14:00-15:00】タイトル本文" — the agreed posting convention
// for a "次回開催" announcement. Anything that doesn't match this shape is
// skipped: without a parsed date we can't tell whether it's still upcoming.
const TITLE_PATTERN = /^【\s*(\d{1,2})\/(\d{1,2})\([^)]*\)\s*(\d{1,2}):(\d{2})\s*[-〜~]\s*(\d{1,2}):(\d{2})\s*】\s*(.*)$/;

function stripHtml(html) {
  const withBreaks = String(html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n');
  const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

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

export async function init(sdk) {
  await sdk.whenReady();

  let props = sdk.getProps();

  const els = {
    heading: sdk.$('.nm-heading'),
    status: sdk.$('.nm-status'),
    card: sdk.$('.nm-card'),
    year: sdk.$('.nm-year'),
    date: sdk.$('.nm-date'),
    weekday: sdk.$('.nm-weekday'),
    badge: sdk.$('.nm-badge'),
    title: sdk.$('.nm-title'),
    time: sdk.$('.nm-time'),
    excerpt: sdk.$('.nm-excerpt'),
    link: sdk.$('.nm-link'),
  };

  function applyStaticProps() {
    const host = sdk.getContainer().host;
    host.style.setProperty('--nm-accent', props.accent_color || '#F2A33C');
    els.heading.textContent = props.heading || '次回の注目イベント';

    if (props.location_label) {
      els.badge.textContent = props.location_label;
      els.badge.style.display = '';
    } else {
      els.badge.style.display = 'none';
    }
  }

  function showStatus(message) {
    els.card.style.display = 'none';
    els.status.textContent = message;
    els.status.style.display = 'block';
  }

  function showCard(next) {
    els.status.style.display = 'none';
    els.card.style.display = '';

    const { parsed, topic } = next;
    els.year.textContent = String(parsed.year);
    els.date.textContent = `${parsed.month}.${parsed.day}`;
    els.weekday.textContent = `${WEEKDAY_LABELS[parsed.date.getDay()]}曜`;
    els.title.textContent = parsed.title || topic.title || '';
    els.time.textContent = `${parsed.startTime} 〜 ${parsed.endTime}`;
    els.excerpt.textContent = truncate(stripHtml(topic.content), 140);

    const url = resolveTopicUrl(topic);
    if (url) {
      els.link.style.display = '';
      els.link.textContent = props.link_label || '投稿を見る';
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
        pathParams: { category_id: categoryId },
        queryParams: {
          tags: props.tag || '次回開催',
          pageSize: String(props.lookback_count || 25),
        },
      });

      const topics = extractTopics(data);
      const next = pickNextMeeting(topics, new Date());
      if (!next) {
        showStatus(props.empty_message || '現在、次回開催予定の投稿はありません。');
        return;
      }
      showCard(next);
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
