import makeBlockie from 'ethereum-blockies-base64'

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  borderRadius?: number,
  preferredTheme?: 'dark' | 'light'
) {
  const originalWidth = img.width
  const originalHeight = img.height

  const scale = Math.min(canvasWidth / originalWidth, canvasHeight / originalHeight)
  const scaledWidth = Math.round(originalWidth * scale)
  const scaledHeight = Math.round(originalHeight * scale)

  const horizontalPadding = (canvasWidth - scaledWidth) / 2
  const verticalPadding = (canvasHeight - scaledHeight) / 2

  ctx.fillStyle = preferredTheme === 'light' ? '#fff' : '#18181b'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  if (borderRadius) {
    const x = 0,
      y = 0,
      radius = borderRadius,
      width = canvasWidth,
      height = canvasHeight

    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()

    ctx.clip()
  }

  ctx.drawImage(img, horizontalPadding, verticalPadding, scaledWidth, scaledHeight)
  ctx.restore()
}

export const createBlockiesImage = (seed: string) => {
  return makeBlockie(seed)
}

export async function renderImageCover(
  imageContent: string,
  width: number,
  height: number,
  preferredTheme?: 'light' | 'dark'
) {
  const image = new Image()

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')!

  image.src = imageContent

  return await new Promise<string>(
    (resolve) =>
      (image.onload = () => {
        drawImageCover(context, image, width, height, 12, preferredTheme)

        const data = canvas.toDataURL()

        canvas.remove()

        resolve(data)
      })
  )
}
