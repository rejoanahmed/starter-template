import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@web/components/ui/sonner";
import i18n from "@web/lib/i18n";
import { getUserSession } from "@web/services/auth";
import Header from "../components/Header";
import appCss from "../styles.css?url";

// Create QueryClient with disabled automatic refetching to prevent infinite queries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      queryKey: ["session"],
      queryFn: () => getUserSession(),
    });
    return { session };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Spotfinder - Find Your Perfect Space",
      },
      {
        name: "description",
        content:
          "Discover unique hourly rental spaces for any occasion. Party rooms, studios, and more at affordable rates.",
      },
      {
        name: "keywords",
        content:
          "hourly rental, party room, event space, short-term rental, venue booking, meeting room",
      },
      {
        property: "og:title",
        content: "Spotfinder - Find Your Perfect Space",
      },
      {
        property: "og:description",
        content:
          "Discover unique hourly rental spaces for any occasion. Party rooms, studios, and more at affordable rates.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://spotfinder.com",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Spotfinder - Find Your Perfect Space",
      },
      {
        name: "twitter:description",
        content:
          "Discover unique hourly rental spaces for any occasion. Party rooms, studios, and more at affordable rates.",
      },
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.language}>
      {/** biome-ignore lint/style/noHeadElement: re */}
      <head>
        <HeadContent />
      </head>
      <body className="pb-16 lg:pb-0">
        <QueryClientProvider client={queryClient}>
          <Header />
          {children}
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Spotfinder",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Toaster />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
