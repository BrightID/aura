import { createSignal, For, Show } from "solid-js"
import { toast } from "@aura/ui"
import type { DialogElement } from "@aura/ui"
import { useRequireSession } from "@/hooks/use-require-session"
import { createStoreContactMutation } from "@/queries/contacts"
import {
  addContact,
  contactsStore,
  type ContactType,
} from "@/store/contacts"

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidPhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone)

/** /contact-info — hashed contact registry so friends can find you. */
export default function ContactInfoPage() {
  useRequireSession()
  let dialog: DialogElement | undefined

  const [type, setType] = createSignal<ContactType>("email")
  const [value, setValue] = createSignal("")
  const [error, setError] = createSignal("")

  const store = createStoreContactMutation()

  const submit = () => {
    const v = value().trim()
    if (type() === "email" && !isValidEmail(v))
      return setError("Invalid email address")
    if (type() === "phone" && !isValidPhone(v))
      return setError("Invalid phone number")

    store.mutate(v, {
      onSuccess: (hash) => {
        addContact({ type: type(), hash })
        setValue("")
        setError("")
        dialog?.hide()
        toast.success("Contact saved", {
          description: "Only a hash of it is stored.",
        })
      },
      onError: (e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
    })
  }

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <a-head class="text-2xl">Your Contact info</a-head>

      <a-text size="sm" class="text-muted-foreground">
        This is how your friends and family find you and ask for verification.
        Contacts are stored as hashes, so the values themselves stay private.
      </a-text>

      <div class="flex flex-col gap-3">
        <Show
          when={contactsStore.stored.length > 0}
          fallback={
            <div class="py-6 text-center text-muted-foreground">
              No contact info added yet.
            </div>
          }
        >
          <For each={contactsStore.stored}>
            {(contact) => (
              <a-card
                variant="glass"
                class="flex items-center justify-between p-4 text-sm"
              >
                <span class="capitalize text-foreground">{contact.type}</span>
                <span class="text-muted-foreground">******************</span>
              </a-card>
            )}
          </For>
        </Show>
      </div>

      <a-dialog ref={dialog}>
        <a-button slot="trigger" variant="glass" data-testid="contact-add">
          + Add contact info
        </a-button>

        <div slot="content" class="flex w-80 max-w-full flex-col gap-4">
          <a-text variant="muted">Add contact information</a-text>

          <div class="flex gap-2">
            <a-button
              class="flex-1"
              data-testid="contact-type-email"
              variant={type() === "email" ? "default" : "outline"}
              onClick={() => {
                setType("email")
                setError("")
              }}
            >
              Email
            </a-button>
            <a-button
              class="flex-1"
              data-testid="contact-type-phone"
              variant={type() === "phone" ? "default" : "outline"}
              onClick={() => {
                setType("phone")
                setError("")
              }}
            >
              Phone
            </a-button>
          </div>

          <div class="flex flex-col gap-1">
            <a-input
              data-testid="contact-value"
              label={type() === "email" ? "Email address" : "Phone number"}
              placeholder={
                type() === "email" ? "you@example.com" : "+1234567890"
              }
              value={value()}
              onChange={(e: CustomEvent<string>) => {
                setValue(e.detail)
                setError("")
              }}
            />
            <Show when={error()}>
              <p class="text-xs text-destructive">{error()}</p>
            </Show>
          </div>

          <a-button
            data-testid="contact-save"
            disabled={store.isPending}
            onClick={submit}
          >
            <Show when={store.isPending} fallback="Save contact">
              Saving…
            </Show>
          </a-button>
        </div>
      </a-dialog>
    </div>
  )
}
