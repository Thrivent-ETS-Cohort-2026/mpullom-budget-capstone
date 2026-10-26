'use client'

import { useState } from "react";

interface TransactionFilterFetchProps {
    onSearch: (fromDate: string, toDate: string) => void;
}

export default function TransactionFilterFetch({ onSearch }: TransactionFilterFetchProps) {
    const getFormattedDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [fromDate, setFromDate] = useState<string>(getFormattedDate(firstDayOfMonth));
    const [toDate, setToDate] = useState<string>(getFormattedDate(lastDayOfMonth));

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSearch(fromDate, toDate);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 mb-2 items-end">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">From Date</label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1 text-sm rounded border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">To Date</label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1 text-sm rounded border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
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