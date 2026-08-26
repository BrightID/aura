import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthState } from "react-firebase-hooks/auth"
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  type User,
} from "firebase/auth"
import { useNavigate } from "react-router"
import { auth } from "~/lib/firebase"
import { toast } from "sonner"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"

import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Trash2,
  Camera,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Copy,
  CheckCheck,
} from "lucide-react"

// ─── Zod schemas ────────────────────────────────────────────────────────────

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  photoURL: z.string().url("Must be a valid URL").or(z.literal("")),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

// ─── Helpers ────────────────────────────────────────────────────────────────

function getProviderLabel(providerId: string): string {
  switch (providerId) {
    case "google.com":
      return "Google"
    case "apple.com":
      return "Apple"
    case "password":
      return "Email / Password"
    default:
      return providerId
  }
}

function getAvatarFallback(user: User): string {
  if (user.displayName) return user.displayName[0].toUpperCase()
  if (user.email) return user.email[0].toUpperCase()
  return "U"
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ─── Section 1: Profile ─────────────────────────────────────────────────────

function ProfileSection({ user }: { user: User }) {
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [pendingPhotoURL, setPendingPhotoURL] = useState(user.photoURL ?? "")
  const [sendingVerification, setSendingVerification] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      photoURL: user.photoURL ?? "",
    },
  })

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile(user, {
        displayName: values.displayName,
        photoURL: values.photoURL || null,
      })
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    }
  }

  const handleApplyPhoto = () => {
    form.setValue("photoURL", pendingPhotoURL, { shouldDirty: true })
    setPhotoDialogOpen(false)
  }

  const handleResendVerification = async () => {
    setSendingVerification(true)
    try {
      await sendEmailVerification(user)
      toast.success("Verification email sent. Check your inbox.")
    } catch {
      toast.error("Failed to send verification email")
    } finally {
      setSendingVerification(false)
    }
  }

  const currentPhotoURL = form.watch("photoURL")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your display name and profile photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={currentPhotoURL || user.photoURL || undefined}
                    alt={user.displayName ?? "Avatar"}
                  />
                  <AvatarFallback className="text-2xl font-semibold">
                    {getAvatarFallback(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setPendingPhotoURL(form.getValues("photoURL"))
                      setPhotoDialogOpen(true)
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Change photo
                  </Button>
                  {currentPhotoURL && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground text-xs"
                      onClick={() => form.setValue("photoURL", "", { shouldDirty: true })}
                    >
                      Remove photo
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                {/* Display name */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email — read-only */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={user.email ?? ""}
                      readOnly
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    {user.emailVerified ? (
                      <Badge
                        variant="secondary"
                        className="shrink-0 gap-1 text-green-600 border-green-200 bg-green-50"
                      >
                        <Check className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 gap-1 text-amber-600 border-amber-200 bg-amber-50"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  {!user.emailVerified && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground"
                      disabled={sendingVerification}
                      onClick={handleResendVerification}
                    >
                      {sendingVerification
                        ? "Sending…"
                        : "Resend verification email"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {form.formState.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Photo URL dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
            <DialogDescription>
              Enter a public image URL for your profile photo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {pendingPhotoURL && (
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={pendingPhotoURL} alt="Preview" />
                  <AvatarFallback>{getAvatarFallback(user)}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="photo-url">Photo URL</Label>
              <Input
                id="photo-url"
                placeholder="https://example.com/photo.jpg"
                value={pendingPhotoURL}
                onChange={(e) => setPendingPhotoURL(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyPhoto}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Section 2: Security / Password ─────────────────────────────────────────

function SecuritySection({ user }: { user: User }) {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)

  const primaryProvider = user.providerData[0]?.providerId ?? "password"
  const isPasswordProvider = primaryProvider === "password"

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: PasswordValues) => {
    if (!user.email) {
      toast.error("No email associated with this account")
      return
    }
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      )
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, values.newPassword)
      toast.success("Password updated successfully")
      form.reset()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        form.setError("currentPassword", {
          message: "Incorrect password",
        })
      } else {
        toast.error("Failed to update password")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Security
        </CardTitle>
        <CardDescription>Manage your password and sign-in method.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isPasswordProvider ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              You signed in with{" "}
              <span className="font-medium text-foreground">
                {getProviderLabel(primaryProvider)}
              </span>
              . Your password is managed externally.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setShowCurrentPassword((v) => !v)
                          }
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setShowConfirmPassword((v) => !v)
                          }
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {form.formState.isSubmitting
                    ? "Updating…"
                    : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Section 3: Account Details ──────────────────────────────────────────────

function AccountDetailsSection({ user }: { user: User }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(user.uid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Details
        </CardTitle>
        <CardDescription>
          Read-only metadata about your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Account Created
            </Label>
            <p className="text-sm font-medium">
              {formatDate(user.metadata.creationTime)}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Last Sign-In
            </Label>
            <p className="text-sm font-medium">
              {formatDate(user.metadata.lastSignInTime)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Sign-In Method
          </Label>
          <div className="flex flex-wrap gap-2">
            {user.providerData.map((provider) => (
              <Badge key={provider.providerId} variant="secondary">
                {getProviderLabel(provider.providerId)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            User ID
          </Label>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={user.uid}
              className="font-mono text-xs bg-muted text-muted-foreground cursor-text"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Section 4: Danger Zone ──────────────────────────────────────────────────

function DangerZoneSection({ user }: { user: User }) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Reauthentication dialog state (needed if session is too old)
  const [reAuthDialogOpen, setReAuthDialogOpen] = useState(false)
  const [reAuthPassword, setReAuthPassword] = useState("")
  const [reAuthError, setReAuthError] = useState("")
  const [showReAuthPassword, setShowReAuthPassword] = useState(false)

  const primaryProvider = user.providerData[0]?.providerId ?? "password"
  const requiresPassword = primaryProvider === "password"

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await user.delete()
      toast.success("Account deleted")
      navigate("/")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/requires-recent-login") {
        setDeleteDialogOpen(false)
        setReAuthDialogOpen(true)
      } else {
        toast.error("Failed to delete account")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReAuth = async () => {
    if (!user.email) return
    setReAuthError("")
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        reAuthPassword
      )
      await reauthenticateWithCredential(user, credential)
      setReAuthDialogOpen(false)
      // Re-open delete confirm dialog
      setConfirmText("")
      setDeleteDialogOpen(true)
    } catch {
      setReAuthError("Incorrect password. Please try again.")
    }
  }

  return (
    <>
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                setConfirmText("")
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will{" "}
                  <strong>permanently delete your account</strong> and all
                  associated projects. This action{" "}
                  <strong>cannot be undone</strong>.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete" className="text-foreground">
                    Type{" "}
                    <span className="font-mono font-bold">DELETE</span> to
                    confirm
                  </Label>
                  <Input
                    id="confirm-delete"
                    placeholder="DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={confirmText !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? "Deleting…" : "Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reauthentication dialog */}
      {requiresPassword && (
        <Dialog open={reAuthDialogOpen} onOpenChange={setReAuthDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Your Identity</DialogTitle>
              <DialogDescription>
                For security, please re-enter your password before deleting
                your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="reauth-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reauth-password"
                    type={showReAuthPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10"
                    value={reAuthPassword}
                    onChange={(e) => {
                      setReAuthPassword(e.target.value)
                      setReAuthError("")
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowReAuthPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showReAuthPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {reAuthError && (
                  <p className="text-sm text-destructive">{reAuthError}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReAuthDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!reAuthPassword}
                onClick={handleReAuth}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const [user] = useAuthState(auth)

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
        Loading account…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and security settings
        </p>
      </div>

      <div className="px-4 lg:px-6 flex flex-col gap-6 max-w-2xl">
        <ProfileSection user={user} />

        <Separator />

        <SecuritySection user={user} />

        <Separator />

        <AccountDetailsSection user={user} />

        <Separator />

        <DangerZoneSection user={user} />
      </div>
    </div>
  )
}
