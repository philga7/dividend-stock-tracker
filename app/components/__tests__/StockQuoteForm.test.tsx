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

    it('calls getStockQuote and displays data on form submission', async () => {
        (alphaVantage.getStockQuote as jest.Mock).mockResolvedValue({
          symbol: 'AAPL',
          price: '150.00',
          open: '148.00',
          high: '152.00',
          low: '147.00',
          previousClose: '148.50',
          change: '1.50',
          changePercent: '1.01%',
        });

        render(<StockQuoteForm />);

        const input = screen.getByPlaceholderText(/enter stock symbol/i);
        fireEvent.change(input, { target: { value: 'AAPL' } });

        fireEvent.click(screen.getByText(/get quote/i));

        await waitFor(() => expect(alphaVantage.getStockQuote).toHaveBeenCalledWith('AAPL'));

        expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
        expect(screen.getByText(/price: \$150.00/i)).toBeInTheDocument();
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
