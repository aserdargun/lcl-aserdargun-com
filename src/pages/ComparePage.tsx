import { Link, useSearchParams } from 'react-router-dom'
import { PageIntro } from '@/components/PageIntro'
import { catalog } from '@/data/catalog'
import { recommendLab } from '@/domain/recommendation'
import { defaultScenario } from '@/domain/scenario-url'
import { formatMoney, formatTerm } from '@/i18n/format'
import { useLocale } from '@/i18n/locale'

const presets = [
  { id: 'balanced', tr: 'Dengeli', en: 'Balanced', budget: 850_000, ownedDeviceIds: [] as string[] },
  { id: 'owned-rtx', tr: 'RTX sahibi', en: 'Owned RTX', budget: 550_000, ownedDeviceIds: ['nvidia-rtx-5090-reference'] },
  { id: 'staged', tr: 'Fazlı başlangıç', en: 'Staged start', budget: 250_000, ownedDeviceIds: [] as string[] },
]

export function ComparePage() {
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const requested = params.get('devices')?.split(',').filter((id) => catalog.devices.some((device) => device.id === id)).slice(0, 4)
  const selected = requested?.length ? requested : catalog.devices.slice(0, 3).map((device) => device.id)
  const devices = selected.map((id) => catalog.devices.find((device) => device.id === id)!).filter(Boolean)
  function toggle(id: string, checked: boolean) {
    const nextSelection = checked ? selected.length < 4 ? [...selected, id] : selected : selected.filter((item) => item !== id)
    setParams({ v: '1', devices: nextSelection.join(',') })
  }
  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Yan yana karar' : 'Side-by-side decision'} title={locale === 'tr' ? 'Cihaz ve paket karşılaştırması' : 'Device and package comparison'} description={locale === 'tr' ? 'En fazla dört cihazı veya üç tam laboratuvar paketini aynı kanıt eksenlerinde karşılaştırın.' : 'Compare up to four devices or three full lab packages on the same evidence axes.'} aside={<><strong>{selected.length}/4</strong><span>{locale === 'tr' ? 'seçili cihaz' : 'selected devices'}</span></>} />
    <section className="compare-picker"><h2>{locale === 'tr' ? 'Cihaz seç' : 'Select devices'}</h2><div>{catalog.devices.map((device) => <label key={device.id}><input type="checkbox" checked={selected.includes(device.id)} disabled={!selected.includes(device.id) && selected.length >= 4} onChange={(event) => toggle(device.id, event.target.checked)} /><span>{formatTerm(device.name, locale)}</span></label>)}</div></section>
    <section className="compare-section"><p className="eyebrow">{locale === 'tr' ? '01 / CİHAZ SKU’SU' : '01 / DEVICE SKU'}</p><h2>{locale === 'tr' ? 'Dört cihazlık matris' : 'Four-device matrix'}</h2><div className="table-scroll"><table className="compare-table"><thead><tr><th>{locale === 'tr' ? 'Ölçüt' : 'Measure'}</th>{devices.map((device) => <th key={device.id}>{formatTerm(device.name, locale)}</th>)}</tr></thead><tbody><tr><th>{locale === 'tr' ? 'Ekosistem' : 'Ecosystem'}</th>{devices.map((device) => <td key={device.id}>{device.ecosystem.toUpperCase()}</td>)}</tr><tr><th>{locale === 'tr' ? 'Bellek' : 'Memory'}</th>{devices.map((device) => <td key={device.id}>{device.memory.totalGiB} GB</td>)}</tr><tr><th>{locale === 'tr' ? 'Güvenli sınır' : 'Safe boundary'}</th>{devices.map((device) => <td key={device.id}>{device.memory.usableGiB ?? device.memory.totalGiB * .8} GB</td>)}</tr><tr><th>{locale === 'tr' ? 'Bant genişliği' : 'Bandwidth'}</th>{devices.map((device) => <td key={device.id}>{device.bandwidthGBs ? `${device.bandwidthGBs} GB/s` : '—'}</td>)}</tr><tr><th>{locale === 'tr' ? 'Çalıştırma ortamı' : 'Runtime'}</th>{devices.map((device) => <td key={device.id}>{device.runtimes.join(', ')}</td>)}</tr><tr><th>{locale === 'tr' ? 'Biçim' : 'Form'}</th>{devices.map((device) => <td key={device.id}>{formatTerm(device.formFactor, locale)}</td>)}</tr></tbody></table></div></section>
    <section className="compare-section"><p className="eyebrow">{locale === 'tr' ? '02 / LABORATUVAR PAKETİ' : '02 / LAB PACKAGE'}</p><h2>{locale === 'tr' ? 'Üç paketlik karşılaştırma' : 'Three-package comparison'}</h2><div className="package-grid">{presets.map((preset) => { const scenario = { ...defaultScenario, budget: preset.budget, ownedDeviceIds: preset.ownedDeviceIds }; const result = recommendLab(scenario, catalog); return <article key={preset.id}><p className="eyebrow">{preset.id}</p><h3>{preset[locale]}</h3><strong>{formatMoney(result.totalCost, 'TRY', locale)}</strong><dl><div><dt>{locale === 'tr' ? 'Durum' : 'Status'}</dt><dd>{formatTerm(result.status, locale)}</dd></div><div><dt>{locale === 'tr' ? 'En düşük uygunluk' : 'Weakest fit'}</dt><dd>{result.weakestFitScore}/100</dd></div><div><dt>{locale === 'tr' ? 'Kapsam' : 'Coverage'}</dt><dd>{result.workloadCoverage}/100</dd></div></dl><p>{result.slots.map((slot) => { const device = catalog.devices.find((item) => item.id === slot.deviceId); return device ? formatTerm(device.name, locale) : '' }).join(' · ')}</p></article>})}</div><Link className="button button--primary" to={`/${locale}/build`}>{locale === 'tr' ? 'Kendi paketini oluştur' : 'Build your package'}</Link></section>
  </>
}
