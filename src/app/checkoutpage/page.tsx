import OrderSummaryPage from '../components/ui/OrderSummaryPage';


// Note: The CheckoutProvider must be defined in your RootLayout.tsx (as you previously had it)
// or a higher shared layout that wraps this route.
export default function CheckoutRoute() {
    return <OrderSummaryPage />;
} 