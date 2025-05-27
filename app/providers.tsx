"use client"

import type React from "react"

import { PrivyProvider } from "@privy-io/react-auth"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  )

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google", "github"],
        appearance: {
          theme: "light",
          accentColor: "#8B5CF6",
          logo: "/logo.png",
          landingHeader: "Welcome to Sensay Learn",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "off",
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
        legal: {
          termsAndConditionsUrl: "/terms",
          privacyPolicyUrl: "/privacy",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  )
}
