import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import { authClient } from "@web/lib/auth-client";
import { Chrome } from "lucide-react";
import { useEffect, useState } from "react";

const extractRedirectURL = (redirectUri?: string, pathOnly = false) => {
  if (!redirectUri || redirectUri.length === 0) {
    return pathOnly
      ? "/"
      : `${import.meta.env.VITE_APP_URL || window.location.origin}/`;
  }

  try {
    // Try to parse as a full URL
    const url = new URL(redirectUri);
    // Valid URL with protocol and hostname
    if (url.protocol && url.hostname) {
      return pathOnly ? url.pathname : redirectUri;
    }
  } catch {
    // Not a valid full URL, check if it's a relative path
    if (redirectUri.startsWith("/")) {
      if (pathOnly) {
        return redirectUri;
      }
      // Use URL constructor to properly join base and path (handles trailing slashes)
      const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;
      return new URL(redirectUri, baseURL).href;
    }
    // If it doesn't start with /, it's invalid, use default
  }

  return pathOnly
    ? "/"
    : `${import.meta.env.VITE_APP_URL || window.location.origin}/`;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirectUri: (search.redirectUri as string) || undefined,
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { redirectUri } = useSearch({ from: "/login" });
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      if (redirectUri) {
        navigate({ to: extractRedirectURL(redirectUri, true) });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [session, redirectUri, navigate]);

  const callbackURL = extractRedirectURL(redirectUri);
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-red-600 mb-3">Spotfinder</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-[22px] font-semibold text-gray-900 mb-6 leading-tight">
            Welcome to Spotfinder
          </h2>

          {/* Google Sign In Button */}
          <Button
            className="w-full h-[48px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-[16px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            variant="outline"
          >
            <Chrome className="mr-3 size-5" />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Info Text */}
          <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
            By continuing, you agree to Spotfinder's{" "}
            <Link className="underline hover:text-gray-900" to="/terms">
              Terms of Service
            </Link>
            ,{" "}
            <Link
              className="underline hover:text-gray-900"
              to="/payments-terms"
            >
              Payments Terms of Service
            </Link>
            , and{" "}
            <Link
              className="underline hover:text-gray-900"
              to="/nondiscrimination"
            >
              Nondiscrimination Policy
            </Link>
            . You also acknowledge our{" "}
            <Link className="underline hover:text-gray-900" to="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Footer Help */}
        <div className="mt-6 text-center">
          <a
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            href="mailto:support@spotfinder.com"
          >
            Need help?
          </a>
        </div>
      </div>
    </div>
  );
}
