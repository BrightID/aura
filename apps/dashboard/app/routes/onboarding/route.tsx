import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { toast } from '@aura/ui';
import { Fragment, useState } from 'react';
import { CheckIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { auth, db } from '~/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection } from 'firebase/firestore';
import {
  AuraInput,
  AuraSelect,
  AuraTextarea,
} from '~/components/aura-form-controls';

const formSchema = z.object({
  fullName: z.string().optional().nullable(),
  email: z
    .email({
      message: 'Please enter a valid email address.',
    })
    .optional()
    .nullable(),
  role: z.string('Please select your role.').optional(),
  organization: z.string().optional(),
  howDidYouHear: z.string('Please tell us how you found BrightID.'),
  useCase: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your use case.')
    .optional(),
  experience: z.string('Please select your experience level.').optional(),
  domain: z
    .url('Please enter a valid URL (e.g., https://example.com)')
    .optional()
    .or(z.literal('')),
});

const STEPS = [
  { id: 1, title: 'Personal Info', fields: ['fullName', 'email', 'domain'] },
  { id: 2, title: 'Professional', fields: ['role', 'organization'] },
  {
    id: 3,
    title: 'About BrightID',
    fields: ['howDidYouHear', 'experience', 'useCase'],
  },
];

type FormData = z.infer<typeof formSchema>;

const roleOptions = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'student', label: 'Student' },
  { value: 'community-organizer', label: 'Community Organizer' },
  { value: 'other', label: 'Other' },
];

const discoveryOptions = [
  { value: 'social-media', label: 'Social Media (Twitter, Reddit, etc.)' },
  { value: 'search-engine', label: 'Search Engine' },
  { value: 'friend-colleague', label: 'Friend or Colleague' },
  { value: 'conference-event', label: 'Conference or Event' },
  { value: 'blog-article', label: 'Blog or Article' },
  { value: 'github', label: 'GitHub' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
];

const experienceOptions = [
  { value: 'beginner', label: 'Beginner - New to the concept' },
  { value: 'intermediate', label: 'Intermediate - Some knowledge' },
  { value: 'advanced', label: 'Advanced - Experienced user' },
  { value: 'expert', label: 'Expert - Building solutions' },
];

function setFieldValue(
  form: UseFormReturn<FormData>,
  name: keyof FormData,
  value: string,
) {
  form.setValue(name, value, { shouldValidate: true, shouldDirty: true });
}

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const [user] = useAuthState(auth);

  const navigate = useNavigate();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const onboardingCollectionRef = collection(db, 'onboarding');
      const docRef = await addDoc(onboardingCollectionRef, {
        ...data,
        createdAt: new Date(),
      });

      console.log('Document written with ID: ', docRef.id);
    },
    mutationKey: ['create-onboarding'],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: '',
      organization: '',
      useCase: '',
    },
  });

  async function validateStep(step: number): Promise<boolean> {
    const stepConfig = STEPS.find((s) => s.id === step);
    if (!stepConfig) return false;

    const result = await form.trigger(stepConfig.fields as any);
    return result;
  }

  async function handleNext() {
    const isValid = await validateStep(currentStep);

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }

    if (isValid && currentStep === STEPS.length) form.handleSubmit(onSubmit)();
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync(values);

    toast('Welcome aboard!', {
      description: 'Your information has been submitted successfully.',
    });
    navigate('/');
  }

  return (
    <a-card className="shadow-xl w-xl mx-auto">
      <div className="flex flex-col gap-1.5 p-6">
        <a-head level="3" className="font-semibold">
          Onboarding Form
        </a-head>
        <p className="text-muted-foreground text-sm">
          Help us understand your needs and provide you with the best experience
        </p>

        <div className="flex items-center justify-between mt-6">
          {STEPS.map((step, index) => (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs mt-2 text-center">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep === 1 && <FormStepOne form={form} />}

          {currentStep === 2 && <FormStepTwo form={form} />}

          {currentStep === 3 && <FormStepThree form={form} />}

          <div className="flex justify-between mt-6 gap-4">
            {currentStep > 1 ? (
              <a-button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex-1 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </a-button>
            ) : (
              <Link className="flex-1" to="/">
                <a-button
                  className="w-full bg-transparent"
                  variant="outline"
                  type="button"
                >
                  <CheckIcon className="w-4 h-4 ml-2" />
                  Skip
                </a-button>
              </Link>
            )}

            {currentStep < STEPS.length ? (
              <a-button type="button" onClick={handleNext} className="flex-1">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </a-button>
            ) : (
              <a-button
                disabled={isPending}
                type="button"
                onClick={handleNext}
                className="flex-1"
              >
                Complete Onboarding
                <CheckIcon className="w-4 h-4 ml-2" />
              </a-button>
            )}
          </div>
        </form>
      </div>
    </a-card>
  );
}

function FormStepOne({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FieldSet>
      <FieldLegend>Personal Information</FieldLegend>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.fullName}>
          <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
          <AuraInput
            name="fullName"
            value={form.watch('fullName') ?? ''}
            placeholder="John Doe"
            aria-invalid={!!form.formState.errors.fullName}
            onValueChange={(value) => setFieldValue(form, 'fullName', value)}
          />
          <FieldError
            errors={
              form.formState.errors.fullName
                ? [form.formState.errors.fullName]
                : undefined
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <AuraInput
            name="email"
            type="email"
            value={form.watch('email') ?? ''}
            placeholder="john@example.com"
            aria-invalid={!!form.formState.errors.email}
            onValueChange={(value) => setFieldValue(form, 'email', value)}
          />
          <FieldError
            errors={
              form.formState.errors.email
                ? [form.formState.errors.email]
                : undefined
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.domain}>
          <FieldLabel htmlFor="domain">Domain</FieldLabel>
          <AuraInput
            name="domain"
            value={form.watch('domain') ?? ''}
            placeholder="https://example.com"
            aria-invalid={!!form.formState.errors.domain}
            onValueChange={(value) => setFieldValue(form, 'domain', value)}
          />
          <FieldDescription>
            Your website or project domain if you have one
          </FieldDescription>
          <FieldError
            errors={
              form.formState.errors.domain
                ? [form.formState.errors.domain]
                : undefined
            }
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

function FormStepTwo({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FieldSet>
      <FieldLegend>Professional Details</FieldLegend>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.role}>
          <FieldLabel htmlFor="role">What is your role?</FieldLabel>
          <AuraSelect
            name="role"
            value={form.watch('role') ?? ''}
            placeholder="Select your role"
            options={roleOptions}
            aria-invalid={!!form.formState.errors.role}
            onValueChange={(value) => setFieldValue(form, 'role', value)}
          />
          <FieldError
            errors={
              form.formState.errors.role
                ? [form.formState.errors.role]
                : undefined
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.organization}>
          <FieldLabel htmlFor="organization">Organization</FieldLabel>
          <AuraInput
            name="organization"
            value={form.watch('organization') ?? ''}
            placeholder="Your company or project name"
            onValueChange={(value) =>
              setFieldValue(form, 'organization', value)
            }
          />
          <FieldDescription>
            If you're representing an organization or project
          </FieldDescription>
          <FieldError
            errors={
              form.formState.errors.organization
                ? [form.formState.errors.organization]
                : undefined
            }
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

function FormStepThree({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FieldSet>
      <FieldLegend>About BrightID</FieldLegend>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.howDidYouHear}>
          <FieldLabel htmlFor="howDidYouHear">
            How did you hear about BrightID?
          </FieldLabel>
          <AuraSelect
            name="howDidYouHear"
            value={form.watch('howDidYouHear') ?? ''}
            placeholder="Select an option"
            options={discoveryOptions}
            aria-invalid={!!form.formState.errors.howDidYouHear}
            onValueChange={(value) =>
              setFieldValue(form, 'howDidYouHear', value)
            }
          />
          <FieldError
            errors={
              form.formState.errors.howDidYouHear
                ? [form.formState.errors.howDidYouHear]
                : undefined
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.experience}>
          <FieldLabel htmlFor="experience">
            Experience with decentralized identity
          </FieldLabel>
          <AuraSelect
            name="experience"
            value={form.watch('experience') ?? ''}
            placeholder="Select your experience level"
            options={experienceOptions}
            aria-invalid={!!form.formState.errors.experience}
            onValueChange={(value) => setFieldValue(form, 'experience', value)}
          />
          <FieldError
            errors={
              form.formState.errors.experience
                ? [form.formState.errors.experience]
                : undefined
            }
          />
        </Field>

        <Field data-invalid={!!form.formState.errors.useCase}>
          <FieldLabel htmlFor="useCase">
            What's your primary use case?
          </FieldLabel>
          <AuraTextarea
            name="useCase"
            value={form.watch('useCase') ?? ''}
            placeholder="Tell us about what you're planning to build or how you intend to use BrightID..."
            className="resize-none min-h-[120px]"
            rows={5}
            aria-invalid={!!form.formState.errors.useCase}
            onValueChange={(value) => setFieldValue(form, 'useCase', value)}
          />
          <FieldDescription>
            Help us understand your goals and how we can support you
          </FieldDescription>
          <FieldError
            errors={
              form.formState.errors.useCase
                ? [form.formState.errors.useCase]
                : undefined
            }
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
