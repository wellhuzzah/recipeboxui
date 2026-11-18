import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import RecipeCard from './RecipeCard'

const VISIBLE = 3

// [translateY, translateX, rotate, scale]
const STACK_OFFSETS = [
    [0,    0,    0,     1],
    [6,   -14,  -2.5,  0.97],
    [10,   10,   2,    0.94],
]

export default function CardDeck({ recipes }) {
    const navigate = useNavigate()
    const [index, setIndex] = useState(0)
    const [animating, setAnimating] = useState(false)
    const touchStartX = useRef(null)

    // Exclude now_serving recipes — those live on the letterboard
    const eligible = (recipes || []).filter(r => !r.now_serving)

    const visibleRecipes = []
    for (let i = 0; i < Math.min(VISIBLE, eligible.length); i++) {
        visibleRecipes.push(eligible[(index + i) % eligible.length])
    }

    const advance = useCallback((dir) => {
        if (animating || eligible.length <= 1) return
        setAnimating(true)
        setTimeout(() => {
            setIndex(prev => {
                if (dir === 'right') return (prev + 1) % eligible.length
                return (prev - 1 + eligible.length) % eligible.length
            })
            setAnimating(false)
        }, 400)
    }, [animating, eligible.length])

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight') advance('right')
            if (e.key === 'ArrowLeft') advance('left')
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [advance])

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
    }
    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return
        const delta = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(delta) > 50) advance(delta > 0 ? 'right' : 'left')
        touchStartX.current = null
    }

    if (!eligible || eligible.length === 0) return null

    return (
        <div className="card-deck-section">
            <div
                className="card-deck-stage"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <button
                    className="deck-arrow deck-arrow-left"
                    onClick={() => advance('left')}
                    aria-label="Previous"
                    disabled={animating}
                >
                    ‹
                </button>

                {[...visibleRecipes].reverse().map((recipe, reversedIdx) => {
                    const depth = (visibleRecipes.length - 1) - reversedIdx
                    const isTop = depth === 0
                    const [offsetY, offsetX, rotate, scale] = STACK_OFFSETS[depth] || STACK_OFFSETS[STACK_OFFSETS.length - 1]

                    const transform = (isTop && animating)
                        ? `translateY(10px) translateX(10px) rotate(2deg) scale(0.94)`
                        : `translateY(${offsetY}px) translateX(${offsetX}px) rotate(${rotate}deg) scale(${scale})`

                    return (
                        <div
                            key={recipe.id}
                            className={`card-deck-card${isTop ? ' card-deck-top' : ''}`}
                            style={{
                                transform,
                                zIndex: isTop && animating ? 0 : VISIBLE - depth,
                                transition: (isTop && animating)
                                    ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease'
                                    : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                opacity: (isTop && animating) ? 0.7 : 1,
                                pointerEvents: isTop && !animating ? 'auto' : 'none',
                            }}
                        >
                            <div className="card-deck-card-constrain">
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={isTop && !animating ? () => navigate(`/recipes/${recipe.id}`) : undefined}
                                />
                            </div>
                        </div>
                    )
                })}

                <button
                    className="deck-arrow deck-arrow-right"
                    onClick={() => advance('right')}
                    aria-label="Next"
                    disabled={animating}
                >
                    ›
                </button>
            </div>
            <div className="deck-mobile-nav">
                <button className="deck-mobile-btn" onClick={() => advance('left')}>‹</button>
                <button className="deck-mobile-btn" onClick={() => advance('right')}>›</button>
            </div>
        </div>
    )
}
