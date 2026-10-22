import React, { useEffect, useRef, useState, useCallback } from "react"
import { playTypewriterSound } from "./typewriterAudio"

export type TypewriterSpeed = "normal" | "fast" | "instant"

interface TypewriterTextProps {
  text: string
  speed?: TypewriterSpeed
  soundEnabled?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
  onComplete?: () => void
  cursorClassName?: string
  showCursor?: boolean
  delay?: number
}

const SPEED_MAP: Record<TypewriterSpeed, number> = {
  normal: 16,
  fast: 5,
  instant: 0,
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = "normal",
  soundEnabled = false,
  className = "",
  as: Component = "span",
  onComplete,
  cursorClassName = "bg-[#43B5FF] shadow-[0_0_8px_#43B5FF]",
  showCursor = true,
  delay = 0,
}) => {
  const [displayedLength, setDisplayedLength] = useState(speed === "instant" ? text.length : 0)
  const [isTyping, setIsTyping] = useState(false)
  const timerRef = useRef<number | null>(null)
  const hasTriggeredCompleteRef = useRef(false)

  // Reset when text changes
  useEffect(() => {
    hasTriggeredCompleteRef.current = false
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (speed === "instant" || reduceMotion) {
      setDisplayedLength(text.length)
      setIsTyping(false)
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true
        onComplete?.()
      }
      return
    }

    setDisplayedLength(0)
    setIsTyping(false)

    const startTimer = window.setTimeout(() => {
      setIsTyping(true)
    }, delay)

    return () => {
      window.clearTimeout(startTimer)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [text, speed, delay, onComplete])

  useEffect(() => {
    if (!isTyping || speed === "instant") return

    if (displayedLength >= text.length) {
      setIsTyping(false)
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true
        onComplete?.()
      }
      return
    }

    const currentChar = text[displayedLength]
    let charDelay = SPEED_MAP[speed]

    // Organic pause for punctuation
    if (speed === "normal") {
      if (currentChar === "." || currentChar === "?" || currentChar === "!") {
        charDelay = 90
      } else if (currentChar === "," || currentChar === ";" || currentChar === ":") {
        charDelay = 50
      }
    }

    timerRef.current = window.setTimeout(() => {
      setDisplayedLength((prev) => prev + 1)
      if (soundEnabled && currentChar && currentChar.trim() !== "") {
        playTypewriterSound(0.02)
      }
    }, charDelay)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [isTyping, displayedLength, text, speed, soundEnabled, onComplete])

  const visibleText = text.slice(0, displayedLength)
  const isDone = displayedLength >= text.length

  return (
    <Component className={className}>
      {visibleText}
      {showCursor && (!isDone || isTyping) && (
        <span
          aria-hidden="true"
          className={`inline-block w-[2.5px] h-[1em] ml-1 align-baseline animate-pulse ${cursorClassName}`}
        />
      )}
    </Component>
  )
}

/**
 * High-performance typewriter hook for complex custom displays
 */
export function useTypewriter(
  fullText: string,
  options: {
    speed?: TypewriterSpeed
    soundEnabled?: boolean
    delay?: number
    onComplete?: () => void
  } = {}
) {
  const { speed = "normal", soundEnabled = false, delay = 0, onComplete } = options
  const [displayedText, setDisplayedText] = useState(speed === "instant" ? fullText : "")
  const [isDone, setIsDone] = useState(speed === "instant")

  const completeCallback = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (speed === "instant" || reduceMotion) {
      setDisplayedText(fullText)
      setIsDone(true)
      completeCallback()
      return
    }

    let currentIndex = 0
    setDisplayedText("")
    setIsDone(false)

    let timeoutId: number | null = null

    const typeNextChar = () => {
      if (currentIndex >= fullText.length) {
        setIsDone(true)
        completeCallback()
        return
      }

      currentIndex++
      setDisplayedText(fullText.slice(0, currentIndex))

      const currentChar = fullText[currentIndex - 1]
      let stepDelay = SPEED_MAP[speed]

      if (speed === "normal") {
        if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          stepDelay = 80
        } else if (currentChar === "," || currentChar === ":") {
          stepDelay = 40
        }
      }

      if (soundEnabled && currentChar && currentChar.trim() !== "") {
        playTypewriterSound(0.025)
      }

      timeoutId = window.setTimeout(typeNextChar, stepDelay)
    }

    const startTimer = window.setTimeout(typeNextChar, delay)

    return () => {
      window.clearTimeout(startTimer)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [fullText, speed, delay, soundEnabled, completeCallback])

  return { displayedText, isDone }
}
