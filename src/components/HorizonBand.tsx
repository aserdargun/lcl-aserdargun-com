import { ArrowUpRight } from 'lucide-react'
import { horizonNodes } from '@/data/horizon'
import { useLocale } from '@/i18n/locale'

const copy = {
  tr: {
    eyebrow: 'aserdargun.com / Öğrenme sistemi',
    title: 'Yerel hesaplama kararını diğer laboratuvarlara bağla.',
    description:
      'CTX ve SEC ile bağlam ve güvenlik koşullarını incele. LCL ile yerel, CLD ile bulut seçeneklerini değerlendir; ortak laboratuvar DCL’de dağıtım varsayımlarını karşılaştır. WFM ve SWI, bu kararların ötesindeki iki paralel araştırma alanıdır. Bağlantılar senaryonu otomatik aktarmıyor.',
    link: 'Projeye git',
  },
  en: {
    eyebrow: 'aserdargun.com / Learning system',
    title: 'Connect local compute decisions to the other labs.',
    description:
      'Review context and security requirements with CTX and SEC. Explore local options in LCL and cloud options in CLD; compare deployment assumptions in their shared lab, DCL. WFM and SWI are two parallel research directions beyond these decisions. Links do not transfer your scenario automatically.',
    link: 'Open the project',
  },
} as const

export function HorizonBand() {
  const locale = useLocale()
  const text = copy[locale]
  return (
    <section className="horizon" aria-labelledby="horizon-title">
      <div className="shell">
      <header className="horizon__header">
        <p className="eyebrow">{text.eyebrow}</p>
        <h2 id="horizon-title">{text.title}</h2>
        <p>{text.description}</p>
        <a className="text-link" href={`https://aserdargun.com/${locale === 'tr' ? 'tr/' : ''}#learning`} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Öğrenme sisteminin tamamını aç ↗' : 'Open the full learning system ↗'}</a>
      </header>
      <div className="horizon__grid" role="list">
        {horizonNodes.map((node) => (
          <a key={node.id} className="horizon__node" href={node.url} target="_blank" rel="noreferrer" role="listitem">
            <span className="horizon__node-eyebrow">{node.prefix}</span>
            <strong className="horizon__node-title">{node.title[locale]}</strong>
            <span className="horizon__node-meta">{node.blurb[locale]}</span>
            <span className="horizon__node-link">
              {text.link} <ArrowUpRight aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
      </div>
    </section>
  )
}
