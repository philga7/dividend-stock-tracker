import { useState } from 'react';
import { getStockQuote } from '../../utils/alphaVantage';
import StockQuote from '@/types/stockQuote';

const StockQuoteForm = () => {
    const [symbol, setSymbol] = useState('');
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [error, setError] = useState('');
    const [signal, setSignal] = useState('');
    const [momentumContext, setMomentumContext] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSignal('');  // Reset signal on new fetch
        setMomentumContext('');  // Reset momentum context on new fetch

        try {
            const data = await getStockQuote(symbol);
            setQuote(data);

            // Analyze SMA and Stochastic for buy/sell signals
            if (data.sma && data.stochK && data.stochD) {
                const currentPrice = parseFloat(data.price);
                const smaValue = parseFloat(data.sma);
                const stochKValue = parseFloat(data.stochK);
                const stochDValue = parseFloat(data.stochD);

                // Buy/Sell signals based on SMA and Stochastic K/D crossovers
                if (currentPrice < smaValue && stochKValue > stochDValue) {
                    setSignal('Buy - The price is below the SMA, and Stochastic indicates bullish momentum.');
                } else if (currentPrice > smaValue && stochKValue < stochDValue) {
                    setSignal('Sell - The price is above the SMA, and Stochastic indicates bearish momentum.');
                } else {
                    setSignal('No strong signal - Stochastic momentum is unclear.');
                }

                // Stochastic interpretation for momentum
                if (stochKValue > 80 && stochDValue > 80) {
                    setMomentumContext('Overbought - Both Stochastic K and D are above 80, indicating the stock may be overbought.');
                } else if (stochKValue < 20 && stochDValue < 20) {
                    setMomentumContext('Oversold - Both Stochastic K and D are below 20, indicating the stock may be oversold.');
                } else if (stochKValue > stochDValue) {
                    setMomentumContext('Bullish momentum - Stochastic K is above D, indicating the stock may continue upward.');
                } else if (stochKValue < stochDValue) {
                    setMomentumContext('Bearish momentum - Stochastic K is below D, indicating the stock may continue downward.');
                } else {
                    setMomentumContext('Neutral - The stock is in a neutral zone without a clear overbought or oversold indication.');
                }
            }
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
                    <p>High: ${quote.high}</p>
                    <p>Low: ${quote.low}</p>

                    {/* Simple Moving Average */}
                    {quote.sma && <p>SMA (20-day): {quote.sma}</p>}

                    {/* Stochastics */}
                    {quote.stochK && quote.stochD && (
                        <div>
                            <p>Stochastic K: {quote.stochK}</p>
                            <p>Stochastic D: {quote.stochD}</p>
                        </div>
                    )}

                    {/* Buy/Sell Signal */}
                    {signal && (
                        <div className={`mt-4 p-2 rounded ${signal.includes('Buy') ? 'bg-green-200' : signal.includes('Sell') ? 'bg-red-200' : 'bg-yellow-200'}`}>
                            <p>{signal}</p>
                        </div>
                    )}

                    {/* Momentum Context */}
                    {momentumContext && (
                        <div className={`mt-2 p-2 rounded bg-gray-100`}>
                            <p>{momentumContext}</p>
                        </div>
                    )}

                    {/* Ex-Dividend Date */}
                    {quote.exDividendDate && <p>Ex-Dividend Date: {quote.exDividendDate}</p>}

                    {/* Latest News */}
                    {quote.news && (
                        <div>
                            <h4 className="font-bold mt-4">Latest News</h4>
                            <ul>
                                {quote.news.map((article, index) => (
                                    <li key={index}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                            {article.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockQuoteForm;