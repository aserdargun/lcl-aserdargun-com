import { Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LocaleProvider, type Locale } from '@/i18n/locale'
import { HorizonBand } from '@/components/HorizonBand'
import { readBrowserValue, writeBrowserValue } from '@/domain/browser-storage'

const nav = [
  { path: 'build', tr: 'Workbench', en: 'Workbench' },
  { path: 'models', tr: 'Modeller', en: 'Models' },
  { path: 'devices', tr: 'Cihazlar', en: 'Devices' },
  { path: 'benchmarks', tr: 'Ölçümler', en: 'Benchmarks' },
  { path: 'compare', tr: 'Karşılaştır', en: 'Compare' },
  { path: 'learn', tr: 'Öğren', en: 'Learn' },
  { path: 'changes', tr: 'Değişiklikler', en: 'Changes' },
  { path: 'methodology', tr: 'Metodoloji', en: 'Methodology' },
]

export function AppShell({ locale }: { locale: Locale }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [light, setLight] = useState(() => readBrowserValue('lcl-theme') === 'light')
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = light ? 'light' : 'dark'
    document.documentElement.lang = locale
  }, [light, locale])

  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    const page = nav.find((item) => location.pathname === `/${locale}/${item.path}`)
    document.title = `${page?.[locale] ?? 'Local Compute Lab'} | LCL`
  }, [location.pathname, locale])

  const otherLocale = locale === 'tr' ? 'en' : 'tr'
  const otherPath = location.pathname.replace(/^\/(tr|en)/, `/${otherLocale}`) + location.search + location.hash

  function toggleTheme() {
    writeBrowserValue('lcl-theme', light ? 'dark' : 'light')
    setLight(!light)
  }

  return (
    <LocaleProvider locale={locale}>
      <a className="skip-link" href="#main">{locale === 'tr' ? 'Ana içeriğe geç' : 'Skip to content'}</a>
      <header className="site-header" onKeyDown={(event) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() } }}>
        <div className="shell site-header__inner">
          <NavLink to={`/${locale}`} className="brand" aria-label={locale === 'tr' ? 'LCL ana sayfa' : 'LCL home'}>
            <span className="brand__mark">LCL</span><span className="brand__name">LOCAL COMPUTE LAB</span>
          </NavLink>
          <button ref={menuButton} className="icon-button mobile-menu" type="button" aria-controls="main-navigation" aria-label={locale === 'tr' ? 'Menüyü aç veya kapat' : 'Toggle menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav id="main-navigation" className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Main navigation'}>
            {nav.map((item) => <NavLink key={item.path} to={`/${locale}/${item.path}`} className={({ isActive }) => isActive ? 'active' : undefined}>{item[locale]}</NavLink>)}
          </nav>
          <div className="header-actions">
            <NavLink className="locale-switch" to={otherPath} lang={otherLocale}>{otherLocale.toUpperCase()}</NavLink>
            <button className="icon-button" type="button" onClick={toggleTheme} title={locale === 'tr' ? 'Temayı değiştir' : 'Toggle theme'} aria-label={locale === 'tr' ? 'Temayı değiştir' : 'Toggle theme'}>
              {light ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="shell" tabIndex={-1}><Outlet /></main>
      <HorizonBand />
      <footer className="site-footer">
        <div className="shell site-footer__grid">
          <div><span className="brand__mark">LCL</span><p>{locale === 'tr' ? 'Yerel AI yatırımı için kanıt defteri.' : 'An evidence ledger for local AI investment.'}</p></div>
          <a href={`https://aserdargun.com/${locale === 'en' ? '' : 'tr/'}`} target="_blank" rel="noreferrer">{locale === 'tr' ? 'Kişisel harita' : 'Personal map'}</a>
          <p>{locale === 'tr' ? 'Hesap yok · takip yok · satış ortaklığı yok' : 'No account · no tracking · no affiliate'}</p>
        </div>
      </footer>
    </LocaleProvider>
  )
}
