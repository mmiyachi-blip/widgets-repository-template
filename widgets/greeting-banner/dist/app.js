// Message pool. Kept flat (not category-tagged) per the source list; only
// the two time-of-day lines are bucket-specific, per the original request.
const BASE_MESSAGES = [
  '今日はどんな一歩を踏み出しますか？',
  'さて、今日はどの扉を開けましょう？',
  '今日のゴールに向けて、どこからスタートしますか？',
  '気になるテーマを選んで、さっそくチェック！',
  '今日のミッションをひとつ選んでみよう！',
  '顧客の成功を、今日もここから加速させよう！',
  '今日も最高の顧客体験をつくるヒント、集まっています！',
  '成果につながるアイデア、ここで見つけていきませんか？',
  '一緒にCSの「次のステップ」へ進みましょう！',
  'カスタマーサクセスをもっと楽しく、もっとスムーズに。',
  '今日はどんな“なるほど！”に出会いたいですか？',
  'ベストプラクティスの旅へ、いってらっしゃい！',
  'あなたの「知りたい」「困った」を解決するヒントがここに。',
  'スキルアップのヒントを宝探ししてみませんか？',
  '新しいノウハウを手に入れて、チームを一歩リード！',
  'ひとりで悩む前に、みんなの知恵をのぞいてみませんか？',
  'CS仲間と一緒に、学びもモチベーションもアップデート！',
  '気分に合わせてチョイス！今日のコンテンツはこちら。',
  'ちょっと一息入れながら、新しい情報を取りにいこう！',
  '迷ったら直感でOK！気になるカードをタップしてみてね。',
]

// Extra lines that only join the pool during their time-of-day window, so
// visitors are somewhat more likely (not guaranteed) to see a fitting tone.
const TIME_MESSAGES = {
  morning: ['今日も1日頑張りましょう！今日は何から始めますか？'],
  evening: ['今日もお疲れ様です！最後にちょこっとチェック？'],
}

function getTimeBucket(date) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 17 && hour < 23) return 'evening'
  return null
}

function pickMessage() {
  const bucket = getTimeBucket(new Date())
  const pool = bucket ? BASE_MESSAGES.concat(TIME_MESSAGES[bucket]) : BASE_MESSAGES
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

export async function init(sdk) {
  await sdk.whenReady()

  const banner = sdk.$('.greeting-banner')
  const bubbleText = sdk.$('.bubble-text')
  const faceParts = sdk.$('.mascot-face-parts')

  bubbleText.textContent = pickMessage()
  faceParts.innerHTML = pickFace()

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
