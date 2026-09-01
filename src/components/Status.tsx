import type { CompatibilityEdge, EvidenceClaim } from '@/data/schema'
import { useLocale } from '@/i18n/locale'

const statusCopy = {
  verified: { tr: 'Doğrulandı', en: 'Verified' },
  fits: { tr: 'Sığıyor', en: 'Fits' },
  constrained: { tr: 'Kısıtlı', en: 'Constrained' },
  unsupported: { tr: 'Desteklenmiyor', en: 'Unsupported' },
  unknown: { tr: 'Bilinmiyor', en: 'Unknown' },
} as const

export function CompatibilityStatus({ status }: { status: CompatibilityEdge['status'] }) {
  const locale = useLocale()
  return <span className={`status status--${status}`}><span aria-hidden="true">●</span> {statusCopy[status][locale]}</span>
}

export function EvidenceStatus({ claim }: { claim?: EvidenceClaim }) {
  const locale = useLocale()
  if (!claim) return <span className="status status--unknown"><span aria-hidden="true">●</span> {locale === 'tr' ? 'Kanıt yok' : 'No evidence'}</span>
  return <span className={`status status--${claim.status}`}><span aria-hidden="true">●</span> {locale === 'tr' ? `${claim.confidence} güven` : `${claim.confidence} confidence`}</span>
}
