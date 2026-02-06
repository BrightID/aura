import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "~/components/ui/input"
import { loginWithApple, loginWithGoogle } from "~/lib/auth-actions"
import { auth } from "~/lib/firebase"
import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { toast } from "sonner"
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof formSchema>

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
    <Card className="max-w-md hover-lift shadow-2xl relative z-10 opacity-100 w-[126%] mx-[0] border-transparent">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold font-sans text-card-foreground">
          Welcome
        </CardTitle>
        <CardDescription className="text-card-foreground/70 font-sans">
          Sign in or create an account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  {...loginForm.register("email")}
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-white/40 bg-white/10 placeholder:text-card-foreground/50 text-card-foreground py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  {...loginForm.register("password")}
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="border-white/40 bg-white/10 placeholder:text-card-foreground/50 text-card-foreground py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full ripple-effect hover-lift font-sans font-bold py-5 transition-all duration-300"
              >
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  {...signupForm.register("email")}
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-white/40 bg-white/10 placeholder:text-card-foreground/50 text-card-foreground py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-red-500 text-xs">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  {...signupForm.register("password")}
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  className="border-white/40 bg-white/10 placeholder:text-card-foreground/50 text-card-foreground py-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-200"
                />
                {signupForm.formState.errors.password && (
                  <p className="text-red-500 text-xs">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                disabled={isPending}
                type="submit"
                className="w-full ripple-effect hover-lift font-sans font-bold py-5 transition-all duration-300"
              >
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Separator />
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 text-card-foreground/60 font-sans">
            Or continue with
          </span>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={loginWithGoogle}
            className="w-full glass-effect border-white/30 hover-lift ripple-effect text-card-foreground hover:bg-white/20 font-sans transition-all duration-300"
          >
            <IconBrandGoogle className="size-5 mr-2" />
            Google
          </Button>

          <Button
            variant="outline"
            onClick={loginWithApple}
            className="w-full glass-effect border-white/30 hover-lift ripple-effect text-card-foreground hover:bg-white/20 font-sans transition-all duration-300"
          >
            <IconBrandApple className="size-5 mr-2" />
            Apple
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginScreen
