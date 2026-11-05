import { loginWithApple, loginWithGoogle } from '~/lib/auth-actions';
import { auth } from '~/lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from '@aura/ui/toast';
import { IconBrandApple, IconBrandGoogle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { AuraInput } from '~/components/aura-form-controls';
import { AuraTabs } from '~/components/aura-tabs';

const formSchema = z.object({
  email: z.email({ message: 'Enter a valid email' }),
  password: z.string().min(6, 'Use at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

/** A text input bound to a react-hook-form field. */
function AuraTextInput({
  control,
  name,
  ...props
}: {
  control: Control<FormData>;
  name: keyof FormData;
  id?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  className?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <AuraInput
          value={field.value ?? ''}
          onValueChange={field.onChange}
          {...props}
        />
      )}
    />
  );
}

function LoginScreen() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const loginForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });
  const signupForm = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      signInWithEmailAndPassword(auth, data.email, data.password),
    mutationKey: ['login-with-password'],
  });
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const onLogin = async (data: FormData) => {
    try {
      await mutateAsync(data);
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const onSignup = async (data: FormData) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      navigate('/onboarding');
    } catch (e) {
      toast((e as Error).message);
    }
  };

  return (
    <div
      className="a-card relative z-10 w-full max-w-[26rem] p-8 shadow-2xl"
      data-variant="default"
    >
      <div className="space-y-1.5 pb-6 text-center">
        <h3 className="a-head text-3xl font-bold tracking-tight" data-level="3">
          Welcome
        </h3>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account
        </p>
      </div>

      <div className="w-full">
        <AuraTabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            { value: 'login', label: 'Sign In' },
            { value: 'signup', label: 'Sign Up' },
          ]}
        />

        <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'login'}>
          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="a-label" htmlFor="login-email">
                Email
              </label>
              <AuraTextInput
                control={loginForm.control}
                name="email"
                id="login-email"
                type="email"
                placeholder="you@example.com"
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="a-label" htmlFor="login-password">
                Password
              </label>
              <AuraTextInput
                control={loginForm.control}
                name="password"
                id="login-password"
                type="password"
                placeholder="••••••••"
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              className="a-button w-full font-semibold"
              disabled={isPending}
              type="submit"
              data-size="lg"
            >
              Sign In
            </button>
          </form>
        </div>

        <div role="tabpanel" className="a-tab-panel" hidden={tab !== 'signup'}>
          <form
            onSubmit={signupForm.handleSubmit(onSignup)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="a-label" htmlFor="signup-email">
                Email
              </label>
              <AuraTextInput
                control={signupForm.control}
                name="email"
                id="signup-email"
                type="email"
                placeholder="you@example.com"
              />
              {signupForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="a-label" htmlFor="signup-password">
                Password
              </label>
              <AuraTextInput
                control={signupForm.control}
                name="password"
                id="signup-password"
                type="password"
                placeholder="••••••••"
              />
              {signupForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              className="a-button w-full font-semibold"
              disabled={isPending}
              type="submit"
              data-size="lg"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      <div className="my-6 flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span className="shrink-0">Or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2.5">
        <button
          className="a-button w-full"
          type="button"
          data-variant="glass"
          onClick={() =>
            loginWithGoogle().catch((e) => toast((e as Error).message))
          }
        >
          <IconBrandGoogle className="size-5" />
          Google
        </button>

        <button
          className="a-button w-full"
          type="button"
          data-variant="glass"
          onClick={() =>
            loginWithApple().catch((e) => toast((e as Error).message))
          }
        >
          <IconBrandApple className="size-5" />
          Apple
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
