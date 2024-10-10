import { useState } from 'react';
import { getStockQuote } from '../../utils/alphaVantage';
import StockQuote from '@/types/stockQuote';

const StockQuoteForm = () => {
    const [symbol, setSymbol] = useState('');
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await getStockQuote(symbol);
            setQuote(data);
        } catch {
            setError('Failed to fetch stock data');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 card bg-base-200 shadow-md">
            <h2 className="text-xl font-bold mb-4">Get Stock Quote</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                    type="text"
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="input input-bordered w-full"
                />
                <button type="submit" className="btn btn-primary">Get Quote</button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {quote && (
                <div className="mt-6 p-4 bg-white rounded shadow-md">
                    <h3 className="text-lg font-semibold">{quote.symbol}</h3>
                    <p>Price: ${quote.price}</p>
                    <p>Open: ${quote.open}</p>
                    <p>High: ${quote.high}</p>
                    <p>Low: ${quote.low}</p>
                    <p>Previous Close: ${quote.previousClose}</p>
                    <p>Change: {quote.change} ({quote.changePercent})</p>
                </div>
            )}
        </div>
    );
};

export default StockQuoteForm;