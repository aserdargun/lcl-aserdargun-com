import { ArrowLeft, Compass, Home, Search } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useLocale } from '@/i18n/locale'

const copy = {
  tr: {
    eyebrow: '404 / Adres bulunamadı',
    title: 'Bu sayfa laboratuvarda yok.',
    description:
      'Aradığın karar dosyası, cihaz profili veya anlık görüntü kaydı bu adreste yer almıyor. Yine de beş adımlı Workbench veya model-cihaz eşleşmelerine doğrudan ulaşabilirsin.',
    primary: 'Anasayfaya dön',
    workbench: 'Workbench’ten başla',
    models: 'Model → cihaz',
    breadcrumb: 'Şu adrese gidildi',
  },
  en: {
    eyebrow: '404 / Address not found',
    title: 'This page is not in the lab.',
    description:
      'The decision file, device profile, or snapshot entry you are looking for does not live at this address. You can still reach the five-step Workbench or the model-to-device ledger directly.',
    primary: 'Back to home',
    workbench: 'Start the Workbench',
    models: 'Model → device',
    breadcrumb: 'Requested address',
  },
} as const

const fallbackLinks = [
  { path: '', tr: 'Anasayfa', en: 'Home' },
  { path: 'build', tr: 'Workbench', en: 'Workbench' },
  { path: 'models', tr: 'Modeller', en: 'Models' },
  { path: 'devices', tr: 'Cihazlar', en: 'Devices' },
  { path: 'methodology', tr: 'Metodoloji', en: 'Methodology' },
]

export function NotFoundPage() {
  const params = useParams()
  const location = useLocation()
  const locale = useLocale()
  const text = copy[locale]
  const currentLocale = params.locale === 'en' ? 'en' : 'tr'

  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="eyebrow">{text.eyebrow}</p>
      <h1 id="not-found-title">{text.title}</h1>
      <p className="lede">{text.description}</p>

      <div className="not-found__panel" role="status">
        <p className="eyebrow">{text.breadcrumb}</p>
        <code className="not-found__path" data-testid="not-found-path">{location.pathname}</code>
      </div>

      <nav className="not-found__actions" aria-label={locale === 'tr' ? 'Önerilen rotalar' : 'Suggested routes'}>
        <Link className="button button--primary" to={`/${currentLocale}`}>
          <Home aria-hidden="true" /> {text.primary}
        </Link>
        <Link className="button" to={`/${currentLocale}/build`}>
          <Compass aria-hidden="true" /> {text.workbench}
        </Link>
        <Link className="button" to={`/${currentLocale}/models`}>
          <Search aria-hidden="true" /> {text.models}
        </Link>
      </nav>

      <ul className="not-found__index" aria-label={locale === 'tr' ? 'Site haritası' : 'Site map'}>
        {fallbackLinks.map((item) => (
          <li key={item.path}>
            <Link to={item.path ? `/${currentLocale}/${item.path}` : `/${currentLocale}`}>
              <ArrowLeft aria-hidden="true" /> {item[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
