import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/press/SiteHeader";
import { Colophon } from "@/components/press/Colophon";
import { CommandPalette } from "@/components/CommandPalette";
import { PageViews } from "@/components/PageViews";
import { getContent } from "@/lib/content";

/** Masthead and headlines. High contrast, one weight — like a real display cut. */
const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

/** Running text. Variable, with an italic that earns its keep. */
const body = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Labels, figures, anything that has to line up in a column. */
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE = "https://bhargav.adepu.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Bhargav Adepu — Systems & ML Engineer",
    template: "%s — Bhargav Adepu",
  },
  description:
    "Systems and machine learning engineer. Google Summer of Code 2025 contributor at VideoLAN, working inside VLC's C++ and Qt/QML codebase. A catalogue of twenty shipped projects and the numbers they produced.",
  authors: [{ name: "Adepu Vaatsava Sri Bhargav", url: SITE }],
  creator: "Adepu Vaatsava Sri Bhargav",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE,
    siteName: "Bhargav Adepu",
    title: "Bhargav Adepu — Systems & ML Engineer",
    description:
      "GSoC 2025 at VideoLAN. Twenty projects, the numbers they produced, and what was harder than it looks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhargav Adepu — Systems & ML Engineer",
    description: "GSoC 2025 at VideoLAN. A catalogue of twenty shipped projects.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2e9" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0c" },
  ],
};

/** Applied before paint so an explicit theme choice never flashes. */
const noFlash = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { profile, projects } = await getContent();

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader profile={profile} />
        <main className="relative z-10 flex-1">{children}</main>
        <Colophon profile={profile} />
        <CommandPalette
          projects={projects.map((p) => ({ slug: p.slug, title: p.title, no: p.no }))}
          profile={{ github: profile.github, linkedin: profile.linkedin, email: profile.email }}
        />
        <PageViews />
      </body>
    </html>
  );
}
