'use client'

import { useState } from "react";

interface TransactionFilterFetchProps {
    onSearch: (fromDate: string, toDate: string) => void;
}

export default function TransactionFilterFetch({ onSearch }: TransactionFilterFetchProps) {
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSearch(fromDate, toDate);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-4 items-end">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 font-medium">From Date</label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1 text-sm rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-600 font-medium">To Date</label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1 text-sm rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
            </div>

            <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-sm font-medium rounded text-white transition-colors shadow-sm"
            >
                Search
            </button>
        </form>
    );
}