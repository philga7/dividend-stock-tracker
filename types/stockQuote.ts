interface StockQuote {
    symbol: string;
    price: string;
    high: string;
    low: string;
    sma?: string;
    stochK?: string;
    stochD?: string;
    exDividendDate?: string;
    news?: { title: string; url: string }[];
}

export default StockQuote;