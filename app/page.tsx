'use client'

import React, { useState } from 'react';

export default function Home() {
    const [ticker, setTicker] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Future: Fetch stock price based on ticker
        console.log(`Fetching data for ${ticker}`);
    };
    
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="card w-full max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                    <h2 className="card-title">Stock Price Tracker</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Enter Stock Ticker</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., AAPL"
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                className="input input-bordered"
                             />
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">
                                Get Price
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}