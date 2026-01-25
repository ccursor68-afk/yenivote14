import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import GoogleAdSense from '@/components/GoogleAdSense'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://serverlistrank.com'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ServerListRank - Türkiye\'nin En İyi Minecraft Sunucu Listesi',
    template: '%s | ServerListRank'
  },
  description: 'En iyi Minecraft sunucularını keşfet, oy ver ve kendi sunucunu ekle! Türkiye\'nin en büyük ve en güncel Minecraft sunucu listesi. Survival, Skyblock, Faction, PvP ve daha fazlası.',
  keywords: [
    'minecraft', 'minecraft sunucu', 'minecraft server', 'minecraft sunucu listesi', 
    'türkiye minecraft', 'minecraft türk sunucuları', 'survival', 'skyblock', 
    'faction', 'pvp', 'minigames', 'minecraft hosting', 'mc sunucu',
    'bedrock sunucu', 'java sunucu', 'crossplay minecraft'
  ],
  authors: [{ name: 'ServerListRank', url: BASE_URL }],
  creator: 'ServerListRank',
  publisher: 'ServerListRank',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'ServerListRank',
    title: 'ServerListRank - Türkiye\'nin En İyi Minecraft Sunucu Listesi',
    description: 'En iyi Minecraft sunucularını keşfet, oy ver ve kendi sunucunu ekle! Türkiye\'nin en büyük Minecraft sunucu listesi.',
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
    creator: '@serverlistrank',
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
    canonical: BASE_URL,
    languages: {
      'tr-TR': BASE_URL,
    },
  },
  category: 'gaming',
}

// JSON-LD Structured Data for Organization and Website
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'ServerListRank',
      description: 'Türkiye\'nin en büyük Minecraft sunucu listesi',
      publisher: {
        '@id': `${BASE_URL}/#organization`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      inLanguage: 'tr-TR'
    },
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ServerListRank',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        '@id': `${BASE_URL}/#logo`,
        url: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
        contentUrl: 'https://customer-assets.emergentagent.com/job_5d2bb20d-ffe5-4fb3-8c06-f22ef6426f62/artifacts/2drde4ew_Gemini_Generated_Image_jnmakrjnmakrjnma-removebg-preview.png',
        width: 512,
        height: 512
      },
      sameAs: []
    },
    {
      '@type': 'ItemList',
      '@id': `${BASE_URL}/#serverlist`,
      name: 'Minecraft Sunucu Listesi',
      description: 'En popüler Minecraft sunucuları',
      itemListElement: []
    }
  ]
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        {/* Google Analytics - tracks page views */}
        <GoogleAnalytics />
        {/* Google AdSense - Auto Ads */}
        <GoogleAdSense />
        
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
