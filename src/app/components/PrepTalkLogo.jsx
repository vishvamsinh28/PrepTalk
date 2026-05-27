"use client";

import { useId } from "react";

export default function PrepTalkLogo({
  showWord = true,
  className = "",
  markClassName = "h-11 w-11",
  textClassName = "text-xl",
}) {
  const id = useId().replace(/:/g, "");
  const markGradientId = `prepTalkMarkGradient-${id}`;
  const bubbleGradientId = `prepTalkBubbleGradient-${id}`;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="PrepTalk"
        className={markClassName}
      >
        <defs>
          <linearGradient id={markGradientId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" />
            <stop offset="0.52" stopColor="#86efac" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id={bubbleGradientId} x1="19" y1="20" x2="45" y2="43" gradientUnits="userSpaceOnUse">
            <stop stopColor="#07111f" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="54" height="54" rx="18" fill={`url(#${markGradientId})`} />
        <path
          d="M20.5 23.5c0-4 3.4-7.2 7.7-7.2h8.1c6 0 10.2 3.8 10.2 9.3 0 5.6-4.2 9.4-10.2 9.4h-6v9.5h-9.8v-21Zm9.8 1.1v3.7h5.3c1.3 0 2.2-.7 2.2-1.9 0-1.1-.9-1.8-2.2-1.8h-5.3Z"
          fill={`url(#${bubbleGradientId})`}
        />
        <path
          d="M40.3 36.7c3.6-.9 6.5-3.2 8-6.4 3.8 1.2 6.3 4 6.3 7.4 0 2.4-1.2 4.5-3.2 5.9l1 5.3-5.7-2.8c-1.2.3-2.5.5-3.9.5-4.5 0-8.3-1.9-10.2-4.9h3.9c1.6 0 2.9-1.3 2.9-2.9v-2.1h.9Z"
          fill="#07111f"
          opacity="0.92"
        />
      </svg>
      {showWord && (
        <span className={`${textClassName} font-black tracking-tight text-white`}>
          PrepTalk
        </span>
      )}
    </span>
  );
}
