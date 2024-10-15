import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockQuoteForm from '../StockQuoteForm';
import * as alphaVantage from '../../../utils/alphaVantage';

jest.mock('../../../utils/alphaVantage', () => ({
    getStockQuote: jest.fn(),
}));

describe('StockQuoteForm', () => {
    it('renders the form correctly', () => {
        render(<StockQuoteForm />);
        expect(screen.getByPlaceholderText(/enter stock symbol/i)).toBeInTheDocument();
        expect(screen.getByText(/get quote/i)).toBeInTheDocument();
    });

    it('displays No Strong Signal when the stock price is above the SMA and Stochastic K is above D', async () => {
        // Mock API response with SMA and Stochastic values
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'AAPL',
            price: '150.00',
            high: '152.00',
            low: '147.00',
            sma: '148.00',  // Mocking an SMA below the current price (Buy scenario)
            stochK: '70.00',
            stochD: '65.00',
            exDividendDate: '2024-10-15',
            news: [{ title: 'Apple releases new iPhone', url: 'https://news.example.com/apple-iphone' }],
        });

        render(<StockQuoteForm />);

        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'AAPL' } });
        fireEvent.click(screen.getByText(/get quote/i));

        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('AAPL'));

        // Check for stock data rendering
        expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$150.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 148.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 70.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 65.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-10-15/i)).toBeInTheDocument();

        // Check for Buy signal (SMA below price, K > D)
        expect(screen.getByText(/No strong signal - Stochastic momentum is unclear./i)).toBeInTheDocument();

        // Check for momentum interpretation (Bullish momentum: K > D)
        expect(screen.getByText(/Bullish momentum - Stochastic K is above D/i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Apple releases new iPhone/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Apple releases new iPhone/i })).toHaveAttribute('href', 'https://news.example.com/apple-iphone');
    });

    it('displays a Buy signal when the stock price is below the SMA and Stochastic D is below K', async () => {
        // Mock API response for Sell scenario
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'TSLA',
            price: '800.00',
            high: '820.00',
            low: '790.00',
            sma: '810.00',  // SMA above the price (Sell scenario)
            stochK: '55.00',
            stochD: '50.00',  // K < D
            exDividendDate: '2024-11-01',
            news: [{ title: 'Tesla unveils new model', url: 'https://news.example.com/tesla-model' }],
        });

        render(<StockQuoteForm />);

        // Simulate user input and form submission
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'TSLA' } });
        fireEvent.click(screen.getByText(/get quote/i));

        // Wait for the async call to complete
        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('TSLA'));

        // Check for stock data rendering
        expect(screen.getByText(/TSLA/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$800.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 810.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 55.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 50.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-11-01/i)).toBeInTheDocument();

        // Check for Buy signal (SMA above price, K > D)
        expect(screen.getByText(/Buy - The price is below the SMA, and Stochastic indicates bullish momentum./i)).toBeInTheDocument();

        // Check for momentum interpretation (Bullish momentum: K > D)
        expect(screen.getByText(/Bullish momentum - Stochastic K is above D, indicating the stock may continue upward./i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Tesla unveils new model/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tesla unveils new model/i })).toHaveAttribute('href', 'https://news.example.com/tesla-model');
    });

    it('displays a Sell signal when the stock price is above the SMA and Stochastic D is above K', async () => {
        // Mock API response for Sell scenario
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'TSLA',
            price: '815.00',
            high: '820.00',
            low: '790.00',
            sma: '810.00',  // SMA above the price (Sell scenario)
            stochK: '55.00',
            stochD: '60.00',  // K < D
            exDividendDate: '2024-11-01',
            news: [{ title: 'Tesla unveils new model', url: 'https://news.example.com/tesla-model' }],
        });

        render(<StockQuoteForm />);

        // Simulate user input and form submission
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'TSLA' } });
        fireEvent.click(screen.getByText(/get quote/i));

        // Wait for the async call to complete
        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('TSLA'));

        // Check for stock data rendering
        expect(screen.getByText(/TSLA/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$815.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 810.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 55.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 60.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-11-01/i)).toBeInTheDocument();

        // Check for Sell signal (SMA below price, K < D)
        expect(screen.getByText(/Sell - The price is above the SMA, and Stochastic indicates bearish momentum./i)).toBeInTheDocument();

        // Check for momentum interpretation (Bearish momentum: K < D)
        expect(screen.getByText(/Bearish momentum - Stochastic K is below D, indicating the stock may continue downward./i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Tesla unveils new model/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tesla unveils new model/i })).toHaveAttribute('href', 'https://news.example.com/tesla-model');
    });

    it('displays an Overbought signal when Stochastic D and K are above 80', async () => {
        // Mock API response for Sell scenario
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'TSLA',
            price: '815.00',
            high: '820.00',
            low: '790.00',
            sma: '810.00',  // SMA above the price (Sell scenario)
            stochK: '81.00',
            stochD: '82.00',  // K < D
            exDividendDate: '2024-11-01',
            news: [{ title: 'Tesla unveils new model', url: 'https://news.example.com/tesla-model' }],
        });

        render(<StockQuoteForm />);

        // Simulate user input and form submission
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'TSLA' } });
        fireEvent.click(screen.getByText(/get quote/i));

        // Wait for the async call to complete
        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('TSLA'));

        // Check for stock data rendering
        expect(screen.getByText(/TSLA/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$815.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 810.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 81.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 82.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-11-01/i)).toBeInTheDocument();

        // Check for Sell signal (SMA below price, K < D)
        expect(screen.getByText(/Sell - The price is above the SMA, and Stochastic indicates bearish momentum./i)).toBeInTheDocument();

        // Check for momentum interpretation (Overbought momentum: K < D)
        expect(screen.getByText(/Overbought - Both Stochastic K and D are above 80, indicating the stock may be overbought./i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Tesla unveils new model/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tesla unveils new model/i })).toHaveAttribute('href', 'https://news.example.com/tesla-model');
    });

    it('displays an Oversold and No Strong signals when Stochastic D and K are below 20', async () => {
        // Mock API response for Sell scenario
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'TSLA',
            price: '815.00',
            high: '820.00',
            low: '790.00',
            sma: '810.00',  // SMA above the price (Sell scenario)
            stochK: '19.00',
            stochD: '18.00',  // K < D
            exDividendDate: '2024-11-01',
            news: [{ title: 'Tesla unveils new model', url: 'https://news.example.com/tesla-model' }],
        });

        render(<StockQuoteForm />);

        // Simulate user input and form submission
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'TSLA' } });
        fireEvent.click(screen.getByText(/get quote/i));

        // Wait for the async call to complete
        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('TSLA'));

        // Check for stock data rendering
        expect(screen.getByText(/TSLA/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$815.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 810.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 19.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 18.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-11-01/i)).toBeInTheDocument();

        // Check for No Strong signal (SMA below price, K > D but below 20)
        expect(screen.getByText(/No strong signal - Stochastic momentum is unclear./i)).toBeInTheDocument();

        // Check for momentum interpretation (Oversold momentum: K & D < 20)
        expect(screen.getByText(/Oversold - Both Stochastic K and D are below 20, indicating the stock may be oversold./i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Tesla unveils new model/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tesla unveils new model/i })).toHaveAttribute('href', 'https://news.example.com/tesla-model');
    });

    it('displays a Neutral and No Strong signals when Stochastic D and K are equal', async () => {
        // Mock API response for Sell scenario
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
            symbol: 'TSLA',
            price: '815.00',
            high: '820.00',
            low: '790.00',
            sma: '810.00',  // SMA above the price (Sell scenario)
            stochK: '50.00',
            stochD: '50.00',  // K < D
            exDividendDate: '2024-11-01',
            news: [{ title: 'Tesla unveils new model', url: 'https://news.example.com/tesla-model' }],
        });

        render(<StockQuoteForm />);

        // Simulate user input and form submission
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'TSLA' } });
        fireEvent.click(screen.getByText(/get quote/i));

        // Wait for the async call to complete
        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('TSLA'));

        // Check for stock data rendering
        expect(screen.getByText(/TSLA/i)).toBeInTheDocument();
        expect(screen.getByText(/Price: \$815.00/i)).toBeInTheDocument();
        expect(screen.getByText(/SMA \(20-day\): 810.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic K: 50.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Stochastic D: 50.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Ex-Dividend Date: 2024-11-01/i)).toBeInTheDocument();

        // Check for No Strong signal (SMA below price, K = D)
        expect(screen.getByText(/No strong signal - Stochastic momentum is unclear./i)).toBeInTheDocument();

        // Check for momentum interpretation (Neutral momentum: K = D)
        expect(screen.getByText(/Neutral - The stock is in a neutral zone without a clear overbought or oversold indication./i)).toBeInTheDocument();

        // Check for news display
        expect(screen.getByText(/Tesla unveils new model/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Tesla unveils new model/i })).toHaveAttribute('href', 'https://news.example.com/tesla-model');
    });

    it('displays error message when API call fails', async () => {
        (alphaVantage.getStockQuote as jest.Mock).mockRejectedValue(new Error('API error'));
    
        render(<StockQuoteForm />);
    
        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'INVALID' } });
        fireEvent.click(screen.getByText(/get quote/i));
    
        await waitFor(() => expect(screen.getByText(/failed to fetch stock data/i)).toBeInTheDocument());
    });
});
