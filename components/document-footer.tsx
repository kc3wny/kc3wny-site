import Link from "next/link"
import { buildInfo } from "@/lib/build-info"

type DocumentNavigation = {
  prev?: {
    href: string
    title: string
  }
  next?: {
    href: string
    title: string
  }
}

type DocumentFooterProps = {
  readonly documentControl: string
  readonly lastUpdated: string
  readonly navigation?: DocumentNavigation
}

export function DocumentFooter({ documentControl, lastUpdated, navigation }: DocumentFooterProps) {
  return (
    <footer className="border-t-2 border-foreground pt-6 mt-12">
      {/* Optional document navigation */}
      {navigation && (navigation.prev || navigation.next) && (
        <div className="mb-6 pb-6 border-b border-muted">
          <div className="text-[10px] tracking-[0.2em] font-sans uppercase text-muted-foreground mb-4">
            Document Navigation
          </div>
          <div className="flex justify-between items-center">
            {navigation.prev ? (
              <Link
                href={navigation.prev.href}
                className="group flex items-center gap-2 text-sm font-sans hover:text-primary transition-colors"
                prefetch={true}
              >
                <span className="text-primary">←</span>
                <span className="uppercase tracking-wide">{navigation.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {navigation.next ? (
              <Link
                href={navigation.next.href}
                className="group flex items-center gap-2 text-sm font-sans hover:text-primary transition-colors"
                prefetch={true}
              >
                <span className="uppercase tracking-wide">{navigation.next.title}</span>
                <span className="text-primary">→</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      {/* Footer content */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 text-[8px] md:text-[10px] font-sans tracking-[0.1em] text-muted-foreground">
        <div>
          <div className="uppercase mb-1">Document No.</div>
          <div className="font-mono text-foreground break-all">{documentControl}</div>
        </div>
        <div className="text-center">
          <div className="uppercase mb-1">Last Updated</div>
          <div className="font-mono text-foreground">{lastUpdated}</div>
        </div>
        <div className="text-right">
          <div className="uppercase mb-1">Distribution</div>
          <div className="font-mono text-foreground">UNLIMITED</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-6 pt-4 border-t border-muted flex flex-col md:flex-row justify-between items-center gap-2 text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
        <span>© {buildInfo.commitYear} M. Matich — All Rights Reserved</span>
        <span>Printed on glass terminal</span>
        <span>Page 1 of 1</span>
      </div>
    </footer>
  )
}
