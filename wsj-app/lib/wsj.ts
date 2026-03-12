export interface Issue {
  issue_number: string
  name: string
  cover_date: string // "YYYY-MM-DD"
  image_url: string
  is_double: boolean
}

export interface FindResult {
  issue: Issue
  covered: boolean
}

let _cache: Issue[] | null = null

export async function getIssues(): Promise<Issue[]> {
  if (_cache) return _cache
  const res = await fetch('/data/issues.json')
  if (!res.ok) throw new Error('Failed to load issues data')
  _cache = (await res.json()) as Issue[]
  return _cache
}

export function findIssueForDate(issues: Issue[], birthDate: Date): FindResult {
  const dateStr = toDateStr(birthDate)

  let lo = 0,
    hi = issues.length - 1,
    found = 0
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (issues[mid].cover_date <= dateStr) {
      found = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  const issue = issues[found]
  const issueDate = parseDate(issue.cover_date)
  const isBiweekly = issueDate < parseDate('1969-10-01')
  const baseInterval = isBiweekly ? 14 : 7
  const coverDays = issue.is_double ? baseInterval * 2 : baseInterval
  const until = new Date(issueDate)
  until.setDate(until.getDate() + coverDays - 1)

  return { issue, covered: birthDate <= until }
}

export function parseDate(str: string): Date {
  return new Date(str + 'T00:00:00')
}

export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** Format a date string using the given locale */
export function formatDate(dateStr: string, locale: string): string {
  return parseDate(dateStr).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Returns the number of full years since the issue was published */
export function getIssueAgeYears(dateStr: string): number {
  const ms = Date.now() - parseDate(dateStr).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25))
}
