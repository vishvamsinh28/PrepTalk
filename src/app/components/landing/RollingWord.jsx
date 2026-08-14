"use client";

/** @file The hero's rotating word. Purely decorative — it conveys no information the copy doesn't. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** How long each word is held before rolling to the next. */
const HOLD_MS = 3000;

/**
 * Cycles words upward through a clipped slot.
 * The slot's width animates to the active word so a centred headline doesn't
 * jump as words of different lengths swap in. Measurement runs in
 * `useLayoutEffect`, before paint, so the first frame is already the right size.
 * Inactive words stay in the DOM (they're what's being scrolled through) but are
 * `aria-hidden`, so a screen reader announces only the visible one.
 * Honours `prefers-reduced-motion`: the interval never starts, leaving the first
 * word static.
 * @param {object} props - Component props.
 * @param {string[]} props.words - Words to cycle; used as their own keys, so must be unique.
 * @returns {JSX.Element} The animated slot.
 */
export default function RollingWord({ words }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(null);
  const [step, setStep] = useState(0);
  const itemRefs = useRef([]);

  // Re-measures on every word change and on resize, since both the slot width
  // and the per-word step height depend on the rendered text.
  useLayoutEffect(() => {
    const measure = () => {
      const active = itemRefs.current[index];
      if (!active) return;
      setWidth(active.getBoundingClientRect().width);
      setStep(active.offsetHeight);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [index]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, HOLD_MS);

    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span
      className="landing-roll text-accent"
      style={width ? { width: `${width}px` } : undefined}
    >
      <span
        className="landing-roll-track"
        style={{ transform: `translateY(${-index * step}px)` }}
      >
        {words.map((word, i) => (
          <span
            key={word}
            ref={(node) => {
              itemRefs.current[i] = node;
            }}
            aria-hidden={i !== index}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
