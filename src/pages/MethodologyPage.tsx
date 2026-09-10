import { PageIntro } from '@/components/PageIntro'
import { useLocale } from '@/i18n/locale'

export function MethodologyPage() {
  const locale = useLocale()
  const sections = locale === 'tr' ? [
    ['Uyumluluk durumları', '“Doğrulandı” durumu yalnızca tam cihaz + çalıştırma ortamı + model + kuantizasyon ölçümüyle verilir. “Sığıyor” bellek ve çalıştırma ortamı kanıtına, “Kısıtlı” açık bir sınıra, “Desteklenmiyor” hesaplanan veya ölçülen uyumsuzluğa, “Bilinmiyor” ise kanıt yokluğuna işaret eder.'],
    ['Bellek hesabı', 'Gereksinim = gerçek model paketi boyutu + KV önbelleği × eşzamanlılık + çalıştırma ortamı ek yükü. Ek yük ölçülmediyse azami(2 GiB, ağırlıkların %10’u); kullanılabilir bellek doğrulanmadıysa toplam belleğin %80’i uygulanır.'],
    ['Uygunluk puanı', 'Bu puan ölçülmüş performans veya başarı olasılığı değildir. İş yükü kapsamı %40 + bellek/bağlam payı %25 + çalıştırma ortamı/işletim sistemi kanıtı %20 + güç/gürültü/biçim %10 + kanıt güncelliği %5.'],
    ['Paket optimizasyonu', 'Önce kompakt biçim, doğrulanmış sistem güç sınırı, çevrimdışı model eşleşmesi ve yerel fiyat/vergi koşulları uygulanır. Üç ekosistemden biri karşılanamıyorsa INELIGIBLE sonucu verilir. Uygun paketler içinde önce bütçe, ardından kapsam, en düşük uygunluk, sezgisel puan/maliyet oranı ve maliyet değerlendirilir; bütçeye sığmayan hedef fazlara ayrılır. Gürültü bir tercihtir. Altyapı maliyeti toplama dahil değildir.'],
    ['Fiyat ve vergi', 'TR ve DE gözlemleri KDV durumunu, US gözlemleri satış vergisi hariç tabanı açıkça gösterir. Döviz dönüşümü yerel fiyatın yerine geçmez ve vergi tabanları tek en-ucuz listesinde karıştırılmaz.'],
    ['Hata durumunda güvenli veri', 'Şema veya kaynak hatasında Son sağlam anlık görüntü korunur. %35 üzeri fiyat değişimi karantinaya alınır; lisans, dosya özeti veya erişim kısıtı değişimi incelemeye gider ve öneriden çıkarılır.'],
  ] : [
    ['Compatibility states', 'verified requires an exact device + runtime + model + quant measurement. fits uses memory and runtime evidence, constrained names an explicit limit, unsupported records a calculated or measured mismatch, and unknown means evidence is absent.'],
    ['Memory calculation', 'Requirement = actual artifact size + KV cache × concurrency + runtime overhead. When overhead is unmeasured use max(2 GiB, 10% of weights); when usable memory is unverified use 80% of total memory.'],
    ['Fit score', 'This heuristic is not measured performance or a probability of success. Workload coverage 40% + memory/context headroom 25% + runtime/OS evidence 20% + power/noise/form 10% + evidence freshness 5%.'],
    ['Package optimization', 'Compact form, verified system power limits, offline model matches, and local price/tax conditions are applied first. Missing an ecosystem produces INELIGIBLE. Eligible packages are ranked by budget, coverage, weakest fit, heuristic score/cost ratio, and cost; over-budget targets are phased. Noise is a preference. Infrastructure costs are excluded.'],
    ['Price and tax', 'TR and DE observations disclose VAT; US observations exclude sales tax. Currency conversion never replaces local price and tax bases are not mixed in one cheapest ranking.'],
    ['Fail-closed data', 'The last-known-good snapshot survives schema or source failure. Price moves above 35% are quarantined; license, hash, or gated changes go to review and leave recommendations.'],
  ]
  return <>
    <PageIntro eyebrow={locale === 'tr' ? 'Açık karar sözleşmesi' : 'Open decision contract'} title={locale === 'tr' ? 'Metodoloji' : 'Methodology'} description={locale === 'tr' ? 'Bir önerinin nasıl üretildiği ve hangi koşulda geri çekildiği denetlenebilir.' : 'How a recommendation is produced—and when it is withdrawn—is auditable.'} />
    <div className="method-ledger">{sections.map(([title, body], index) => <section key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}</div>
    <section className="download-band"><div><p className="eyebrow">{locale === 'tr' ? 'VERİ / V1' : 'DATA / V1'}</p><h2>{locale === 'tr' ? 'Statik sözleşmeyi indir' : 'Download the static contract'}</h2></div><div><a href="/data/v1/catalog.json" download>catalog.json</a><a href="/manifest.json" download>manifest.json</a><a href="/changes.json" download>changes.json</a></div></section>
  </>
}
