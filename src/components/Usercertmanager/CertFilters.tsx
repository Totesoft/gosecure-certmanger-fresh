import React from "react";

interface OptionItem {
    id: string | number;
}

interface RenderCertFiltersProps {
    rootIdInput: string;
    intermediateIdInput: string;
    certIdInput: string;

    setRootIdInput: (value: string) => void;
    setIntermediateIdInput: (value: string) => void;
    setCertIdInput: (value: string) => void;

    intermediateOptions: OptionItem[];
    certOptions: OptionItem[];

    onClearFilters: () => void;
}

const RenderCertFilters = ({
    rootIdInput,
    intermediateIdInput,
    certIdInput,
    setRootIdInput,
    setIntermediateIdInput,
    setCertIdInput,
    intermediateOptions,
    certOptions,
    onClearFilters
}: RenderCertFiltersProps) => {
    return (
        <div className="my-4 p-4 bg-gray-100 rounded-xl shadow-md">

            <div className="mb-4">
                <label className="font-semibold">Filter by Root ID</label>
                <input
                    className="block w-full p-2 border rounded mt-1"
                    type="text"
                    value={rootIdInput}
                    onChange={(e) => setRootIdInput(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="font-semibold">Filter by Intermediate</label>
                <select
                    className="block w-full p-2 border rounded mt-1"
                    value={intermediateIdInput}
                    onChange={(e) => setIntermediateIdInput(e.target.value)}
                >
                    <option value="">All</option>
                    {intermediateOptions?.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.id}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="font-semibold">Filter by Certificate</label>
                <select
                    className="block w-full p-2 border rounded mt-1"
                    value={certIdInput}
                    onChange={(e) => setCertIdInput(e.target.value)}
                >
                    <option value="">All</option>
                    {certOptions?.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.id}
                        </option>
                    ))}
                </select>
            </div>

            <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={onClearFilters}
            >
                Clear Filters
            </button>
        </div>
    );
};

export default RenderCertFilters;
