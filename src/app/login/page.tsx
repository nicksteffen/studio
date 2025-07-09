import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from './actions'
import GoogleSignInButton from '@/components/GoogleSignInButton'

export default async function LoginPage({
  searchparams,
}: {
  searchparams: { message: string }
}) {
  const searchParams = await searchparams;
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue your list.</CardDescription>
        </CardHeader>
        {/* <OneTapComponent/> */}
        <GoogleSignInButton/>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {searchParams?.message && (
              <p className="text-destructive text-sm p-2 bg-destructive/10 rounded-md text-center">
                {searchParams.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?
            <Button variant="link" asChild className="pl-1">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
