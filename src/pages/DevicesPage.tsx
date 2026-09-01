import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageIntro } from '@/components/PageIntro'
import { catalog } from '@/data/catalog'
import type { Ecosystem, Market } from '@/data/schema'
import { marketTaxDisclosure } from '@/domain/pricing'
import { useLocale } from '@/i18n/locale'

function amount(value: number, market: Market) {
  const config = { TR: ['tr-TR', 'TRY'], US: ['en-US', 'USD'], DE: ['de-DE', 'EUR'] } as const
  return new Intl.NumberFormat(config[market][0], { style: 'currency', currency: config[market][1], maximumFractionDigits: 0 }).format(value)
}

export function DevicesPage() {
  const locale = useLocale()
  const [params, setParams] = useSearchParams()
  const market = (['TR', 'US', 'DE'].includes(params.get('market') ?? '') ? params.get('market') : 'TR') as Market
  const ecosystem = (['nvidia', 'amd', 'apple'].includes(params.get('ecosystem') ?? '') ? params.get('ecosystem') : 'all') as Ecosystem | 'all'
  const selectedId = params.get('device')
  const filtered = useMemo(() => catalog.devices.filter((device) => ecosystem === 'all' || device.ecosystem === ecosystem), [ecosystem])
  const selected = catalog.devices.find((device) => device.id === selectedId) ?? filtered[0]
  const price = selected ? catalog.prices.find((item) => item.deviceId === selected.id && item.market === market && item.status !== 'quarantined') : undefined
  const compatibilityCount = selected ? catalog.compatibilities.filter((edge) => edge.deviceId === selected.id && edge.status !== 'unsupported').length : 0

  function updateFilters(values: { market?: Market; ecosystem?: Ecosystem | 'all'; device?: string }) {
    const next = new URLSearchParams(params)
    next.set('v', '1')
    if (values.market) next.set('market', values.market)
    if (values.ecosystem === 'all') next.delete('ecosystem')
    else if (values.ecosystem) next.set('ecosystem', values.ecosystem)
    if (values.device) next.set('device', values.device)
    setParams(next)
  }

  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Cihaz profilleri' : 'Device profiles'} title={locale === 'tr' ? 'Yerel cihazlar' : 'Local devices'} description={locale === 'tr' ? 'AI cube, mini PC, Mac mini ve Mac Studio; masaüstü referansları bağlam için korunur.' : 'AI cubes, mini PCs, Mac mini, and Mac Studio; desktop references remain for context.'} aside={<><strong>{catalog.devices.length}</strong><span>{locale === 'tr' ? 'cihaz SKU’su' : 'device SKUs'}</span></>} />
    <div className="filter-bar"><label><span>{locale === 'tr' ? 'Ekosistem' : 'Ecosystem'}</span><select value={ecosystem} onChange={(event) => updateFilters({ ecosystem: event.target.value as Ecosystem | 'all' })}><option value="all">{locale === 'tr' ? 'Tümü' : 'All'}</option><option value="nvidia">NVIDIA</option><option value="amd">AMD</option><option value="apple">Apple</option></select></label><label><span>{locale === 'tr' ? 'Pazar' : 'Market'}</span><select value={market} onChange={(event) => updateFilters({ market: event.target.value as Market })}><option value="TR">TR</option><option value="US">US</option><option value="DE">DE</option></select></label><p>{marketTaxDisclosure(market, locale)}</p></div>
    <div className="device-ledger"><div className="device-ledger__list">{filtered.map((device) => { const devicePrice = catalog.prices.find((item) => item.deviceId === device.id && item.market === market && item.status !== 'quarantined'); return <button key={device.id} type="button" className={`${device.ecosystem}${selected?.id === device.id ? ' active' : ''}`} onClick={() => updateFilters({ device: device.id })}><span>{device.ecosystem.toUpperCase()} / {device.category}</span><strong>{device.name}</strong><small>{device.memory.totalGiB} GB · {devicePrice ? amount(devicePrice.amount, market) : (locale === 'tr' ? 'Fiyat yok' : 'No price')}</small></button>})}</div>{selected ? <article className={`device-profile device-profile--${selected.ecosystem}`}><p className="eyebrow">{selected.maker} / {selected.category}</p><h2>{selected.name}</h2><p>{selected.processor}<br />{selected.accelerator}</p><dl className="profile-specs"><div><dt>{locale === 'tr' ? 'Bellek' : 'Memory'}</dt><dd>{selected.memory.totalGiB} GB {selected.memory.unified ? (locale === 'tr' ? 'birleşik' : 'unified') : 'VRAM'}</dd></div><div><dt>{locale === 'tr' ? 'Bant genişliği' : 'Bandwidth'}</dt><dd>{selected.bandwidthGBs ? `${selected.bandwidthGBs} GB/s` : '—'}</dd></div><div><dt>{locale === 'tr' ? 'Azami güç' : 'Max power'}</dt><dd>{selected.powerW.max ? `${selected.powerW.max} W` : '—'}</dd></div><div><dt>{locale === 'tr' ? 'Ağ' : 'Network'}</dt><dd>{selected.network.join(' · ')}</dd></div><div><dt>Runtime</dt><dd>{selected.runtimes.join(' · ')}</dd></div><div><dt>{locale === 'tr' ? 'Kanıtlı eşleşme' : 'Evidence matches'}</dt><dd>{compatibilityCount}</dd></div><div><dt>{locale === 'tr' ? 'Eğitim / fine-tuning' : 'Training / fine-tuning'}</dt><dd>{selected.trainingSupport ?? 'not-assessed'}</dd></div></dl>{price ? <div className="price-observation"><strong>{amount(price.amount, market)}</strong><span>{price.configuration}</span><span>{price.taxBasis} · {price.stock} · {price.observedAt}</span><a href={price.sourceUrl} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Fiyat / satın alma referansı ↗' : 'Price / purchase reference ↗'}</a></div> : <p className="policy-note">{locale === 'tr' ? 'Bu pazarda doğrulanmış fiyat gözlemi yok.' : 'No verified price observation in this market.'}</p>}</article> : null}</div>
  </>
}
