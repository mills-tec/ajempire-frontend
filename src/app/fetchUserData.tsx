import { useCartStore } from '@/lib/stores/cart-store';
import { useEffect } from 'react';

export default function FetchUserData() {
    useEffect(() => {
        // if (pathname.includes("admin")) return;
        const retrySync = useCartStore.getState().retrySync;

        // Retry when connection is restored
        window.addEventListener("online", retrySync);
        // Retry periodically (e.g., every 1 minute)
        const interval = setInterval(retrySync, 60000);
        // if (getBearerToken()) {
        //     // useWishlistStore.getState().initWishlist();
        // }


        return () => {
            window.removeEventListener("online", retrySync);
            clearInterval(interval);
        };
        // pathname (not just []): this must re-run when someone crosses into or
        // out of an admin route within the same session, or the guard above only
        // ever reflects whatever route the app happened to boot on. Previously
        // the `!getBearerToken()` branch also returned before the cleanup
        // function was registered, which leaked the listener/interval on every
        // re-run for guests — fixed by moving that check after they're set up.
    }, []);
    return null
}
