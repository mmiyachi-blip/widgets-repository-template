const ICONS = {
  1: 'icons/product_learning.png',
  2: 'icons/best_practices_tips.png',
  3: 'icons/community_consultation.png',
  4: 'icons/subcommittees.png',
  5: 'icons/events_webinars.png',
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]))
}

function cardHtml(index, props) {
  const title = props[`card_${index}_title`] || ''
  const link = props[`card_${index}_link`] || '#'
  const color = props[`card_${index}_color`] || '#999999'

  return `
    <a class="card" style="--card-color: ${escapeHtml(color)}" href="${escapeHtml(link)}">
      <img class="icon" src="${ICONS[index]}" alt="" />
      <span class="label">${escapeHtml(title)}</span>
      <span class="arrow-badge">&#8250;</span>
    </a>
  `
}

export async function init(sdk) {
  await sdk.whenReady()

  const rowTop = sdk.$('.row-top')
  const rowBottom = sdk.$('.row-bottom')

  function render(props) {
    rowTop.innerHTML = [1, 2].map((i) => cardHtml(i, props)).join('')
    rowBottom.innerHTML = [3, 4, 5].map((i) => cardHtml(i, props)).join('')
  }

  render(sdk.getProps())

  sdk.on('propsChanged', (newProps) => {
    render(newProps)
  })
}
