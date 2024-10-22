import axios from 'axios';
import NewsArticle from '@/types/newsArticle';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

export const getStockQuote = async (symbol: string) => {
    try {
        // Fetch global quote
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: API_KEY,
            },
        });
        const quote = response.data['Global Quote'];

        // Fetch SMA (Simple Moving Average)
        const smaResponse = await axios.get(BASE_URL, {
            params: {
                function: 'SMA',
                symbol,
                interval: 'daily',
                time_period: 20,
                series_type: 'close',
                apikey: API_KEY,
            },
        });
        const sma = smaResponse.data['Technical Analysis: SMA']?.[Object.keys(smaResponse.data['Technical Analysis: SMA'])[0]]?.['SMA'];

        // Fetch Stochastics for the SMA
        const stochResponse = await axios.get(BASE_URL, {
            params: {
                function: 'STOCH',
                symbol,
                interval: 'daily',
                fastkperiod: 14,
                slowkperiod: 3,
                slowdperiod: 3,
                apikey: API_KEY,
            },
        });
        const stochData = stochResponse.data['Technical Analysis: STOCH'];
        const latestStoch = stochData[Object.keys(stochData)[0]];
        const stochK = latestStoch['SlowK'];
        const stochD = latestStoch['SlowD'];

        // Fetch Ex-Dividend Date
        const overviewResponse = await axios.get(BASE_URL, {
            params: {
                function: 'OVERVIEW',
                symbol,
                apikey: API_KEY,
            },
        });
        const exDividendDate = overviewResponse.data['ExDividendDate'];

        // Fetch latest news (News Sentiment API)
        const newsResponse = await axios.get(BASE_URL, {
            params: {
                function: 'NEWS_SENTIMENT',
                tickers: symbol,
                apikey: API_KEY,
            },
        });

        const newsArticles = newsResponse.data.feed.slice(0, 6).map((article: NewsArticle) => ({
            title: article.title,
            url: article.url,
        }));

        return {
            symbol: quote['01. symbol'],
            price: quote['05. price'],
            high: quote['03. high'],
            low: quote['04. low'],
            sma,
            stochK,
            stochD,
            exDividendDate,
            news: newsArticles,
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw new Error('Failed to fetch stock data');
    }
};
