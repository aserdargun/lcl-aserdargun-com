import { Brain, GraduationCap, Library, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FlashcardDeck } from '@/components/learn/FlashcardDeck'
import { PageIntro } from '@/components/PageIntro'
import { learnCategories, learnConcepts, type LearnConcept, type LearnDifficulty } from '@/data/education'
import { countLearnProgress, emptyLearnProgress, loadLearnProgress, markLearnConcept, saveLearnProgress, type LearnConceptStatus, type LearnProgress } from '@/domain/learn-progress'
import { useLocale } from '@/i18n/locale'

const difficultyTagClass: Record<LearnDifficulty, string> = {
  intro: 'education__concept-tag--intro',
  core: 'education__concept-tag--core',
  advanced: 'education__concept-tag--advanced',
}

const difficultyCopy: Record<LearnDifficulty, { tr: string; en: string }> = {
  intro: { tr: 'Giriş', en: 'Intro' },
  core: { tr: 'Temel', en: 'Core' },
  advanced: { tr: 'İleri', en: 'Advanced' },
}

const introCopy = {
  tr: {
    eyebrow: 'Öğren',
    title: 'Workbench kararını kavramadan veremezsin.',
    description:
      'LCL, karar destekleyen bir iş aracıdır. Aynı zamanda kendi öğrenim yolculuğun için kavramsal bir katmandır: açık ağırlıklı model paketinden uygunluk puanına, %35 kuralından anlık görüntü kimliğine kadar her şeyin kısa bir kartı burada.',
    aside: '29 kavram · 5 kategori · tarayıcıda saklanan aralıklı tekrar ilerlemesi',
    pillarTitle: 'Bu sayfa ne işe yarar?',
    pillarOneTitle: 'Kavram kartları',
    pillarOneBody: 'Her kavram iki-dört cümlede. Sözlük değil, karar destek sözlüğü.',
    pillarTwoTitle: 'Aralıklı tekrar',
    pillarTwoBody: 'Öğrendim / Tekrar işaretleri tarayıcıda saklanır; ilerleme sıfırlanabilir.',
    pillarThreeTitle: 'Workbench bağlamı',
    pillarThreeBody: 'Her kavramın “Workbench için neden önemli” notu karar dosyasına bağlanır.',
    learnMore: 'Kavramı aç',
    noProgress: 'Henüz kart işaretlenmedi. Filtreyi “Yeni kavramlar” üzerinde bırakıp başla.',
  },
  en: {
    eyebrow: 'Learn',
    title: 'You cannot make a Workbench decision without the concepts.',
    description:
      'LCL is a decision support product. It is also a concept layer for your own learning journey: from open-weight artifacts to the fit score, from the 35% rule to the snapshot id — every concept has a short card here.',
    aside: '29 concepts · 5 categories · browser-persisted SRS progress',
    pillarTitle: 'What is this page for?',
    pillarOneTitle: 'Concept cards',
    pillarOneBody: 'Every concept in two-to-four sentences. Not a glossary — a decision-support dictionary.',
    pillarTwoTitle: 'Spaced repetition',
    pillarTwoBody: 'Known / again marks are stored in this browser; progress is resettable.',
    pillarThreeTitle: 'Workbench context',
    pillarThreeBody: 'Every concept carries a “why it matters in the Workbench” note, tied to the decision file.',
    learnMore: 'Open the card',
    noProgress: 'No cards marked yet. Leave the filter on “Fresh concepts” to start.',
  },
} as const

export function EducationPage() {
  const locale = useLocale()
  const intro = introCopy[locale]
  const [progress, setProgress] = useState<LearnProgress>(() => loadLearnProgress(learnConcepts.map((c) => c.id)))
  const [now, setNow] = useState<number>(() => Date.now())
  const [openedCard, setOpenedCard] = useState<{ id: string; request: number } | null>(null)
  useEffect(() => {
    if (!openedCard) return
    const deck = document.getElementById('flashcard-deck')
    deck?.scrollIntoView?.({ block: 'start' })
    deck?.focus({ preventScroll: true })
  }, [openedCard])

  useEffect(() => { saveLearnProgress(progress) }, [progress])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const interval = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const stats = useMemo(() => countLearnProgress(progress, learnConcepts.map((c) => c.id), now), [progress, now])

  const handleAdvance = (conceptId: string, next: LearnConceptStatus) => {
    const markedAt = Date.now()
    setNow(markedAt)
    setProgress((current) => markLearnConcept(current, conceptId, next, markedAt))
  }
  const handleReset = () => {
    setProgress(emptyLearnProgress(learnConcepts.map((c) => c.id)))
  }

  return (
    <section className="education">
      <PageIntro
        eyebrow={intro.eyebrow}
        title={intro.title}
        description={intro.description}
        aside={<><strong>{learnConcepts.length}</strong><span>{locale === 'tr' ? 'kavram kartı' : 'concept cards'}</span></>}
      />

      <section className="evidence-band" aria-label={intro.pillarTitle}>
        <div>
          <Library aria-hidden="true" />
          <h2>{intro.pillarOneTitle}</h2>
          <p>{intro.pillarOneBody}</p>
        </div>
        <div>
          <GraduationCap aria-hidden="true" />
          <h2>{intro.pillarTwoTitle}</h2>
          <p>{intro.pillarTwoBody}</p>
        </div>
        <div>
          <Sparkles aria-hidden="true" />
          <h2>{intro.pillarThreeTitle}</h2>
          <p>{intro.pillarThreeBody}</p>
        </div>
      </section>

      <FlashcardDeck
        key={openedCard?.request ?? 0}
        initialConceptId={openedCard?.id}
        concepts={learnConcepts}
        status={progress.status}
        nextReviewAt={progress.nextReviewAt}
        onAdvance={handleAdvance}
        onReset={handleReset}
        stats={stats}
        now={now}
      />

      {learnCategories.map((category) => {
        const items = learnConcepts.filter((concept) => concept.category === category.id)
        if (items.length === 0) return null
        return (
          <section key={category.id} className="education__category" aria-labelledby={`learn-cat-${category.id}`}>
            <header>
              <h2 id={`learn-cat-${category.id}`}>{category.title[locale]}</h2>
              <span className="education__category-meta">
                {items.length} {locale === 'tr' ? 'kavram' : 'concepts'} · {locale === 'tr' ? 'kategori' : 'category'} 0{category.order}
              </span>
            </header>
            <p className="lede" style={{ marginBottom: '2rem' }}>{category.description[locale]}</p>
            <div className="education__concept-grid" role="list">
              {items.map((concept) => <ConceptCard key={concept.id} concept={concept} onOpen={() => setOpenedCard((current) => ({ id: concept.id, request: (current?.request ?? 0) + 1 }))} />)}
            </div>
          </section>
        )
      })}

      <p className="lede" style={{ marginTop: '3rem', fontSize: '0.9rem' }}>
        <Brain aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
        {locale === 'tr'
          ? <>İlerleme bu tarayıcıda saklanır. Tarayıcı kaydı kapalıysa yalnızca mevcut oturumda korunur.</>
          : <>Progress is stored in this browser. When browser storage is disabled, it lasts for the current session only.</>}
      </p>
    </section>
  )
}

function ConceptCard({ concept, onOpen }: { concept: LearnConcept; onOpen: () => void }) {
  const locale = useLocale()
  return (
    <article className="education__concept" role="listitem" data-testid={`learn-concept-${concept.id}`}>
      <span className={`education__concept-tag ${difficultyTagClass[concept.difficulty]}`}>{difficultyCopy[concept.difficulty][locale]}</span>
      <h3>{concept.term[locale]}</h3>
      <p>{concept.definition[locale]}</p>
      <button type="button" className="education__concept-link" onClick={onOpen}>
        {locale === 'tr' ? 'Kartı aç' : 'Open the card'} →
      </button>
    </article>
  )
}
