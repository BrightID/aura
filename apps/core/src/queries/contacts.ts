import { createMutation } from "@tanstack/solid-query"
import bcrypt from "bcryptjs"
import {
  BASE_SALT_FOR_CONTACTS,
  normalizeContactValue,
} from "@/shared/lib/contacts"
import { postJson } from "@/shared/lib/api"

const GET_VERIFIED_API = "/interface"

/**
 * Hash a contact (fixed salt, so the server can match it later) and register
 * the hash with the get-verified service. Returns the hash for local storage.
 */
export const createStoreContactMutation = () =>
  createMutation(() => ({
    mutationFn: async (value: string) => {
      const hash = await bcrypt.hash(
        normalizeContactValue(value),
        BASE_SALT_FOR_CONTACTS,
      )
      // A SyntaxError after a 2xx means an empty/non-JSON body — that's fine,
      // only the status matters here (non-2xx already threw a plain Error).
      await postJson(`${GET_VERIFIED_API}/api/create-social`, { hash }).catch(
        (e) => {
          if (!(e instanceof SyntaxError)) throw e
        },
      )
      return hash
    },
  }))
