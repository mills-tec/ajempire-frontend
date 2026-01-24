"use client";

export default function ShareAppButton() {
    const handleShare = async () => {
        const shareData = {
            title: "Check out this app!",
            text: "I found this awesome app, try it out 👇",
            url: window.location.origin,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert("Sharing is not supported on this device");
            }
        } catch (error) {
            console.log("Share failed:", error);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="px-4 py-2 bg-primaryhover text-white rounded"
        >
            Share App
        </button>
    );
}
