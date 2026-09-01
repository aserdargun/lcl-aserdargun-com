import { Search } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CompatibilityStatus } from '@/components/Status'
import { PageIntro } from '@/components/PageIntro'
import { catalog } from '@/data/catalog'
import { useLocale } from '@/i18n/locale'

export function ModelsPage() {
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const selectedId = params.get('model') ?? catalog.models[0].id
  const selected = catalog.models.find((model) => model.id === selectedId) ?? catalog.models[0]
  const filtered = useMemo(() => catalog.models.filter((model) => `${model.name} ${model.publisher} ${model.modalities.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query])
  const matches = catalog.compatibilities.filter((edge) => edge.modelId === selected.id)

  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Model → cihaz' : 'Model → device'} title={locale === 'tr' ? 'Bu model nerede çalışır?' : 'Where does this model run?'} description={locale === 'tr' ? 'Yalnızca resmi yayıncı artefaktları ve tekrarlanabilir dönüşümler; lisans ve yerel çalışma koşulları ayrı.' : 'Publisher artifacts and reproducible conversions only; license and local operating conditions stay separate.'} aside={<><strong>{catalog.models.length}</strong><span>{locale === 'tr' ? 'küratörlü model' : 'curated models'}</span></>} />
    <div className="catalog-layout">
      <aside className="catalog-index">
        <label className="search-field"><Search aria-hidden="true" /><span className="visually-hidden">{locale === 'tr' ? 'Model ara' : 'Search models'}</span><input type="search" value={query} placeholder={locale === 'tr' ? 'Model ara' : 'Search models'} onChange={(event) => { const next = new URLSearchParams(params); if (event.target.value) next.set('q', event.target.value); else next.delete('q'); setParams(next, { replace: true }) }} /></label>
        <div className="catalog-index__list">{filtered.map((model) => <button className={model.id === selected.id ? 'active' : ''} key={model.id} type="button" onClick={() => { const next = new URLSearchParams(params); next.set('model', model.id); setParams(next) }}><span>{model.publisher}</span><strong>{model.name}</strong><small>{model.modalities.join(' · ')}</small></button>)}</div>
      </aside>
      <article className="model-detail">
        <header><p className="eyebrow">{selected.publisher} / {selected.family}</p><h2>{selected.name}</h2><p>{selected.parameterCountB ? `${selected.parameterCountB}B` : '—'} · {selected.artifacts[0].quantization} · {selected.artifacts[0].fileSizeGiB.toFixed(1)} GiB</p></header>
        <dl className="evidence-ledger"><div><dt>{locale === 'tr' ? 'Lisans' : 'License'}</dt><dd><a href={selected.license.url} target="_blank" rel="noreferrer">{selected.license.name} ↗</a></dd></div><div><dt>Gated</dt><dd>{selected.gated ? (locale === 'tr' ? 'Evet' : 'Yes') : (locale === 'tr' ? 'Hayır' : 'No')}</dd></div><div><dt>remote_code</dt><dd>{selected.remoteCode}</dd></div><div><dt>{locale === 'tr' ? 'Çevrimdışı' : 'Offline'}</dt><dd>{selected.offline}</dd></div><div><dt>Telemetry</dt><dd>{selected.telemetry}</dd></div><div><dt>SHA-256</dt><dd><code title={selected.artifacts[0].sha256}>{selected.artifacts[0].sha256.slice(0, 16)}…</code></dd></div></dl>
        <section className="compatibility-section"><h3>{locale === 'tr' ? 'Cihaz eşleşmeleri' : 'Device matches'}</h3>{matches.length ? <div className="table-scroll"><table><thead><tr><th>{locale === 'tr' ? 'Cihaz' : 'Device'}</th><th>Runtime</th><th>{locale === 'tr' ? 'Durum' : 'Status'}</th><th>{locale === 'tr' ? 'Bellek' : 'Memory'}</th><th>Fit</th></tr></thead><tbody>{matches.map((edge) => { const device = catalog.devices.find((item) => item.id === edge.deviceId)!; return <tr key={edge.id}><td><Link to={`/${locale}/devices?device=${device.id}`}>{device.name}</Link></td><td>{edge.runtime}</td><td><CompatibilityStatus status={edge.status} /></td><td>{edge.requiredMemoryGiB.toFixed(1)} / {edge.usableMemoryGiB.toFixed(1)} GiB</td><td>{edge.fitScore}/100</td></tr>})}</tbody></table></div> : <p>{locale === 'tr' ? 'Bu snapshot’ta eşleşme yok.' : 'No match in this snapshot.'}</p>}</section>
        <p className="policy-note">{locale === 'tr' ? '“Güvenli model” etiketi kullanılmaz. Kaynak, hash, lisans, gated erişim, remote_code ve ağ koşullarını birlikte değerlendirin.' : 'LCL does not use a “safe model” label. Evaluate source, hash, license, gated access, remote_code, and network conditions together.'}</p>
        <a className="text-link" href={selected.modelCardUrl} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Resmi model kartı ↗' : 'Official model card ↗'}</a>
      </article>
    </div>
  </>
}
