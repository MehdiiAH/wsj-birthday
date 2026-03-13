'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import {
  getIssues,
  findIssueForDate,
  parseDate,
  formatDate,
  getIssueAgeYears,
  type Issue,
  type FindResult,
} from '@/lib/wsj'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'

type Status = 'idle' | 'loading' | 'found' | 'out-of-range' | 'error'

// ─── Image Lightbox ──────────────────────────────────────────────────────────

function ImageLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-pointer animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-xs w-full" onClick={e => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="w-full rounded-xl shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-wsj-red rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-red-700 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── CoverImage ───────────────────────────────────────────────────────────────

function CoverImage({
  url, name, noImageLabel, onZoom,
}: {
  url: string; name: string; noImageLabel: string; onZoom?: () => void
}) {
  const [imgError, setImgError] = useState(false)

  if (!url || imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] gap-2">
        <span className="text-3xl opacity-30">🗞️</span>
        <span className="text-[10px] text-wsj-muted text-center px-2">{noImageLabel}</span>
      </div>
    )
  }

  return (
    <div className={`relative group ${onZoom ? 'cursor-zoom-in' : ''}`} onClick={onZoom}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      {onZoom && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center pointer-events-none">
          <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-90 transition-opacity drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── ResultCard ───────────────────────────────────────────────────────────────

function ResultCard({
  result, birthDate, locale, onShare, onTweet, copied,
}: {
  result: FindResult; birthDate: string; locale: string
  onShare: () => void; onTweet: () => void; copied: boolean
}) {
  const t = useTranslations()
  const { issue } = result
  const ageYears = getIssueAgeYears(issue.cover_date)
  const isBiweekly = parseDate(issue.cover_date) < parseDate('1969-10-01')
  const isFirstOfYear = issue.name.toLowerCase().includes('no. 1,')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="animate-fade-up">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-1.5 bg-wsj-red/10 border border-wsj-red/25 text-wsj-red rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-wsj-red animate-pulse inline-block" />
          {t('badges.yourIssue')}
        </div>
      </div>

      <div className="bg-wsj-surface border border-wsj-border rounded-2xl overflow-hidden">
        <div className="flex">
          <div className="relative flex-shrink-0 w-36 md:w-44 cover-shine corner-fold overflow-hidden">
            <div className="aspect-[3/4]">
              <CoverImage
                url={issue.image_url}
                name={issue.name}
                noImageLabel={t('result.noImage')}
                onZoom={issue.image_url ? () => setLightboxOpen(true) : undefined}
              />
            </div>
          </div>

          <div className="flex-1 p-5 min-w-0">
            <div className="text-[10px] text-wsj-muted uppercase tracking-widest mb-1.5">
              {t('result.publisher')}
            </div>
            <h2 className="font-display text-3xl md:text-4xl leading-none text-white mb-4">
              {issue.name}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-300">
                <span className="text-wsj-red mt-0.5 flex-shrink-0">◆</span>
                <span>{t('result.released', { date: formatDate(issue.cover_date, locale) })}</span>
              </div>
              {issue.is_double && (
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-wsj-red mt-0.5 flex-shrink-0">◆</span>
                  <span>{t('result.doubleIssue')}</span>
                </div>
              )}
              {isBiweekly && (
                <div className="flex items-start gap-2 text-gray-300">
                  <span className="text-wsj-red mt-0.5 flex-shrink-0">◆</span>
                  <span>{t('result.biweekly')}</span>
                </div>
              )}
              {isFirstOfYear && (
                <div className="flex items-start gap-2 text-yellow-400">
                  <span className="mt-0.5 flex-shrink-0">★</span>
                  <span>{t('result.firstOfYear')}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-wsj-border">
              <div className="text-[10px] text-wsj-muted uppercase tracking-wider mb-0.5">
                {t('result.ageLabel')}
              </div>
              <div className="font-display text-2xl text-wsj-red leading-none">
                {t('result.ageYears', { count: ageYears })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-wsj-border flex gap-2.5">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 bg-wsj-red hover:bg-red-700 active:scale-[0.98] transition-all duration-150 rounded-xl py-2.5 text-sm font-semibold"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {t('share.copied')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                {t('share.copy')}
              </>
            )}
          </button>
          <button
            onClick={onTweet}
            title="X / Twitter"
            className="flex items-center justify-center border border-wsj-border hover:border-[#333] bg-wsj-surface hover:bg-[#1a1a1a] active:scale-[0.98] transition-all duration-150 rounded-xl px-4 py-2.5 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.852L1.258 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
            </svg>
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox url={issue.image_url} name={issue.name} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function JumpBirthdayApp() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [issues, setIssues] = useState<Issue[]>([])
  const [dataReady, setDataReady] = useState(false)
  const [date, setDate] = useState('')
  const [result, setResult] = useState<FindResult | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const doSearch = useCallback(
    (dateStr: string, issueList: Issue[]) => {
      if (!dateStr || issueList.length === 0) return
      const birthDate = parseDate(dateStr)
      const minDate = parseDate(issueList[0].cover_date)
      const maxDate = parseDate(issueList[issueList.length - 1].cover_date)

      if (birthDate < minDate || birthDate > maxDate) {
        setStatus('out-of-range')
        setResult(null)
        return
      }

      setStatus('loading')
      setTimeout(() => {
        const found = findIssueForDate(issueList, birthDate)
        setResult(found)
        setStatus('found')
        router.replace(('/?d=' + dateStr) as never, { scroll: false })
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }, 300)
    },
    [router]
  )

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    getIssues()
      .then(data => {
        setIssues(data)
        setDataReady(true)
        const d = searchParams.get('d')
        if (d) {
          setDate(d)
          doSearch(d, data)
        }
      })
      .catch(() => setStatus('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(date, issues)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Copy this link:', window.location.href)
    }
  }

  const handleTweet = () => {
    if (!result) return
    const text = t('share.tweet', { date: formatDate(date, locale), issue: result.issue.name })
    window.open(
      'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(window.location.href),
      '_blank', 'noopener,noreferrer'
    )
  }

  const minDate = issues.length ? issues[0].cover_date : '1968-01-01'
  const maxDate = issues.length ? issues[issues.length - 1].cover_date : new Date().toISOString().split('T')[0]

  return (
    <div className="relative min-h-screen bg-wsj-black">
      <div className="manga-bg absolute inset-0 opacity-[0.03] pointer-events-none" />
      <div className="h-1 bg-wsj-red w-full" />

      <main className="relative z-10 max-w-lg mx-auto px-4 pt-10 pb-24">
        <div className="mb-10 animate-fade-in text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-wsj-red" />
            <span className="text-xs font-bold tracking-[0.3em] text-wsj-red uppercase select-none">
              {t('hero.japanese')}
            </span>
            <div className="h-px w-8 bg-wsj-red" />
          </div>
          <h1 className="font-display text-[clamp(4rem,15vw,7rem)] leading-[0.85] tracking-wide select-none">
            <span className="text-white">{t('hero.title1')}</span>
            <br />
            <span className="text-wsj-red">{t('hero.title2')}</span>
          </h1>
          <p className="mt-4 text-wsj-muted text-sm max-w-xs mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-wsj-surface border border-wsj-border rounded-2xl p-6 mb-8 animate-fade-in"
        >
          <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-wsj-muted mb-2">
            {t('search.label')}
          </label>
          <div className="relative mb-3 overflow-hidden rounded-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wsj-muted pointer-events-none">📅</span>
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value)
                if (result) { setResult(null); setStatus('idle') }
              }}
              min={minDate}
              max={maxDate}
              disabled={!dataReady}
              className="w-full bg-black border border-wsj-border hover:border-[#333] focus:border-wsj-red rounded-xl pl-11 pr-4 py-3.5 text-white text-base transition-colors duration-200 outline-none disabled:opacity-40 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!dataReady || !date || status === 'loading'}
            className="w-full bg-wsj-red hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-150 rounded-xl py-3 text-white font-semibold text-sm tracking-wide"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                {t('search.searching')}
              </span>
            ) : (
              t('search.button')
            )}
          </button>

          <p className="mt-3 text-[11px] text-wsj-muted">
            {t('search.period', { min: minDate.slice(0, 4), max: maxDate.slice(0, 4) })}
          </p>

          {!dataReady && status !== 'error' && (
            <div className="mt-3 flex items-center gap-2 text-wsj-muted text-xs">
              <div className="w-3 h-3 border border-wsj-muted border-t-transparent rounded-full animate-spin-slow" />
              {t('search.loading')}
            </div>
          )}
          {status === 'error' && <p className="mt-3 text-wsj-red text-sm">{t('search.error')}</p>}
          {status === 'out-of-range' && date && (
            <p className="mt-3 text-yellow-400 text-sm">
              {t('search.outOfRange', { min: minDate.slice(0, 4), max: maxDate.slice(0, 4) })}
            </p>
          )}
        </form>

        <div ref={resultRef}>
          {status === 'found' && result && (
            <ResultCard
              result={result}
              birthDate={date}
              locale={locale}
              onShare={handleShare}
              onTweet={handleTweet}
              copied={copied}
            />
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-wsj-border py-6 text-center text-[11px] text-wsj-muted">
        <div className="mb-4">
          <LocaleSwitcher />
        </div>
        <p>
          {t.rich('footer.credit', {
            link: chunks => (
              <a href="https://comicvine.gamespot.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                {chunks}
              </a>
            ),
          })}
        </p>
      </footer>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wsj-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wsj-border border-t-wsj-red rounded-full animate-spin-slow" />
      </div>
    }>
      <JumpBirthdayApp />
    </Suspense>
  )
}
