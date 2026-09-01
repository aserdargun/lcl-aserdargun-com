import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './App'

function renderRoute(route: string) {
  return render(<MemoryRouter initialEntries={[route]}><AppRoutes /></MemoryRouter>)
}

describe('LCL application routes', () => {
  beforeEach(() => localStorage.clear())

  it('renders the Turkish decision-first home with the sibling atlas navigation', () => {
    renderRoute('/tr')

    expect(screen.getByRole('heading', { level: 1, name: 'Hangi laboratuvarı almalıyım?' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Ana navigasyon' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Modeller' })).toHaveAttribute('href', '/tr/models')
    expect(screen.getByRole('link', { name: 'LLM Runtime Atlas' })).toHaveAttribute('href', 'https://llm.aserdargun.com/tr')
  })

  it('renders the English locale without duplicating the route structure', () => {
    renderRoute('/en/devices')

    expect(screen.getByRole('heading', { level: 1, name: 'Local devices' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Models' })).toHaveAttribute('href', '/en/models')
  })

  it('completes the five-step workbench and returns all three ecosystem nodes', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/build?v=1&market=TR&budget=250000')

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
    renderRoute('/tr/build?v=1&market=TR&budget=50000')

    for (let step = 0; step < 4; step += 1) {
      await user.click(screen.getByRole('button', { name: 'Devam et' }))
    }
    await user.click(screen.getByRole('button', { name: 'Paketi hesapla' }))

    expect(screen.getByText(/Bütçe farkı/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Fazlı alım planı' })).toBeInTheDocument()
  })

  it('persists a scenario only after an explicit browser-save action', async () => {
    const user = userEvent.setup()
    renderRoute('/tr/build?v=1&market=TR&budget=250000')

    expect(localStorage.getItem('lcl-saved-scenario-v1')).toBeNull()
    for (let step = 0; step < 4; step += 1) await user.click(screen.getByRole('button', { name: 'Devam et' }))
    await user.click(screen.getByRole('button', { name: 'Paketi hesapla' }))
    await user.click(screen.getByRole('button', { name: 'Bu senaryoyu tarayıcıda sakla' }))

    expect(JSON.parse(localStorage.getItem('lcl-saved-scenario-v1') ?? '{}')).toMatchObject({ version: 1, market: 'TR', budget: 250000 })
    expect(screen.getByRole('button', { name: 'Tarayıcı kaydını sil' })).toBeInTheDocument()
  })
})
