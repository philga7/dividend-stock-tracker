import axios from 'axios';
import StockData from '@/types/stockData';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Function to format the Polygon API call URLs
const getPolygonUrl = (endpoint: string) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${POLYGON_BASE_URL}${endpoint}${separator}apiKey=${POLYGON_API_KEY}`;
};

// Helper function to get the date based on 4 PM ET rule
const getStockDate = () => {
    const now = new Date();

    // Convert current time to UTC
    const utcNow = new Date(now.toUTCString());

    // Calculate Eastern Time (ET), which is UTC-5 or UTC-4 depending on daylight saving
    const utcOffset = now.getTimezoneOffset(); // Get UTC offset in minutes
    const etOffset = utcOffset + 240; // Eastern Time is UTC-5 (Standard Time), or UTC-4 (Daylight Saving Time)
    const etNow = new Date(utcNow.getTime() - etOffset * 60 * 1000);

    // Check if the current time is after 4 PM ET
    const marketCloseHour = 16; // 4 PM in 24-hour format
    const marketCloseMinute = 0;

    const isAfterMarketClose = etNow.getHours() > marketCloseHour ||
        (etNow.getHours() === marketCloseHour && etNow.getMinutes() >= marketCloseMinute);

    if (isAfterMarketClose) {
        // Return today's date if it is after 4 PM ET
        return etNow.toISOString().split('T')[0];
    } else {
        // Otherwise, return yesterday's date
        const yesterday = new Date(etNow);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
};

export const getStockQuote = async (symbol: string) => {
    try {
        // Force symbol to uppercase
        const upperSymbol = symbol.toUpperCase();

        // Get the correct date (either today or yesterday based on the time)
        const stockDate = getStockDate();

        // Fetch previous day's OHLC (Open, High, Low, Close) using Aggregates API
        const prevDayResponse = await axios.get(getPolygonUrl(`/v1/open-close/${upperSymbol}/${stockDate}`));
        const prevDayData = prevDayResponse.data;

        // Fetch 20 days of historical data for SMA and Stochastic calculations
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 20);
        const startDateStr = startDate.toISOString().split('T')[0];

        const historyResponse = await axios.get(getPolygonUrl(`/v2/aggs/ticker/${upperSymbol}/range/1/day/${startDateStr}/${endDate}`));
        const historyData = historyResponse.data.results;

        // Ensure there is enough data for SMA and Stochastic calculations
        if (!historyData || historyData.length < 14) {
            throw new Error('Insufficient historical data for technical indicators');
        }
        
        // Calculate 20-day SMA (Simple Moving Average)
        const sma = (historyData.slice(-20).reduce((acc: number, curr: { c: number }) => acc + curr.c, 0) / 20).toFixed(2);

        // Calculate Stochastic Oscillator (StochK and StochD) using 14-day period
        const stochK = calculateStochasticOscillatorK(historyData).toFixed(2);
        const stochD = calculateStochasticOscillatorD(Number(stochK)).toFixed(2);

        // Fetch Ex-Dividend Date using the Dividends API
        const dividendResponse = await axios.get(getPolygonUrl(`/v3/reference/dividends?ticker=${upperSymbol}`));
        const exDividendDate = dividendResponse.data.results[0]?.ex_dividend_date;

        // Fetch latest news using the Ticker News API
        const newsResponse = await axios.get(getPolygonUrl(`/v2/reference/news?ticker=${upperSymbol}`));
        const newsArticles = newsResponse.data.results.slice(0, 6).map((article: { title: string; article_url: string }) => ({
            title: article.title,
            url: article.article_url,
        }));

        return {
            symbol: upperSymbol,
            price: prevDayData.close,
            high: prevDayData.high,
            low: prevDayData.low,
            sma,
            stochK,
            stochD,
            exDividendDate,
            news: newsArticles,
        };
    } catch (error) {
        console.error('Error fetching stock data from Polygon:', error);
        throw new Error('Failed to fetch stock data');
    }
};

// Helper functions to calculate Stochastic Oscillator (StochK and StochD)
const calculateStochasticOscillatorK = (data: StockData[]) => {
    // Calculate Stochastic K value over a 14-day period
    const period = 14;
    const latestData = data.slice(-period);
    const high = Math.max(...latestData.map(d => d.h));
    const low = Math.min(...latestData.map(d => d.l));
    const close = latestData[latestData.length - 1].c;
    return ((close - low) / (high - low)) * 100;
};

const calculateStochasticOscillatorD = (stochK: number) => stochK / 3;
