import type { NextConfig } from 'next'
import { withSerwist } from '@serwist/turbopack'

const isDev = process.env.NODE_ENV === 'development'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : ''

// Next.js hydration needs inline scripts; external scripts are still limited to this site.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ''}`,
  "font-src 'self'",
  [
    "connect-src 'self'",
    supabaseHost && `https://${supabaseHost} wss://${supabaseHost}`,
    // Azure Speech (recognition and synthesis) and OpenStreetMap reverse geocoding
    'https://*.speech.microsoft.com wss://*.speech.microsoft.com',
    'https://nominatim.openstreetmap.org',
  ]
    .filter(Boolean)
    .join(' '),
  "media-src 'self' blob:",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The voice assistant needs the microphone, and nearby jobs need location; nothing else.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: supabaseHost
      ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // Old Indonesian URLs (with or without the old /protected prefix) keep working.
  async redirects() {
    const renamed: [string, string][] = [
      ['beranda', 'home'],
      ['pekerjaan', 'jobs'],
      ['kelas', 'courses'],
      ['profil', 'profile'],
      ['edit-profil', 'edit-profile'],
      ['tentang-kami', 'about'],
      ['daftar', 'signup'],
    ]
    return [
      ...renamed.flatMap(([from, to]) => [
        { source: `/protected/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
        { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
      ]),
      { source: '/protected/:path*', destination: '/:path*', permanent: true },
    ]
  },
}

export default withSerwist(nextConfig)
