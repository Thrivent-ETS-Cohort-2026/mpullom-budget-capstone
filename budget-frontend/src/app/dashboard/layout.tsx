'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
            <header className="border-b border-slate-700 bg-slate-800 px-8 py-4 flex flex-col gap-4">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Good morning, {currentUser?.firstName || 'User'}
                    </h1>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition shadow-sm"
                        >
                            Logout
                        </button>

                        <div className="w-10 h-10 rounded-full border-2 border-slate-600 overflow-hidden flex items-center justify-center shadow-sm">
                            <img
                                src="/profile-icon.jpeg"
                                alt="User Profile"
                                className="w-full h-full object-cover block"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
                    <button
                        onClick={() => router.push('/dashboard/banking')}
                        className="flex-1 py-3 text-center font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white border-r border-slate-700 transition"
                    >
                        Banking
                    </button>

                    <button
                        onClick={() => router.push('/dashboard/budgeting')}
                        className="flex-1 py-3 text-center font-medium bg-blue-600 text-white shadow-inner transition"
                    >
                        Budgeting
                    </button>
                </div>

            </header>

            <main className="flex-1 p-6 md:p-10 flex justify-center items-center bg-slate-950">
                <div className="w-full max-w-6xl h-full min-h-[70vh] border border-slate-800 rounded-2xl bg-slate-900/40 p-6 shadow-xl flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}