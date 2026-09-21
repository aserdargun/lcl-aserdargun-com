import { PageIntro } from '@/components/PageIntro'
import { catalog, acceptedChanges as changeLog } from '@/data/catalog'
import { formatTerm } from '@/i18n/format'
import { formatDate, useLocale } from '@/i18n/locale'

export function ChangesPage() {
  const locale = useLocale()
  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Anlık görüntü günlüğü' : 'Snapshot ledger'} title={locale === 'tr' ? 'Değişiklikler' : 'Changes'} description={locale === 'tr' ? 'Yeni modeller, cihazlar, fiyatlar, lisanslar ve kaynak durumları yayın kimliğiyle izlenir.' : 'New models, devices, prices, licenses, and source states are tracked with the release identity.'} aside={<><strong>{formatDate(catalog.generatedAt, locale)}</strong><span>{catalog.snapshotId}</span></>} />
    <section className="source-health"><div><span className="status status--current"><span aria-hidden="true">●</span> {formatTerm('current', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'current').length}</strong></div><div><span className="status status--stale"><span aria-hidden="true">●</span> {formatTerm('stale', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'stale').length}</strong></div><div><span className="status status--quarantined"><span aria-hidden="true">●</span> {formatTerm('quarantined', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'quarantined').length}</strong></div><div><span className="status status--review"><span aria-hidden="true">●</span> {formatTerm('review', locale)}</span><strong>{catalog.sources.filter((source) => source.status === 'review').length}</strong></div></section>
    <p className="policy-note">{locale === 'tr' ? 'Durumlar kabul edilmiş anlık görüntüye aittir; bugün yapılmış kaynak kontrolü anlamına gelmez. Yenileme elle başlatılır. Aşağıdaki tarihler, derleme tarihinden ayrı olan kaynak kontrol tarihleridir.' : 'Statuses belong to the accepted snapshot; they do not indicate a source check today. Refresh is manual. The dates below are source-check dates, separate from the build date.'}</p>
    <section aria-labelledby="source-dates-title">
      <h2 id="source-dates-title">{locale === 'tr' ? 'Kaynaklar ve kontrol tarihleri' : 'Sources and check dates'}</h2>
      <div className="table-scroll"><table>
        <thead><tr><th>{locale === 'tr' ? 'Kaynak' : 'Source'}</th><th>{locale === 'tr' ? 'Son kaynak kontrolü' : 'Last source check'}</th><th>{locale === 'tr' ? 'Kayıtlı durum' : 'Recorded status'}</th></tr></thead>
        <tbody>{catalog.sources.map((source) => <tr key={source.id}><td><a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a></td><td><time dateTime={source.checkedAt}>{formatDate(source.checkedAt, locale)}</time></td><td>{formatTerm(source.status, locale)}</td></tr>)}</tbody>
      </table></div>
    </section>
    <ol className="change-ledger">{changeLog.map((change) => <li key={change.id}><time>{formatDate(change.date, locale)}</time><div><p className="eyebrow">{formatTerm(change.type, locale)} / {formatTerm(change.severity, locale)}</p><h2>{change.title[locale]}</h2><p>{change.summary[locale]}</p><small>{change.sourceIds.join(' · ')}</small></div></li>)}</ol>
  </>
}
