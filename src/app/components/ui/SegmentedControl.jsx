"use client";

/** @file Segmented control used for short, mutually exclusive choices (level, interview type). */

/**
 * Segmented button group; the selected option fills ink.
 * Buttons are `type="button"` so clicking one inside a form doesn't submit it,
 * and the hidden input carries the value for native form submission — the
 * control works both as controlled React state and as a plain form field.
 * Options are used as their own React keys, so they must be unique.
 * @param {object} props - Component props.
 * @param {string} props.name - Name of the hidden input.
 * @param {string} props.value - Currently selected option.
 * @param {string[]} props.options - Choices, rendered in order.
 * @param {Function} props.onChange - Called with the raw option string.
 * @returns {JSX.Element} The control.
 */
export default function SegmentedControl({ name, value, options, onChange }) {
  return (
    <div className="inline-flex w-full overflow-hidden rounded-[4px] border border-rule">
      {options.map((option, index) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={`min-h-11 flex-1 px-3 text-sm transition-colors ${
              index > 0 ? "border-l border-rule" : ""
            } ${
              isActive
                ? "bg-ink font-medium text-canvas"
                : "bg-transparent text-ink-soft hover:bg-black/[0.03] hover:text-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value} readOnly />
    </div>
  );
}
