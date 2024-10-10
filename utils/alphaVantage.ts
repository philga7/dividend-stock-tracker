import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockQuote = async (symbol: string) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: API_KEY,
            },
        });
        const quote = response.data['Global Quote'];
        return {
            symbol: quote['01. symbol'],
            open: quote['02. open'],
            high: quote['03. high'],
            low: quote['04. low'],
            price: quote['05. price'],
            volume: quote['06. volume'],
            previousClose: quote['08. previous close'],
            change: quote['09. change'],
            changePercent: quote['10. change percent'],
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw new Error('Failed to fetch stock data');
    }
};
