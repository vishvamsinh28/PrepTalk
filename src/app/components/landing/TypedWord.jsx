"use client";

import { useEffect, useRef, useState } from "react";

const TYPE_MS = 95;
const DELETE_MS = 42;
const HOLD_MS = 2100;

export default function TypedWord({ words }) {
  const [text, setText] = useState(words[0]);
  const [animate, setAnimate] = useState(false);
  const state = useRef({ word: 0, phase: "hold", char: words[0].length });

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(true);
    }
  }, []);

  useEffect(() => {
    if (!animate) return;

    let timer;

    const tick = () => {
      const current = state.current;
      const word = words[current.word];

      if (current.phase === "typing") {
        current.char += 1;
        setText(word.slice(0, current.char));

        if (current.char === word.length) {
          current.phase = "hold";
          timer = setTimeout(tick, HOLD_MS);
        } else {
          timer = setTimeout(tick, TYPE_MS);
        }
        return;
      }

      if (current.phase === "hold") {
        current.phase = "deleting";
        timer = setTimeout(tick, DELETE_MS);
        return;
      }

      current.char -= 1;
      setText(word.slice(0, current.char));

      if (current.char === 0) {
        current.word = (current.word + 1) % words.length;
        current.phase = "typing";
      }
      timer = setTimeout(tick, DELETE_MS);
    };

    timer = setTimeout(tick, HOLD_MS);
    return () => clearTimeout(timer);
  }, [animate, words]);

  return (
    <span className="text-accent">
      {text}
      {animate && <span className="landing-caret" aria-hidden="true" />}
    </span>
  );
}
