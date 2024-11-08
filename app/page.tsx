"use client";

import StockQuoteForm from './components/StockQuoteForm';

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="p-4 bg-base-100 shadow-md flex justify-between">
                <h1 className="text-xl font-bold">Stock Dividend Tracker</h1>
                <nav>
                    <a className="btn btn-outline">Portfolio</a>
                    <a className="btn btn-outline">Alerts</a>
                </nav>
            </header>
            <main className="flex flex-1 items-center justify-center p-4 bg-base-200">
                <StockQuoteForm />
            </main>
        </div>
    )
}