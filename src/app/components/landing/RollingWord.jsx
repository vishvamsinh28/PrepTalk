"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const HOLD_MS = 3000;

/*
 * Words roll up through a clipped slot. The slot's width eases to the active
 * word so the centred headline never sits off-centre, and there is no caret.
 */
export default function RollingWord({ words }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(null);
  const [step, setStep] = useState(0);
  const itemRefs = useRef([]);

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
