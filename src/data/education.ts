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
      tr: 'Açık ağırlıklı model, model paketi, çalıştırma ortamı ve bellek sınırı: Workbench’in konuştuğu dil.',
      en: 'Open weights, artifacts, runtime, and the memory frontier: the language the Workbench speaks.',
    },
  },
  {
    id: 'hardware',
    order: 2,
    title: { tr: '02 — Donanım', en: '02 — Hardware' },
    description: {
      tr: 'AI küpü, mini PC, Mac mini, Mac Studio ve masaüstü referansları; bellek, bant genişliği, güç ve gürültü ekseninde.',
      en: 'AI cubes, mini PCs, Mac mini, Mac Studio, and desktop references; on memory, bandwidth, power, and noise axes.',
    },
  },
  {
    id: 'runtime',
    order: 3,
    title: { tr: '03 — Çalıştırma ortamı', en: '03 — Runtime' },
    description: {
      tr: 'CUDA, ROCm, MLX, llama.cpp, Ollama, vLLM; model paketi biçimleri, lisans ve çevrimdışı koşullar.',
      en: 'CUDA, ROCm, MLX, llama.cpp, Ollama, vLLM; artifact formats, licenses, and offline conditions.',
    },
  },
  {
    id: 'fit-score',
    order: 4,
    title: { tr: '04 — Uygunluk puanı ve Workbench', en: '04 — Fit score and Workbench' },
    description: {
      tr: '40 / 25 / 20 / 10 / 5 ağırlıkları, beş adımlı senaryo, paylaşım URL’si ve bütçe aşımı.',
      en: 'The 40 / 25 / 20 / 10 / 5 weights, the five-step scenario, the share URL, and budget overrun.',
    },
  },
  {
    id: 'evidence',
    order: 5,
    title: { tr: '05 — Kanıt ve anlık görüntü', en: '05 — Evidence and snapshot' },
    description: {
      tr: 'Doğrulandı / Sığıyor / Kısıtlı / Desteklenmiyor / Bilinmiyor durumları, hata durumunda güvenli anlık görüntü, %35 kuralı ve değişiklik defteri.',
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
      tr: "Eğitilmiş ağırlıkların indirilebilir olduğu model yayını. Erişim onayı ve lisans koşulları ayrıca değerlendirilir; açık ağırlık, açık kaynak yazılımla aynı anlama gelmez.",
      en: "A model release with downloadable trained weights. Access approval and license terms must be assessed separately; open weights do not mean open-source software.",
    },
    example: {
      tr: "gpt-oss, kataloğun açık ağırlıklı model örneklerinden biridir. Model ailesi, dosya biçimi ve kuantizasyon ayrı özelliklerdir.",
      en: "gpt-oss is one open-weight model family in the catalog. Model family, file format, and quantization are separate properties.",
    },
    whyItMatters: {
      tr: "LCL, yerel çalışma için yayıncı paketlerini veya kaynağı ve dönüşümü tekrarlanabilen paketleri değerlendirir.",
      en: "LCL evaluates publisher artifacts or artifacts with reproducible source and conversion records for local operation.",
    },
  },
  {
    id: 'artifact',
    category: 'foundations',
    difficulty: 'intro',
    term: { tr: 'Model paketi', en: 'Artifact' },
    definition: {
      tr: 'Modelin tek bir indirilebilir paketi: dosya, SHA-256, biçim, kuantizasyon ve boyut. Bir modelin birden fazla paketi olabilir.',
      en: 'A single downloadable bundle: file, SHA-256, format, quantization, size. A model can have many artifacts.',
    },
    example: {
      tr: "Bu anlık görüntüde gpt-oss-120b MXFP4 paketi yaklaşık 60,8 GiB olarak kayıtlıdır. Başka bir dönüşüm ayrı bir model paketi sayılır.",
      en: "In this snapshot, the gpt-oss-120b MXFP4 artifact is recorded at about 60.8 GiB. Another conversion is a separate artifact.",
    },
    whyItMatters: {
      tr: 'Bellek hesabı model paketi boyutundan başlar. Yanlış paket seçimi hatalı bir “sığıyor” sonucu üretebilir.',
      en: 'Memory math starts from artifact size. Picking the wrong artifact can make a workload look like it “fits.”',
    },
  },
  {
    id: 'quantization',
    category: 'foundations',
    difficulty: 'core',
    term: { tr: 'Kuantizasyon', en: 'Quantization' },
    definition: {
      tr: 'Ağırlıkları daha az bit ile ifade etme. Dosya boyutunu ve bellek gereksinimini düşürür; doğruluk kaybı model paketinin kendisine bağlıdır.',
      en: 'Storing weights in fewer bits. Reduces file size and memory use; the accuracy trade-off is artifact-specific.',
    },
    example: {
      tr: "Q4_K_M ve Q8_0 farklı kuantizasyon seçenekleridir. FP16 ve BF16, 16 bit kayan nokta biçimleridir; doğruluk ve hız kullanılan modele ve çekirdeklere bağlıdır.",
      en: "Q4_K_M and Q8_0 are different quantization choices. FP16 and BF16 are 16-bit floating-point formats; accuracy and speed depend on the model and kernels.",
    },
    whyItMatters: {
      tr: "Uyumluluk kaydı model paketi düzeyindedir. Workbench, katalogdaki eşleşmeleri kullanır; yeni bir kuantizasyonu çalıştırıp ölçmez.",
      en: "Compatibility is recorded per artifact. The Workbench uses catalog matches; it does not run or benchmark a new quantization.",
    },
  },
  {
    id: 'kv-cache',
    category: 'foundations',
    difficulty: 'core',
    term: { tr: 'KV önbelleği', en: 'KV cache' },
    definition: {
      tr: "Önceki token’ların anahtar/değer tensörlerini saklayan önbellek. Tam dikkat kullanan modellerde bağlam ve eşzamanlılık arttıkça büyür; kayan pencere, sıkıştırma ve önbellek biçimi bu ilişkiyi değiştirebilir.",
      en: "A cache of key/value tensors for previous tokens. With full attention it grows with context and concurrency; sliding windows, compression, and cache format can change that relationship.",
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
    term: {"tr": "Kullanılabilir bellek varsayımı", "en": "Usable-memory assumption"},
    definition: {
      tr: "Model için ayrılabilecek bellek tahmini. Katalogda kullanılabilir bellek varsa o değer, yoksa toplamın %80’i kullanılır; bu bir çalıştırma garantisi değildir.",
      en: "An estimate of memory available to the model. LCL uses a catalog usable-memory value when present, otherwise 80% of total memory; this does not guarantee a successful run.",
    },
    example: {
      tr: "128 GiB katalog belleği ve ayrı kullanılabilir bellek kaydı yoksa varsayım 102,4 GiB’dır. Model, KV önbelleği ve ek yük bu sınıra göre değerlendirilir.",
      en: "With 128 GiB of catalog memory and no separate usable-memory record, the assumption is 102.4 GiB. Weights, KV cache, and overhead are assessed against this limit.",
    },
    whyItMatters: {
      tr: "Bellek hesabı GiB kullanır. Üreticinin GB etiketi ve işletim sisteminin ayırabildiği gerçek bellek ayrıca kontrol edilmelidir.",
      en: "Memory calculations use GiB. Manufacturer GB labels and memory actually available through the operating system need separate checks.",
    },
  },
  {
    id: 'runtime',
    category: 'foundations',
    difficulty: 'intro',
    term: { tr: 'Çalıştırma ortamı', en: 'Runtime' },
    definition: {
      tr: "Model paketini yükleyip çıkarım yapan yazılım ve kullandığı altyapı. llama.cpp, Ollama ve vLLM çalıştırma/sunma araçlarıdır; CUDA, ROCm ve Metal hızlandırma katmanlarıdır, MLX bir makine öğrenimi çatısıdır.",
      en: "Software that loads an artifact and performs inference, plus its supporting stack. llama.cpp, Ollama, and vLLM run or serve models; CUDA, ROCm, and Metal provide acceleration, while MLX is an ML framework.",
    },
    example: {
      tr: 'Aynı GGUF paketi llama.cpp ve Ollama üzerinde farklı performans gösterebilir; hangisinin ölçüldüğü önemlidir.',
      en: 'The same GGUF can benchmark differently on llama.cpp vs. Ollama; the measurement context matters.',
    },
    whyItMatters: {
      tr: "Cihaz, model paketi, çalıştırma ortamı ve sürümü birlikte doğrulanır. Belleğe sığma tahmini, doğrulanmış çalıştırma kanıtından ayrı tutulur.",
      en: "Device, artifact, runtime, and version must be verified together. An estimated memory fit stays separate from evidence of a verified run.",
    },
  },

  // hardware
  {
    id: 'ai-cube',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'AI küpü', en: 'AI cube' },
    definition: {
      tr: 'Tek bir GPU + kompakt soğutma + küçük güç bütçesi ile tasarlanmış mini format yapay zeka düğümü. Genellikle NVIDIA tabanlıdır.',
      en: 'A compact-format node built around a single GPU with tight cooling and a small power budget. Usually NVIDIA-based.',
    },
    example: {
      tr: "DGX Spark, kompakt bir AI sistemi örneğidir; GPU, bellek, güç ve soğutma sınırları cihaz profiliyle birlikte okunur.",
      en: "DGX Spark is an example of a compact AI system; read its GPU, memory, power, and cooling limits with the device profile.",
    },
    whyItMatters: {
      tr: 'Kompakt kısıtı seçildiğinde AI küpü aday olur; gürültü ve güç tercihiyle birlikte değerlendirilir.',
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
      tr: "Birleşik belleğin tamamı GPU’ya veya tek modele ayrılamayabilir. İşletim sistemi ve cihaz sınırları kullanılabilir belleği belirler.",
      en: "The full unified-memory pool may not be available to the GPU or one model. Operating-system and device limits determine usable memory.",
    },
  },
  {
    id: 'mac-studio',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Mac Studio (Apple)', en: 'Mac Studio (Apple)' },
    definition: {
      tr: "Apple Silicon tabanlı masaüstü bilgisayar ailesi. Birleşik bellek kapasitesi, bant genişliği ve model desteği seçilen çipe, yapılandırmaya ve çalıştırma ortamına bağlıdır.",
      en: "A family of Apple Silicon desktop computers. Unified-memory capacity, bandwidth, and model support depend on the chip, configuration, and runtime.",
    },
    example: {
      tr: "Katalogdaki bir Apple cihazı koşulları karşılıyorsa aday olur. Sahip olduğunuz uygun cihazın ek edinme maliyeti sıfır kabul edilir.",
      en: "An Apple device in the catalog becomes a candidate when it meets the requirements. An eligible owned device has zero additional acquisition cost.",
    },
    whyItMatters: {
      tr: "Apple yuvası uygun adaylar arasından seçilir; her senaryoda aynı Mac önerilmez. Kullanılabilir bellek varsayımı diğer cihazlarla aynı kurala tabidir.",
      en: "The Apple slot is chosen from eligible candidates; the same Mac is not recommended for every scenario. Usable memory follows the same rule as other devices.",
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
      tr: "Örnek: 128 GiB toplam belleği CPU, GPU ve işletim sistemi paylaşır. Modele ayrılabilecek miktar 128 GiB’dan az olabilir.",
      en: "Example: CPU, GPU, and the operating system share 128 GiB of total memory. Less than 128 GiB may be available to the model.",
    },
    whyItMatters: {
      tr: 'Diğer uygulamalar kullanılabilir belleği azaltır. Katalogdaki kullanılabilir bellek kaydı veya %80 varsayımı gerçek sistemde ayrıca doğrulanmalıdır.',
      en: 'Other applications reduce available memory. The catalog usable-memory record or 80% assumption must be checked on the actual system.',
    },
  },
  {
    id: 'bandwidth',
    category: 'hardware',
    difficulty: 'advanced',
    term: { tr: 'Bellek bant genişliği', en: 'Memory bandwidth' },
    definition: {
      tr: "Bellekle işlemci arasında saniyede taşınabilen veri miktarı (GB/s). Bellek erişimiyle sınırlanan çıkarımı etkiler; tek başına token hızını belirlemez.",
      en: "The amount of data moved between memory and processor per second (GB/s). It affects memory-bound inference but does not determine token throughput on its own.",
    },
    example: {
      tr: "Örnek olarak 200 GB/s ve 800 GB/s farklı aktarım kapasiteleridir. İkinci değer, aynı modelin mutlaka dört kat hızlı çalışacağı anlamına gelmez.",
      en: "As an example, 200 GB/s and 800 GB/s describe different transfer capacities. The second figure does not guarantee four times the model throughput.",
    },
    whyItMatters: {
      tr: "Bant genişliği cihaz karşılaştırmasında gösterilir. Mevcut Workbench puanında bağımsız bir bant genişliği veya ölçülmüş token hızı terimi yoktur.",
      en: "Bandwidth is displayed in device comparisons. The current Workbench score has no separate bandwidth or measured token-throughput term.",
    },
  },
  {
    id: 'form-factor',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Form faktörü', en: 'Form factor' },
    definition: {
      tr: 'Cihazın fiziksel boyutu ve yerleşim biçimi: AI küpü, mini PC, Mac mini, Mac Studio veya masaüstü referansı.',
      en: 'Physical size and placement: AI cube, mini PC, Mac mini, Mac Studio, or desktop reference.',
    },
    example: {
      tr: '“Kompakt cihaz” seçildiğinde masaüstü referansları elenir; bu, kütüphane ya da çalışma odası kısıtı içindir.',
      en: 'When the user opts into compact-only, desktop references are excluded — for library or studio constraints.',
    },
    whyItMatters: {
      tr: 'Kompakt seçim, biçimi kesin bir kısıt yapar; uygun olmayan pahalı cihazlar erkenden elenir.',
      en: 'Compact turns the form factor into a hard constraint; the filter is applied early because expensive devices would be a mismatch.',
    },
  },
  {
    id: 'noise-class',
    category: 'hardware',
    difficulty: 'intro',
    term: { tr: 'Gürültü sınıfı', en: 'Noise class' },
    definition: {
      tr: "Katalogdaki nitel gürültü sınıfı: sessiz, düşük gürültülü, duyulur veya bilinmiyor. Bu etiketler belirli mesafede yapılmış dB ölçümünün yerine geçmez.",
      en: "A qualitative catalog noise class: silent, quiet, audible, or unknown. These labels do not replace a dB measurement at a specified distance.",
    },
    example: {
      tr: "“Sessiz” tercihiyle sessiz sınıfında olmayan bir cihazın fiziksel puanı düşer. Gürültü seçimi tek başına cihazı elemez.",
      en: "With the silent preference, a device outside the silent class receives a lower physical score. Noise preference alone does not exclude a device.",
    },
    whyItMatters: {
      tr: "Gürültü puanlama tercihidir; kompakt biçim ve belirtilen azami sistem gücü kesin koşullardır.",
      en: "Noise is a scoring preference; compact form and a specified maximum system power are hard requirements.",
    },
  },
  {
    id: 'ten-gigabit-ethernet',
    category: 'hardware',
    difficulty: 'core',
    term: { tr: '10 GbE ve ortak depolama', en: '10 GbE and shared storage' },
    definition: {
      tr: '10 Gb/sn Ethernet, NAS ve UPS: model paketi ve veri aktarımı için laboratuvar altyapısı.',
      en: '10 Gb/s Ethernet, NAS, and UPS: the lab infrastructure for moving models, artifacts, and data.',
    },
    example: {
      tr: "70 GB aktarımı, protokol ve disk ek yükü yok sayılırsa 1 Gb/sn ile 560 saniye, 10 Gb/sn ile 56 saniye sürer. Gerçek süre ağ, disk ve kaynak hızına bağlıdır.",
      en: "Ignoring protocol and disk overhead, a 70 GB transfer takes 560 seconds at 1 Gb/s or 56 seconds at 10 Gb/s. Actual duration depends on network, disk, and source speed.",
    },
    whyItMatters: {
      tr: "Altyapı seçenekleri senaryoda saklanır. Mevcut öneri motoru bunları maliyete veya puana katmaz; ek bütçeyi ayrıca planlayın.",
      en: "Infrastructure choices are saved in the scenario. The current recommendation engine does not include them in cost or score; budget for them separately.",
    },
  },

  // runtime
  {
    id: 'safetensors',
    category: 'runtime',
    difficulty: 'intro',
    term: { tr: 'safetensors', en: 'safetensors' },
    definition: {
      tr: "Hugging Face’in tensör saklama biçimi. Ağırlık yüklerken pickle kaynaklı keyfi kod çalıştırma riskini azaltır; tüm model kodunun güvenli olduğu anlamına gelmez.",
      en: "Hugging Face’s tensor-storage format. It reduces pickle-related arbitrary-code execution risk when loading weights; it does not establish the safety of all model code.",
    },
    example: {
      tr: 'Hugging Face üzerinde çoğu yeni açık ağırlıklı model paketi safetensors olarak yayımlanır.',
      en: 'Most new open-weight artifacts on Hugging Face ship as safetensors.',
    },
    whyItMatters: {
      tr: "Dosya biçimi ve uzak kod gereksinimi ayrı özelliklerdir. safetensors kullanan bir model yine özel model kodu veya ek bağımlılıklar gerektirebilir.",
      en: "File format and remote-code requirements are separate properties. A model using safetensors can still require custom model code or additional dependencies.",
    },
  },
  {
    id: 'gguf',
    category: 'runtime',
    difficulty: 'core',
    term: { tr: 'GGUF', en: 'GGUF' },
    definition: {
      tr: "GGML ekosistemindeki model ağırlıklarını ve metaverisini saklayan biçim. Kuantize veya kayan noktalı tensörler taşıyabilir; CPU/GPU kullanımı çalıştırma ortamına bağlıdır.",
      en: "A format for model weights and metadata in the GGML ecosystem. It can hold quantized or floating-point tensors; CPU/GPU execution depends on the runtime.",
    },
    example: {
      tr: 'Q4_K_M ve Q8_0 kuantizasyonları çoğunlukla GGUF olarak yayımlanır; Ollama bu paketleri doğrudan kullanır.',
      en: 'Q4_K_M and Q8_0 quants usually ship as GGUF; Ollama consumes these artifacts directly.',
    },
    whyItMatters: {
      tr: '“Aynı model paketi CPU ve GPU arasında paylaşılsın” istendiğinde tercih edilir; tekrarlanabilir dönüşüm gerektirir.',
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
      tr: "Bir modelin MLX ile çalışması için mimarisinin ve model paketinin ilgili MLX aracında desteklenmesi gerekir; topluluk dönüşümü yayıncı paketiyle aynı değildir.",
      en: "Running a model with MLX requires architecture and artifact support in the relevant MLX tool; a community conversion is distinct from a publisher artifact.",
    },
    whyItMatters: {
      tr: "Apple cihazlarında olası bir çalıştırma seçeneğidir. Öneriye uygunluk, katalogdaki model paketi ve kanıtları üzerinden değerlendirilir.",
      en: "It is a possible runtime option on Apple devices. Recommendation eligibility is evaluated using the catalog artifact and its evidence.",
    },
  },
  {
    id: 'ollama',
    category: 'runtime',
    difficulty: 'intro',
    term: { tr: 'Ollama', en: 'Ollama' },
    definition: {
      tr: "Model indirme, yönetme ve çıkarım sunmayı kolaylaştıran araç. Yerel çalışma ile bulut seçenekleri ayrıdır; modelin ve çalıştırma ayarının hangisini kullandığı kontrol edilmelidir.",
      en: "A tool for downloading, managing, and serving models. Local execution and cloud options are distinct; check which one the model and configuration use.",
    },
    example: {
      tr: "ollama run bir modeli çalıştırır; ollama serve sunucuyu başlatır. OpenAI uyumlu uçlar API’nin bir alt kümesini destekler.",
      en: "ollama run runs a model; ollama serve starts the server. OpenAI-compatible endpoints support a subset of that API.",
    },
    whyItMatters: {
      tr: 'Aynı GGUF paketi Ollama üzerinden sunulabilir; performans ölçümlerinde çalıştırma ortamının adıyla birlikte kayıt altına alınır.',
      en: 'The same GGUF can be served through Ollama; benchmark entries must record the runtime name.',
    },
  },
  {
    id: 'gated',
    category: 'runtime',
    difficulty: 'core',
    term: { tr: 'Onaylı erişim', en: 'Gated access' },
    definition: {
      tr: 'Modelin indirilmeden önce bir form, anlaşma veya e-posta onayı gerektirmesi. “Açık ağırlık” olmasını engellemez; “kullanım”ı koşula bağlar.',
      en: 'A model requiring a form, agreement, or email approval before download. It can still be open-weight; it gates usage.',
    },
    example: {
      tr: "Bir yayıncı indirme öncesi koşul kabulü veya erişim onayı isteyebilir. Her modelin erişim alanını kendi resmi kartından kontrol edin.",
      en: "A publisher may require acceptance of terms or access approval before download. Check each model’s access conditions on its official card.",
    },
    whyItMatters: {
      tr: '“Yerel laboratuvar” senaryosunda erişim onayı kullanıcının sorumluluğundadır; LCL model paketini önerir ama onay adımını ayrı tutar.',
      en: 'In a “local lab” scenario, gated access is the user’s responsibility; LCL recommends the artifact and keeps the approval step separate.',
    },
  },

  // fit-score
  {
    id: 'fit-formula',
    category: 'fit-score',
    difficulty: 'core',
    term: { tr: 'Uygunluk puanı formülü', en: 'Fit-score formula' },
    definition: {
      tr: "İş yükü puanı %40 + kullanılabilir bellek kapasitesi %25 + katalogda çalıştırma ortamı bulunması %20 + gürültü tercihi %10 + fiyat kaydı durumu %5. Bu sezgisel puan, ölçülmüş performans veya başarı olasılığı değildir.",
      en: "Workload score 40% + usable-memory capacity 25% + presence of catalog runtimes 20% + noise preference 10% + price-record status 5%. This heuristic is not measured performance or a success probability.",
    },
    example: {
      tr: "Bellek bileşeni 96 GiB’da 100’e ulaşır. Çalıştırma ortamı listesi doluysa bileşen 88’dir; bu değer belirli bir modelin ölçüldüğünü göstermez.",
      en: "The memory component reaches 100 at 96 GiB. A non-empty runtime list gives a component of 88; that value does not mean a particular model was benchmarked.",
    },
    whyItMatters: {
      tr: "URL senaryo girdilerini taşır; puan veya sonuç saklamaz. Katalog ve hesaplama değişirse aynı girdiler farklı sonuç üretebilir.",
      en: "The URL carries scenario inputs; it does not store scores or results. Changes to the catalog or calculation can change the result for the same inputs.",
    },
  },
  {
    id: 'scenario-url',
    category: 'fit-score',
    difficulty: 'core',
    term: { tr: 'Sürümlü senaryo URL’si', en: 'Versioned scenario URL' },
    definition: {
      tr: "Workbench girdilerini sürüm numarasıyla URL sorgusunda taşıyan yapı. Pazar, bütçe, iş yükleri, kısıtlar, mevcut cihazlar ve altyapı paylaşılır; imza veya şifreleme içermez.",
      en: "A URL query carrying Workbench inputs with a version number. It shares market, budget, workloads, constraints, owned devices, and infrastructure; it has no signature or encryption.",
    },
    example: {
      tr: '/tr/build?v=1&market=TR&budget=500000&owned=nvidia-rtx-5090-reference gibi.',
      en: 'Like /tr/build?v=1&market=TR&budget=500000&owned=nvidia-rtx-5090-reference.',
    },
    whyItMatters: {
      tr: "Bağlantı girdileri geri yükler ve kabul edilmiş katalogla yeniden hesaplanır. Sonucu belgelemek için anlık görüntü kimliğini ayrıca kaydedin; URL hassas bilgi taşımamalıdır.",
      en: "The link restores inputs and recalculates with the accepted catalog. Record the snapshot ID separately to document the result; keep sensitive information out of the URL.",
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
      tr: "Seçilen pakette önce mevcut cihazlar, sonra ek edinme maliyeti artan sıradaki cihazlar gelir. Fazların toplamı mevcut bütçeyi aşabilir.",
      en: "Within the selected package, owned devices come first, followed by devices in increasing acquisition cost. The combined phases can exceed the current budget.",
    },
    whyItMatters: {
      tr: '“Fazlı alım” durumu başarısızlık değildir; bütçe sınırı kabul edilir ve alım sırası şeffaftır.',
      en: 'A “phased” outcome is not a failure; the budget boundary is accepted and the order is transparent.',
    },
  },

  // evidence
  {
    id: 'verified-vs-fits',
    category: 'evidence',
    difficulty: 'core',
    term: { tr: 'Doğrulandı ve Sığıyor', en: 'verified vs. fits' },
    definition: {
      tr: '“Doğrulandı” tam cihaz + çalıştırma ortamı + model + kuantizasyon ölçümü demektir. “Sığıyor” yalnızca bellek ve çalıştırma ortamı kanıtına dayanır.',
      en: 'verified means an exact device + runtime + model + quant measurement. fits relies on memory and runtime evidence only.',
    },
    example: {
      tr: "Tam model paketi, cihaz, sürüm ve test koşullarıyla ölçülen çalışma “Doğrulandı” olabilir. Bellek ve çalıştırma ortamı varsayımlarıyla eşleşen kayıt “Sığıyor” düzeyinde kalır.",
      en: "A run measured with the exact artifact, device, version, and test conditions may be verified. A match based on memory and runtime assumptions remains at fits.",
    },
    whyItMatters: {
      tr: "Model → cihaz tablosundaki durum ve koşulları okuyun. Paket uygunluk puanı, bu eşleşmeleri ölçülmüş performansa dönüştürmez.",
      en: "Read the status and conditions in the model-to-device table. A package fit score does not turn these matches into measured performance.",
    },
  },
  {
    id: 'fail-closed',
    category: 'evidence',
    difficulty: 'core',
    term: { tr: 'Hata durumunda güvenli anlık görüntü', en: 'Fail-closed snapshot' },
    definition: {
      tr: "Aday anlık görüntü doğrulamadan geçmeden kabul edilmez. Şema veya yayınlama hatası son sağlam anlık görüntüyü korur; yenileme kaynakları otomatik taramaz.",
      en: "A candidate snapshot must pass validation before acceptance. Schema or publication failure preserves the last-known-good snapshot; refresh does not automatically crawl sources.",
    },
    example: {
      tr: "%35 üzeri fiyat değişimi karantinaya alınır ve öneride kullanılmaz. Lisans, dosya özeti ve erişim değişiklikleri kaynak incelemesinde ayrıca değerlendirilmelidir.",
      en: "Price changes above 35% are quarantined and excluded from recommendations. License, hash, and access changes require separate source review.",
    },
    whyItMatters: {
      tr: "Şema doğruluğu fiyatın bugün güncel olduğunu kanıtlamaz. Referans ve eski fiyat gözlemleri tarihleriyle kullanılabilir; satın alma öncesi yeniden kontrol gerekir.",
      en: "Schema validity does not prove that a price is current today. Reference and stale observations can be used with their dates; recheck them before purchase.",
    },
  },
  {
    id: 'anomaly-guard',
    category: 'evidence',
    difficulty: 'advanced',
    term: { tr: '%35 anomali kuralı', en: 'The 35% rule' },
    definition: {
      tr: "Aynı kimlik ve yapılandırmadaki önceki gözleme göre %35’ten fazla değişen fiyat karantinaya alınır. Kural fiyat içindir; tüm teknik özellikleri sayısal olarak karşılaştırmaz.",
      en: "A price changing by more than 35% against the previous observation with the same ID and configuration is quarantined. The rule covers prices; it does not numerically compare all technical specifications.",
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
    term: { tr: 'Anlık görüntü kimliği', en: 'Snapshot id' },
    definition: {
      tr: 'Her veri sürümünün SHA-256 özetinden türetilen, değişiklik günlüğünde görünen yayın kimliği.',
      en: 'The release identity derived from the SHA-256 digest of each data version, surfaced in the change ledger.',
    },
    example: {
      tr: "Örnek biçim: lcl-YYYY-MM-DD-<özet>. Geçerli kimlik ana sayfada, Değişiklikler bölümünde ve manifest.json içinde bulunur.",
      en: "Example format: lcl-YYYY-MM-DD-<digest>. Find the accepted ID on the home page, Changes page, and in manifest.json.",
    },
    whyItMatters: {
      tr: 'Paylaşılan karar dosyalarının hangi veri sürümüne dayandığını tek bir kimlikle belgelemek için kullanılır.',
      en: 'Used to record which data version a shared decision file was based on — one stable id.',
    },
  },
]

export const learnConceptIds = learnConcepts.map((concept) => concept.id)
