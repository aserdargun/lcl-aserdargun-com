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

// Public identities mirror the root portfolio's data/living-system.json.
export const horizonNodes: readonly HorizonNode[] = [
  {
    "id": "llm",
    "prefix": "llm",
    "title": {
      "en": "LLM Runtime & Serving Atlas",
      "tr": "LLM Runtime & Serving Atlas"
    },
    "blurb": {
      "en": "A source-backed field guide to LLM runtimes and serving engines across seven architectural layers, with an interactive learning layer.",
      "tr": "LLM çalıştırma ortamlarını ve sunma motorlarını yedi mimari katmanda sınıflandıran, etkileşimli öğrenme katmanına sahip kaynaklı alan rehberi."
    },
    "url": "https://llm.aserdargun.com/"
  },
  {
    "id": "gpu",
    "prefix": "gpu",
    "title": {
      "en": "GPU Kernel Engineering — Kernel Atlas",
      "tr": "GPU Kernel Engineering — Kernel Atlas"
    },
    "blurb": {
      "en": "A bilingual 12-week interactive atlas for CUDA, Triton, GPU memory, LLM operators, correctness, profiling, inference, and multi-GPU systems.",
      "tr": "CUDA, Triton, GPU belleği, LLM işleçleri, doğruluk, profil çıkarma, çıkarım ve çoklu GPU sistemleri için iki dilli, etkileşimli 12 haftalık atlas."
    },
    "url": "https://gpu.aserdargun.com/"
  },
  {
    "id": "aia",
    "prefix": "aia",
    "title": {
      "en": "AI Ecosystem Atlas",
      "tr": "AI Ecosystem Atlas"
    },
    "blurb": {
      "en": "An evidence-backed research console for comparing AI products and developer ecosystems.",
      "tr": "Yapay zekâ ürünlerini ve geliştirici ekosistemlerini kanıtlarıyla karşılaştıran araştırma konsolu."
    },
    "url": "https://aia.aserdargun.com/"
  },
  {
    "id": "cld",
    "prefix": "cld",
    "title": {
      "en": "Cloud Provider Cost Comparison",
      "tr": "Bulut Sağlayıcı Maliyet Karşılaştırması"
    },
    "blurb": {
      "en": "A source-backed decision tool comparing pre-tax USD costs for cloud services available from Türkiye.",
      "tr": "Türkiye’den erişilebilen bulut servislerini kaynaklı, vergiler hariç USD maliyetleriyle karşılaştıran karar destek aracı."
    },
    "url": "https://cld.aserdargun.com/"
  },
  {
    "id": "usl",
    "prefix": "usl",
    "title": {
      "en": "Unsloth Studio Learning Atlas",
      "tr": "Unsloth Studio Learning Atlas"
    },
    "blurb": {
      "en": "A bilingual, evidence-aware learning atlas for Unsloth Studio, LoRA, QLoRA, dataset engineering, evaluation, and local model deployment.",
      "tr": "Unsloth Studio, LoRA, QLoRA, veri seti mühendisliği, değerlendirme ve yerel model dağıtımı için iki dilli, kanıt duyarlı öğrenme atlası."
    },
    "url": "https://usl.aserdargun.com/"
  },
  {
    "id": "hns",
    "prefix": "hns",
    "title": {
      "en": "Harness Engineering Observatory",
      "tr": "Harness Engineering Observatory"
    },
    "blurb": {
      "en": "A bilingual, source-backed observatory for comparing the harnesses, runtimes, orchestration, execution, verification, and observability layers that turn model capability into reliable agent systems.",
      "tr": "Model yeteneğini güvenilir ajan sistemlerine dönüştüren harness, çalıştırma, orkestrasyon, yürütme, doğrulama ve gözlemlenebilirlik katmanlarını karşılaştıran iki dilli, kaynaklı gözlemevi."
    },
    "url": "https://hns.aserdargun.com/"
  }
]
