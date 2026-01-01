// Build information utilities
// Extracts git commit, date, and other build metadata

function getCommitHash(): string {
  // On Vercel, use built-in environment variables
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  }
  
  // Fallback for local/other environments
  return process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || "LOCAL"
}

function getBuildDate(): string {
  // Use Vercel's commit date if available
  if (process.env.VERCEL_GIT_COMMIT_DATE) {
    const date = new Date(process.env.VERCEL_GIT_COMMIT_DATE)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short"
    }).toUpperCase()
  }
  
  // Fallback to current date
  const now = new Date()
  return now.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short"
  }).toUpperCase()
}

function getRevision(): string {
  // Use commit count or commit hash as revision
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    const hash = process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
    return `${hash}`
  }
  
  return process.env.NEXT_PUBLIC_GIT_REVISION || "REV"
}

function getDocumentNumber(prefix: string = "PF"): string {
  const year = new Date().getFullYear()
  const commit = getCommitHash()
  return `${prefix}-${year}-${commit}`
}

function getCommitYear(): string {
  // Use Vercel's commit date if available
  if (process.env.VERCEL_GIT_COMMIT_DATE) {
    const date = new Date(process.env.VERCEL_GIT_COMMIT_DATE)
    return date.getFullYear().toString()
  }
  
  // Fallback to current year
  return new Date().getFullYear().toString()
}

export const buildInfo = {
  commitHash: getCommitHash(),
  buildDate: getBuildDate(),
  revision: getRevision(),
  commitYear: getCommitYear(),
  getDocumentNumber,
}

// For use in client components
export function useBuildInfo() {
  return {
    commitHash: process.env.NEXT_PUBLIC_GIT_COMMIT_SHA?.slice(0, 7) || "LOCAL",
    buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short"
    }).toUpperCase(),
    revision: process.env.NEXT_PUBLIC_GIT_REVISION || "REV",
  }
}
