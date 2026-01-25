import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { Input } from "@starter/ui/components/input";
import { Label } from "@starter/ui/components/label";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { authClient } from "@web/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "/",
    };
  },
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const { redirect } = useSearch({ from: "/login" });
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (isAuthenticated) {
      router.navigate({ to: redirect || "/" });
    }
  }, [isAuthenticated, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!password) {
      toast.error("Password is required.");
      return;
    }
    if (mode === "sign-up" && !name.trim()) {
      toast.error("Name is required to create an account.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      setIsLoading(true);
      const callbackURL = redirect || "/";
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({
          name: name.trim(),
          email: trimmedEmail,
          password,
          callbackURL,
        });
        if (error) throw new Error(error.message);
        toast.success("Account created. Redirecting…");
      } else {
        const { error } = await authClient.signIn.email({
          email: trimmedEmail,
          password,
          callbackURL,
        });
        if (error) throw new Error(error.message);
        toast.success("Signed in. Redirecting…");
      }
      router.invalidate();
      router.navigate({ to: callbackURL, reloadDocument: true });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      console.error("[Login] Error:", err);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === "sign-in" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? "Sign in with your email and password"
              : "Enter your details to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "sign-up" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  autoComplete="name"
                  disabled={isLoading}
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  type="text"
                  value={name}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                disabled={isLoading}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                disabled={isLoading}
                id="password"
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
              {mode === "sign-up" && (
                <p className="text-muted-foreground text-xs">
                  At least 8 characters
                </p>
              )}
            </div>
            <Button
              className="w-full"
              disabled={isLoading}
              size="lg"
              type="submit"
            >
              {isLoading
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>
          <p className="text-muted-foreground text-center text-sm">
            {mode === "sign-in"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              className="text-foreground underline underline-offset-2 hover:no-underline"
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                setPassword("");
              }}
              type="button"
            >
              {mode === "sign-in" ? "Create account" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
