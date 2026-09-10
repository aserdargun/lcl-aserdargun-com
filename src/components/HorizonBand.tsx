import { ArrowUpRight } from 'lucide-react'
import { horizonNodes } from '@/data/horizon'
import { useLocale } from '@/i18n/locale'

const copy = {
  tr: {
    eyebrow: 'The horizon / aserdargun ailesi',
    title: 'Karar dosyasının ötesinde ne var?',
    description:
      'LCL, bir karar dosyasıdır. Kanıtı, modeli veya karşılaştırmayı başka bir yüzeyde arıyorsan aşağıdaki kardeş projelere geç.',
    link: 'Projeye git',
  },
  en: {
    eyebrow: 'The horizon / the aserdargun family',
    title: 'What sits beyond the decision file?',
    description:
      'LCL is a decision file. If you are looking for the evidence, the model, or the comparison on a different surface, hop to the sibling projects below.',
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
