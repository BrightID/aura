import { loginWithApple, loginWithGoogle } from "~/lib/auth-actions"
import { auth } from "~/lib/firebase"
import { useEffect, useRef } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router"
import { Controller, useForm, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { toast } from "@aura/ui"
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { useAuraEvent } from "~/lib/aura"

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof formSchema>

/** Native `<a-input>` bound to a react-hook-form field via its `change` event. */
function AuraTextInput({
  control,
  name,
  ...props
}: {
  control: Control<FormData>
  name: keyof FormData
  id?: string
  type?: "text" | "email" | "password" | "number"
  placeholder?: string
  className?: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <BoundInput value={field.value ?? ""} onChange={field.onChange} {...props} />
      )}
    />
  )
}

function BoundInput({
  value,
  onChange,
  ...props
}: {
  value: string
  onChange: (v: string) => void
  id?: string
  type?: "text" | "email" | "password" | "number"
  placeholder?: string
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  useAuraEvent<string>(ref, "change", onChange)
  return <a-input ref={ref} value={value} {...props} />
}

function LoginScreen() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const loginForm = useForm<FormData>({ resolver: zodResolver(formSchema) })
  const signupForm = useForm<FormData>({ resolver: zodResolver(formSchema) })
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      signInWithEmailAndPassword(auth, data.email, data.password),
    mutationKey: ["login-with-password"],
  })
  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  const onLogin = async (data: FormData) => {
    try {
      await mutateAsync(data)
    } catch (e) {
      toast((e as Error).message)
    }
  }

  const onSignup = async (data: FormData) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
      navigate("/onboarding")
    } catch (e) {
      toast((e as Error).message)
    }
  }

  return (
    <a-card variant="default" className="relative z-10 w-full max-w-[26rem] p-8 shadow-2xl">
      <div className="space-y-1.5 pb-6 text-center">
        <a-head level="3" className="text-3xl font-bold tracking-tight">
          Welcome
        </a-head>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account
        </p>
      </div>

      <a-tabs value="login" className="w-full">
        <a-tab value="login">Sign In</a-tab>
        <a-tab value="signup">Sign Up</a-tab>

        <a-tab-panel slot="panel" value="login">
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <a-label for="login-email">Email</a-label>
              <AuraTextInput
                control={loginForm.control}
                name="email"
                id="login-email"
                type="email"
                placeholder="you@example.com"
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <a-label for="login-password">Password</a-label>
              <AuraTextInput
                control={loginForm.control}
                name="password"
                id="login-password"
                type="password"
                placeholder="••••••••"
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <a-button disabled={isPending} type="submit" size="lg" className="w-full font-semibold">
              Sign In
            </a-button>
          </form>
        </a-tab-panel>

        <a-tab-panel slot="panel" value="signup">
          <form
            onSubmit={signupForm.handleSubmit(onSignup)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <a-label for="signup-email">Email</a-label>
              <AuraTextInput
                control={signupForm.control}
                name="email"
                id="signup-email"
                type="email"
                placeholder="you@example.com"
              />
              {signupForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <a-label for="signup-password">Password</a-label>
              <AuraTextInput
                control={signupForm.control}
                name="password"
                id="signup-password"
                type="password"
                placeholder="••••••••"
              />
              {signupForm.formState.errors.password && (
                <p className="text-xs text-red-500">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <a-button disabled={isPending} type="submit" size="lg" className="w-full font-semibold">
              Sign Up
            </a-button>
          </form>
        </a-tab-panel>
      </a-tabs>

      <div className="relative my-6">
        <div className="h-px w-full bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Or continue with
        </span>
      </div>

      <div className="grid gap-2.5">
        <a-button
          variant="glass"
          className="w-full"
          onClick={() =>
            loginWithGoogle().catch((e) => toast((e as Error).message))
          }
        >
          <IconBrandGoogle className="mr-2 size-5" />
          Google
        </a-button>

        <a-button
          variant="glass"
          className="w-full"
          onClick={() =>
            loginWithApple().catch((e) => toast((e as Error).message))
          }
        >
          <IconBrandApple className="mr-2 size-5" />
          Apple
        </a-button>
      </div>
    </a-card>
  )
}

export default LoginScreen
