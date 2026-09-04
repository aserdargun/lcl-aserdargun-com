import type { Currency, Market } from '@/data/schema'
import type { Locale } from './locale'

const terms: Record<Locale, Record<string, string>> = {
  tr: {
    'not-required': 'Gerekli değil', optional: 'İsteğe bağlı', required: 'Gerekli', unknown: 'Bilinmiyor',
    supported: 'Destekleniyor', conditional: 'Koşullu', unsupported: 'Desteklenmiyor',
    'none-known': 'Bilinen yok', 'runtime-dependent': 'Çalıştırma ortamına bağlı',
    'ai-cube': 'AI küpü', 'mini-pc': 'Mini PC', 'mac-mini': 'Mac mini', 'mac-studio': 'Mac Studio', 'desktop-reference': 'Masaüstü referansı',
    verified: 'Doğrulandı', limited: 'Sınırlı', 'not-assessed': 'Değerlendirilmedi', reference: 'Referans',
    'vat-included': 'KDV dahil', 'vat-excluded': 'KDV hariç', 'sales-tax-excluded': 'Satış vergisi hariç',
    included: 'Dahil', excluded: 'Hariç', 'in-stock': 'Stokta', preorder: 'Ön sipariş', 'out-of-stock': 'Stokta yok',
    current: 'Güncel', stale: 'Eski', quarantined: 'Karantinada', review: 'İncelemede',
    catalog: 'Katalog', model: 'Model', device: 'Cihaz', price: 'Fiyat', license: 'Lisans', availability: 'Stok durumu', benchmark: 'Ölçüm',
    info: 'Bilgi', watch: 'İzle', complete: 'Tam paket', phased: 'Fazlı alım',
    text: 'metin', code: 'kod', reasoning: 'akıl yürütme', vision: 'görsel anlama', image: 'görüntü', video: 'video', audio: 'ses',
    'tokens-per-second': 'saniyede belirteç', silent: 'Sessiz', quiet: 'Düşük gürültülü', audible: 'Duyulur',
    'RTX 5090 GPU only; host, PSU, storage excluded': 'Yalnızca RTX 5090 GPU; ana makine, güç kaynağı ve depolama hariç',
    'RTX 5090 host (GPU-only reference)': 'RTX 5090 ana makinesi (yalnızca GPU referansı)',
    'NVIDIA reference': 'NVIDIA referansı', 'Existing x86 host required': 'Mevcut bir x86 ana makinesi gerekir',
    'Host-dependent': 'Ana makineye bağlı', 'Desktop GPU / host required': 'Masaüstü GPU / ana makine gerekli',
    'Mini workstation / 2U-ready': 'Mini iş istasyonu / 2U uyumlu', '10GbE configurable': '10GbE yapılandırılabilir',
    '128GB RAM + 2TB SSD': '128 GB RAM + 2 TB SSD', '128GB Max AI Compute Edition': '128 GB Max AI Compute Edition',
    '36GB unified memory + 512GB SSD': '36 GB birleşik bellek + 512 GB SSD',
    '128GB unified memory + 4TB NVMe': '128 GB birleşik bellek + 4 TB NVMe',
    '64GB RAM + 1TB SSD, EU plug': '64 GB RAM + 1 TB SSD, AB fişi',
  },
  en: {
    'not-required': 'Not required', optional: 'Optional', required: 'Required', unknown: 'Unknown',
    supported: 'Supported', conditional: 'Conditional', unsupported: 'Unsupported',
    'none-known': 'None known', 'runtime-dependent': 'Runtime-dependent',
    'ai-cube': 'AI cube', 'mini-pc': 'Mini PC', 'mac-mini': 'Mac mini', 'mac-studio': 'Mac Studio', 'desktop-reference': 'Desktop reference',
    verified: 'Verified', limited: 'Limited', 'not-assessed': 'Not assessed', reference: 'Reference',
    'vat-included': 'VAT included', 'vat-excluded': 'VAT excluded', 'sales-tax-excluded': 'Sales tax excluded',
    included: 'Included', excluded: 'Excluded', 'in-stock': 'In stock', preorder: 'Pre-order', 'out-of-stock': 'Out of stock',
    current: 'Current', stale: 'Stale', quarantined: 'Quarantined', review: 'In review',
    catalog: 'Catalog', model: 'Model', device: 'Device', price: 'Price', license: 'License', availability: 'Availability', benchmark: 'Benchmark',
    info: 'Info', watch: 'Watch', complete: 'Complete package', phased: 'Phased purchase',
    text: 'text', code: 'code', reasoning: 'reasoning', vision: 'vision', image: 'image', video: 'video', audio: 'audio',
    'tokens-per-second': 'tokens per second', silent: 'Silent', quiet: 'Quiet', audible: 'Audible',
  },
}

export function formatTerm(value: string, locale: Locale) {
  return terms[locale][value] ?? value
}

export function formatMoney(value: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(value)
}

export function formatMarketName(market: Market, locale: Locale) {
  return ({
    tr: { TR: 'Türkiye', US: 'ABD', DE: 'Almanya' },
    en: { TR: 'Türkiye', US: 'United States', DE: 'Germany' },
  } as const)[locale][market]
}

export function formatProtocol(protocol: string, locale: Locale) {
  if (locale === 'en') return protocol
  if (protocol.startsWith('Vendor-reported Fedora 42')) return 'Üreticinin bildirdiği hız ölçümü (Fedora 42); bağlam, istem ve güç modu yayımlanmadı.'
  if (protocol.startsWith('Vendor-reported EVO-X2')) return 'Üreticinin bildirdiği hız tablosu (EVO-X2); bağlam, istem ve güç modu yayımlanmadı.'
  return protocol
}
