import { Check, ChevronLeft, ChevronRight, Copy, RotateCcw, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { catalog } from '@/data/catalog'
import { labScenarioSchema } from '@/data/schema'
import type { Ecosystem, LabRecommendation, LabScenario, Market, Workload } from '@/data/schema'
import { marketTaxDisclosure } from '@/domain/pricing'
import { recommendLab } from '@/domain/recommendation'
import { parseScenarioQuery, serializeScenarioQuery } from '@/domain/scenario-url'
import { useLocale } from '@/i18n/locale'

const workloadCopy: Record<Workload, { tr: string; en: string }> = {
  text: { tr: 'Metin, kod ve reasoning', en: 'Text, code, and reasoning' },
  vision: { tr: 'Görsel dil modeli', en: 'Vision-language model' },
  image: { tr: 'Görsel üretimi', en: 'Image generation' },
  video: { tr: 'Video üretimi', en: 'Video generation' },
  audio: { tr: 'Ses ve konuşma', en: 'Audio and speech' },
}

const stepCopy = [
  { tr: 'Pazar ve bütçe', en: 'Market and budget' },
  { tr: 'İş yükleri ve öncelikler', en: 'Workloads and priorities' },
  { tr: 'Gizlilik, güç ve gürültü', en: 'Privacy, power, and noise' },
  { tr: 'Mevcut ekipman', en: 'Existing equipment' },
  { tr: 'Laboratuvar altyapısı', en: 'Lab infrastructure' },
]

const scenarioStorageKey = 'lcl-saved-scenario-v1'

function initialScenario(search: string) {
  if (search) return parseScenarioQuery(search)
  try {
    const saved = localStorage.getItem(scenarioStorageKey)
    if (saved) return labScenarioSchema.parse(JSON.parse(saved))
  } catch {
    localStorage.removeItem(scenarioStorageKey)
  }
  return parseScenarioQuery(search)
}

function money(amount: number, market: Market, locale: 'tr' | 'en') {
  const settings = { TR: ['tr-TR', 'TRY'], US: ['en-US', 'USD'], DE: ['de-DE', 'EUR'] } as const
  const [marketLocale, currency] = settings[market]
  const numberLocale = market === 'TR' && locale === 'en' ? 'en-GB' : marketLocale
  return new Intl.NumberFormat(numberLocale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function ToggleRow({ checked, onChange, title, detail }: { checked: boolean; onChange: (checked: boolean) => void; title: string; detail?: string }) {
  return <label className="choice-row"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span><strong>{title}</strong>{detail ? <small>{detail}</small> : null}</span><span className="choice-row__mark" aria-hidden="true"><Check /></span></label>
}

export function WorkbenchPage() {
  const locale = useLocale()
  const location = useLocation()
  const navigate = useNavigate()
  const [scenario, setScenario] = useState<LabScenario>(() => initialScenario(location.search))
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<LabRecommendation | null>(null)
  const [activeEcosystem, setActiveEcosystem] = useState<Ecosystem>('nvidia')
  const [copied, setCopied] = useState(false)
  const [persisted, setPersisted] = useState(() => localStorage.getItem(scenarioStorageKey) !== null)

  const pricedDevices = useMemo(() => new Set(catalog.prices.filter((price) => price.market === scenario.market && price.status !== 'quarantined').map((price) => price.deviceId)), [scenario.market])
  const ownedChoices = catalog.devices.filter((device) => device.category === 'desktop-reference' || pricedDevices.has(device.id))

  function patch(next: Partial<LabScenario>) {
    setScenario((current) => ({ ...current, ...next }))
  }

  function setMarket(market: Market) {
    patch({ market, currency: ({ TR: 'TRY', US: 'USD', DE: 'EUR' } as const)[market] })
  }

  function setWorkload(kind: Workload, enabled: boolean) {
    const current = scenario.workloads.filter((item) => item.kind !== kind)
    patch({ workloads: enabled ? [...current, { kind, priority: 3 }] : current.length ? current : scenario.workloads })
  }

  function setPriority(kind: Workload, priority: number) {
    patch({ workloads: scenario.workloads.map((item) => item.kind === kind ? { ...item, priority } : item) })
  }

  function calculate() {
    const recommendation = recommendLab(scenario, catalog)
    setResult(recommendation)
    const query = serializeScenarioQuery(scenario)
    navigate({ pathname: location.pathname, search: query }, { replace: true })
  }

  async function copyScenario() {
    const url = `${window.location.origin}${location.pathname}${serializeScenarioQuery(scenario)}`
    await navigator.clipboard?.writeText(url)
    setCopied(true)
  }

  function togglePersistence() {
    if (persisted) localStorage.removeItem(scenarioStorageKey)
    else localStorage.setItem(scenarioStorageKey, JSON.stringify(scenario))
    setPersisted((value) => !value)
  }

  if (result) return <ResultView scenario={scenario} result={result} locale={locale} active={activeEcosystem} setActive={setActiveEcosystem} copied={copied} persisted={persisted} copyScenario={copyScenario} togglePersistence={togglePersistence} restart={() => { setResult(null); setStep(0) }} />

  return (
    <section className="workbench">
      <header className="workbench__header">
        <div><p className="eyebrow">Workbench / 0{step + 1}</p><h1>{stepCopy[step][locale]}</h1></div>
        <p>{locale === 'tr' ? 'Yanıtlar yalnızca bu tarayıcı sekmesinde işlenir.' : 'Answers are processed only in this browser tab.'}</p>
      </header>
      <ol className="progress" aria-label={locale === 'tr' ? 'Workbench ilerlemesi' : 'Workbench progress'}>{stepCopy.map((item, index) => <li key={item.en} className={index === step ? 'active' : index < step ? 'complete' : ''}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span><small>{item[locale]}</small></li>)}</ol>
      <div className="workbench__body">
        <div className="workbench__form">
          {step === 0 ? <MarketStep scenario={scenario} locale={locale} setMarket={setMarket} patch={patch} /> : null}
          {step === 1 ? <WorkloadStep scenario={scenario} locale={locale} setWorkload={setWorkload} setPriority={setPriority} /> : null}
          {step === 2 ? <ConstraintStep scenario={scenario} locale={locale} patch={patch} /> : null}
          {step === 3 ? <OwnedStep scenario={scenario} locale={locale} choices={ownedChoices} patch={patch} /> : null}
          {step === 4 ? <InfrastructureStep scenario={scenario} locale={locale} patch={patch} /> : null}
          <div className="form-actions">
            {step > 0 ? <button type="button" className="button button--quiet" onClick={() => setStep((value) => value - 1)}><ChevronLeft aria-hidden="true" /> {locale === 'tr' ? 'Geri' : 'Back'}</button> : <span />}
            {step < 4 ? <button type="button" className="button button--primary" onClick={() => setStep((value) => value + 1)}>{locale === 'tr' ? 'Devam et' : 'Continue'} <ChevronRight aria-hidden="true" /></button> : <button type="button" className="button button--primary" onClick={calculate}>{locale === 'tr' ? 'Paketi hesapla' : 'Calculate package'} <ChevronRight aria-hidden="true" /></button>}
          </div>
        </div>
        <ScenarioSummary scenario={scenario} locale={locale} />
      </div>
    </section>
  )
}

function MarketStep({ scenario, locale, setMarket, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; setMarket: (market: Market) => void; patch: (value: Partial<LabScenario>) => void }) {
  return <fieldset><legend>{locale === 'tr' ? 'Satın alma pazarı' : 'Purchase market'}</legend><div className="segmented">{(['TR', 'US', 'DE'] as const).map((market) => <label key={market}><input type="radio" name="market" value={market} checked={scenario.market === market} onChange={() => setMarket(market)} /><span>{market === 'TR' ? 'Türkiye' : market === 'US' ? 'United States' : 'Deutschland'}</span></label>)}</div><label className="field"><span>{locale === 'tr' ? 'Toplam edinme bütçesi' : 'Total acquisition budget'}</span><div className="money-input"><span>{scenario.currency === 'TRY' ? '₺' : scenario.currency === 'USD' ? '$' : '€'}</span><input aria-label={locale === 'tr' ? 'Bütçe' : 'Budget'} type="number" min="0" step="100" value={scenario.budget} onChange={(event) => patch({ budget: Math.max(0, Number(event.target.value)) })} /></div></label><p className="field-note">{marketTaxDisclosure(scenario.market, locale)}</p></fieldset>
}

function WorkloadStep({ scenario, locale, setWorkload, setPriority }: { scenario: LabScenario; locale: 'tr' | 'en'; setWorkload: (kind: Workload, value: boolean) => void; setPriority: (kind: Workload, value: number) => void }) {
  return <fieldset><legend>{locale === 'tr' ? 'Neyi yerelde çalıştıracaksınız?' : 'What will you run locally?'}</legend><div className="workload-list">{(Object.keys(workloadCopy) as Workload[]).map((kind) => { const selected = scenario.workloads.find((item) => item.kind === kind); return <div className={`workload-row${selected ? ' selected' : ''}`} key={kind}><ToggleRow checked={Boolean(selected)} onChange={(value) => setWorkload(kind, value)} title={workloadCopy[kind][locale]} detail={kind.toUpperCase()} />{selected ? <label className="priority"><span>{locale === 'tr' ? 'Öncelik' : 'Priority'}: {selected.priority}/5</span><input aria-label={`${workloadCopy[kind][locale]} ${locale === 'tr' ? 'önceliği' : 'priority'}`} type="range" min="1" max="5" value={selected.priority} onChange={(event) => setPriority(kind, Number(event.target.value))} /></label> : null}</div>})}</div></fieldset>
}

function ConstraintStep({ scenario, locale, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; patch: (value: Partial<LabScenario>) => void }) {
  const update = (value: Partial<LabScenario['constraints']>) => patch({ constraints: { ...scenario.constraints, ...value } })
  return <fieldset><legend>{locale === 'tr' ? 'Yerel çalışma sınırları' : 'Local operating boundaries'}</legend><div className="choice-list"><ToggleRow checked={scenario.constraints.offlineRequired} onChange={(value) => update({ offlineRequired: value })} title={locale === 'tr' ? 'İnternet olmadan çalışmalı' : 'Must work without internet'} detail={locale === 'tr' ? 'Model ve runtime kurulduktan sonra' : 'After model and runtime installation'} /><ToggleRow checked={scenario.constraints.compactOnly} onChange={(value) => update({ compactOnly: value })} title={locale === 'tr' ? 'Yalnızca kompakt cihazlar' : 'Compact devices only'} detail={locale === 'tr' ? 'AI cube, mini PC ve Mac' : 'AI cube, mini PC, and Mac'} /></div><label className="field"><span>{locale === 'tr' ? 'Gürültü tercihi' : 'Noise preference'}</span><select value={scenario.constraints.noise} onChange={(event) => update({ noise: event.target.value as LabScenario['constraints']['noise'] })}><option value="silent">{locale === 'tr' ? 'Sessiz' : 'Silent'}</option><option value="quiet">{locale === 'tr' ? 'Düşük gürültü' : 'Quiet'}</option><option value="balanced">{locale === 'tr' ? 'Dengeli' : 'Balanced'}</option></select></label><label className="field"><span>{locale === 'tr' ? 'Düğüm başına azami güç (isteğe bağlı)' : 'Maximum power per node (optional)'}</span><input type="number" min="1" placeholder="W" value={scenario.constraints.maxPowerW ?? ''} onChange={(event) => update({ maxPowerW: event.target.value ? Number(event.target.value) : null })} /></label></fieldset>
}

function OwnedStep({ scenario, locale, choices, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; choices: typeof catalog.devices; patch: (value: Partial<LabScenario>) => void }) {
  function setOwned(id: string, checked: boolean) { patch({ ownedDeviceIds: checked ? [...scenario.ownedDeviceIds, id] : scenario.ownedDeviceIds.filter((item) => item !== id) }) }
  return <fieldset><legend>{locale === 'tr' ? 'Zaten sahip olduğunuz cihazlar' : 'Equipment you already own'}</legend><p className="field-note">{locale === 'tr' ? 'Seçilen cihaz kendi ekosistem yuvasını ₺0 / $0 / €0 ek maliyetle doldurur.' : 'A selected device fills its ecosystem slot at zero additional acquisition cost.'}</p><div className="choice-list">{choices.map((device) => <ToggleRow key={device.id} checked={scenario.ownedDeviceIds.includes(device.id)} onChange={(value) => setOwned(device.id, value)} title={device.name} detail={`${device.memory.totalGiB} GB · ${device.ecosystem.toUpperCase()}`} />)}</div></fieldset>
}

function InfrastructureStep({ scenario, locale, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; patch: (value: Partial<LabScenario>) => void }) {
  const update = (value: Partial<LabScenario['infrastructure']>) => patch({ infrastructure: { ...scenario.infrastructure, ...value } })
  return <fieldset><legend>{locale === 'tr' ? 'Laboratuvarın hazır olduğu altyapı' : 'Infrastructure available to the lab'}</legend><div className="choice-list"><ToggleRow checked={scenario.infrastructure.tenGigabitEthernet} onChange={(value) => update({ tenGigabitEthernet: value })} title="10GbE" detail={locale === 'tr' ? 'Model, artefakt ve veri aktarımı' : 'Model, artifact, and data transfer'} /><ToggleRow checked={scenario.infrastructure.nas} onChange={(value) => update({ nas: value })} title="NAS" detail={locale === 'tr' ? 'Ortak model deposu' : 'Shared model storage'} /><ToggleRow checked={scenario.infrastructure.ups} onChange={(value) => update({ ups: value })} title="UPS" detail={locale === 'tr' ? 'Üç düğüm için kesintisiz güç' : 'Protected power for three nodes'} /></div></fieldset>
}

function ScenarioSummary({ scenario, locale }: { scenario: LabScenario; locale: 'tr' | 'en' }) {
  return <aside className="scenario-summary"><p className="eyebrow">{locale === 'tr' ? 'Canlı senaryo' : 'Live scenario'}</p><strong className="scenario-summary__budget">{money(scenario.budget, scenario.market, locale)}</strong><dl><div><dt>{locale === 'tr' ? 'Pazar' : 'Market'}</dt><dd>{scenario.market}</dd></div><div><dt>{locale === 'tr' ? 'İş yükü' : 'Workloads'}</dt><dd>{scenario.workloads.length}</dd></div><div><dt>{locale === 'tr' ? 'Mevcut düğüm' : 'Owned nodes'}</dt><dd>{scenario.ownedDeviceIds.length}</dd></div><div><dt>{locale === 'tr' ? 'Ağ' : 'Network'}</dt><dd>{scenario.infrastructure.tenGigabitEthernet ? '10GbE' : '1/2.5GbE'}</dd></div></dl></aside>
}

interface ResultViewProps {
  scenario: LabScenario
  result: LabRecommendation
  locale: 'tr' | 'en'
  active: Ecosystem
  setActive: (value: Ecosystem) => void
  copied: boolean
  persisted: boolean
  copyScenario: () => void
  togglePersistence: () => void
  restart: () => void
}

function ResultView({ scenario, result, locale, active, setActive, copied, persisted, copyScenario, togglePersistence, restart }: ResultViewProps) {
  return <section className="results">
    <header className="result-header">
      <div>
        <p className="eyebrow">LCL / {result.status === 'complete' ? (locale === 'tr' ? 'Bütçe içinde' : 'Within budget') : (locale === 'tr' ? 'Fazlı alım' : 'Phased purchase')}</p>
        <h1>{locale === 'tr' ? 'Üç ekosistemli laboratuvarınız' : 'Your three-ecosystem lab'}</h1>
        <p className="lede">{locale === 'tr' ? `Toplam yeni edinme maliyeti ${money(result.totalCost, scenario.market, locale)}.` : `Total new acquisition cost is ${money(result.totalCost, scenario.market, locale)}.`}</p>
      </div>
      <div className="result-header__actions">
        <button className="button button--quiet" type="button" onClick={restart}><RotateCcw aria-hidden="true" /> {locale === 'tr' ? 'Senaryoyu düzenle' : 'Edit scenario'}</button>
        <button className="button button--quiet" type="button" onClick={copyScenario}><Copy aria-hidden="true" /> {copied ? (locale === 'tr' ? 'Kopyalandı' : 'Copied') : (locale === 'tr' ? 'Paylaşım URL’si' : 'Share URL')}</button>
        <button className="button button--quiet" type="button" onClick={togglePersistence}><Save aria-hidden="true" /> {persisted ? (locale === 'tr' ? 'Tarayıcı kaydını sil' : 'Remove browser save') : (locale === 'tr' ? 'Bu senaryoyu tarayıcıda sakla' : 'Save this scenario in browser')}</button>
      </div>
    </header>
    {result.status === 'phased' ? <div className="budget-warning"><strong>{locale === 'tr' ? `Bütçe farkı: ${money(result.budgetGap, scenario.market, locale)}` : `Budget gap: ${money(result.budgetGap, scenario.market, locale)}`}</strong><span>{locale === 'tr' ? 'Zayıf bir paket uydurulmadı; tam hedef aşağıda fazlara ayrıldı.' : 'No weak package was invented; the full target is phased below.'}</span></div> : null}
    <div className="ecosystem-tabs" role="tablist" aria-label={locale === 'tr' ? 'Ekosistem sonuçları' : 'Ecosystem results'}>{(['nvidia', 'amd', 'apple'] as const).map((ecosystem) => <button key={ecosystem} role="tab" aria-selected={active === ecosystem} onClick={() => setActive(ecosystem)}>{ecosystem.toUpperCase()}</button>)}</div>
    <div className="result-grid">{result.slots.map((slot) => {
      const device = catalog.devices.find((item) => item.id === slot.deviceId)!
      const price = catalog.prices.find((item) => item.deviceId === slot.deviceId && item.market === scenario.market)
      const edges = catalog.compatibilities.filter((edge) => edge.deviceId === device.id && edge.status !== 'unsupported')
      const evidence = catalog.evidence.filter((claim) => claim.subjectId === device.id)
      const alternative = catalog.devices.find((item) => item.ecosystem === slot.ecosystem && item.id !== device.id && catalog.prices.some((candidate) => candidate.deviceId === item.id && candidate.market === scenario.market && candidate.status !== 'quarantined'))
      const modalities = [...new Set(edges.flatMap((edge) => catalog.models.find((model) => model.id === edge.modelId)?.modalities ?? []))]
      return <article key={slot.ecosystem} className={`result-node result-node--${slot.ecosystem}${active === slot.ecosystem ? ' active' : ''}`}>
        <p className="eyebrow">{slot.ecosystem.toUpperCase()} / {slot.owned ? (locale === 'tr' ? 'MEVCUT' : 'OWNED') : 'NODE'}</p>
        <h2>{slot.ecosystem === 'nvidia' ? 'NVIDIA · ' : slot.ecosystem === 'amd' ? 'AMD · ' : 'Apple · '}{device.name}</h2>
        <p className="result-node__price">{slot.owned ? (locale === 'tr' ? 'Ek maliyet yok' : 'No added cost') : money(slot.acquisitionCost, scenario.market, locale)}</p>
        <dl className="node-metrics"><div><dt>{locale === 'tr' ? 'Bellek' : 'Memory'}</dt><dd>{device.memory.totalGiB} GB</dd></div><div><dt>{locale === 'tr' ? 'Güvenli sınır' : 'Safe boundary'}</dt><dd>{device.memory.usableGiB ?? device.memory.totalGiB * .8} GB</dd></div><div><dt>{locale === 'tr' ? 'Fit puanı' : 'Fit score'}</dt><dd>{slot.fitScore}/100</dd></div><div><dt>{locale === 'tr' ? 'Kanıt' : 'Evidence'}</dt><dd>{evidence.length ? (locale === 'tr' ? 'Yüksek' : 'High') : (locale === 'tr' ? 'Sınırlı' : 'Limited')}</dd></div></dl>
        <div className="meter" aria-label={`${slot.fitScore}/100`}><span style={{ width: `${slot.fitScore}%` }} /></div>
        <h3>{locale === 'tr' ? 'Çalışabilen model sınıfları' : 'Model classes that run'}</h3><p>{modalities.length ? modalities.join(' · ') : (locale === 'tr' ? 'Doğrulanmış eşleşme yok' : 'No evidenced match')}</p>
        <h3>{locale === 'tr' ? 'Alternatif' : 'Alternative'}</h3><p>{alternative?.name ?? (locale === 'tr' ? 'Bu pazarda ikinci fiyat gözlemi yok' : 'No second market observation')}</p>
        {price ? <a className="text-link" href={price.sourceUrl} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Fiyat kaynağı ↗' : 'Price source ↗'}</a> : null}
      </article>
    })}</div>
    {result.status === 'phased' ? <section className="phase-plan"><p className="eyebrow">{locale === 'tr' ? 'Bütçe sınırı' : 'Budget boundary'}</p><h2>{locale === 'tr' ? 'Fazlı alım planı' : 'Phased purchase plan'}</h2><ol>{result.phases.map((phase) => { const device = catalog.devices.find((item) => item.id === phase.deviceId)!; return <li key={phase.deviceId}><span>0{phase.order}</span><strong>{device.name}</strong><em>{phase.acquisitionCost === 0 ? (locale === 'tr' ? 'Mevcut' : 'Owned') : money(phase.acquisitionCost, scenario.market, locale)}</em></li>})}</ol></section> : null}
  </section>
}
