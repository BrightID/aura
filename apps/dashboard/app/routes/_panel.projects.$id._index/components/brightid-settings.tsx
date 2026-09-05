'use client';

import { type ReactNode, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { API_BASE_URL } from '~/constants';
import _ from 'lodash';
import { toast } from '@aura/ui';
import { cn } from '~/lib/utils';
import {
  AuraInput,
  AuraSwitch,
  AuraTextarea,
} from '~/components/aura-form-controls';

const formSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  name: z.string().min(1, 'Name is required'),
  sponsoring: z.boolean().default(true),
  testing: z.boolean(),
  idsAsHex: z.boolean(),
  soulbound: z.boolean(),
  soulboundMessage: z.string().optional(),
  usingBlindSig: z.boolean(),
  verifications: z.string().optional(),
  verificationExpirationLength: z.coerce.number().optional(),
  nodeUrl: z.url().optional().or(z.literal('')),
  context: z.string().optional(),
  description: z.string().optional(),
  links: z.string().optional(),
  images: z.string().optional(),
  callbackUrl: z.url().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

function FieldShell({
  label,
  description,
  error,
  children,
  className,
}: {
  label: string;
  description?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <a-label>{label}</a-label>
      {children}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

function SwitchField({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <a-label>{title}</a-label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <AuraSwitch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function getError(errors: unknown, name: keyof FormValues) {
  const fieldError = (
    errors as Partial<Record<keyof FormValues, { message?: unknown }>>
  )[name];
  const message = fieldError?.message;
  return typeof message === 'string' ? message : undefined;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <a-card variant="default">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold leading-none">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </a-card>
  );
}

export function BrightIdSettingsForm({
  initialData,
}: {
  initialData?: FormValues;
}) {
  const params = useParams();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: _.merge(
      {
        sponsoring: true,
        testing: false,
        idsAsHex: false,
        soulbound: false,
        usingBlindSig: false,
        nodeUrl: 'https://node.brightid.org',
        description: '',
        context: '',
        soulboundMessage: '',
        links: '',
        images: '',
        callbackUrl: '',
        verifications: '',
      },
      initialData,
    ),
  });

  const errors = form.formState.errors;

  // The verifications script can change from outside this form (e.g. selecting a
  // requirement level on the General tab). react-hook-form freezes defaultValues
  // at mount, so sync the field on refetch — unless the user is editing it.
  const incomingVerifications = initialData?.verifications ?? '';
  useEffect(() => {
    if (!form.getFieldState('verifications').isDirty) {
      form.setValue('verifications', incomingVerifications);
    }
  }, [incomingVerifications, form]);

  const { isPending, mutate } = useMutation({
    mutationKey: ['update-project', params.id],
    mutationFn: async (data: FormValues) => {
      const token = await getAuth().currentUser?.getIdToken();

      return axios.post(
        `${API_BASE_URL}/api/projects/update-project-brightid`,
        {
          brightIdApp: data,
          projectId: Number(params['id']),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
    },
    onSuccess(data, variables, onMutateResult, context) {
      toast.success('Bright Id settings updated');
      context.client.invalidateQueries({ queryKey: ['user-projects'] });
    },
    onError(error, variables, onMutateResult, context) {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <SectionCard
        title="Basic Information"
        description="Core identifiers for your BrightID app"
      >
        <Controller
          control={form.control}
          name="key"
          render={({ field }) => (
            <FieldShell
              label="Key *"
              description="Unique identifier for the app (cannot be changed later)"
              error={getError(errors, 'key')}
            >
              <AuraInput
                name={field.name}
                value={field.value ?? ''}
                placeholder="my-unique-app"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <FieldShell
              label="Name *"
              description="Friendly name shown to BrightID users"
              error={getError(errors, 'name')}
            >
              <AuraInput
                name={field.name}
                value={field.value ?? ''}
                placeholder="My Awesome App"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
      </SectionCard>

      <SectionCard title="App Mode & Features">
        <Controller
          control={form.control}
          name="testing"
          render={({ field }) => (
            <SwitchField
              title="Testing Mode"
              description="Uses test network and doesn't affect mainnet scores"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="idsAsHex"
          render={({ field }) => (
            <SwitchField
              title="IDs as Hex"
              description="User IDs formatted as Ethereum addresses (0x...)"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SectionCard>

      <SectionCard title="Verification Method">
        <Controller
          control={form.control}
          name="soulbound"
          render={({ field }) => (
            <SwitchField
              title="Soulbound (v1.5)"
              description="Uses context-bound signatures with Ethereum address"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {form.watch('soulbound') && (
          <>
            <Controller
              control={form.control}
              name="context"
              render={({ field }) => (
                <FieldShell
                  label="Context *"
                  description="Name of the context (e.g., your app name)"
                  error={getError(errors, 'context')}
                >
                  <AuraInput
                    name={field.name}
                    value={field.value ?? ''}
                    placeholder="myapp"
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                </FieldShell>
              )}
            />
            <Controller
              control={form.control}
              name="soulboundMessage"
              render={({ field }) => (
                <FieldShell
                  label="Soulbound Message"
                  description="Message shown in wallet when user signs (optional)"
                >
                  <AuraTextarea
                    name={field.name}
                    value={field.value ?? ''}
                    rows={3}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                </FieldShell>
              )}
            />
          </>
        )}

        <Controller
          control={form.control}
          name="usingBlindSig"
          render={({ field }) => (
            <SwitchField
              title="Blind Signatures (v1.6)"
              description="More private verification method"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </SectionCard>

      <SectionCard title="Verifications & Node">
        <Controller
          control={form.control}
          name="verifications"
          render={({ field }) => (
            <FieldShell
              label="Verifications Script"
              description="Aura script defining which verifications are accepted (one per line allowed)"
            >
              <AuraTextarea
                name={field.name}
                value={field.value ?? ''}
                rows={8}
                className="font-mono text-sm"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
        <Controller
          control={form.control}
          name="verificationExpirationLength"
          render={({ field }) => (
            <FieldShell
              label="Verification Expiration (ms)"
              description="How long verifications remain valid (0 = never expire)"
            >
              <AuraInput
                name={field.name}
                value={field.value == null ? '' : String(field.value)}
                type="number"
                placeholder="2592000000 (30 days)"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
        <Controller
          control={form.control}
          name="nodeUrl"
          render={({ field }) => (
            <FieldShell
              label="Preferred Node URL"
              description="Custom BrightID/Aura node (optional)"
              error={getError(errors, 'nodeUrl')}
            >
              <AuraInput
                name={field.name}
                value={field.value ?? ''}
                placeholder="https://node.brightid.org"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
      </SectionCard>

      <SectionCard title="Callback">
        <Controller
          control={form.control}
          name="callbackUrl"
          render={({ field }) => (
            <FieldShell
              label="Callback URL"
              description="Called when a user connects their BrightID"
              error={getError(errors, 'callbackUrl')}
            >
              <AuraInput
                name={field.name}
                value={field.value ?? ''}
                placeholder="https://myapp.com/api/brightid-callback"
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            </FieldShell>
          )}
        />
      </SectionCard>

      <div className="flex justify-end">
        <a-button disabled={isPending} type="submit" size="lg">
          Save BrightID Settings
        </a-button>
      </div>
    </form>
  );
}
