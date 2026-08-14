"use client";

/** @file Custom select for the scorecard, where a native `<select>` can't be styled to match. */

import { FaChevronDown } from "react-icons/fa";

/**
 * Custom select with listbox semantics.
 * Open state is lifted to the parent via `openSelect`/`setOpenSelect` rather
 * than held locally, so opening one row automatically closes any other — with
 * local state, several dropdowns could overlap at once.
 * The `onMouseDown` preventDefault on each option is what makes selection work:
 * without it the button's blur fires first, closing the list before the click
 * lands. Blur still closes when focus genuinely leaves the group.
 * @param {object} props - Component props.
 * @param {string} props.id - Identity of this select, compared against `openSelect`.
 * @param {*} props.value - Currently selected option.
 * @param {any[]} props.options - Choices; used as their own keys, so must be unique.
 * @param {Function} props.onChange - Called with the chosen option.
 * @param {string} props.openSelect - Id of the currently open select, `""` for none.
 * @param {Function} props.setOpenSelect - Setter for the shared open id.
 * @param {boolean} [props.compact=false] - Tighter spacing for the per-dimension rows.
 * @returns {JSX.Element} The select.
 */
export default function ScorecardSelect({ id, value, options, onChange, openSelect, setOpenSelect, compact = false }) {
  const isOpen = openSelect === id;

  /**
   * Applies a choice and closes the list.
   * @param {*} nextValue - Option the user picked.
   * @returns {void}
   */
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
