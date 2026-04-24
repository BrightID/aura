export function getRandomElement<T = []>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function findLastIndex<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean,
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}
