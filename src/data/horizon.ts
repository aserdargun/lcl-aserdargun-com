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
      "en": "A bilingual learning atlas with eight lessons, a 12-week roadmap, teaching labs and historical experiment evidence for LoRA/QLoRA, datasets, evaluation and local deployment. No live GPU or training; ADP extends adaptation practice with synthetic experiments.",
      "tr": "LoRA/QLoRA, veri setleri, değerlendirme ve yerel dağıtım için sekiz ders, 12 haftalık yol, öğretici laboratuvarlar ve geçmiş deney kanıtları sunan iki dilli atlas. Canlı GPU veya eğitim yoktur; ADP, uyarlama pratiğini sentetik deneylerle genişletir."
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
      "en": "A bilingual, source-backed observatory comparing seven agent-system layers: execution, tools, context, lifecycle, observability, verification, and governance. Evidence and editorial interpretation remain separate; no universal ranking.",
      "tr": "Çalıştırma, araçlar, bağlam, yaşam döngüsü, gözlemlenebilirlik, doğrulama ve yönetişimden oluşan yedi ajan sistemi katmanını karşılaştıran iki dilli, kaynaklı gözlemevi. Kanıt ve editoryal yorum ayrıdır; evrensel sıralama üretmez."
    },
    "url": "https://hns.aserdargun.com/"
  },
  {
    "id": "ctx",
    "prefix": "ctx",
    "title": {
      "en": "Context & Knowledge Engineering",
      "tr": "Bağlam ve Bilgi Mühendisliği"
    },
    "blurb": {
      "en": "A bilingual, source-backed field guide to the information system that runs before a model answers, from ingestion and retrieval through citation, caching, and memory.",
      "tr": "Model yanıtından önce çalışan bilgi sistemini alım ve erişimden alıntılama, önbellekleme ve belleğe kadar tasarlamaya yarayan iki dilli, kaynaklı alan rehberi."
    },
    "url": "https://ctx.aserdargun.com/"
  },
  {
    "id": "sec",
    "prefix": "sec",
    "title": {
      "en": "AI Systems Security Observatory",
      "tr": "AI Sistemleri Güvenlik Gözlemevi"
    },
    "blurb": {
      "en": "A bilingual, evidence-aware observatory for tracing AI-agent trust from model intent through identity, authorization, constrained action, audit, and incident recovery.",
      "tr": "Model niyetinden kimliğe, yetkilendirmeye, kısıtlı eyleme, denetime ve olay sonrası toparlanmaya kadar AI ajanlarına duyulan güveni izleyen iki dilli, kanıt duyarlı gözlemevi."
    },
    "url": "https://sec.aserdargun.com/"
  },
  {
    "id": "dcl",
    "prefix": "dcl",
    "title": {
      "en": "Deployment Choice Laboratory",
      "tr": "Dağıtım Karar Laboratuvarı"
    },
    "blurb": {
      "en": "The shared laboratory of CLD and LCL. Compare local hardware, cloud GPUs, managed inference and token APIs against workload, memory, privacy and cost assumptions. Hard constraints and educational estimates explain conditional choices; no live pricing or universal winner is claimed.",
      "tr": "CLD ve LCL’nin ortak laboratuvarı. Yerel donanım, bulut GPU, yönetilen çıkarım ve token API seçeneklerini iş yükü, bellek, gizlilik ve maliyet varsayımlarıyla karşılaştır. Kesin kısıtlar ve eğitim amaçlı tahminler koşullu kararları açıklar; canlı fiyat veya evrensel kazanan iddiası yoktur."
    },
    "url": "https://dcl.aserdargun.com/"
  },
  {
    "id": "wfm",
    "prefix": "wfm",
    "title": {
      "en": "World Models Atlas",
      "tr": "World Models Atlas"
    },
    "blurb": {
      "en": "A living research atlas tracing how world models connect perception, prediction, planning, and action through primary sources.",
      "tr": "Dünya modellerinin algı, tahmin, planlama ve eylem arasındaki rolünü birincil kaynaklar üzerinden izleyen yaşayan bir araştırma atlası."
    },
    "url": "https://wfm.aserdargun.com/"
  },
  {
    "id": "swi",
    "prefix": "swi",
    "title": {
      "en": "SWI — Swarm Intelligence",
      "tr": "SWI — Sürü Zekâsı"
    },
    "blurb": {
      "en": "A bilingual swarm-intelligence atlas with eight biology dossiers, 21 selected studies and eight static agent experiment templates. SWI observes and explains; ANT and BEE own the colony simulations. Recipes export Markdown/JSON without running agents; the agenda stays in the browser.",
      "tr": "Sekiz biyoloji dosyası, seçilmiş 21 çalışma ve sekiz statik ajan deney şablonu sunan iki dilli sürü zekâsı atlası. SWI gözlemler ve açıklar; koloni simülasyonları ANT ve BEE’ye aittir. Reçeteler ajan çalıştırmadan Markdown/JSON üretir; gündem tarayıcıda kalır."
    },
    "url": "https://swi.aserdargun.com/"
  }
]
