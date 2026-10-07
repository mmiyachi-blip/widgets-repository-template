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

export async function init(sdk) {
  await sdk.whenReady()

  const banner = sdk.$('.greeting-banner')
  const bubbleText = sdk.$('.bubble-text')
  const faceParts = sdk.$('.mascot-face-parts')

  const message = pickMessage()
  faceParts.innerHTML = pickFace()

  const name = await getViewerName()
  bubbleText.textContent = name ? `${name}さん、${message}` : message
  banner.classList.add('is-ready')

  function applyProps(props) {
    const accent = props.accent_color || '#7B3BC4'
    banner.style.setProperty('--accent-a', accent)
    banner.style.setProperty(
      '--accent-b',
      `color-mix(in srgb, ${accent} 70%, #4F8EF7)`
    )
  }

  applyProps(sdk.getProps())

  sdk.on('propsChanged', (newProps) => {
    applyProps(newProps)
  })
}
