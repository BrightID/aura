import Dialog from '@/components/ui/dialog';
import type { DialogHandle } from '@/components/ui/dialog';
import { toast } from '@aura/ui/toast';
import { createSignal, For, Show } from 'solid-js';
import ListState from '@/components/list/list-state';
import { useRequireSession } from '@/hooks/use-require-session';
import { createStoreContactMutation } from '@/queries/contacts';
import { addContact, type ContactType, contactsStore } from '@/store/contacts';

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone);

export default function ContactInfoPage() {
  useRequireSession();
  let dialog: DialogHandle | undefined;

  const [type, setType] = createSignal<ContactType>('email');
  const [value, setValue] = createSignal('');
  const [error, setError] = createSignal('');

  const store = createStoreContactMutation();

  const submit = () => {
    const v = value().trim();
    if (type() === 'email' && !isValidEmail(v))
      return setError('Invalid email address');
    if (type() === 'phone' && !isValidPhone(v))
      return setError('Invalid phone number');

    store.mutate(v, {
      onSuccess: (hash) => {
        addContact({ type: type(), hash });
        setValue('');
        setError('');
        dialog?.hide();
        toast.success('Contact saved', {
          description: 'Only a hash of it is stored.',
        });
      },
      onError: () => setError('Could not save this contact. Try again.'),
    });
  };

  return (
    <div class="flex w-full flex-1 flex-col gap-4 px-5 pt-6 pb-10">
      <h2 class="a-head text-2xl">Your Contact info</h2>

      <p
        class="a-text text-muted-foreground"
        data-size="sm"
        data-variant="muted"
      >
        This is how your friends and family find you and ask for verification.
        Contacts are stored as hashes, so the values themselves stay private.
      </p>

      <div class="flex flex-col gap-3">
        <ListState
          loading={false}
          empty={contactsStore.stored?.length === 0}
          emptyText="No contact info added yet."
        >
          <For each={contactsStore.stored}>
            {(contact) => (
              <div
                class="a-card flex items-center justify-between p-4 text-sm"
                data-variant="glass"
              >
                <span class="capitalize text-foreground">{contact.type}</span>
                <span class="text-muted-foreground">******************</span>
              </div>
            )}
          </For>
        </ListState>
      </div>

      <Dialog
        label="Add contact information"
        ref={dialog}
        trigger={
          <button
            class="a-button"
            type="button"
            data-variant="glass"
            data-testid="contact-add"
          >
            + Add contact info
          </button>
        }
      >
        <div class="flex w-80 max-w-full flex-col gap-4">
          <p class="a-text" data-variant="muted">
            Add contact information
          </p>

          <div class="flex gap-2">
            <button
              class="a-button flex-1"
              type="button"
              data-testid="contact-type-email"
              data-variant={type() === 'email' ? 'default' : 'outline'}
              onClick={() => {
                setType('email');
                setError('');
              }}
            >
              Email
            </button>
            <button
              class="a-button flex-1"
              type="button"
              data-testid="contact-type-phone"
              data-variant={type() === 'phone' ? 'default' : 'outline'}
              onClick={() => {
                setType('phone');
                setError('');
              }}
            >
              Phone
            </button>
          </div>

          <div class="flex flex-col gap-1">
            <label class="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
              {type() === 'email' ? 'Email address' : 'Phone number'}
              <input
                class="a-input font-normal"
                data-testid="contact-value"
                placeholder={
                  type() === 'email' ? 'you@example.com' : '+1234567890'
                }
                value={value()}
                onInput={(e) => {
                  setValue(e.currentTarget.value);
                  setError('');
                }}
              />
            </label>
            <Show when={error()}>
              <p class="text-xs text-destructive">{error()}</p>
            </Show>
          </div>

          <button
            class="a-button"
            type="button"
            data-testid="contact-save"
            disabled={store.isPending}
            onClick={submit}
          >
            <Show when={store.isPending} fallback="Save contact">
              Saving…
            </Show>
          </button>
        </div>
      </Dialog>
    </div>
  );
}
