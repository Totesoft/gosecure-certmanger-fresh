import { useState, useRef, useEffect } from "react";
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

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (selected: DateRange | undefined) => {
        if (selected?.from && selected?.to) {
            setRange(selected);
            onChange(selected as { from: Date; to: Date });
            setOpen(false);
        }
    };

    return (
        <div ref={pickerRef} className="relative w-full">
            <input
                readOnly
                onClick={() => setOpen((prev) => !prev)}
                value={
                    range.from && range.to
                        ? `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`
                        : ""
                }
                placeholder="Select Date Range"
                className="w-full pl-10 pr-4 py-2 rounded-xl text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 cursor-pointer"
            />

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
