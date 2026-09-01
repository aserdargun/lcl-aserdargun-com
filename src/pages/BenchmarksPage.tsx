import { PageIntro } from '@/components/PageIntro'
import { catalog } from '@/data/catalog'
import { metricForWorkload } from '@/domain/recommendation'
import { useLocale } from '@/i18n/locale'

export function BenchmarksPage() {
  const locale = useLocale()
  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Kanıtlı ölçümler' : 'Evidence-backed runs'} title={locale === 'tr' ? 'Benchmark tarayıcısı' : 'Benchmark browser'} description={locale === 'tr' ? 'Sadece aynı model revizyonu, quant, runtime, context, güç modu ve protokol içindeki koşular karşılaştırılabilir.' : 'Runs are comparable only within the same model revision, quant, runtime, context, power mode, and protocol.'} aside={<><strong>{catalog.benchmarks.length}</strong><span>{locale === 'tr' ? 'yayınlanmış koşu' : 'published runs'}</span></>} />
    <div className="benchmark-warning"><strong>{locale === 'tr' ? 'Karşılaştırılabilir kohort henüz yok.' : 'No comparable cohort yet.'}</strong><p>{locale === 'tr' ? 'Mevcut üretici ölçümlerinde context, prompt veya güç modu eksik. Bu nedenle fiyat/performans endeksi hesaplanmadı.' : 'Current vendor runs omit context, prompt, or power mode. LCL therefore does not calculate a price/performance index.'}</p></div>
    <div className="benchmark-ledger">{catalog.benchmarks.map((run) => { const model = catalog.models.find((item) => item.id === run.modelId)!; const device = catalog.devices.find((item) => item.id === run.deviceId)!; const source = catalog.evidence.find((item) => run.evidenceIds.includes(item.id)); return <article key={run.id}><header><div><p className="eyebrow">{run.modality} / {run.metric}</p><h2>{model.name}</h2><p>{device.name} · {run.runtime}</p></div><strong>{run.value}<small>{run.metric === 'tokens-per-second' ? ' tok/s' : ''}</small></strong></header><dl><div><dt>Context</dt><dd>{run.contextTokens ?? (locale === 'tr' ? 'Yayınlanmadı' : 'Not published')}</dd></div><div><dt>{locale === 'tr' ? 'Güç modu' : 'Power mode'}</dt><dd>{run.powerMode ?? (locale === 'tr' ? 'Yayınlanmadı' : 'Not published')}</dd></div><div><dt>{locale === 'tr' ? 'Tekrarlanabilir' : 'Reproducible'}</dt><dd>{run.reproducible ? (locale === 'tr' ? 'Evet' : 'Yes') : (locale === 'tr' ? 'Hayır' : 'No')}</dd></div><div><dt>{locale === 'tr' ? 'Doğru metrik' : 'Metric family'}</dt><dd>{metricForWorkload(run.modality)}</dd></div></dl><p>{run.protocol}</p>{source ? <a className="text-link" href={source.sourceUrl} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Kaynak ↗' : 'Source ↗'}</a> : null}</article>})}</div>
  </>
}
