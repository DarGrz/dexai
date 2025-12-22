'use client'

import { useState, useEffect } from 'react'

const headlines = [
  'Widoczność w wyszukiwarkach AI',
  'Znajdź klientów przez ChatGPT',
  'Optymalizacja dla Gemini',
  'Twoja firma w Perplexity',
]

export default function AnimatedHeadline() {
  const [index, setIndex] = useState(0)
  const [animationState, setAnimationState] = useState<'enter' | 'visible' | 'exit'>('enter')

  useEffect(() => {
    // Enter animation (0.5s)
    const enterTimer = setTimeout(() => {
      setAnimationState('visible')
    }, 300)

    // Stay visible (2.5s)
    const visibleTimer = setTimeout(() => {
      setAnimationState('exit')
    }, 3000)

    // Exit animation (1.3s) then change headline
    const exitTimer = setTimeout(() => {
      setIndex((current) => (current + 1) % headlines.length)
      setAnimationState('enter')
    }, 4300)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(visibleTimer)
      clearTimeout(exitTimer)
    }
  }, [index])

  return (
    <div className="relative h-[120px] md:h-[150px] overflow-hidden mb-3">
      <h1
        className={`text-5xl md:text-6xl font-bold text-gray-900 leading-tight ease-in-out ${
          animationState === 'enter' ? '-translate-y-full opacity-0 transition-all duration-[500ms]' : 
          animationState === 'visible' ? 'translate-y-0 opacity-100 transition-all duration-[500ms]' : 
          'translate-y-full opacity-0 transition-all duration-[1300ms]'
        }`}
      >
        {headlines[index]}
      </h1>
    </div>
  )
}
