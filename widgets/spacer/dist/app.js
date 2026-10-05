const toPx = (value, fallback) => {
  const n = Number(value)
  return `${Number.isFinite(n) && n >= 0 ? Math.min(n, 400) : fallback}px`
}

export async function init(sdk) {
  await sdk.whenReady()

  const root = sdk.$('.sp')

  const applyProps = (props = {}) => {
    const p = props || {}
    root.style.setProperty('--h-desktop', toPx(p.height_desktop, 40))
    root.style.setProperty('--h-mobile', toPx(p.height_mobile, 24))
    root.style.background = p.background_color || 'transparent'
  }

  applyProps(sdk.getProps())
  sdk.on('propsChanged', applyProps)
}
