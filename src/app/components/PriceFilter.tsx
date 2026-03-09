import React, { useState, useMemo, useEffect } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

interface PriceFilterProps {
    initialMin: number;
    initialMax: number;
    selectedMin: number | null;
    selectedMax: number | null;
    onApply: (min: number | null, max: number | null) => void;
}
function PriceFilter({ initialMin, initialMax, onApply, selectedMax, selectedMin }: PriceFilterProps) {
    const [sliderMin, setSliderMin] = useState(initialMin);
    const [sliderMax, setSliderMax] = useState(initialMax);

    useEffect(() => {
        setSliderMin(selectedMin ?? initialMin);
        setSliderMax(selectedMax ?? initialMax);
    }, [selectedMin, selectedMax, initialMin, initialMax]);
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-3">
                Filter by Price
            </h2>

            {/* Slider */}
            <RangeSlider
                className="mb-4  bg-brand_pink"
                min={initialMin}
                max={initialMax}
                value={[sliderMin, sliderMax]}   // ✅ controlled
                onInput={(values: number[]) => {  // ✅ correct type
                    setSliderMin(values[0]);
                    setSliderMax(values[1]);
                }}

            />

            {/* Display Selected Range */}
            <div className="text-sm text-gray-600 mb-4">
                Showing:
                <strong> ₦{sliderMin.toLocaleString()}</strong> —
                <strong> ₦{sliderMax.toLocaleString()}</strong>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => onApply(sliderMin, sliderMax)}
                    className="px-4 py-2 bg-brand_pink text-white rounded-lg"
                >
                    Apply
                </button>

                <button
                    onClick={() => {
                        setSliderMin(initialMin);
                        setSliderMax(initialMax);
                        onApply(null, null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}

export default PriceFilter;
