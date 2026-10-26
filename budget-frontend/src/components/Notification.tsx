'use client'

interface NotificationProps {
    message: string;
    onClose: () => void;
}

export default function Notification({ message, onClose }: NotificationProps) {
    if (!message) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-md w-full text-slate-100 flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-rose-800 hover:text-rose-700 hover:bg-slate-700/50 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
                    aria-label="Close"
                >
                    ✕
                </button>
                <div className="mt-4 text-base font-medium text-slate-200">
                    {message}
                </div>
            </div>
        </div>
    );
}