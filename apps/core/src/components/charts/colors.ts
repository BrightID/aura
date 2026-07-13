/**
 * Bar palettes from the old app (`constants/chart.ts`), keyed by the signed
 * confidence (-4…4): green/red shades for other evaluators, purple for the
 * logged-in user's own bar, orange for the focused subject's bar.
 */
type ColorMap = Record<string, string>

export const valueColorMap: ColorMap = {
  "-4": "#924848",
  "-3": "#DA6A6A",
  "-2": "#EE9D9D",
  "-1": "#F5BFBF",
  "1": "#D5ECDA",
  "2": "#B4E6C0",
  "3": "#72BF83",
  "4": "#5B9969",
}

export const userRatingColorMap: ColorMap = {
  "-4": "#D9C7F9",
  "-3": "#C2A8F3",
  "-2": "#AC89ED",
  "-1": "#956AE6",
  "1": "#8341DE",
  "2": "#6C34B3",
  "3": "#572988",
  "4": "#451F6D",
}

export const subjectRatingColorMap: ColorMap = {
  "-4": "#FAD7A0",
  "-3": "#F8C471",
  "-2": "#F5B041",
  "-1": "#F39C12",
  "1": "#E67E22",
  "2": "#CA6A1A",
  "3": "#AF5714",
  "4": "#91450F",
}

const clampSigned = (value: number) =>
  Math.max(-4, Math.min(4, Math.round(value))) || 1

/** Color for one evaluation bar (old `getBarChartColor`). */
export function barColor(
  signedConfidence: number,
  evaluator: string,
  authBrightId?: string,
  focusedSubjectId?: string,
): string {
  const map =
    evaluator === authBrightId
      ? userRatingColorMap
      : evaluator === focusedSubjectId
        ? subjectRatingColorMap
        : valueColorMap
  return map[String(clampSigned(signedConfidence))]
}
