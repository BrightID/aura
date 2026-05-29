export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase(),
  );
}
