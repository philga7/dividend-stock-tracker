import { test, expect } from '@playwright/test';

test.describe('Stock Quote Form', () => {
  test('should load the form and fetch stock data with SMA and Stochastic analysis', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');

    // Check that the input field and button are present
    const input = page.locator('input[placeholder="Enter stock symbol (e.g., AAPL)"]');
    await expect(input).toBeVisible();

    const button = page.locator('text=Get Quote');
    await expect(button).toBeVisible();

    // Enter a stock symbol and submit the form
    await input.fill('AAPL');
    await button.click();

    // Wait for the stock data to appear
    const stockSymbol = page.locator('h3:has-text("AAPL")');
    await expect(stockSymbol).toBeVisible();
    
    // Check that stock data fields are rendered
    const price = page.locator('text=Price: $');
    await expect(price).toContainText('Price: $');

    // Check for SMA
    const sma = page.locator('text=SMA (20-day):');
    await expect(sma).toContainText('SMA (20-day):');

    // Check for Stochastic K and D values
    const stochK = page.locator('text=Stochastic K:');
    const stochD = page.locator('text=Stochastic D:');
    await expect(stochK).toContainText('Stochastic K:');
    await expect(stochD).toContainText('Stochastic D:');

    // Assert that the high and low details are rendered
    const openPrice = page.locator('text=High: $');
    const change = page.locator('text=Low:');
    
    await expect(openPrice).toContainText('High: $');
    await expect(change).toContainText('Low:');
  });
});
