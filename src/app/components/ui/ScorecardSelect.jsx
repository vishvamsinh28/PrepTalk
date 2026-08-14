"use client";

import { FaChevronDown } from "react-icons/fa";

/**
 * Accessible custom select used by the scorecard. Only one instance
 * opens at a time via the shared openSelect id.
 * @param {{ id: string, value: any, options: any[], onChange: Function,
 *   openSelect: string, setOpenSelect: Function, compact?: boolean }} props
 */
export default function ScorecardSelect({ id, value, options, onChange, openSelect, setOpenSelect, compact = false }) {
  const isOpen = openSelect === id;

  const chooseValue = (nextValue) => {
    onChange(nextValue);
    setOpenSelect("");
  };

  return (
    <div className={compact ? "relative mt-2" : "relative"}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpenSelect(isOpen ? "" : id)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setOpenSelect("");
          }
        }}
        className={`field-surface field-control flex items-center justify-between gap-3 text-left transition ${
          compact ? "min-h-11 py-2.5" : ""
        }`}
      >
        <span className="min-w-0 truncate">{value}</span>
        <FaChevronDown className={`shrink-0 text-xs text-accent transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-[4px] border border-accent bg-white shadow-2xl"
        >
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseValue(option)}
                className={`block w-full px-4 py-3 text-left text-sm font-bold transition ${
                  isSelected
                    ? "bg-accent/10 text-accent"
                    : "text-ink hover:bg-black/5 hover:text-ink"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
