import { ArrowRight, Database, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { catalog, snapshotDate } from '@/data/catalog'
import { formatDate, useLocale } from '@/i18n/locale'

const rails = [
  { id: 'nvidia', label: 'NVIDIA', tr: 'CUDA ve AI küpü', en: 'CUDA and AI cube' },
  { id: 'amd', label: 'AMD', tr: 'Birleşik bellekli mini PC', en: 'Unified-memory mini PC' },
  { id: 'apple', label: 'APPLE', tr: 'MLX ve sessiz masaüstü', en: 'MLX and quiet desktop' },
]

export function HomePage() {
  const locale = useLocale()
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">LCL / Local Compute Lab</p>
          <h1>{locale === 'tr' ? 'Hangi laboratuvarı almalıyım?' : 'Which lab should I buy?'}</h1>
          <p className="lede">{locale === 'tr' ? 'Bütçenize, iş yükünüze ve mevcut ekipmanınıza göre NVIDIA + AMD + Apple yerel AI laboratuvarı kurun.' : 'Build an NVIDIA + AMD + Apple local AI lab around your budget, workloads, and existing equipment.'}</p>
          <div className="hero-actions">
            <Link className="button button--primary" to={`/${locale}/build`}>{locale === 'tr' ? 'Laboratuvarı oluştur' : 'Build your lab'} <ArrowRight aria-hidden="true" /></Link>
            <Link className="text-link" to={`/${locale}/models`}>{locale === 'tr' ? 'Modelden cihaza git' : 'Start with a model'}</Link>
          </div>
        </div>
        <aside className="snapshot-block" aria-label={locale === 'tr' ? 'Veri durumu' : 'Data status'}>
          <p className="eyebrow">{locale === 'tr' ? 'Son katalog derlemesi' : 'Latest catalog build'}</p>
          <strong>{formatDate(snapshotDate, locale)}</strong>
          <p className="field-note">{locale === 'tr' ? 'Derleme tarihi kaynakların yeniden doğrulandığı anlamına gelmez. Her gözlemin kendi tarihini kontrol edin.' : 'The build date does not mean sources were reverified. Check each observation date.'}</p>
          <dl className="snapshot-stats">
            <div><dt>{locale === 'tr' ? 'Model' : 'Models'}</dt><dd>{catalog.models.length}</dd></div>
            <div><dt>{locale === 'tr' ? 'Cihaz' : 'Devices'}</dt><dd>{catalog.devices.length}</dd></div>
            <div><dt>{locale === 'tr' ? 'Pazar' : 'Markets'}</dt><dd>3</dd></div>
          </dl>
          <Link className="text-link" to={`/${locale}/changes`}>{catalog.snapshotId}</Link>
        </aside>
      </section>

      <section className="ecosystem-rails" aria-label={locale === 'tr' ? 'Ekosistemler' : 'Ecosystems'}>
        {rails.map((rail, index) => (
          <div className={`ecosystem-rail ecosystem-rail--${rail.id}`} key={rail.id}>
            <span className="ecosystem-rail__index">0{index + 1}</span>
            <h2>{rail.label}</h2>
            <p>{rail[locale]}</p>
            <span className="ecosystem-rail__line" aria-hidden="true" />
          </div>
        ))}
      </section>

      <section className="decision-preview">
        <div className="section-heading">
          <p className="eyebrow">{locale === 'tr' ? 'Beş kısa adım' : 'Five short steps'}</p>
          <h2>{locale === 'tr' ? 'Satın alma kararını kanıtla.' : 'Make the purchase defensible.'}</h2>
          <p>{locale === 'tr' ? 'Pazar ve bütçeden başlayın; her düğümün neden seçildiğini, hangi model sınıflarını çalıştırdığını ve bellek sınırını görün.' : 'Start with market and budget; see why every node was selected, the model classes it runs, and its memory boundary.'}</p>
        </div>
        <ol className="step-ledger">
          {[
            [locale === 'tr' ? 'Pazar ve bütçe' : 'Market and budget', 'TR · US · DE'],
            [locale === 'tr' ? 'İş yükleri' : 'Workloads', 'LLM · VLM · IMAGE · VIDEO · AUDIO'],
            [locale === 'tr' ? 'Kısıtlar' : 'Constraints', locale === 'tr' ? 'Gizlilik · güç · gürültü' : 'Privacy · power · noise'],
            [locale === 'tr' ? 'Mevcut ekipman' : 'Owned equipment', 'RTX → ₺0 / $0 / €0'],
            [locale === 'tr' ? 'Altyapı' : 'Infrastructure', '10GbE · NAS · UPS'],
          ].map(([title, detail], index) => <li key={title}><span>0{index + 1}</span><strong>{title}</strong><small>{detail}</small></li>)}
        </ol>
      </section>

      <section className="evidence-band">
        <div><ShieldCheck aria-hidden="true" /><h2>{locale === 'tr' ? '“Güvenli” değil, açık kanıt.' : 'Not “safe”; explicit evidence.'}</h2><p>{locale === 'tr' ? 'Dosya özeti, lisans ve erişim koşulları ayrı ayrı gösterilir.' : 'File hash, license, and access conditions are shown separately.'}</p></div>
        <div><Database aria-hidden="true" /><h2>{locale === 'tr' ? 'Son sağlam anlık görüntü korunur.' : 'Last-known-good is preserved.'}</h2><p>{locale === 'tr' ? 'Şema, kaynak veya anomali kontrolü başarısız olursa aday veri yayınlanmaz.' : 'A candidate is not published when schema, source, or anomaly checks fail.'}</p></div>
      </section>
    </>
  )
}
