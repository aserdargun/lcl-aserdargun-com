import { Check, Eye, RotateCcw, Shuffle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { LearnConcept } from '@/data/education'
import type { LearnConceptStatus } from '@/domain/learn-progress'
import { useLocale } from '@/i18n/locale'

type FilterKey = 'fresh' | 'soon' | 'later' | 'mastered'

const filterOrder: FilterKey[] = ['fresh', 'soon', 'later', 'mastered']

const filterLabel: Record<FilterKey, { tr: string; en: string }> = {
  fresh: { tr: 'Yeni kavramlar', en: 'Fresh concepts' },
  soon: { tr: 'Bugün tekrar', en: 'Due today' },
  later: { tr: 'Yakında', en: 'Coming up' },
  mastered: { tr: 'Öğrenildi', en: 'Mastered' },
}

const statusLabel: Record<LearnConceptStatus, { tr: string; en: string }> = {
  new: { tr: 'Yeni', en: 'New' },
  learning: { tr: 'Öğreniyorum', en: 'Learning' },
  known: { tr: 'Öğrendim', en: 'Known' },
}

const actionLabel: Record<LearnConceptStatus, { tr: string; en: string }> = {
  new: { tr: 'Öğrenmeye başla', en: 'Start learning' },
  learning: { tr: 'Öğrendim', en: 'Mark known' },
  known: { tr: 'Tekrar gözden geçir', en: 'Send back to learning' },
}

export interface FlashcardDeckProps {
  concepts: readonly LearnConcept[]
  status: Record<string, LearnConceptStatus>
  onAdvance: (conceptId: string, next: LearnConceptStatus) => void
  onReset: () => void
  stats: { total: number; new: number; learning: number; known: number; dueNow: number; buckets: Record<FilterKey, number> }
  now: number
}

function bucketForFilter(status: LearnConceptStatus, nextReviewAt: number | undefined, now: number): FilterKey {
  if (nextReviewAt && nextReviewAt <= now) return 'soon'
  if (status === 'known') return 'mastered'
  if (status === 'learning') return 'later'
  return 'fresh'
}

export function FlashcardDeck({ concepts, status, onAdvance, onReset, stats, now }: FlashcardDeckProps) {
  const locale = useLocale()
  const [filter, setFilter] = useState<FilterKey>('fresh')
  const [revealed, setRevealed] = useState(false)
  const [order, setOrder] = useState<readonly string[]>([])

  const bucketOf = (concept: LearnConcept): FilterKey => bucketForFilter(status[concept.id] ?? 'new', undefined, now)

  const filtered = useMemo(() => {
    if (filter === 'mastered') return concepts.filter((concept) => (status[concept.id] ?? 'new') === 'known')
    return concepts.filter((concept) => bucketOf(concept) === filter)
    // bucketOf is derived from status and now — they are already in the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concepts, filter, status, now])

  // Reset the visible card when the user changes the filter or marks an answer.
  useEffect(() => { setRevealed(false) }, [filter])

  const current = order.length
    ? concepts.find((concept) => concept.id === order[0]) ?? filtered[0]
    : filtered[0]

  const currentStatus: LearnConceptStatus = current ? (status[current.id] ?? 'new') : 'new'
  const nextStatus: LearnConceptStatus = currentStatus === 'new' ? 'learning' : currentStatus === 'learning' ? 'known' : 'learning'

  const handleAdvance = () => {
    if (!current) return
    onAdvance(current.id, nextStatus)
    setRevealed(false)
    if (order.length > 1) setOrder(order.slice(1))
  }

  const handleShuffle = () => {
    const ids = filtered.map((concept) => concept.id)
    if (ids.length < 2) return
    const shuffled = [...ids]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1))
      ;[shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!]
    }
    setOrder(shuffled)
  }

  const progressPct = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0

  return (
    <div className="flashcard" data-testid="flashcard-deck">
      <div className="flashcard__deck">
        <header>
          <p className="flashcard__eyebrow">{locale === 'tr' ? 'Flashcard destesi' : 'Flashcard deck'}</p>
          <h3 style={{ margin: 0 }}>{locale === 'tr' ? 'Kavramı aç, kendini test et.' : 'Reveal the term, test yourself.'}</h3>
        </header>

        <progress className="flashcard__progress" max={stats.total} value={stats.known} aria-label={locale === 'tr' ? 'Öğrenilen kavramlar' : 'Concepts learned'} />

        {!current ? (
          <div className="flashcard__card" data-testid="flashcard-empty">
            <p className="flashcard__eyebrow">{filterLabel[filter][locale]}</p>
            <p className="flashcard__empty">
              {locale === 'tr'
                ? 'Bu kategoride gösterilecek kart yok. Filtreyi değiştir veya ilerlemeyi sıfırla.'
                : 'No cards in this category. Switch the filter or reset progress.'}
            </p>
            <button type="button" className="flashcard__reveal" onClick={onReset}>
              <RotateCcw aria-hidden="true" /> {locale === 'tr' ? 'İlerlemeyi sıfırla' : 'Reset progress'}
            </button>
          </div>
        ) : (
          <article className="flashcard__card" data-testid={`flashcard-card-${current.id}`}>
            <span className={`education__concept-tag education__concept-tag--${current.difficulty}`}>{statusLabel[currentStatus][locale]}</span>
            <p className="flashcard__eyebrow">{locale === 'tr' ? 'Kavram' : 'Term'}</p>
            <h4 className="flashcard__term">{current.term[locale]}</h4>
            {revealed ? (
              <>
                <p className="flashcard__eyebrow">{locale === 'tr' ? 'Tanım' : 'Definition'}</p>
                <p className="flashcard__definition">{current.definition[locale]}</p>
                <p className="flashcard__example">
                  <strong>{locale === 'tr' ? 'Örnek:' : 'Example:'}</strong> {current.example[locale]}
                </p>
              </>
            ) : (
              <button type="button" className="flashcard__reveal" onClick={() => setRevealed(true)} data-testid="flashcard-reveal">
                <Eye aria-hidden="true" /> {locale === 'tr' ? 'Tanımı göster' : 'Reveal definition'}
              </button>
            )}
            {revealed ? (
              <div className="flashcard__controls" role="group" aria-label={locale === 'tr' ? 'Cevap işaretle' : 'Mark answer'}>
                <button type="button" className="button button--primary" onClick={handleAdvance} data-testid="flashcard-advance">
                  <Check aria-hidden="true" /> {actionLabel[currentStatus][locale]}
                </button>
                <button type="button" className="button button--quiet" onClick={() => setRevealed(false)}>
                  {locale === 'tr' ? 'Bir daha düşün' : 'Hide again'}
                </button>
              </div>
            ) : null}
          </article>
        )}

        <div className="flashcard__statusbar" role="status" aria-live="polite">
          <span><strong>{stats.known}</strong> / {stats.total} {locale === 'tr' ? 'öğrenildi' : 'known'}</span>
          <span><strong>{progressPct}%</strong></span>
          <span><strong>{stats.dueNow}</strong> {locale === 'tr' ? 'bugün tekrar' : 'due now'}</span>
          <button type="button" className="button button--quiet" onClick={handleShuffle} disabled={filtered.length < 2}>
            <Shuffle aria-hidden="true" /> {locale === 'tr' ? 'Karıştır' : 'Shuffle'}
          </button>
        </div>
      </div>

      <aside className="flashcard__sidebar" aria-label={locale === 'tr' ? 'Filtre ve ilerleme' : 'Filter and progress'}>
        <h3>{locale === 'tr' ? 'Filtre' : 'Filter'}</h3>
        <ul className="flashcard__filter-list">
          {filterOrder.map((key) => (
            <li key={key}>
              <button type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} data-testid={`flashcard-filter-${key}`}>
                <span>{filterLabel[key][locale]}</span>
                <strong style={{ float: 'right' }}>{stats.buckets[key] ?? 0}</strong>
              </button>
            </li>
          ))}
        </ul>
        <h3>{locale === 'tr' ? 'İlerleme' : 'Progress'}</h3>
        <dl className="flashcard__stat-grid">
          <div><dt>{locale === 'tr' ? 'Yeni' : 'New'}</dt><dd>{stats.new}</dd></div>
          <div><dt>{locale === 'tr' ? 'Öğreniyor' : 'Learning'}</dt><dd>{stats.learning}</dd></div>
          <div><dt>{locale === 'tr' ? 'Öğrendi' : 'Known'}</dt><dd>{stats.known}</dd></div>
        </dl>
        <button type="button" className="button button--quiet" onClick={onReset}>
          <RotateCcw aria-hidden="true" /> {locale === 'tr' ? 'İlerlemeyi sıfırla' : 'Reset progress'}
        </button>
      </aside>
    </div>
  )
}
