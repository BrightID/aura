export const copyToClipboard = (str: string) => {
  navigator.clipboard.writeText(str).then(() => console.log("text copied"))
}
