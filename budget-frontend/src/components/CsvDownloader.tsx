'use client'

import Image from "next/image";
import { Transaction } from "@/types/DataTypes";

interface CsvDownloaderProps {
    transactions: Transaction[];
}

export default function CsvDownloader({ transactions }: CsvDownloaderProps) {
    function handleDownloadCsv() {
        if (transactions.length === 0) {
            alert("No transactions available to download.");
            return;
        }

        const headers = ["Transaction ID", "Type", "Amount", "Description", "Timestamp", "Category"];
        const rows = transactions.map(t => [
            t.transactionId ?? "",
            t.transactionType ?? "",
            t.amount ?? 0,
            `"${(t.description || "").replace(/"/g, '""')}"`,
            t.timestamp ?? "",
            t.category ?? ""
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <button
            onClick={handleDownloadCsv}
            type="button"
            title="Download CSV"
            aria-label="Download CSV"
            className="p-1 rounded hover:opacity-80 active:scale-95 transition-all flex items-center justify-center focus:outline-none"
        >
            <Image
                src="/download-icon.png"
                alt="Download CSV"
                width={32}
                height={32}
                className="rounded object-contain bg-sky-500"
            />
        </button>
    );
}