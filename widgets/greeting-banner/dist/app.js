// Message pools, one per time-of-day bucket (each picked from exclusively,
// not merged with the others).
const MORNING_MESSAGES = [
  'おはようございます。今日もひとつ、新しい視点を持ち帰りませんか？',
  '今日の仕事を変えるヒント、ここでひとつ見つけていきませんか？',
  'おはようございます。昨日まで知らなかったことに、出会いにいきましょう。',
  '今日の「なるほど！」をひとつ探してみませんか？',
  'まずは5分。最新のCS・AIトレンドを覗いてみませんか？',
  '今日のあなたに、新しい選択肢をひとつ。',
  '誰かの実践が、今日のあなたのヒントになるかもしれません。',
  'おはようございます。AIの進化、今日もキャッチアップしていきましょう。',
  'いつものやり方に、ひとつ新しい視点を加えてみませんか？',
  '今日の仕事がちょっと楽しみになるヒント、探してみましょう。',
  'いい一日は、いい発見から。今日は何を見つけますか？',
  '「他社ではどうしてる？」その答え、コミュニティにあるかもしれません。',
  '朝のインプットに、仲間たちのリアルな知見をどうぞ。',
  '変化の速い時代だからこそ、みんなの知恵を味方に。',
  '今日ひとつ学んだことが、半年後の大きな差になるかもしれません。',
  '新しいアイデアは、新しい人との出会いから。分科会を覗いてみませんか？',
  '今日はどんな発見が待っているでしょう。さあ、コミュニティを探索してみましょう。',
]

const DAYTIME_MESSAGES = [
  'ちょっとひと休み。みんなの最新Tipsを覗いていきませんか？',
  '「これ、みんなどうしてる？」と思ったら、気軽に聞いてみましょう。',
  'あなたの悩み、実は同じことで悩んでいる仲間がいるかもしれません。',
  'ランチのお供に、気になる分科会をひとつ覗いてみませんか？',
  '困ったときこそコミュニティ。ひとりで考えず、みんなに聞いてみましょう。',
  'あなたの「ちょっと聞きたい」が、誰かの「それ知りたかった！」になるかも。',
  '仕事の合間に、他社のリアルな取り組みを覗いてみませんか？',
  '同じテーマに挑戦している仲間、探してみませんか？',
  'AI、デジタルタッチ、Ops、コミュニティ。あなたのテーマはどれですか？',
  '答えを探すだけじゃなく、一緒に考える仲間を見つけませんか？',
  'そのモヤモヤ、コミュニティに投げてみると何かが動くかもしれません。',
  'あなたの経験も、誰かにとっては貴重なベストプラクティスです。',
  '「うちではこうしてます！」その一言、ぜひ聞かせてください。',
  '見るだけでもOK。でも今日はひとつ、リアクションしてみませんか？',
  '気になる投稿を見つけたら、コメントから会話を始めてみましょう。',
  '会社を越えると、今まで見えなかった答えが見えてくるかもしれません。',
  '同じミッションを持つ仲間と話すと、仕事はもっと面白くなる。',
]

const NIGHT_MESSAGES = [
  '今日もお疲れさまでした。最後にひとつ、新しい刺激を持ち帰りませんか？',
  '今日の悩みは、今日のうちにコミュニティへ。誰かがヒントをくれるかも。',
  '今日得た気づき、コミュニティで誰かにシェアしてみませんか？',
  '一日の終わりに、明日試したくなるアイデアをひとつ。',
  '明日の仕事をちょっと楽しみにするヒント、探していきませんか？',
  '今日とは違う視点で、明日の仕事を始めてみませんか？',
  'あなたが今日経験したことは、誰かが明日知りたいことかもしれません。',
  '「もっとこうしたい」が生まれたら、仲間と話してみましょう。',
  '一人では思いつかなかったアイデアに、ここなら出会えるかもしれません。',
  'AIの進化は待ってくれません。今日のアップデートを覗いてみましょう。',
  '今日もひとつ、知らなかった世界を覗いてから帰りませんか？',
  '明日の自分に、新しいアイデアをひとつプレゼント。',
  '仕事の景色を変えるのは、誰かの何気ない一言かもしれません。',
  '今日の「困った」を、明日の「できた」に。みんなの知恵を借りてみましょう。',
  '次に挑戦したいこと、一緒に取り組む仲間を探してみませんか？',
]

function getTimeBucket(date) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 18) return 'daytime'
  return 'night'
}

function pickMessage() {
  const pools = { morning: MORNING_MESSAGES, daytime: DAYTIME_MESSAGES, night: NIGHT_MESSAGES }
  const pool = pools[getTimeBucket(new Date())]
  return pool[Math.floor(Math.random() * pool.length)]
}

// Facial expressions swapped into the mascot's <g class="mascot-face-parts">.
// Picked independently of the message so the mascot isn't always smiling.
// Intentionally no angry/frowning face.
const FACES = [
  // smile (closed happy eyes)
  '<path class="mascot-eye" d="M39 52 q4 -7 8 0" /><path class="mascot-eye" d="M53 52 q4 -7 8 0" />',
  // neutral (flat gaze, flat mouth)
  '<circle class="mascot-eye-dot" cx="43" cy="52" r="2.4" /><circle class="mascot-eye-dot" cx="57" cy="52" r="2.4" /><line class="mascot-mouth" x1="43" y1="63" x2="57" y2="63" />',
  // surprised (wide open eyes, small "o" mouth)
  '<circle class="mascot-eye-ring" cx="43" cy="51" r="4" /><circle class="mascot-pupil" cx="43" cy="51" r="1.6" /><circle class="mascot-eye-ring" cx="57" cy="51" r="4" /><circle class="mascot-pupil" cx="57" cy="51" r="1.6" /><circle class="mascot-mouth-o" cx="50" cy="64" r="3" />',
  // wink (one closed eye, one open, gentle smile)
  '<path class="mascot-eye" d="M39 52 q4 -7 8 0" /><circle class="mascot-eye-ring" cx="57" cy="51" r="4" /><circle class="mascot-pupil" cx="57" cy="51" r="1.6" /><path class="mascot-mouth" d="M44 61 q6 5 12 0" />',
]

function pickFace() {
  return FACES[Math.floor(Math.random() * FACES.length)]
}

// Resolves to the signed-in member's username, or null for guests, a missing
// SDK, a failed lookup, or a timeout — the greeting then just omits the name.
function getViewerName(timeoutMs = 1500) {
  const web = window.ChWebSdk
  if (!web?.Context?.User || typeof web.onReady !== 'function') return Promise.resolve(null)

  const lookup = new Promise((resolve) => {
    web.onReady(async () => {
      try {
        const me = await web.Context.User()
        resolve(me && me.userId !== null && me.username ? me.username : null)
      } catch {
        resolve(null)
      }
    })
  })
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))
  return Promise.race([lookup, timeout])
}

// Conversational lines that quote a recent community post; "{title}" becomes a link.
const NEWS_TEMPLATES = [
  '今週「{title}」の投稿があったの見た！？チェックしてね！',
  '今週は「{title}」を要チェックだよ！もう見た？',
  '「{title}」、もうチェックした？今週のおすすめだよ！',
  'ねえねえ、今週「{title}」の投稿が出てるよ！見にいこう！',
  '今週の注目は「{title}」！ちょっとのぞいてみない？',
]

const MAX_TITLE_CHARS = 40

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
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

function shortenTitle(title) {
  const chars = Array.from(String(title).trim())
  return chars.length > MAX_TITLE_CHARS ? `${chars.slice(0, MAX_TITLE_CHARS).join('')}…` : chars.join('')
}

const newsSettingsKey = (props) =>
  JSON.stringify([props.news_category_id, props.news_tag, props.news_days, props.news_chance, props.community_base_url])

// Resolves to { title, href } for a random post from the last `news_days` days,
// or null (feature off, nothing recent, connector error, or timeout).
function fetchRecentPost(props, timeoutMs = 2500) {
  const ids = String(props.news_category_id || '')
    .split(/[,、，\s]+/).map((v) => v.trim()).filter(Boolean)
  if (!ids.length) return Promise.resolve(null)

  const days = Math.min(Math.max(parseInt(props.news_days, 10) || 7, 1), 60)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const tag = String(props.news_tag || '').trim()

  const lookup = (async () => {
    try {
      const wsdk = new window.WidgetServiceSDK()
      const results = await Promise.allSettled(ids.map((id) => {
        const queryParams = { categoryId: id, pageSize: '10' }
        if (tag) queryParams.tags = tag
        return wsdk.connectors.execute({ permalink: 'cc-latest-topics', method: 'GET', queryParams })
      }))
      const recent = results
        .flatMap((r) => (r.status === 'fulfilled' ? extractTopics(r.value) : []))
        .filter((t) => t && t.title && new Date(t.createdAt || 0).getTime() >= cutoff)
      if (!recent.length) return null
      const topic = pickRandom(recent)
      return {
        title: shortenTitle(topic.title),
        href: topicUrl(topic, props.community_base_url, topic.categoryId || ids[0]),
      }
    } catch (err) {
      console.error('[greeting-banner] recent post lookup failed', err)
      return null
    }
  })()
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))
  return Promise.race([lookup, timeout])
}

// Rolls whether this visit quotes a post (news_chance %) and, if so, fetches one.
// Falls back to a plain time-of-day message in every other case.
async function chooseContent(props) {
  const chance = Math.min(Math.max(Number(props.news_chance) || 0, 0), 100)
  if (Math.random() * 100 < chance) {
    const post = await fetchRecentPost(props)
    if (post) {
      const [before, after] = pickRandom(NEWS_TEMPLATES).split('{title}')
      return { before, after, post }
    }
  }
  return { before: pickMessage(), after: '', post: null }
}

export async function init(sdk) {
  await sdk.whenReady()

  const banner = sdk.$('.greeting-banner')
  const bubbleText = sdk.$('.bubble-text')
  const faceParts = sdk.$('.mascot-face-parts')

  faceParts.innerHTML = pickFace()

  // Unset (widgets saved before this option existed) counts as on.
  const wantsName = (props) => props.show_user_name !== false

  let content = null
  let name = null
  let nameLookedUp = false

  function renderText(props) {
    const nodes = []
    const prefix = wantsName(props) && name ? `${name}さん、` : ''
    nodes.push(document.createTextNode(prefix + content.before))
    if (content.post) {
      const link = document.createElement('a')
      link.className = 'post-link'
      link.textContent = content.post.title
      const href = safeHref(content.post.href)
      if (href) link.setAttribute('href', href)
      nodes.push(link, document.createTextNode(content.after))
    }
    bubbleText.replaceChildren(...nodes)
  }

  function applyProps(props) {
    const accent = props.accent_color || '#7B3BC4'
    banner.style.setProperty('--accent-a', accent)
    banner.style.setProperty(
      '--accent-b',
      `color-mix(in srgb, ${accent} 70%, #4F8EF7)`
    )
  }

  const props = sdk.getProps()
  applyProps(props)

  const [chosen, viewerName] = await Promise.all([
    chooseContent(props),
    wantsName(props) ? getViewerName() : Promise.resolve(null),
  ])
  content = chosen
  name = viewerName
  nameLookedUp = wantsName(props)
  renderText(props)
  banner.classList.add('is-ready')

  let lastNewsKey = newsSettingsKey(props)

  sdk.on('propsChanged', async (newProps) => {
    applyProps(newProps)
    if (wantsName(newProps) && !nameLookedUp) {
      name = await getViewerName()
      nameLookedUp = true
    }
    const key = newsSettingsKey(newProps)
    if (key !== lastNewsKey) {
      lastNewsKey = key
      content = await chooseContent(newProps)
    }
    renderText(newProps)
  })
}
