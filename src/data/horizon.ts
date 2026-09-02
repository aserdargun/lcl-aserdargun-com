export interface HorizonNode {
  /** Stable id used in testids and keys. Lowercase kebab-case. */
  id: string
  /** Brand prefix (used as the eyebrow tag). */
  prefix: string
  /** Display title, locale-aware. */
  title: { tr: string; en: string }
  /** One-sentence summary, locale-aware. */
  blurb: { tr: string; en: string }
  /** Public production URL. */
  url: string
}

/**
 * Sibling aserdargun apps shown in the LCL horizon strip. Each entry links
 * to a public production site (https://<id>.aserdargun.com). Order is
 * intentional: LCL is the family — most-adjacent siblings come first so
 * users move from decision to evidence without losing context.
 */
export const horizonNodes: readonly HorizonNode[] = [
  {
    id: 'llm',
    prefix: 'llm',
    title: { tr: 'LLM Runtime Atlas', en: 'LLM Runtime Atlas' },
    blurb: {
      tr: 'Açık ağırlık modelleri için runtime ve artefakt kanıt defteri.',
      en: 'Runtime and artifact ledger for open-weight models.',
    },
    url: 'https://llm.aserdargun.com/',
  },
  {
    id: 'gpu',
    prefix: 'gpu',
    title: { tr: 'GPU Karşılaştırma', en: 'GPU Comparison' },
    blurb: {
      tr: 'NVIDIA ve AMD ekran kartlarını fiyat, bellek ve form ekseninde karşılaştır.',
      en: 'Compare NVIDIA and AMD cards on price, memory, and form factor.',
    },
    url: 'https://gpu.aserdargun.com/',
  },
  {
    id: 'aia',
    prefix: 'aia',
    title: { tr: 'AI Ecosystem Atlas', en: 'AI Ecosystem Atlas' },
    blurb: {
      tr: 'Üretici, model ve ekosistemleri haritalayan kardeş atlas.',
      en: 'Sibling atlas mapping vendors, models, and ecosystems.',
    },
    url: 'https://aia.aserdargun.com/',
  },
  {
    id: 'cld',
    prefix: 'cld',
    title: { tr: 'Bulut Karşılaştırma', en: 'Cloud Comparison' },
    blurb: {
      tr: 'Türkiye’den erişilebilir bulut sağlayıcıları kaynak destekli karşılaştırma.',
      en: 'Source-backed cloud comparison for providers reachable from Türkiye.',
    },
    url: 'https://cld.aserdargun.com/',
  },
  {
    id: 'usl',
    prefix: 'usl',
    title: { tr: 'URL Shortener', en: 'URL Shortener' },
    blurb: {
      tr: 'Sürüm ve snapshot kimliği taşıyan kısa bağlantı hizmeti.',
      en: 'Short-link service that carries the version and snapshot id.',
    },
    url: 'https://usl.aserdargun.com/',
  },
  {
    id: 'hns',
    prefix: 'hns',
    title: { tr: 'Hands-on Notes', en: 'Hands-on Notes' },
    blurb: {
      tr: 'Saha notları, vaka çalışmaları ve uygulama günlükleri.',
      en: 'Field notes, case studies, and hands-on logs.',
    },
    url: 'https://hns.aserdargun.com/',
  },
]
