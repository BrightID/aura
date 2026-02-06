import { signal } from '@lit-labs/signals'

type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: JSONSerializable }
  | JSONSerializable[]

function isJSONSerializable(value: unknown): value is JSONSerializable {
  try {
    JSON.parse(JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const localStorageSignal = <T>(
  key: string,
  initialValue: T,
  parseFn?: (value: string | null) => T,
  serializeFn?: (value: T) => string | null
) => {
  if (!isJSONSerializable(initialValue)) {
    throw new Error('Initial value must be JSON serializable')
  }

  const storage = localStorage.getItem(key)
  let parsedStorage: T | null = null

  try {
    parsedStorage = parseFn ? parseFn(storage as string) : (storage as never) ?? null
  } catch (e) {
    parsedStorage = (storage as never) ?? null
    console.warn(`Failed to parse stored value for key "${key}". Using initial value.`)
  }

  const state = signal<T>(parsedStorage || initialValue)

  return {
    get: () => state.get(),
    set: (value: T) => {
      if (!isJSONSerializable(value)) {
        throw new Error('Value must be JSON serializable')
      }
      const serialized = serializeFn ? serializeFn(value) ?? value!.toString() : value!.toString()
      localStorage.setItem(key, serialized)
      state.set(value)
    }
  }
}
