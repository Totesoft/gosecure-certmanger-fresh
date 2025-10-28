import { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

type DateRange = { from: Date | null; to: Date | null };

function DateRangePicker({
    onChange,
    currentRange,
}: {
    onChange: (range: { from: Date; to: Date }) => void;
    currentRange?: { from: Date; to: Date };
}) {
    const [range, setRange] = useState<DateRange>({
        from: currentRange?.from ?? null,
        to: currentRange?.to ?? null,
    });

    const [open, setOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const handleSelect = (selected: DateRange | undefined) => {
        if (selected?.from && selected?.to) {
            setRange(selected);
            onChange(selected as { from: Date; to: Date });
            setOpen(false);
        }
    };

    // Close the picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div ref={pickerRef} className="relative inline-block">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow-md transition-all"
            >
                {range.from && range.to
                    ? `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`
                    : "Select Date Range"}
            </button>

            {open && (
                <div className="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={handleSelect}
                        numberOfMonths={1}
                    />
                </div>
            )}
        </div>
    );
}

export default DateRangePicker;
