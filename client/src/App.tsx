import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useUser,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { registerTokenGetter } from "@/api/client";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Categories from "@/pages/Categories";
import Budgets from "@/pages/Budgets";
import Alerts from "@/pages/Alerts";
import NotFound from "@/pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#2a3a85",
    colorBackground: "#ffffff",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorDanger: "#dc2626",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.6rem",
  },
  elements: {
    card: "shadow-none border border-border",
    socialButtonsBlockButton: "border border-border",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}

function AuthTokenBridge() {
  const { getToken, isSignedIn } = useAuth();
  useEffect(() => {
    registerTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken, isSignedIn]);
  return null;
}

function SessionCacheReset() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    return addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== id) {
        qc.clear();
      }
      prevUserIdRef.current = id;
    });
  }, [addListener, qc]);
  return null;
}

function Protected() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isSignedIn) return <Landing />;
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/categories" component={Categories} />
        <Route path="/budgets" component={Budgets} />
        <Route path="/alerts" component={Alerts} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      appearance={clerkAppearance}
      routerPush={(to) => setLocation(to)}
      routerReplace={(to) => setLocation(to, { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <AuthTokenBridge />
        <SessionCacheReset />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/:rest*" component={SignInPage} />
            <Route path="/sign-up/:rest*" component={SignUpPage} />
            <Route component={Protected} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter>
      <AppRoutes />
    </WouterRouter>
  );
}
