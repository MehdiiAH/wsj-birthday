// Root page — the middleware redirects / → /fr/ (or user's locale)
// This file is kept as a fallback but should never be rendered.
import { redirect } from 'next/navigation'
export default function RootPage() {
  redirect('/fr')
}
