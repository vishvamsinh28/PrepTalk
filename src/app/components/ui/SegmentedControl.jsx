"use client";

/**
 * Flush segmented control; selected option fills ink. Emits the raw
 * option value.
 * @param {{ name: string, value: string, options: string[], onChange: Function }} props
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
