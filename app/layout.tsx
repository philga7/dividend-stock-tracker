import '../styles/globals.css'

export const metadata = {
    title: 'Stock Dividend Tracker',
    description: 'Track your stock dividends and get real-time quotes',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-base-100 text-base-content">
                {children}
            </body>
        </html>
    );
}
