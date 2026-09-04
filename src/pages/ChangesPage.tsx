import { PageIntro } from '@/components/PageIntro'
import { catalog } from '@/data/catalog'
import { changeLog } from '@/data/change-log'
import { formatTerm } from '@/i18n/format'
import { formatDate, useLocale } from '@/i18n/locale'

export function ChangesPage() {
  const locale = useLocale()
  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Anlık görüntü günlüğü' : 'Snapshot ledger'} title={locale === 'tr' ? 'Değişiklikler' : 'Changes'} description={locale === 'tr' ? 'Yeni modeller, cihazlar, fiyatlar, lisanslar ve kaynak durumları yayın kimliğiyle izlenir.' : 'New models, devices, prices, licenses, and source states are tracked with the release identity.'} aside={<><strong>{formatDate(catalog.generatedAt, locale)}</strong><span>{catalog.snapshotId}</span></>} />
    <section className="source-health"><div><span className="status status--current"><span aria-hidden="true">●</span> {formatTerm('current', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'current').length}</strong></div><div><span className="status status--stale"><span aria-hidden="true">●</span> {formatTerm('stale', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'stale').length}</strong></div><div><span className="status status--quarantined"><span aria-hidden="true">●</span> {formatTerm('quarantined', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'quarantined').length}</strong></div><div><span className="status status--review"><span aria-hidden="true">●</span> {formatTerm('review', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'review').length}</strong></div></section>
    <ol className="change-ledger">{changeLog.map((change) => <li key={change.id}><time>{formatDate(change.date, locale)}</time><div><p className="eyebrow">{formatTerm(change.type, locale)} / {formatTerm(change.severity, locale)}</p><h2>{change.title[locale]}</h2><p>{change.summary[locale]}</p><small>{change.sourceIds.join(' · ')}</small></div></li>)}</ol>
  </>
}
