import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { Fragment, useState } from "react"
import { CheckIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { auth, db, fbDb, writeData } from "~/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { addDoc, collection } from "firebase/firestore"

const formSchema = z.object({
  fullName: z.string().optional().nullable(),
  email: z
    .email({
      message: "Please enter a valid email address.",
    })
    .optional()
    .nullable(),
  role: z.string("Please select your role.").optional(),
  organization: z.string().optional(),
  howDidYouHear: z.string("Please tell us how you found BrightID."),
  useCase: z
    .string()
    .min(10, "Please provide at least 10 characters describing your use case.")
    .optional(),
  experience: z.string("Please select your experience level.").optional(),
  domain: z
    .url("Please enter a valid URL (e.g., https://example.com)")
    .optional()
    .or(z.literal("")),
})

const STEPS = [
  { id: 1, title: "Personal Info", fields: ["fullName", "email", "domain"] },
  { id: 2, title: "Professional", fields: ["role", "organization"] },
  {
    id: 3,
    title: "About BrightID",
    fields: ["howDidYouHear", "experience", "useCase"],
  },
]

type FormData = z.infer<typeof formSchema>

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)

  const [user] = useAuthState(auth)

  const navigate = useNavigate()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const onboardingCollectionRef = collection(db, "onboarding")
      const docRef = await addDoc(onboardingCollectionRef, {
        ...data,
        createdAt: new Date(),
      })

      console.log("Document written with ID: ", docRef.id)
    },
    mutationKey: ["create-onboarding"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
      organization: "",
      useCase: "",
    },
  })

  async function validateStep(step: number): Promise<boolean> {
    const stepConfig = STEPS.find((s) => s.id === step)
    if (!stepConfig) return false

    const result = await form.trigger(stepConfig.fields as any)
    return result
  }

  async function handleNext() {
    const isValid = await validateStep(currentStep)

    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }

    if (isValid && currentStep === STEPS.length) form.handleSubmit(onSubmit)()
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutateAsync(values)

    toast("Welcome aboard!", {
      description: "Your information has been submitted successfully.",
    })
    navigate("/dashboard")
  }

  return (
    <Card className="shadow-xl w-xl mx-auto">
      <CardHeader>
        <CardTitle>Onboarding Form</CardTitle>
        <CardDescription>
          Help us understand your needs and provide you with the best experience
        </CardDescription>

        <div className="flex items-center justify-between mt-6">
          {STEPS.map((step, index) => (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
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
                  className={`h-0.5 flex-1 mx-2 transition-colors ${currentStep > step.id ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </Fragment>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep === 1 && <FormStepOne form={form} />}

          {currentStep === 2 && <FormStepTwo form={form} />}

          {currentStep === 3 && <FormStepThree form={form} />}

          <div className="flex justify-between mt-6 gap-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex-1 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <Link className="flex-1" to={"/dashboard"}>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  type="button"
                >
                  <CheckIcon className="w-4 h-4 ml-2" />
                  Skip
                </Button>
              </Link>
            )}

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                disabled={isPending}
                type="button"
                onClick={handleNext}
                className="flex-1"
              >
                Complete Onboarding
                <CheckIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function FormStepOne({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FieldSet>
      <FieldLegend>Personal Information</FieldLegend>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.fullName}>
          <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
          <Input
            id="fullName"
            placeholder="John Doe"
            aria-invalid={!!form.formState.errors.fullName}
            {...form.register("fullName")}
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
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
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
          <Input
            id="domain"
            type="url"
            placeholder="https://example.com"
            aria-invalid={!!form.formState.errors.domain}
            {...form.register("domain")}
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
  )
}

function FormStepTwo({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FieldSet>
      <FieldLegend>Professional Details</FieldLegend>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.role}>
          <FieldLabel htmlFor="role">What is your role?</FieldLabel>
          <Select
            onValueChange={(value) => form.setValue("role", value)}
            defaultValue={form.watch("role")}
          >
            <SelectTrigger
              id="role"
              aria-invalid={!!form.formState.errors.role}
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="product-manager">Product Manager</SelectItem>
              <SelectItem value="researcher">Researcher</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="community-organizer">
                Community Organizer
              </SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
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
          <Input
            id="organization"
            placeholder="Your company or project name"
            {...form.register("organization")}
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
  )
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
          <Select
            onValueChange={(value) => form.setValue("howDidYouHear", value)}
            defaultValue={form.watch("howDidYouHear")}
          >
            <SelectTrigger
              id="howDidYouHear"
              aria-invalid={!!form.formState.errors.howDidYouHear}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="social-media">
                Social Media (Twitter, Reddit, etc.)
              </SelectItem>
              <SelectItem value="search-engine">Search Engine</SelectItem>
              <SelectItem value="friend-colleague">
                Friend or Colleague
              </SelectItem>
              <SelectItem value="conference-event">
                Conference or Event
              </SelectItem>
              <SelectItem value="blog-article">Blog or Article</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="podcast">Podcast</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
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
          <Select
            onValueChange={(value) => form.setValue("experience", value)}
            defaultValue={form.watch("experience")}
          >
            <SelectTrigger
              id="experience"
              aria-invalid={!!form.formState.errors.experience}
            >
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">
                Beginner - New to the concept
              </SelectItem>
              <SelectItem value="intermediate">
                Intermediate - Some knowledge
              </SelectItem>
              <SelectItem value="advanced">
                Advanced - Experienced user
              </SelectItem>
              <SelectItem value="expert">
                Expert - Building solutions
              </SelectItem>
            </SelectContent>
          </Select>
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
          <Textarea
            id="useCase"
            placeholder="Tell us about what you're planning to build or how you intend to use BrightID..."
            className="resize-none min-h-[120px]"
            aria-invalid={!!form.formState.errors.useCase}
            {...form.register("useCase")}
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
  )
}
