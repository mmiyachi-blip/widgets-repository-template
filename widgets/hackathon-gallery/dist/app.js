function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]))
}

const NEW_DAYS = 14
const ME = { id: 'me', name: 'あなた' }

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

const SEED = [
  { id: 's1', type: 'skill', title: 'アカウントオンボーディングブリーフ', desc: '新任CSMがアカウントを自信を持って引き継げるよう、ステークホルダーの背景から30日間のアクションプランまで、必要なすべてを提供します。', tool: 'Staircase AI', tags: ['オンボーディング&引き継ぎ'], author: '田中 CSM', createdAt: daysAgo(2), likes: 12, downloads: 34, body: '---\nname: account-onboarding-brief\ndescription: 新任CSM向けの引き継ぎブリーフを作成する\n---\n\n# 手順\n1. 対象アカウントのステークホルダーと関係性を整理する\n2. 直近90日の主要イベントを時系列でまとめる\n3. 30日間のアクションプランを提示する' },
  { id: 's2', type: 'prompt', title: 'アカウントサマリー', desc: 'ヘルス、ARR、センチメント、リスク、拡大のシグナル、推奨される次のステップまで、あらゆる顧客の全体像を、構造化されたビューで数秒のうちに把握できます。', tool: 'Staircase AI', tags: ['アカウントヘルス'], author: '佐藤 CSM', createdAt: daysAgo(5), likes: 27, downloads: 81, body: '[アカウント名] について、ヘルス・ARR・センチメント・リスク・拡大シグナルを表形式でまとめ、推奨ネクストステップを3つ提示してください。' },
  { id: 's3', type: 'prompt', title: '拡大分析', desc: 'あらゆるアカウントについて、実際のシグナルに裏付けられた最も有力な拡大機会を洗い出し、それを前進させるための優先順位付きのCSMアクションプランを提示します。', tool: 'Staircase AI', tags: ['オンボーディング&引き継ぎ'], author: '鈴木 CSM', createdAt: daysAgo(9), likes: 8, downloads: 19, body: '[アカウント名] の拡大機会を、根拠となるシグナル付きで優先順位順に挙げ、各機会へのCSMアクションを提案してください。' },
  { id: 's4', type: 'skill', title: 'CTA棚卸しレポート', desc: 'Gainsight MCPで未完了CTAを取得し、期限超過・優先度別に整理して週次の対応方針を出力します。', tool: 'Gainsight MCP', tags: ['CTA', '週次運用'], author: '高橋 CSM', createdAt: daysAgo(20), likes: 15, downloads: 42, body: '---\nname: cta-review\ndescription: 未完了CTAを棚卸しして週次の対応方針を作る\n---\n\n# 手順\n1. fetch_cta_list で未完了CTAを取得\n2. 期限超過・優先度で分類\n3. 今週対応すべきTop5を提案' },
  { id: 's5', type: 'prompt', title: '更新リスク早期検知', desc: '90日以内に更新を迎えるアカウントのヘルス推移とセンチメントを突き合わせ、リスク要因と先手のアクションを提案します。', tool: 'Gainsight MCP + Staircase AI', tags: ['更新', 'リスク'], author: '伊藤 CSM', createdAt: daysAgo(30), likes: 21, downloads: 57, body: '更新日が90日以内のアカウントを抽出し、ヘルススコア推移とセンチメントからリスク要因を分析、先手のアクションを提案してください。' },
]

// --- Store ---------------------------------------------------------------
// 現在はモック(メモリ + localStorage)。CC標準コンテンツ(REST API)に切り替える際は
// この4メソッドの中身だけを差し替える。UI側は変更不要。
function createMockStore() {
  const KEY = 'hk-gallery-mock-v1'
  let state = null
  try { state = JSON.parse(localStorage.getItem(KEY)) } catch (e) { state = null }
  if (!state) state = { items: SEED.map((s) => ({ ...s })), liked: {} }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* storage unavailable */ } }
  return {
    async list() { return state.items.map((i) => ({ ...i, liked: !!state.liked[i.id] })) },
    async toggleLike(id) {
      const it = state.items.find((i) => i.id === id)
      if (state.liked[id]) { delete state.liked[id]; it.likes -= 1 } else { state.liked[id] = true; it.likes += 1 }
      save()
      return { likes: it.likes, liked: !!state.liked[id] }
    },
    async countDownload(id) {
      const it = state.items.find((i) => i.id === id)
      it.downloads += 1
      save()
    },
    async create(draft) {
      const item = { ...draft, id: 'u' + Date.now(), author: ME.name, createdAt: new Date().toISOString(), likes: 0, downloads: 0, pending: true }
      state.items.unshift(item)
      save()
      return item
    },
  }
}


// CC標準コンテンツ(記事)を保存先にする。記事の tags に以下の規約でメタ情報を持たせる:
//   hackathon        … このギャラリーの対象記事の目印(コネクタ側で必ず付与)
//   hk-skill/hk-prompt … 種別
//   hk-tool-*        … 対象ツール
//   上記以外          … 利用者が付けたトピックタグ
// 記事本文は <p>概要</p><pre><code>本文</code></pre> の形で保存し、読み込み時に分解する。
const TOOL_TAGS = {
  'Gainsight MCP': 'hk-tool-gainsight-mcp',
  'Staircase AI': 'hk-tool-staircase-ai',
  'Gainsight MCP + Staircase AI': 'hk-tool-both',
  'その他': 'hk-tool-other',
}
const TAG_TOOLS = Object.fromEntries(Object.entries(TOOL_TAGS).map(([k, v]) => [v, k]))

function parseArticle(a) {
  const tags = a.tags || []
  const doc = new DOMParser().parseFromString(a.body || '', 'text/html')
  // CCは本文の改行を <br> に変換して保存するため、テキスト化の前に改行へ戻す
  doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'))
  const code = doc.querySelector('pre')
  const desc = doc.querySelector('p')?.textContent.trim() || ''
  const body = code ? code.textContent : doc.body.textContent.trim()
  return {
    id: String(a.id), title: a.title, desc, body,
    type: tags.includes('hk-skill') ? 'skill' : 'prompt',
    tool: TAG_TOOLS[tags.find((t) => t.startsWith('hk-tool-'))] || 'その他',
    tags: tags.filter((t) => t !== 'hackathon' && !t.startsWith('hk-')),
    author: a.author || '', createdAt: a.publishedAt, likes: a.likes || 0, liked: !!a.liked,
    url: a.url || '', replies: a.replies || 0,
  }
}

function createCommunityStore() {
  const wsdk = new window.WidgetServiceSDK()
  const call = (permalink, opts = {}) => wsdk.connectors.execute({ permalink, method: 'POST', ...opts })
  let cache = []
  return {
    async list() {
      const res = await wsdk.connectors.execute({ permalink: 'hk-articles-list', method: 'GET' })
      const arr = Array.isArray(res) ? res : (res.result || [])
      cache = arr.map(parseArticle)
      return cache.map((i) => ({ ...i }))
    },
    async toggleLike(id) {
      const it = cache.find((i) => i.id === id)
      await call(it.liked ? 'hk-article-unlike' : 'hk-article-like', { pathParams: { id } })
      it.liked = !it.liked
      it.likes += it.liked ? 1 : -1
      return { likes: it.likes, liked: it.liked }
    },
    async create(draft) {
      const clean = (t) => t.replace(/[,&#/\\<>]/g, '').trim()
      const content = `<p>${escapeHtml(draft.desc)}</p><pre><code>${escapeHtml(draft.body)}</code></pre>`
      const tags = [`hk-${draft.type}`, TOOL_TAGS[draft.tool] || 'hk-tool-other', ...draft.tags.map(clean).filter(Boolean)]
      await call('hk-article-create', { payload: { title: draft.title, content, tags } })
      return null // 記事は下書きで作成され、運営が公開するまで一覧には出ない
    },
  }
}

// --- helpers -------------------------------------------------------------
const isNew = (it) => Date.now() - new Date(it.createdAt).getTime() < NEW_DAYS * 86400000

function toMarkdown(it) {
  if (it.type === 'skill') return it.body
  return `# ${it.title}\n\n> ${it.desc}\n\n対象ツール: ${it.tool}\n\n## プロンプト\n\n${it.body}\n`
}

function fileName(it) {
  const slug = it.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const base = slug || `${it.type}-${it.id}`
  return it.type === 'skill' ? 'SKILL.md' : `${base}.md`
}

export async function init(sdk) {
  await sdk.whenReady()

  let props = sdk.getProps() || {}
  const store = props.data_source === 'mock' ? createMockStore() : createCommunityStore()
  const $ = (sel) => sdk.$(sel)
  let items = []
  const f = { q: '', type: 'all', tag: 'all', sort: 'new' }

  function applyProps() {
    const host = sdk.getContainer().host
    host.style.setProperty('--accent', props.accent_color || '#559CF9')
  }

  function toast(msg) {
    const t = $('.hk-toast')
    t.textContent = msg
    t.classList.add('hk-show')
    setTimeout(() => t.classList.remove('hk-show'), 1800)
  }

  function visible() {
    const q = f.q.trim().toLowerCase()
    const list = items.filter((i) =>
      (f.type === 'all' || i.type === f.type) &&
      (f.tag === 'all' || i.tags.includes(f.tag)) &&
      (!q || (i.title + i.desc + i.tags.join(' ')).toLowerCase().includes(q)))
    const key = { new: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), likes: (a, b) => b.likes - a.likes, dl: (a, b) => b.downloads - a.downloads }[f.sort]
    return list.sort(key)
  }

  function render() {
    const list = visible()
    $('.hk-count').innerHTML = `<b>${list.length}</b> 件の${escapeHtml(props.item_label || 'プロンプト')}`

    const tags = [...new Set(items.flatMap((i) => i.tags))]
    const tab = (label, type, tag, on) => `<button class="hk-tab ${on ? 'hk-on' : ''}" data-type="${type}" data-tag="${escapeHtml(tag)}">${escapeHtml(label)}</button>`
    $('.hk-tabs').innerHTML =
      tab('すべて', 'all', 'all', f.type === 'all' && f.tag === 'all') +
      tab('Skill', 'skill', 'all', f.type === 'skill') +
      tab('プロンプト', 'prompt', 'all', f.type === 'prompt') +
      tags.map((t) => tab('# ' + t, 'all', t, f.tag === t)).join('')

    $('.hk-grid').innerHTML = list.length ? list.map((i) => `
      <div class="hk-card" data-id="${i.id}">
        <h3 class="hk-title">
          ${i.pending ? '<span class="hk-badge" style="background:#999">承認待ち</span>' : isNew(i) ? '<span class="hk-badge">NEW</span>' : ''}${i.type === 'skill' ? '<span class="hk-badge hk-skill">SKILL</span>' : ''}${escapeHtml(i.title)}
        </h3>
        <p class="hk-desc">${escapeHtml(i.desc)}</p>
        <div><span class="hk-chip"><span class="hk-dot"></span>${escapeHtml(i.tool)}</span></div>
        <div>${i.tags.map((t) => `<span class="hk-chip hk-tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="hk-meta">
          <span>${escapeHtml(i.author)}</span>
          <button class="hk-like ${i.liked ? 'hk-on' : ''}" data-act="like" data-id="${i.id}">${i.liked ? '♥' : '♡'} ${i.likes}</button>
          ${i.downloads !== undefined ? `<span>⬇ ${i.downloads}</span>` : ''}
        </div>
        <div class="hk-actions">
          <button class="hk-btn" data-act="copy" data-id="${i.id}">${i.type === 'skill' ? 'Skillをコピー' : 'プロンプトをコピー'}</button>
          <button class="hk-btn hk-ghost" data-act="download" data-id="${i.id}">ダウンロード</button>
        </div>
      </div>`).join('') : '<div class="hk-empty">該当する投稿がありません</div>'
  }

  async function reload() {
    try { items = await store.list(); render() }
    catch (e) {
      console.error('[hackathon-gallery] list failed', e)
      $('.hk-grid').innerHTML = '<div class="hk-empty">一覧を読み込めませんでした。時間をおいて再度お試しください。</div>'
    }
  }

  const needLogin = (e) => { console.error('[hackathon-gallery]', e); toast('操作できませんでした。ログインしているか確認してください') }

  function openOverlay(name) { $(`[data-ov="${name}"]`).classList.add('hk-open') }
  function closeOverlays() { sdk.$$('.hk-overlay').forEach((o) => o.classList.remove('hk-open')) }

  function openDetail(id) {
    const it = items.find((i) => i.id === id)
    $('.hk-detail').innerHTML = `
      <h2>${escapeHtml(it.title)}</h2>
      <p style="color:var(--muted);font-size:14px;line-height:1.8">${escapeHtml(it.desc)}</p>
      <div><span class="hk-chip"><span class="hk-dot"></span>${escapeHtml(it.tool)}</span>${it.tags.map((t) => `<span class="hk-chip hk-tag">${escapeHtml(t)}</span>`).join('')}</div>
      <pre class="hk-body">${escapeHtml(it.body)}</pre>
      <div class="hk-actions" style="margin-top:14px">
        <button class="hk-btn" data-act="copy" data-id="${it.id}">コピー</button>
        <button class="hk-btn hk-ghost" data-act="download" data-id="${it.id}">ダウンロード (${escapeHtml(fileName(it))})</button>
      </div>`
    openOverlay('detail')
  }

  async function copy(id) {
    const it = items.find((i) => i.id === id)
    try { await navigator.clipboard.writeText(it.body); toast('コピーしました') }
    catch (e) { toast('コピーできませんでした。詳細を開いて手動でコピーしてください') }
    if (store.countDownload) { await store.countDownload(id); await reload() }
  }

  async function download(id) {
    const it = items.find((i) => i.id === id)
    const blob = new Blob([toMarkdown(it)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileName(it)
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast(`${fileName(it)} をダウンロードしました`)
    if (store.countDownload) { await store.countDownload(id); await reload() }
  }

  async function submitPost() {
    const v = (n) => $(`[name="${n}"]`).value.trim()
    const draft = {
      type: v('type'), title: v('title'), desc: v('desc'), tool: v('tool'), body: v('body'),
      tags: v('tags').split(/[,、]/).map((s) => s.trim()).filter(Boolean).slice(0, 3),
    }
    const err = !draft.title ? 'タイトルを入力してください' : !draft.desc ? '概要を入力してください' : !draft.body ? '本文を入力してください' : ''
    $('.hk-err').textContent = err
    if (err) return
    try { await store.create(draft) } catch (err) { return needLogin(err) }
    closeOverlays()
    ;['title', 'desc', 'tags', 'body'].forEach((n) => { $(`[name="${n}"]`).value = '' })
    toast('投稿しました(運営の承認後に公開されます)')
    await reload()
  }

  const root = sdk.getContainer()
  root.addEventListener('click', async (e) => {
    const tabEl = e.target.closest('.hk-tab')
    if (tabEl) { f.type = tabEl.dataset.type; f.tag = tabEl.dataset.tag; return render() }
    const actEl = e.target.closest('[data-act]')
    if (actEl) {
      const { act, id } = actEl.dataset
      e.stopPropagation()
      if (act === 'like') { try { const r = await store.toggleLike(id); Object.assign(items.find((i) => i.id === id), r); return render() } catch (err) { return needLogin(err) } }
      if (act === 'copy') return copy(id)
      if (act === 'download') return download(id)
      if (act === 'open-post') return openOverlay('post')
      if (act === 'submit-post') return submitPost()
      if (act === 'close') return closeOverlays()
    }
    if (e.target.classList.contains('hk-overlay')) return closeOverlays()
    const card = e.target.closest('.hk-card')
    if (card) openDetail(card.dataset.id)
  })
  $('.hk-search').addEventListener('input', (e) => { f.q = e.target.value; render() })
  $('.hk-sort').addEventListener('change', (e) => { f.sort = e.target.value; render() })

  applyProps()
  sdk.on('propsChanged', (p) => { props = p || {}; applyProps(); render() })
  await reload()
}
