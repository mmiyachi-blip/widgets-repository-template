function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]))
}

function cardHtml(index, props, iconUrl) {
  const title = props[`card_${index}_title`] || ''
  const subtitle = props[`card_${index}_subtitle`] || ''
  const link = props[`card_${index}_link`] || '#'
  const color = props[`card_${index}_color`] || '#999999'
  const textColor = props[`card_${index}_text_color`] || color

  return `
    <a class="card" style="--card-color: ${escapeHtml(color)}; --card-text-color: ${escapeHtml(textColor)}" href="${escapeHtml(link)}">
      <img class="icon" src="${escapeHtml(iconUrl || '')}" alt="" />
      <span class="text">
        <span class="label">${escapeHtml(title)}</span>
        ${subtitle ? `<span class="subtitle">${escapeHtml(subtitle)}</span>` : ''}
      </span>
      <span class="arrow-badge">&#8250;</span>
    </a>
  `
}

export async function init(sdk) {
  await sdk.whenReady()

  // Resolved by the platform's publish-time rewrite of the <link> hrefs
  // declared statically in content.html — see the comment there.
  const iconUrls = {
    1: sdk.$('#icon-src-1')?.href || '',
    2: sdk.$('#icon-src-2')?.href || '',
    3: sdk.$('#icon-src-3')?.href || '',
    4: sdk.$('#icon-src-4')?.href || '',
    5: sdk.$('#icon-src-5')?.href || '',
  }

  const rowTop = sdk.$('.row-top')
  const rowBottom = sdk.$('.row-bottom')

  function render(props) {
    rowTop.innerHTML = [3, 4, 5].map((i) => cardHtml(i, props, iconUrls[i])).join('')
    rowBottom.innerHTML = [1, 2].map((i) => cardHtml(i, props, iconUrls[i])).join('')
  }

  render(sdk.getProps())

  sdk.on('propsChanged', (newProps) => {
    render(newProps)
  })
}
