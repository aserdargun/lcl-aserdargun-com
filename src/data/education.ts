export type LearnDifficulty = 'intro' | 'core' | 'advanced'

export interface LearnConcept {
  /** Stable lowercase kebab-case id. */
  id: string
  /** Category id (matches an entry in `learnCategories`). */
  category: 'foundations' | 'hardware' | 'runtime' | 'fit-score' | 'evidence'
  /** Reading difficulty. */
  difficulty: LearnDifficulty
  /** Short headline, locale-aware. */
  term: { tr: string; en: string }
  /** Two-to-four sentence definition, locale-aware. */
  definition: { tr: string; en: string }
  /** Concrete example or contrast, locale-aware. */
  example: { tr: string; en: string }
  /** Why this concept matters inside LCL's Workbench. */
  whyItMatters: { tr: string; en: string }
}

export interface LearnCategory {
  id: LearnConcept['category']
  order: number
  title: { tr: string; en: string }
  description: { tr: string; en: string }
}

export const learnCategories: readonly LearnCategory[] = [
  {
    id: 'foundations',
    order: 1,
    title: { tr: '01 — Temel kavramlar', en: '01 — Foundations' },
    description: {
      tr: 'Açık ağırlık modeli, artefakt, çalışma anı ve bellek sınırı: Workbench’in konuştuğu dil.',
      en: 'Open weights, artifacts, runtime, and the memory frontier: the language the Workbench speaks.',
    },
  },
  {
    id: 'hardware',
    order: 2,
    title: { tr: '02 — Donanım', en: '02 — Hardware' },
    description: {
      tr: 'AI cube, mini PC, Mac mini, Mac Studio ve masaüstü referansları; bellek, bant genişliği, güç ve gürültü ekseninde.',
      en: 'AI cubes, mini PCs, Mac mini, Mac Studio, and desktop references; on memory, bandwidth, power, and noise axes.',
    },
  },
  {
    id: 'runtime',
    order: 3,
    title: { tr: '03 — Çalışma zamanı', en: '03 — Runtime' },
    description: {
      tr: 'CUDA, ROCm, MLX, llama.cpp, Ollama, vLLM; artefakt formatları, lisans ve çevrimdışı koşullar.',
      en: 'CUDA, ROCm, MLX, llama.cpp, Ollama, vLLM; artifact formats, licenses, and offline conditions.',
    },
  },
  {
    id: 'fit-score',
    order: 4,
    title: { tr: '04 — Fit puanı ve Workbench', en: '04 — Fit score and Workbench' },
    description: {
      tr: '40 / 25 / 20 / 10 / 5 ağırlıkları, beş adımlı senaryo, paylaşım URL’si ve bütçe aşımı.',
      en: 'The 40 / 25 / 20 / 10 / 5 weights, the five-step scenario, the share URL, and budget overrun.',
    },
  },
  {
    id: 'evidence',
    order: 5,
    title: { tr: '05 — Kanıt ve snapshot', en: '05 — Evidence and snapshot' },
    description: {
      tr: 'verified / fits / constrained / unsupported / unknown, fail-closed snapshot, %35 kuralı ve değişiklik defteri.',
      en: 'verified / fits / constrained / unsupported / unknown, fail-closed snapshots, the 35% rule, and the change ledger.',
    },
  },
]

export const learnConcepts: readonly LearnConcept[] = [
  // foundations
  {
    id: 'open-weight',
    category: 'foundations',
    difficulty: 'intro',
    term: { tr: 'Açık ağırlık', en: 'Open weight' },
    definition: {
      tr: 'Modelin eğitilmiş ağırlıklarının herkesin indirebileceği şekilde yayımlandığı yapıt. LCL yalnızca bu kategorideki artefaktları önerir.',
      en: 'A release where the trained model weights are published for anyone to download. LCL only recommends artifacts in this category.',
    },
    example: {
      tr: 'Qwen3, gpt-oss, Gemma, DeepSeek; Apple MLX veya safetensors formatlarında yayımlanır.',
      en: 'Qwen3, gpt-oss, Gemma, and DeepSeek ship in Apple MLX or safetensors formats.',
    },
    whyItMatters: {
      tr: '“Yerel” kararı açık ağırlık olmadan mümkün değildir. LCL yalnızca açık artefaktları önerir.',
      en: 'No “local” decision is possible without open weights. LCL recommends only open artifacts.',
    },
  },
  {
    id: 'artifact',
    category: 'foundations',
    difficulty: 'intro',
    term: { tr: 'Artefakt', en: 'Artifact' },
    definition: {
      tr: 'Modelin tek bir indirilebilir paketi: dosya, SHA-256, format, quantization, boyut. Bir modelin birden fazla artefaktı olabilir.',
      en: 'A single downloadable bundle: file, SHA-256, format, quantization, size. A model can have many artifacts.',
    },
    example: {
      tr: 'gpt-oss-120b’nin BF16 safetensors (~60 GiB) ile MXFP4 (~63 GiB) sürümü iki ayrı artefakttır.',
      en: 'gpt-oss-120b ships as BF16 safetensors (~60 GiB) and MXFP4 (~63 GiB) — two artifacts.',
    },
    whyItMatters: {
      tr: 'Bellek hesabı artefakt boyutundan başlar. Yanlış artefakt seçimi “sığıyor” görünmesine yol açabilir.',
      en: 'Memory math starts from artifact size. Picking the wrong artifact can make a workload look like it “fits.”',
    },
  },
  {
    id: 'quantization',
    category: 'foundations',
    difficulty: 'core',
    term: { tr: 'Kuantizasyon', en: 'Quantization' },
    definition: {
      tr: 'Ağırlıkları daha az bit ile ifade etme. Dosya boyutunu ve bellek gereksinimini düşürür; doğruluk kaybı artefaktın kendisine bağlıdır.',
      en: 'Storing weights in fewer bits. Reduces file size and memory use; the accuracy trade-off is artifact-specific.',
    },
    example: {
      tr: 'Q4_K_M orta denge; Q8_0 doğruluğa yakın; FP16/BF16 tam keskinlik. Apple MLX’te 4-bit ve 8-bit ayrı artefaktlardır.',
      en: 'Q4_K_M is a middle ground; Q8_0 stays close to full precision; FP16/BF16 keep full sharpness. MLX uses 4-bit and 8-bit as separate artifacts.',
    },
    whyItMatters: {
      tr: '“Aynı model, farklı quant, farklı cihaz” demektir. Workbench bellek sınırını artefakt düzeyinde hesaplar.',
      en: '“Same model, different quant, different device.” The Workbench counts memory at the artifact level.',
    },
  },
  {
    id: 'kv-cache',
    category: 'foundations',
    difficulty: 'core',
    term: { tr: 'KV cache', en: 'KV cache' },
    definition: {
      tr: 'Önceki token’ların anahtar/değer tensörleri. Bağlam penceresi büyüdükçe ve eşzamanlılık arttıkça bellek tüketimi doğrusal olarak büyür.',
      en: 'Key/value tensors of past tokens. As the context window and concurrency grow, memory use grows linearly.',
    },
    example: {
      tr: '128K bağlamda 4 eşzamanlılık, 7B bir modelde ağırlıklardan daha fazla bellek tüketebilir.',
      en: 'At 128K context with concurrency 4, a 7B model can use more memory for KV than for the weights.',
    },
    whyItMatters: {
      tr: '“Belleğe sığar” ifadesi yalnızca ağırlıklar için değil, bağlam ve eşzamanlılık çarpımı içindir.',
      en: '“Fits in memory” is a product of weights, context, and concurrency — not weights alone.',
    },
  },
  {
    id: 'safe-boundary',
    category: 'foundations',
    difficulty: 'core',
    term: { tr: 'Güvenli sınır', en: 'Safe boundary' },
    definition: {
      tr: 'Çalışma anı + işletim sistemi yükü düşüldükten sonra kalan ve modele verilebilecek bellek miktarı.',
      en: 'What is left for the model after the runtime and operating system reserve their share.',
    },
    example: {
      tr: '128 GB Mac Studio için ölçülmemişse belleğin %80’i (≈ 102 GB) kullanılır.',
      en: 'For a 128 GB Mac Studio with no measurement, LCL uses 80% of memory (≈ 102 GB).',
    },
    whyItMatters: {
      tr: 'Workbench sığma kararını güvenli sınıra göre verir; toplam belleğe göre değil.',
      en: 'The Workbench decides “fits” against the safe boundary, not the headline memory number.',
    },
  },
  {
    id: 'runtime',
    category: 'foundations',
    difficulty: 'intro',
    term: { tr: 'Çalışma zamanı (runtime)', en: 'Runtime' },
    definition: {
      tr: 'Model artefaktını yükleyip inference yapan yazılım. CUDA, ROCm, Metal/MLX, llama.cpp, Ollama, vLLM hepsi birer runtime’dır.',
      en: 'The software that loads a model artifact and runs inference. CUDA, ROCm, Metal/MLX, llama.cpp, Ollama, and vLLM are all runtimes.',
    },
    example: {
      tr: 'Aynı GGUF artefaktı llama.cpp ve Ollama üzerinde farklı performans gösterebilir; hangisinin ölçüldüğü önemlidir.',
      en: 'The same GGUF can benchmark differently on llama.cpp vs. Ollama; the measurement context matters.',
    },
    whyItMatters: {
      tr: '“Cihazda çalışır” ifadesi runtime + sürüm ile birlikte doğrulanır; aksi belirtilmedikçe “unknown” kabul edilir.',
      en: '“Runs on this device” is only verified with a runtime and version; otherwise LCL treats it as unknown.',
    },
  },

  // hardware
  {
    id: 'ai-cube',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'AI cube', en: 'AI cube' },
    definition: {
      tr: 'Tek bir GPU + kompakt soğutma + küçük güç bütçesi ile tasarlanmış mini format yapay zeka düğümü. Genellikle NVIDIA tabanlıdır.',
      en: 'A compact-format node built around a single GPU with tight cooling and a small power budget. Usually NVIDIA-based.',
    },
    example: {
      tr: 'NVIDIA DGX Spark, Project DIGITS, Asus Ascent GX10.',
      en: 'NVIDIA DGX Spark, Project DIGITS, Asus Ascent GX10.',
    },
    whyItMatters: {
      tr: 'Kompakt kısıtı seçildiğinde AI cube aday olur; gürültü ve güç tercihiyle birlikte değerlendirilir.',
      en: 'When the user opts into compact-only, AI cubes become candidates — combined with the noise and power preferences.',
    },
  },
  {
    id: 'mini-pc',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Birleşik bellekli mini PC', en: 'Unified-memory mini PC' },
    definition: {
      tr: 'AMD Ryzen AI Max veya benzeri APU ile tek bir bellek havuzundan CPU ve GPU’nun yararlandığı kompakt form.',
      en: 'A compact machine built around an AMD Ryzen AI Max (or similar) APU where CPU and GPU share one memory pool.',
    },
    example: {
      tr: 'Framework Desktop, Minisforum AI series, HP Z2 Mini G1a.',
      en: 'Framework Desktop, Minisforum AI series, HP Z2 Mini G1a.',
    },
    whyItMatters: {
      tr: '128 GB birleşik bellek tek bir artefakt için ayrılabilir; “bütçe dostu” paketlerde AMD yuvasını doldurur.',
      en: 'A unified 128 GB pool can be reserved for one artifact; this is what fills the AMD slot in budget-friendly packages.',
    },
  },
  {
    id: 'mac-studio',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Mac Studio (Apple)', en: 'Mac Studio (Apple)' },
    definition: {
      tr: 'M3 / M4 / M5 Max ve Ultra çiplerinde 64–512 GB birleşik bellek sunan sessiz masaüstü düğümü. MLX ve llama.cpp ile çalışır.',
      en: 'A quiet desktop node on M3 / M4 / M5 Max and Ultra chips with 64–512 GB unified memory. Runs MLX and llama.cpp.',
    },
    example: {
      tr: 'Mac Studio M5 Ultra 512 GB, bütçe sınırı aşıldığında “phased” plana alınır; mevcutsa ₺0 ek maliyetle paketi tamamlar.',
      en: 'The 512 GB Mac Studio M5 Ultra is the “phased” plan when the budget is tight; if owned, it completes the package at zero added cost.',
    },
    whyItMatters: {
      tr: 'Apple yuvasının varsayılan adayıdır. Birleşik bellek hesabı farklı çalışır; “safe boundary” daha yüksektir.',
      en: 'Default candidate for the Apple slot. Unified memory changes the math — the safe boundary is higher.',
    },
  },
  {
    id: 'unified-memory',
    category: 'hardware',
    difficulty: 'core',
    term: { tr: 'Birleşik bellek', en: 'Unified memory' },
    definition: {
      tr: 'CPU ve GPU’nun aynı fiziksel belleği paylaşması. macOS / Apple Silicon ve bazı AMD APU’larda görülür.',
      en: 'CPU and GPU sharing the same physical memory. Found on Apple Silicon and some AMD APUs.',
    },
    example: {
      tr: 'Mac Studio M5 Ultra 512 GB: 512 GB tek havuz; bant genişliği GB/s cinsinden modele bağlı.',
      en: 'Mac Studio M5 Ultra 512 GB: a single 512 GB pool; bandwidth in GB/s depends on the chip.',
    },
    whyItMatters: {
      tr: '“Aynı cihazda başka uygulamalar” senaryosunda sınırı düşürür; LCL bu yüzden güvenli sınırı ölçüldüyse kullanır.',
      en: 'In “other apps on the same device” scenarios, the effective pool shrinks; LCL uses the safe boundary if it has been measured.',
    },
  },
  {
    id: 'bandwidth',
    category: 'hardware',
    difficulty: 'advanced',
    term: { tr: 'Bellek bant genişliği', en: 'Memory bandwidth' },
    definition: {
      tr: 'Bir saniye içinde belleğe/ bellekten taşınabilecek veri miktarı (GB/s). Token üretim hızını büyük ölçüde belirler.',
      en: 'How many GB/s can move between the accelerator and memory (GB/s). Drives token throughput on most local runs.',
    },
    example: {
      tr: 'RTX 5090 ~1.8 TB/s, Mac Studio M5 Ultra ~800 GB/s, Ryzen AI Max 395 ~150 GB/s; bu, aynı modelde tok/s farkını açıklar.',
      en: 'RTX 5090 ~1.8 TB/s, Mac Studio M5 Ultra ~800 GB/s, Ryzen AI Max 395 ~150 GB/s; this is why the same model yields different tok/s.',
    },
    whyItMatters: {
      tr: 'Bant genişliği düşükse, büyük bir model “sığar” görünür ama tok/s düşer. Workbench bunu fit puanına yansıtır.',
      en: 'Low bandwidth can make a model “fit” while under-delivering on tok/s. The Workbench encodes this in the fit score.',
    },
  },
  {
    id: 'form-factor',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Form faktörü', en: 'Form factor' },
    definition: {
      tr: 'Cihazın fiziksel boyutu ve yerleşim biçimi: AI cube, mini PC, Mac mini, Mac Studio veya masaüstü referansı.',
      en: 'Physical size and placement: AI cube, mini PC, Mac mini, Mac Studio, or desktop reference.',
    },
    example: {
      tr: '“Kompakt cihaz” seçildiğinde masaüstü referansları elenir; bu, kütüphane ya da çalışma odası kısıtı içindir.',
      en: 'When the user opts into compact-only, desktop references are excluded — for library or studio constraints.',
    },
    whyItMatters: {
      tr: 'Kompakt seçim form faktörünü bir hard kısıt yapar; eleme erken yapılır, çünkü pahalı cihazlar uygun değildir.',
      en: 'Compact turns the form factor into a hard constraint; the filter is applied early because expensive devices would be a mismatch.',
    },
  },
  {
    id: 'noise-class',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Gürültü sınıfı', en: 'Noise class' },
    definition: {
      tr: 'Cihazın yük altında ürettiği ses profilinin sınıflandırması: silent, quiet, audible, unknown.',
      en: 'How loud the device gets under load: silent, quiet, audible, or unknown.',
    },
    example: {
      tr: 'Mac Studio sessizdir; AI cube soğutma profiliyle “quiet” olabilir; oyuncu GPU’su “audible” sayılır.',
      en: 'A Mac Studio is silent; an AI cube lands at “quiet” depending on cooling; a gaming GPU is “audible.”',
    },
    whyItMatters: {
      tr: '“Silent” seçildiğinde tüm audible cihazlar elenir; bu, ofis yanı veya yatak odası kısıtı içindir.',
      en: 'When the user picks silent, every audible device is dropped — for office-side or bedroom constraints.',
    },
  },
  {
    id: 'ten-gigabit-ethernet',
    category: 'hardware',
    difficulty: 'core',
    term: { tr: '10 GbE ve ortak depolama', en: '10 GbE and shared storage' },
    definition: {
      tr: '10 Gb/sn Ethernet, NAS ve UPS: model, artefakt ve veri aktarımı için laboratuvar altyapısı.',
      en: '10 Gb/s Ethernet, NAS, and UPS: the lab infrastructure for moving models, artifacts, and data.',
    },
    example: {
      tr: '70 GB’lık bir artefakt 1 GbE ile ~10 dakikada iner; 10 GbE ile ~1 dakikada. Tekrar indirme maliyeti burada düşer.',
      en: 'A 70 GB artifact over 1 GbE takes ~10 minutes; over 10 GbE, ~1 minute. Re-fetch cost drops accordingly.',
    },
    whyItMatters: {
      tr: 'Workbench altyapı adımı, hangi düğümün indirmenin darboğazı olacağını belirler; mevcut ekipmanla bütçeyi etkiler.',
      en: 'The infrastructure step decides which node is the download bottleneck; with existing equipment, it shifts the budget.',
    },
  },

  // runtime
  {
    id: 'safetensors',
    category: 'runtime',
    difficulty: 'intro',
    term: { tr: 'safetensors', en: 'safetensors' },
    definition: {
      tr: 'Pickle yerine geçen, belleğe doğrudan eşlenen güvenli tensör formatı. PyTorch ekibi tarafından geliştirildi.',
      en: 'A safe tensor format that replaces pickle and memory-maps directly. Developed by the PyTorch team.',
    },
    example: {
      tr: 'Hugging Face üzerinde çoğu yeni açık ağırlık artefaktı safetensors olarak yayımlanır.',
      en: 'Most new open-weight artifacts on Hugging Face ship as safetensors.',
    },
    whyItMatters: {
      tr: '“Güvenli” artefakt tercih edildiğinde varsayılan format. Remote code gerektirmez.',
      en: 'Default for “safe” artifact preference. Requires no remote code.',
    },
  },
  {
    id: 'gguf',
    category: 'runtime',
    difficulty: 'core',
    term: { tr: 'GGUF', en: 'GGUF' },
    definition: {
      tr: 'llama.cpp ekibinin tek-dosya, kuantize edilmiş model formatı. CPU + GPU hibrit çalıştırmayı kolaylaştırır.',
      en: 'llama.cpp’s single-file, quantized model format. Enables CPU + GPU hybrid inference.',
    },
    example: {
      tr: 'Q4_K_M ve Q8_0 quant’ları çoğunlukla GGUF olarak yayımlanır; Ollama doğrudan bu artefaktları kullanır.',
      en: 'Q4_K_M and Q8_0 quants usually ship as GGUF; Ollama consumes these artifacts directly.',
    },
    whyItMatters: {
      tr: '“Aynı artefakt CPU ve GPU arasında paylaşılsın” istendiğinde tercih edilir; tekrarlanabilir dönüşüm gerektirir.',
      en: 'Preferred when “same artifact shared across CPU and GPU” is needed; requires a reproducible conversion.',
    },
  },
  {
    id: 'mlx',
    category: 'runtime',
    difficulty: 'core',
    term: { tr: 'Apple MLX', en: 'Apple MLX' },
    definition: {
      tr: 'Apple’ın Apple Silicon için açık kaynak makine öğrenimi çatısı. Birleşik bellekle çalışır, Metal üzerinde hızlanır.',
      en: 'Apple’s open-source ML framework for Apple Silicon. Runs on unified memory, accelerates through Metal.',
    },
    example: {
      tr: 'Qwen3, gpt-oss ve Gemma MLX uyumlu artefaktları Hugging Face’te ayrı yayımlar.',
      en: 'Qwen3, gpt-oss, and Gemma publish MLX-compatible artifacts on Hugging Face.',
    },
    whyItMatters: {
      tr: 'Apple yuvasında varsayılan runtime seçimidir; tekrarlanabilir bir quant dönüşümüyle birlikte önerilir.',
      en: 'Default runtime choice in the Apple slot; recommended with a reproducible quant conversion.',
    },
  },
  {
    id: 'ollama',
    category: 'runtime',
    difficulty: 'intro',
    term: { tr: 'Ollama', en: 'Ollama' },
    definition: {
      tr: 'Yerel model çalıştırmayı kolaylaştıran, llama.cpp üzerine kurulu bir yönetim katmanı. Tek komutla model indirir ve çalıştırır.',
      en: 'A management layer over llama.cpp that makes local model serving simple. One command pulls and serves a model.',
    },
    example: {
      tr: '“ollama run qwen3:30b” komutu modeli indirip bir OpenAI uyumlu API ile servis eder.',
      en: '“ollama run qwen3:30b” downloads the model and serves it behind an OpenAI-compatible API.',
    },
    whyItMatters: {
      tr: 'Aynı GGUF artefaktı Ollama üzerinden servis edilebilir; performans ölçümlerinde runtime adıyla birlikte kayıt altına alınır.',
      en: 'The same GGUF can be served through Ollama; benchmark entries must record the runtime name.',
    },
  },
  {
    id: 'gated',
    category: 'runtime',
    difficulty: 'core',
    term: { tr: 'Gated erişim', en: 'Gated access' },
    definition: {
      tr: 'Modelin indirilmeden önce bir form, anlaşma veya e-posta onayı gerektirmesi. “Açık ağırlık” olmasını engellemez; “kullanım”ı koşula bağlar.',
      en: 'A model requiring a form, agreement, or email approval before download. It can still be open-weight; it gates usage.',
    },
    example: {
      tr: 'gpt-oss, Llama tabanlı yayınlar, bazı Med-Gemma artefaktları.',
      en: 'gpt-oss, Llama-based releases, and certain Med-Gemma artifacts.',
    },
    whyItMatters: {
      tr: '“Yerel laboratuvar” senaryosunda gated olması kullanıcının sorumluluğundadır; LCL artefaktı önerir ama onay adımını ayrı tutar.',
      en: 'In a “local lab” scenario, gated access is the user’s responsibility; LCL recommends the artifact and keeps the approval step separate.',
    },
  },

  // fit-score
  {
    id: 'fit-formula',
    category: 'fit-score',
    difficulty: 'core',
    term: { tr: 'Fit puanı formülü', en: 'Fit-score formula' },
    definition: {
      tr: 'İş yükü kapsamı %40 + bellek/context %25 + runtime/OS %20 + güç/gürültü/form %10 + kanıt güncelliği %5. Maksimum 100.',
      en: 'Workload coverage 40% + memory/context 25% + runtime/OS 20% + power/noise/form 10% + evidence freshness 5%. Max 100.',
    },
    example: {
      tr: 'Aynı artefakt, sessiz bir Mac Studio’da 88 olurken, gürültülü bir masaüstünde 75 olabilir.',
      en: 'The same artifact can score 88 on a quiet Mac Studio and 75 on a noisy desktop reference.',
    },
    whyItMatters: {
      tr: 'Tek sayı karşılaştırmayı kolaylaştırır; paylaşım URL’sine yazılır, böylece senaryo aynı puanla geri yüklenir.',
      en: 'A single number makes comparison easy; it is written into the share URL so the same score can be restored.',
    },
  },
  {
    id: 'scenario-url',
    category: 'fit-score',
    difficulty: 'core',
    term: { tr: 'Sürümlü senaryo URL’si', en: 'Versioned scenario URL' },
    definition: {
      tr: 'Workbench senaryosunu (pazar, bütçe, iş yükü, kısıtlar, altyapı) sürüm ve imza olarak URL’de taşıyan yapı.',
      en: 'A URL that carries the Workbench scenario (market, budget, workload, constraints, infrastructure) as version + signature.',
    },
    example: {
      tr: '/tr/build?v=1&market=TR&budget=500000&owned=nvidia-rtx-5090-reference gibi.',
      en: 'Like /tr/build?v=1&market=TR&budget=500000&owned=nvidia-rtx-5090-reference.',
    },
    whyItMatters: {
      tr: 'Bir karar dosyasının başkasıyla paylaşılabilir olması için temel gereksinimdir; her zaman geri yüklendiğinde aynı paketi üretir.',
      en: 'Foundational to making a decision file shareable; every restore yields the same package.',
    },
  },
  {
    id: 'phased-plan',
    category: 'fit-score',
    difficulty: 'advanced',
    term: { tr: 'Fazlı alım planı', en: 'Phased purchase plan' },
    definition: {
      tr: 'Bütçe üç ekosistemi de karşılamadığında “zayıf paket uydurma” yerine önerilen sıralı alım planı.',
      en: 'When the budget cannot cover all three ecosystems, this is the ordered acquisition plan that replaces “inventing a weak package.”',
    },
    example: {
      tr: 'Önce mevcut düğüm (0 ek maliyet), sonra en ucuz ekosistem, sonra en yüksek fit skorlu düğüm.',
      en: 'First the owned node (0 cost), then the cheapest ecosystem, then the highest-fit node.',
    },
    whyItMatters: {
      tr: '“Phased” durumu başarısızlık değildir; bütçe sınırı kabul edilir ve alım sırası şeffaftır.',
      en: 'A “phased” outcome is not a failure; the budget boundary is accepted and the order is transparent.',
    },
  },

  // evidence
  {
    id: 'verified-vs-fits',
    category: 'evidence',
    difficulty: 'core',
    term: { tr: 'verified vs. fits', en: 'verified vs. fits' },
    definition: {
      tr: 'verified tam cihaz + runtime + model + quant ölçümü demektir. fits yalnızca bellek ve runtime kanıtına dayanır.',
      en: 'verified means an exact device + runtime + model + quant measurement. fits relies on memory and runtime evidence only.',
    },
    example: {
      tr: 'RTX 5090 + Qwen3 30B BF16 ölçüldüyse “verified”; yalnızca bellek hesabı yapıldıysa “fits”.',
      en: 'RTX 5090 + Qwen3 30B BF16 measured → “verified”; only memory math → “fits.”',
    },
    whyItMatters: {
      tr: 'Workbench sonucu göstermeden önce durumun verified mı fits mi olduğunu açıkça yazar; karar dosyası denetlenebilir kalır.',
      en: 'The Workbench writes the status (verified vs. fits) before showing the package; the decision file stays auditable.',
    },
  },
  {
    id: 'fail-closed',
    category: 'evidence',
    difficulty: 'core',
    term: { tr: 'Fail-closed snapshot', en: 'Fail-closed snapshot' },
    definition: {
      tr: 'Şema, kaynak veya anomali kontrolü başarısız olduğunda aday veri yerine son sağlam snapshot’ın korunması.',
      en: 'When a schema, source, or anomaly check fails, the last-known-good snapshot survives and the candidate is not published.',
    },
    example: {
      tr: '%35 üzeri fiyat değişimi karantinaya gider; lisans veya hash değişimi inceleme durumuna düşer ve öneriden çıkar.',
      en: 'A >35% price move is quarantined; a license or hash change goes to review and leaves the recommendation set.',
    },
    whyItMatters: {
      tr: 'LCL’de “yayında” görünen her şey son doğrulamadan geçmiştir; karar dosyası yanlış fiyata dayanmaz.',
      en: 'Everything you see live in LCL has passed the last validation; the decision file is never built on a stale price.',
    },
  },
  {
    id: 'anomaly-guard',
    category: 'evidence',
    difficulty: 'advanced',
    term: { tr: '%35 anomali kuralı', en: 'The 35% rule' },
    definition: {
      tr: 'Önceki gözleme göre %35’ten fazla değişen fiyat veya teknik özellik otomatik olarak karantinaya alınır.',
      en: 'Any price or technical spec that moves more than 35% from the previous observation is auto-quarantined.',
    },
    example: {
      tr: 'Bir cihaz ₺300.000’dan ₺450.000’a çıktığında bu gözlem karantinaya alınır; manuel onay gerekir.',
      en: 'A device moving from ₺300,000 to ₺450,000 is quarantined and needs manual sign-off.',
    },
    whyItMatters: {
      tr: 'Yanlış, döviz dalgalı veya tek-örnek fiyatın paketi kirletmesini engeller.',
      en: 'Prevents a noisy, FX-volatile, or single-observation price from polluting the package.',
    },
  },
  {
    id: 'snapshot-id',
    category: 'evidence',
    difficulty: 'intro',
    term: { tr: 'Snapshot kimliği', en: 'Snapshot id' },
    definition: {
      tr: 'Her veri sürümünün SHA-256 özetinden türetilen, değişiklik günlüğünde görünen yayın kimliği.',
      en: 'The release identity derived from the SHA-256 digest of each data version, surfaced in the change ledger.',
    },
    example: {
      tr: 'lcl-2026-09-01-6404367009ad / Changes sayfasında görünür; “şu anki veri budur” diye okunmalıdır.',
      en: 'lcl-2026-09-01-6404367009ad appears on the Changes page and reads as “this is the current data.”',
    },
    whyItMatters: {
      tr: 'Paylaşılan karar dosyalarının hangi veri sürümüne dayandığını tek bir kimlikle belgelemek için kullanılır.',
      en: 'Used to record which data version a shared decision file was based on — one stable id.',
    },
  },
]

export const learnConceptIds = learnConcepts.map((concept) => concept.id)
