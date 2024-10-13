import { test, expect } from '@playwright/test';

test.describe('Stock Quote Form', () => {
  test('should load the form and fetch stock data', async ({ page }) => {
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
    const stockSymbol = page.locator('text=AAPL');
    await expect(stockSymbol).toBeVisible();
    
    // Check that stock data fields are rendered
    const price = page.locator('text=Price: $');
    await expect(price).toContainText('Price: $');

    // Assert that the price, open, and change details are rendered
    const openPrice = page.locator('text=Open: $');
    const change = page.locator('text=Change:');
    
    await expect(openPrice).toContainText('Open: $');
    await expect(change).toContainText('Change:');
  });
});
