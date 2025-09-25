import { CheckCircle2 } from "lucide-react"

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
      <CheckCircle2 className="h-16 w-16 text-primary" />

      <h1 className="text-2xl font-bold text-foreground">
        Email Verified!
      </h1>

      <p className="text-sm text-muted-foreground">
        Your email has been confirmed. You can now close this window, go back to HelpOrbit, and refresh the page.
      </p>

      <p className="text-xs text-muted-foreground">
        If you still face issues, please contact support.
      </p>
    </div>
  )
}
