import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'

function renderRoute(route: string) {
  return render(<MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter>)
}

describe('LCL application routes', () => {
  it('continues working when storage access is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError') })
    renderRoute('/en/build')
    expect(screen.getByRole('heading', { name: 'Market and budget' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('keeps an explicitly empty comparison empty', async () => {
    renderRoute('/en/compare?devices=nvidia-dgx-spark,nvidia-dgx-spark')
    expect(screen.getByText('1/4')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('checkbox', { name: 'DGX Spark' }))
    expect(screen.getByText('0/4')).toBeInTheDocument()
    expect(screen.getByText('Select devices to compare.')).toBeInTheDocument()
  })

  it('shows a profile from the selected ecosystem', async () => {
    renderRoute('/en/devices?device=nvidia-dgx-spark')
    await userEvent.selectOptions(screen.getByLabelText('Ecosystem'), 'apple')
    expect(screen.queryByRole('heading', { level: 2, name: 'DGX Spark' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Mac Studio/ })).toBeInTheDocument()
  })

  it('opens the requested concept in the learning deck', async () => {
    renderRoute('/en/learn')
    const cards = screen.getAllByTestId(/^learn-concept-/)
    const card = cards[5]
    const term = card.querySelector('h3')!.textContent!
    await userEvent.click(card.querySelector('button')!)
    expect(screen.getByTestId('flashcard-deck').querySelector('h4')).toHaveTextContent(term)
  })

  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('renders the Turkish decision-first home with the horizon strip and the workbench entry point', () => {
    renderRoute('/tr')

    expect(screen.getByRole('heading', { level: 1, name: 'Hangi laboratuvarı almalıyım?' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Ana navigasyon' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Modeller' })).toHaveAttribute('href', '/tr/models')
    expect(screen.getByRole('link', { name: 'Öğren' })).toHaveAttribute('href', '/tr/learn')
    expect(screen.getByRole('link', { name: 'Modeller' })).toHaveAttribute('href', '/tr/models')
    const horizonLinks = document.querySelectorAll('.horizon__node')
    expect(horizonLinks.length).toBeGreaterThanOrEqual(3)
    const atlasLink = Array.from(horizonLinks).find((node) => /LLM Runtime & Serving Atlas/i.test(node.textContent ?? ''))
    expect(atlasLink).toBeDefined()
    expect(atlasLink?.getAttribute('href')).toBe('https://llm.aserdargun.com/')
  })

  it('renders the English locale without duplicating the route structure', () => {
    renderRoute('/en/devices')

    expect(screen.getByRole('heading', { level: 1, name: 'Local devices' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Models' })).toHaveAttribute('href', '/en/models')
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/en/learn')
  })

  it('shows the 404 page for an unknown localized route and keeps the locale switch accessible', () => {
    renderRoute('/en/this-route-does-not-exist')

    expect(screen.getByRole('heading', { level: 1, name: 'This page is not in the lab.' })).toBeInTheDocument()
    expect(screen.getByTestId('not-found-path')).toHaveTextContent('/en/this-route-does-not-exist')
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en')
    expect(screen.getByRole('link', { name: 'Start the Workbench' })).toHaveAttribute('href', '/en/build')
  })

  it('completes the five-step workbench and returns all three ecosystem nodes', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/build?v=1&market=TR&budget=250000&compact=0&owned=nvidia-rtx-5090-reference')

    expect(screen.getByRole('heading', { level: 1, name: 'Pazar ve bütçe' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(screen.getByRole('heading', { level: 1, name: 'İş yükleri ve öncelikler' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Gizlilik, güç ve gürültü' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Mevcut ekipman' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Devam et' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Laboratuvar altyapısı' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Paketi hesapla' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Üç ekosistemli laboratuvarınız' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /NVIDIA/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /AMD/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Apple/ })).toBeInTheDocument()
  })

  it('shows a phased plan instead of a fake complete package for an insufficient budget', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/build?v=1&market=TR&budget=50000&compact=0&owned=nvidia-rtx-5090-reference')

    for (let step = 0; step < 4; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Devam et' }))
    }
    await user.click(screen.getByRole('button', { name: 'Paketi hesapla' }))

    expect(screen.getByText(/Bütçe farkı/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Fazlı alım planı' })).toBeInTheDocument()
  })

  it('persists a scenario only after an explicit browser-save action', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/build?v=1&market=TR&budget=250000&compact=0&owned=nvidia-rtx-5090-reference')

    expect(localStorage.getItem('lcl-saved-scenario-v1')).toBeNull()
    for (let step = 0; step < 4; step += 1) await user.click(screen.getByRole('button', { name: 'Devam et' }))
    await user.click(screen.getByRole('button', { name: 'Paketi hesapla' }))
    await user.click(screen.getByRole('button', { name: 'Bu senaryoyu tarayıcıda sakla' }))

    expect(JSON.parse(localStorage.getItem('lcl-saved-scenario-v1') ?? '{}')).toMatchObject({ version: 1, market: 'TR', budget: 250000 })
    expect(screen.getByRole('button', { name: 'Tarayıcı kaydını sil' })).toBeInTheDocument()
  })

  it('exposes the /learn route with a flashcard deck and concept grid', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/learn')

    expect(screen.getByRole('heading', { level: 1, name: 'Workbench kararını kavramadan veremezsin.' })).toBeInTheDocument()
    expect(screen.getByTestId('flashcard-deck')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^learn-concept-/).length).toBeGreaterThanOrEqual(20)

    await user.click(screen.getByTestId('flashcard-reveal'))
    expect(screen.getByRole('button', { name: /Öğrenmeye başla|Start learning/ })).toBeInTheDocument()
  })

  it('localizes model access states instead of exposing schema codes', () => {
    renderRoute('/tr/models?model=openai-gpt-oss-20b')

    expect(screen.getByText('Erişim kısıtı')).toBeInTheDocument()
    expect(screen.getByText('Uzak kod')).toBeInTheDocument()
    expect(screen.getByText('Gerekli değil')).toBeInTheDocument()
    expect(screen.getByText('Destekleniyor')).toBeInTheDocument()
    expect(screen.getByText('Çalıştırma ortamına bağlı')).toBeInTheDocument()
    expect(screen.getAllByText('metin · kod · akıl yürütme').length).toBeGreaterThan(0)
    expect(screen.queryByText('remote_code')).not.toBeInTheDocument()
  })

  it('localizes device categories, acquisition states, and English currency formatting', () => {
    const { unmount } = renderRoute('/tr/devices?market=TR&device=nvidia-rtx-5090-reference')

    expect(screen.getAllByText(/Masaüstü referansı/).length).toBeGreaterThan(0)
    expect(screen.getByText('Çalıştırma ortamı')).toBeInTheDocument()
    expect(screen.getByText(/KDV dahil · Stokta/)).toBeInTheDocument()

    unmount()
    renderRoute('/en/devices?market=TR&device=nvidia-rtx-5090-reference')
    expect(screen.getAllByText(/TRY\s*290,409/).length).toBeGreaterThan(0)
  })

  it('labels an old price observation instead of presenting it as current', () => {
    renderRoute('/tr/devices?market=TR&device=amd-minisforum-ms-s1-max-128')

    expect(screen.getByText(/Eski · 01 Eyl 2026/)).toBeInTheDocument()
  })

  it('localizes comparison result states and section labels', () => {
    renderRoute('/tr/compare')

    expect(screen.getByText('01 / CİHAZ SKU’SU')).toBeInTheDocument()
    expect(screen.getByText('02 / LABORATUVAR PAKETİ')).toBeInTheDocument()
    expect(screen.getAllByText(/Tam paket|Fazlı alım/).length).toBeGreaterThan(0)
    expect(screen.queryByText('complete')).not.toBeInTheDocument()
    expect(screen.queryByText('phased')).not.toBeInTheDocument()
  })

  it('uses locale-specific market names in the Workbench', () => {
    const { unmount } = renderRoute('/tr/build')
    expect(screen.getByLabelText('ABD')).toBeInTheDocument()
    expect(screen.getByLabelText('Almanya')).toBeInTheDocument()

    unmount()
    renderRoute('/en/build')
    expect(screen.getByLabelText('United States')).toBeInTheDocument()
    expect(screen.getByLabelText('Germany')).toBeInTheDocument()
  })

  it('uses natural Turkish wording on the home and changes pages', () => {
    const { unmount } = renderRoute('/tr')
    expect(screen.getByText('Son katalog derlemesi')).toBeInTheDocument()
    expect(screen.getByText('Dosya özeti, lisans ve erişim koşulları ayrı ayrı gösterilir.')).toBeInTheDocument()

    unmount()
    renderRoute('/tr/changes')
    expect(screen.getByRole('heading', { level: 1, name: 'Değişiklikler' })).toBeInTheDocument()
    expect(screen.getByText('Anlık görüntü günlüğü')).toBeInTheDocument()
    expect(screen.getByText('Eski')).toBeInTheDocument()
    expect(screen.getAllByText('Katalog / Bilgi').length).toBeGreaterThan(0)
  })

  it('explains benchmark and methodology terms in Turkish', () => {
    const { unmount } = renderRoute('/tr/benchmarks')
    expect(screen.getByText('Ölçüm tarayıcısı')).toBeInTheDocument()
    expect(screen.getAllByText('Bağlam').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Üreticinin bildirdiği hız/).length).toBeGreaterThan(0)

    unmount()
    renderRoute('/tr/methodology')
    expect(screen.getByText(/“Doğrulandı” durumu yalnızca tam cihaz/)).toBeInTheDocument()
    expect(screen.getByText(/Son sağlam anlık görüntü/)).toBeInTheDocument()
  })

  it('keeps the Turkish learning introduction free of untranslated product jargon', () => {
    renderRoute('/tr/learn')
    expect(screen.getAllByText('Öğren').length).toBeGreaterThan(0)
    expect(screen.getByText(/uygunluk puanına/)).toBeInTheDocument()
    expect(screen.getByText(/anlık görüntü kimliğine/)).toBeInTheDocument()
  })
})
