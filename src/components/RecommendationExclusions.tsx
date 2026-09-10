import type { ExclusionReason, LabRecommendation } from '@/data/schema'

const reasons: Record<ExclusionReason, { tr: string; en: string }> = {
  host: { tr: 'Fiyat yalnızca GPU içindir; komple ana makine maliyeti yok', en: 'The price covers only the GPU; a complete host cost is missing' },
  compact: { tr: 'Kompakt cihaz koşulu', en: 'Compact-device requirement' },
  power: { tr: 'Güç sınırı aşılıyor veya toplam sistem gücü doğrulanmamış', en: 'Power limit exceeded or total system power unverified' },
  offline: { tr: 'Öneriye uygun çevrimdışı model eşleşmesi yok', en: 'No eligible offline model match' },
  price: { tr: 'Bu pazarda uygun vergi tabanlı, stok dışı olmayan fiyat gözlemi yok', en: 'No local price with a matching tax basis and available stock status' },
}

export function RecommendationExclusions({ result, locale }: { result: Extract<LabRecommendation, { status: 'ineligible' }>; locale: 'tr' | 'en' }) {
  return <div className="recommendation-exclusions" role="status">
    <p>{locale === 'tr' ? 'Mevcut katalog seçilen kesin koşullarla üç ekosistemi tamamlayamıyor. Aşağıdaki eleme nedenlerini inceleyerek senaryoyu düzenleyebilirsiniz.' : 'The current catalog cannot fill all three ecosystems under these requirements. Review the exclusion reasons before editing the scenario.'}</p>
    <ul>{result.exclusions.map((item) => <li key={item.ecosystem}><strong>{item.ecosystem.toUpperCase()}</strong><ul>{item.reasons.map((reason) => <li key={reason}>{reasons[reason][locale]}</li>)}</ul></li>)}</ul>
  </div>
}
