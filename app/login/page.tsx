'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </a>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms-of-service" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

