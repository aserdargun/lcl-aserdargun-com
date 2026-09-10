import type { ChangeEntry } from './schema'

export const changeLog: ChangeEntry[] = [
  {
    id: 'change-2026-09-10-decision-integrity', date: '2026-09-10', type: 'catalog', severity: 'info',
    title: { tr: 'Karar sınırları ve veri bütünlüğü', en: 'Decision boundaries and data integrity' },
    summary: { tr: 'DGX Spark sistem güç sınırı ile RTX 5090 GPU güç değeri ayrıldı. GPU fiyatı komple ana makine maliyeti olarak kullanılmaz. Kesin koşullar, eksik kanıt, öğrenme kartları ve tarayıcı kaydı düzeltildi. Önceki fiyat gözlemleri yeniden doğrulanmadı; kendi tarihleriyle korunur.', en: 'DGX Spark system power and RTX 5090 GPU power are distinguished. GPU prices cannot stand in for complete host costs. Hard requirements, missing evidence, learning cards, and browser persistence were corrected. Prior price observations were not reverified and retain their original dates.' },
    entityIds: ['nvidia-dgx-spark', 'nvidia-rtx-5090-reference'], sourceIds: ['nvidia-dgx', 'nvidia-rtx'],
  },
  {
    id: 'change-2026-09-04-language-data-refresh', date: '2026-09-04', type: 'catalog', severity: 'info',
    title: { tr: 'Dil, biçim ve veri tazeliği güncellemesi', en: 'Language, layout, and data-freshness update' },
    summary: { tr: 'Türkçe terimler tutarlılaştırıldı, mobil model tablosundaki taşma giderildi, güncel model ve fiyat bilgileri işlendi; doğrulanamayan Akakçe gözlemi eski olarak işaretlendi.', en: 'Turkish terminology was standardized, mobile model-table overflow was fixed, current model and price facts were incorporated, and the unverified Akakçe observation was marked stale.' },
    entityIds: ['deepseek-v4-flash', 'wan-2-2-t2v-a14b', 'amd-minisforum-ms-s1-max-128'], sourceIds: ['hf-deepseek', 'hf-wan', 'minisforum-us', 'akakce-minisforum'],
  },
  {
    id: 'change-2026-09-01-lcl-seed', date: '2026-09-01', type: 'catalog', severity: 'info',
    title: { tr: 'İlk kanıtlı LCL anlık görüntüsü', en: 'First evidence-backed LCL snapshot' },
    summary: { tr: 'Sekiz model, dokuz cihaz ve Türkiye/ABD/Almanya fiyat gözlemleri yayınlandı.', en: 'Eight models, nine devices, and Türkiye/US/Germany price observations were published.' },
    entityIds: [], sourceIds: ['nvidia-dgx', 'amd-max395', 'apple-studio', 'openai-models', 'hf-qwen', 'hf-deepseek', 'hf-gemma'],
  },
  {
    id: 'change-2026-08-25-mac-studio-m5', date: '2026-08-25', type: 'device', severity: 'info',
    title: { tr: 'M5 Max ve M5 Ultra Mac Studio', en: 'M5 Max and M5 Ultra Mac Studio' },
    summary: { tr: 'M5 Max 128 GB’a, M5 Ultra 512 GB’a kadar birleşik bellekle kataloğa eklendi.', en: 'M5 Max up to 128GB and M5 Ultra up to 512GB unified memory were added to the catalog.' },
    entityIds: ['apple-mac-studio-m5-max-128', 'apple-mac-studio-m5-ultra-512'], sourceIds: ['apple-studio'],
  },
  {
    id: 'change-2026-08-15-qwen-3-8', date: '2026-08-15', type: 'model', severity: 'info',
    title: { tr: 'Qwen3.8-27B keşfedildi', en: 'Qwen3.8-27B discovered' },
    summary: { tr: 'Resmi 28B görsel-metin modeli, 262K yerel bağlam yapılandırmasıyla eklendi.', en: 'The official 28B image-text model was added with its 262K local context configuration.' },
    entityIds: ['qwen-3-8-27b'], sourceIds: ['hf-qwen'],
  },
]
