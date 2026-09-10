import { Check, ChevronLeft, ChevronRight, Copy, RotateCcw, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { catalog } from '@/data/catalog'
import { labScenarioSchema } from '@/data/schema'
import type { Ecosystem, LabPackage, LabRecommendation, LabScenario, Market, Workload } from '@/data/schema'
import { marketTaxDisclosure } from '@/domain/pricing'
import { deviceExclusions, eligibleModelMatches, recommendationPrice, recommendLab } from '@/domain/recommendation'
import { readBrowserValue, writeBrowserValue } from '@/domain/browser-storage'
import { RecommendationExclusions } from '@/components/RecommendationExclusions'
import { parseScenarioQuery, serializeScenarioQuery } from '@/domain/scenario-url'
import { formatMarketName, formatMoney, formatTerm } from '@/i18n/format'
import { formatDate, useLocale } from '@/i18n/locale'

const workloadCopy: Record<Workload, { tr: string; en: string }> = {
  text: { tr: 'Metin, kod ve akıl yürütme', en: 'Text, code, and reasoning' },
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
    const saved = readBrowserValue(scenarioStorageKey)
    if (saved) return labScenarioSchema.parse(JSON.parse(saved))
  } catch {
    writeBrowserValue(scenarioStorageKey, null)
  }
  return parseScenarioQuery(search)
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
  const [savedScenario, setSavedScenario] = useState(() => readBrowserValue(scenarioStorageKey))
  const persisted = savedScenario === JSON.stringify(scenario)
  const [actionError, setActionError] = useState('')
  const writtenSearch = useRef(location.search)
  const ownedChoices = catalog.devices

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('.workbench h1, .results h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
    if (typeof heading.scrollIntoView === 'function') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step, result])

  useEffect(() => {
    if (location.search === writtenSearch.current) return
    writtenSearch.current = location.search
    setScenario(initialScenario(location.search))
    setStep(0)
    setResult(null)
    setCopied(false)
    setActionError('')
  }, [location.search])

  function patch(next: Partial<LabScenario>) {
    const updated = { ...scenario, ...next }
    setScenario(updated)
    setCopied(false)
    writtenSearch.current = serializeScenarioQuery(updated)
    navigate({ search: writtenSearch.current }, { replace: true })
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
    writtenSearch.current = query
    navigate({ pathname: location.pathname, search: query }, { replace: true })
  }

  async function copyScenario() {
    const url = `${window.location.origin}${location.pathname}${serializeScenarioQuery(scenario)}`
    setActionError('')
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
      setActionError(locale === 'tr' ? 'Bağlantı kopyalanamadı. Senaryo bağlantısı adres çubuğunda bulunuyor.' : 'The link could not be copied. The scenario URL is available in the address bar.')
    }
  }

  function togglePersistence() {
    const next = persisted ? null : JSON.stringify(scenario)
    if (writeBrowserValue(scenarioStorageKey, next)) {
      setSavedScenario(next)
      setActionError('')
    } else setActionError(locale === 'tr' ? 'Tarayıcı kaydı değiştirilemedi. Senaryonuz bu sekmede kullanılabilir.' : 'Browser storage could not be changed. Your scenario remains available in this tab.')
  }

  if (result?.status === 'ineligible') return <section className="results"><p className="eyebrow">LCL / INELIGIBLE</p><h1>{locale === 'tr' ? 'Bu koşullarla paket oluşturulamıyor' : 'No package meets these requirements'}</h1><RecommendationExclusions result={result} locale={locale} /><button className="button button--primary" onClick={() => { setResult(null); setStep(0) }}><RotateCcw aria-hidden="true" />{locale === 'tr' ? 'Senaryoyu düzenle' : 'Edit scenario'}</button></section>
  if (result) return <><ResultView scenario={scenario} result={result} locale={locale} active={activeEcosystem} setActive={setActiveEcosystem} copied={copied} persisted={persisted} copyScenario={copyScenario} togglePersistence={togglePersistence} restart={() => { setResult(null); setStep(0); setActionError('') }} />{actionError ? <p className="action-error" role="alert">{actionError}</p> : null}</>

  return (
    <section className="workbench">
      <header className="workbench__header">
        <div><p className="eyebrow">Workbench / 0{step + 1}</p><h1>{stepCopy[step][locale]}</h1></div>
        <p>{locale === 'tr' ? 'Yanıtlar yalnızca bu tarayıcı sekmesinde işlenir.' : 'Answers are processed only in this browser tab.'}</p>
      </header>
      <ol className="progress" aria-label={locale === 'tr' ? 'Workbench ilerlemesi' : 'Workbench progress'}>{stepCopy.map((item, index) => <li key={item.en} className={index === step ? 'active' : index < step ? 'complete' : ''}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span><small>{item[locale]}</small></li>)}</ol>
      <div className="workbench__body">
        <form className="workbench__form" onSubmit={(event) => { event.preventDefault(); if (step < 4) setStep(step + 1); else calculate() }}>
          {step === 0 ? <MarketStep scenario={scenario} locale={locale} setMarket={setMarket} patch={patch} /> : null}
          {step === 1 ? <WorkloadStep scenario={scenario} locale={locale} setWorkload={setWorkload} setPriority={setPriority} /> : null}
          {step === 2 ? <ConstraintStep scenario={scenario} locale={locale} patch={patch} /> : null}
          {step === 3 ? <OwnedStep scenario={scenario} locale={locale} choices={ownedChoices} patch={patch} /> : null}
          {step === 4 ? <InfrastructureStep scenario={scenario} locale={locale} patch={patch} /> : null}
          <div className="form-actions">
            {step > 0 ? <button type="button" className="button button--quiet" onClick={() => setStep((value) => value - 1)}><ChevronLeft aria-hidden="true" /> {locale === 'tr' ? 'Geri' : 'Back'}</button> : <span />}
            <button type="submit" className="button button--primary">{step < 4 ? (locale === 'tr' ? 'Devam et' : 'Continue') : (locale === 'tr' ? 'Paketi hesapla' : 'Calculate package')} <ChevronRight aria-hidden="true" /></button>
          </div>
        </form>
        <ScenarioSummary scenario={scenario} locale={locale} />
      </div>
    </section>
  )
}

function MarketStep({ scenario, locale, setMarket, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; setMarket: (market: Market) => void; patch: (value: Partial<LabScenario>) => void }) {
  return <fieldset><legend>{locale === 'tr' ? 'Satın alma pazarı' : 'Purchase market'}</legend><div className="segmented">{(['TR', 'US', 'DE'] as const).map((market) => <label key={market}><input aria-label={formatMarketName(market, locale)} type="radio" name="market" value={market} checked={scenario.market === market} onChange={() => setMarket(market)} /><span>{formatMarketName(market, locale)}</span></label>)}</div><label className="field"><span>{locale === 'tr' ? 'Toplam edinme bütçesi' : 'Total acquisition budget'}</span><div className="money-input"><span>{scenario.currency === 'TRY' ? '₺' : scenario.currency === 'USD' ? '$' : '€'}</span><input aria-label={locale === 'tr' ? 'Bütçe' : 'Budget'} type="number" min="0" step="any" value={scenario.budget} required onChange={(event) => { const budget = Number(event.target.value); if (Number.isFinite(budget)) patch({ budget: Math.max(0, budget) }) }} /></div></label><p className="field-note">{marketTaxDisclosure(scenario.market, locale)}</p></fieldset>
}

function WorkloadStep({ scenario, locale, setWorkload, setPriority }: { scenario: LabScenario; locale: 'tr' | 'en'; setWorkload: (kind: Workload, value: boolean) => void; setPriority: (kind: Workload, value: number) => void }) {
  return <fieldset><legend>{locale === 'tr' ? 'Neyi yerelde çalıştıracaksınız?' : 'What will you run locally?'}</legend><div className="workload-list">{(Object.keys(workloadCopy) as Workload[]).map((kind) => { const selected = scenario.workloads.find((item) => item.kind === kind); return <div className={`workload-row${selected ? ' selected' : ''}`} key={kind}><ToggleRow checked={Boolean(selected)} onChange={(value) => setWorkload(kind, value)} title={workloadCopy[kind][locale]} detail={kind.toUpperCase()} />{selected ? <label className="priority"><span>{locale === 'tr' ? 'Öncelik' : 'Priority'}: {selected.priority}/5</span><input aria-label={`${workloadCopy[kind][locale]} ${locale === 'tr' ? 'önceliği' : 'priority'}`} type="range" min="1" max="5" value={selected.priority} onChange={(event) => setPriority(kind, Number(event.target.value))} /></label> : null}</div>})}</div></fieldset>
}

function ConstraintStep({ scenario, locale, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; patch: (value: Partial<LabScenario>) => void }) {
  const update = (value: Partial<LabScenario['constraints']>) => patch({ constraints: { ...scenario.constraints, ...value } })
  return <fieldset><legend>{locale === 'tr' ? 'Yerel çalışma sınırları' : 'Local operating boundaries'}</legend><div className="choice-list"><ToggleRow checked={scenario.constraints.offlineRequired} onChange={(value) => update({ offlineRequired: value })} title={locale === 'tr' ? 'İnternet olmadan çalışmalı' : 'Must work without internet'} detail={locale === 'tr' ? 'Model ve çalıştırma ortamı kurulduktan sonra' : 'After model and runtime installation'} /><ToggleRow checked={scenario.constraints.compactOnly} onChange={(value) => update({ compactOnly: value })} title={locale === 'tr' ? 'Yalnızca kompakt cihazlar' : 'Compact devices only'} detail={locale === 'tr' ? 'AI küpü, mini PC ve Mac' : 'AI cube, mini PC, and Mac'} /></div><label className="field"><span>{locale === 'tr' ? 'Gürültü tercihi' : 'Noise preference'}</span><select aria-label={locale === 'tr' ? 'Gürültü tercihi' : 'Noise preference'} value={scenario.constraints.noise} onChange={(event) => update({ noise: event.target.value as LabScenario['constraints']['noise'] })}><option value="silent">{locale === 'tr' ? 'Sessiz' : 'Silent'}</option><option value="quiet">{locale === 'tr' ? 'Düşük gürültü' : 'Quiet'}</option><option value="balanced">{locale === 'tr' ? 'Dengeli' : 'Balanced'}</option></select></label><label className="field"><span>{locale === 'tr' ? 'Düğüm başına azami güç (isteğe bağlı)' : 'Maximum power per node (optional)'}</span><input type="number" min="1" step="any" placeholder="W" value={scenario.constraints.maxPowerW ?? ''} onChange={(event) => update({ maxPowerW: event.target.value ? Number(event.target.value) : null })} /></label></fieldset>
}

function OwnedStep({ scenario, locale, choices, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; choices: typeof catalog.devices; patch: (value: Partial<LabScenario>) => void }) {
  function setOwned(id: string, checked: boolean) { patch({ ownedDeviceIds: checked ? [...scenario.ownedDeviceIds, id] : scenario.ownedDeviceIds.filter((item) => item !== id) }) }
  return <fieldset><legend>{locale === 'tr' ? 'Zaten sahip olduğunuz cihazlar' : 'Equipment you already own'}</legend><p className="field-note">{locale === 'tr' ? 'Seçilen cihaz kendi ekosistem yuvasını ₺0 / $0 / €0 ek maliyetle doldurur.' : 'A selected device fills its ecosystem slot at zero additional acquisition cost.'}</p><div className="choice-list">{choices.map((device) => <ToggleRow key={device.id} checked={scenario.ownedDeviceIds.includes(device.id)} onChange={(value) => setOwned(device.id, value)} title={formatTerm(device.name, locale)} detail={`${device.memory.totalGiB} GB · ${device.ecosystem.toUpperCase()}`} />)}</div></fieldset>
}

function InfrastructureStep({ scenario, locale, patch }: { scenario: LabScenario; locale: 'tr' | 'en'; patch: (value: Partial<LabScenario>) => void }) {
  const update = (value: Partial<LabScenario['infrastructure']>) => patch({ infrastructure: { ...scenario.infrastructure, ...value } })
  return <fieldset><legend>{locale === 'tr' ? 'Laboratuvarın hazır olduğu altyapı' : 'Infrastructure available to the lab'}</legend><div className="choice-list"><ToggleRow checked={scenario.infrastructure.tenGigabitEthernet} onChange={(value) => update({ tenGigabitEthernet: value })} title="10GbE" detail={locale === 'tr' ? 'Model paketi ve veri aktarımı' : 'Model, artifact, and data transfer'} /><ToggleRow checked={scenario.infrastructure.nas} onChange={(value) => update({ nas: value })} title="NAS" detail={locale === 'tr' ? 'Ortak model deposu' : 'Shared model storage'} /><ToggleRow checked={scenario.infrastructure.ups} onChange={(value) => update({ ups: value })} title="UPS" detail={locale === 'tr' ? 'Üç düğüm için kesintisiz güç' : 'Protected power for three nodes'} /></div></fieldset>
}

function ScenarioSummary({ scenario, locale }: { scenario: LabScenario; locale: 'tr' | 'en' }) {
  return <aside className="scenario-summary"><p className="eyebrow">{locale === 'tr' ? 'Canlı senaryo' : 'Live scenario'}</p><strong className="scenario-summary__budget">{formatMoney(scenario.budget, scenario.currency, locale)}</strong><dl><div><dt>{locale === 'tr' ? 'Pazar' : 'Market'}</dt><dd>{formatMarketName(scenario.market, locale)}</dd></div><div><dt>{locale === 'tr' ? 'İş yükü' : 'Workloads'}</dt><dd>{scenario.workloads.length}</dd></div><div><dt>{locale === 'tr' ? 'Mevcut düğüm' : 'Owned nodes'}</dt><dd>{scenario.ownedDeviceIds.length}</dd></div><div><dt>{locale === 'tr' ? 'Ağ' : 'Network'}</dt><dd>{scenario.infrastructure.tenGigabitEthernet ? '10GbE' : '1/2.5GbE'}</dd></div></dl></aside>
}

interface ResultViewProps {
  scenario: LabScenario
  result: LabPackage
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
  const matchedWorkloads = new Set(result.slots.flatMap((slot) => eligibleModelMatches(slot.deviceId, scenario, catalog)
    .flatMap((edge) => catalog.models.find((model) => model.id === edge.modelId)?.modalities ?? [])))
  const missingWorkloads = scenario.workloads.filter((workload) => !matchedWorkloads.has(workload.kind))
  return <section className="results">
    <header className="result-header">
      <div>
        <p className="eyebrow">LCL / {result.status === 'complete' ? (locale === 'tr' ? 'Bütçe içinde' : 'Within budget') : (locale === 'tr' ? 'Fazlı alım' : 'Phased purchase')}</p>
        <h1>{locale === 'tr' ? 'Üç ekosistemli laboratuvarınız' : 'Your three-ecosystem lab'}</h1>
        <p className="lede">{locale === 'tr' ? `Gözlenen fiyatlarla tahmini edinme maliyeti ${formatMoney(result.totalCost, scenario.currency, locale)}.` : `Estimated acquisition cost at observed prices is ${formatMoney(result.totalCost, scenario.currency, locale)}.`}</p>
      </div>
      <div className="result-header__actions">
        <button className="button button--quiet" type="button" onClick={restart}><RotateCcw aria-hidden="true" /> {locale === 'tr' ? 'Senaryoyu düzenle' : 'Edit scenario'}</button>
        <button className="button button--quiet" type="button" onClick={copyScenario}><Copy aria-hidden="true" /> {copied ? (locale === 'tr' ? 'Kopyalandı' : 'Copied') : (locale === 'tr' ? 'Paylaşım URL’si' : 'Share URL')}</button>
        <button className="button button--quiet" type="button" onClick={togglePersistence}><Save aria-hidden="true" /> {persisted ? (locale === 'tr' ? 'Tarayıcı kaydını sil' : 'Remove browser save') : (locale === 'tr' ? 'Bu senaryoyu tarayıcıda sakla' : 'Save this scenario in browser')}</button>
      </div>
    </header>
    <p className="policy-note">{locale === 'tr' ? 'Bütçe durumu yalnızca cihaz fiyatlarını kapsar; stok, güncel fiyat, kargo, altyapı ve ek vergiler satın alma öncesi kontrol edilmelidir. Uygunluk puanları ölçülmüş performans değildir.' : 'Budget status covers device prices only; verify stock, current prices, shipping, infrastructure, and additional taxes before purchase. Fit scores are not measured performance.'}</p>
    {missingWorkloads.length ? <p className="policy-note" role="status">{locale === 'tr' ? 'Bu pakette uygun model eşleşmesi bulunmayan iş yükleri: ' : 'Workloads without an eligible model match in this package: '}{missingWorkloads.map((item) => workloadCopy[item.kind][locale]).join(', ')}</p> : null}
    {result.status === 'phased' ? <div className="budget-warning"><strong>{locale === 'tr' ? `Bütçe farkı: ${formatMoney(result.budgetGap, scenario.currency, locale)}` : `Budget gap: ${formatMoney(result.budgetGap, scenario.currency, locale)}`}</strong><span>{locale === 'tr' ? 'Zayıf bir paket uydurulmadı; tam hedef aşağıda fazlara ayrıldı.' : 'No weak package was invented; the full target is phased below.'}</span></div> : null}
    <div className="ecosystem-tabs" role="tablist" aria-label={locale === 'tr' ? 'Ekosistem sonuçları' : 'Ecosystem results'}>{(['nvidia', 'amd', 'apple'] as const).map((ecosystem) => <button key={ecosystem} id={`tab-${ecosystem}`} role="tab" aria-controls={`panel-${ecosystem}`} tabIndex={active === ecosystem ? 0 : -1} aria-selected={active === ecosystem} onKeyDown={(event) => { const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!keys.includes(event.key)) return; event.preventDefault(); const items: Ecosystem[] = ['nvidia', 'amd', 'apple']; const index = items.indexOf(ecosystem); const next = items[event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3]; setActive(next); document.getElementById(`tab-${next}`)?.focus() }} onClick={() => setActive(ecosystem)}>{ecosystem.toUpperCase()}</button>)}</div>
    <div className="result-grid">{result.slots.map((slot) => {
      const device = catalog.devices.find((item) => item.id === slot.deviceId)!
      const price = recommendationPrice(slot.deviceId, scenario, catalog)
      const edges = eligibleModelMatches(device.id, scenario, catalog)
      const evidence = catalog.evidence.filter((claim) => claim.subjectId === device.id && claim.status === 'current' && claim.confidence === 'high')
      const alternative = catalog.devices.find((item) => item.ecosystem === slot.ecosystem && item.id !== device.id && !deviceExclusions(item, scenario, catalog).length)
      const modalities = [...new Set(edges.flatMap((edge) => catalog.models.find((model) => model.id === edge.modelId)?.modalities ?? []))]
      return <article key={slot.ecosystem} id={`panel-${slot.ecosystem}`} aria-label={slot.ecosystem.toUpperCase()} className={`result-node result-node--${slot.ecosystem}${active === slot.ecosystem ? ' active' : ''}`}>
        <p className="eyebrow">{slot.ecosystem.toUpperCase()} / {slot.owned ? (locale === 'tr' ? 'MEVCUT' : 'OWNED') : (locale === 'tr' ? 'DÜĞÜM' : 'NODE')}</p>
        <h2>{slot.ecosystem === 'nvidia' ? 'NVIDIA · ' : slot.ecosystem === 'amd' ? 'AMD · ' : 'Apple · '}{formatTerm(device.name, locale)}</h2>
        <p className="result-node__price">{slot.owned ? (locale === 'tr' ? 'Ek maliyet yok' : 'No added cost') : formatMoney(slot.acquisitionCost, scenario.currency, locale)}</p>
        <dl className="node-metrics"><div><dt>{locale === 'tr' ? 'Bellek' : 'Memory'}</dt><dd>{device.memory.totalGiB} GB</dd></div><div><dt>{locale === 'tr' ? 'Güvenli sınır' : 'Safe boundary'}</dt><dd>{device.memory.usableGiB ?? device.memory.totalGiB * .8} GB</dd></div><div><dt>{locale === 'tr' ? 'Uygunluk puanı' : 'Fit score'}</dt><dd>{slot.fitScore}/100</dd></div><div><dt>{locale === 'tr' ? 'Kanıt' : 'Evidence'}</dt><dd>{evidence.length ? (locale === 'tr' ? 'Yüksek' : 'High') : (locale === 'tr' ? 'Sınırlı' : 'Limited')}</dd></div></dl>
        <div className="meter" aria-label={`${slot.fitScore}/100`}><span style={{ width: `${slot.fitScore}%` }} /></div>
        <h3>{locale === 'tr' ? 'Uygun model sınıfları' : 'Eligible model classes'}</h3><p>{modalities.length ? modalities.map((item) => formatTerm(item, locale)).join(' · ') : (locale === 'tr' ? 'Doğrulanmış eşleşme yok' : 'No evidenced match')}</p>
        <h3>{locale === 'tr' ? 'Alternatif' : 'Alternative'}</h3><p>{alternative ? formatTerm(alternative.name, locale) : (locale === 'tr' ? 'Bu pazarda ikinci fiyat gözlemi yok' : 'No second market observation')}</p>
        {price && !slot.owned ? <><small className="result-node__price-status">{formatTerm(price.status, locale)} · {formatDate(price.observedAt, locale)} · {formatTerm(price.stock, locale)} · {formatTerm(price.taxBasis, locale)}</small><a className="text-link" href={price.sourceUrl} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Fiyat kaynağı ↗' : 'Price source ↗'}</a></> : null}
      </article>
    })}</div>
    {result.status === 'phased' ? <section className="phase-plan"><p className="eyebrow">{locale === 'tr' ? 'Bütçe sınırı' : 'Budget boundary'}</p><h2>{locale === 'tr' ? 'Fazlı alım planı' : 'Phased purchase plan'}</h2><ol>{result.phases.map((phase) => { const device = catalog.devices.find((item) => item.id === phase.deviceId)!; return <li key={phase.deviceId}><span>0{phase.order}</span><strong>{formatTerm(device.name, locale)}</strong><em>{phase.acquisitionCost === 0 ? (locale === 'tr' ? 'Mevcut' : 'Owned') : formatMoney(phase.acquisitionCost, scenario.currency, locale)}</em></li>})}</ol></section> : null}
  </section>
}
