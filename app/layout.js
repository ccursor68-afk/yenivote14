import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import GoogleAdSense from '@/components/GoogleAdSense'

export const metadata = {
  title: {
    default: 'ServerListRank - Minecraft Sunucu Listesi',
    template: '%s | ServerListRank'
  },
  description: 'En iyi Minecraft sunucularını keşfet, oy ver ve kendi sunucunu ekle! Türkiye\'nin en büyük Minecraft sunucu listesi.',
  keywords: ['minecraft', 'sunucu', 'server', 'liste', 'türkiye', 'survival', 'skyblock', 'faction', 'pvp', 'minigames', 'hosting'],
  authors: [{ name: 'ServerListRank' }],
  creator: 'ServerListRank',
  publisher: 'ServerListRank',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://serverlistrank.com',
    siteName: 'ServerListRank',
    title: 'ServerListRank - Minecraft Sunucu Listesi',
    description: 'En iyi Minecraft sunucularını keşfet, oy ver ve kendi sunucunu ekle!',
    images: [
      {
        url: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
        width: 512,
        height: 512,
        alt: 'ServerListRank Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServerListRank - Minecraft Sunucu Listesi',
    description: 'En iyi Minecraft sunucularını keşfet, oy ver ve kendi sunucunu ekle!',
    images: ['https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png'],
  },
  icons: {
    icon: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
    shortcut: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
    apple: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
  },
  verification: {
    // google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://serverlistrank.com',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
