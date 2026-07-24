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
    if (user) navigate("/dashboard")
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
    <a-card className="max-w-md hover-lift shadow-2xl relative z-10 opacity-100 w-[126%] mx-[0] border-transparent">
      <div className="text-center space-y-2 p-6">
        <a-head
          level="3"
          className="text-3xl font-bold font-sans text-card-foreground"
        >
          Welcome
        </a-head>
        <p className="text-card-foreground/70 font-sans">
          Sign in or create an account
        </p>
      </div>

      <div className="space-y-6 p-6 pt-0">
        <a-tabs value="login" className="w-full">
          <a-tab value="login">Sign In</a-tab>
          <a-tab value="signup">Sign Up</a-tab>

          <a-tab-panel slot="panel" value="login" className="space-y-4">
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <a-label for="login-email">Email</a-label>
                <AuraTextInput
                  control={loginForm.control}
                  name="email"
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <a-label for="login-password">Password</a-label>
                <AuraTextInput
                  control={loginForm.control}
                  name="password"
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <a-button
                disabled={isPending}
                type="submit"
                className="w-full ripple-effect hover-lift font-sans font-bold py-5 transition-all duration-300"
              >
                Sign In
              </a-button>
            </form>
          </a-tab-panel>

          <a-tab-panel slot="panel" value="signup" className="space-y-4">
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <a-label for="signup-email">Email</a-label>
                <AuraTextInput
                  control={signupForm.control}
                  name="email"
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <a-label for="signup-password">Password</a-label>
                <AuraTextInput
                  control={signupForm.control}
                  name="password"
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-xs">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <a-button
                disabled={isPending}
                type="submit"
                className="w-full ripple-effect hover-lift font-sans font-bold py-5 transition-all duration-300"
              >
                Sign Up
              </a-button>
            </form>
          </a-tab-panel>
        </a-tabs>

        <a-separator />
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-card-foreground/60 font-sans">
            Or continue with
          </span>
        </div>

        <div className="space-y-3">
          <a-button
            variant="outline"
            onClick={loginWithGoogle}
            className="w-full glass-effect border-foreground/20 hover-lift ripple-effect text-card-foreground hover:bg-foreground/10 font-sans transition-all duration-300"
          >
            <IconBrandGoogle className="size-5 mr-2" />
            Google
          </a-button>

          <a-button
            variant="outline"
            onClick={loginWithApple}
            className="w-full glass-effect border-foreground/20 hover-lift ripple-effect text-card-foreground hover:bg-foreground/10 font-sans transition-all duration-300"
          >
            <IconBrandApple className="size-5 mr-2" />
            Apple
          </a-button>
        </div>
      </div>
    </a-card>
  )
}

export default LoginScreen
