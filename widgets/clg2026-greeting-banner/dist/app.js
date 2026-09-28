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

export async function init(sdk) {
  await sdk.whenReady()

  const banner = sdk.$('.greeting-banner')
  const bubbleText = sdk.$('.bubble-text')

  bubbleText.textContent = pickMessage()

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
