interface StockQuote {
    symbol: string;
    price: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    change: number;
    changePercent: string;
}

export default StockQuote;