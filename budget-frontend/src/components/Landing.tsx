'use client'
import Login from "@/components/Login";

export default function Landing() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
        </div>        
        <Login />
      </div>
    </main>
  );
}