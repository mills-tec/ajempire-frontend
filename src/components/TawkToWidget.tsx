"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SUPPORT_PATH = "/pages/support";

export default function TawkToWidget() {
  const pathname = usePathname();
  const onSupportPage = pathname?.startsWith(SUPPORT_PATH) ?? false;

  // Use a ref so the polling closure always sees the latest value
  const onSupportRef = useRef(onSupportPage);
  onSupportRef.current = onSupportPage;

  useEffect(() => {
    let pollId: ReturnType<typeof setInterval>;

    const applyVisibility = (): boolean => {
      const api = (window as any).Tawk_API;
      if (
        typeof api?.hideWidget !== "function" ||
        typeof api?.showWidget !== "function"
      ) {
        return false;
      }
      if (onSupportRef.current) {
        api.showWidget();
      } else {
        api.hideWidget();
      }
      return true;
    };

    // Try immediately — widget may already be loaded from a previous route
    if (!applyVisibility()) {
      // Not ready yet: poll every 300ms until the API is available, then stop
      pollId = setInterval(() => {
        if (applyVisibility()) clearInterval(pollId);
      }, 300);
    }

    return () => clearInterval(pollId);
  }, [onSupportPage]);

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();

          Tawk_API.customStyle = {
            visibility: {
              desktop: { position: 'br', xOffset: 15, yOffset: 15 },
              mobile:  { position: 'br', xOffset: 10, yOffset: 80 }
            }
          };

          Tawk_API.onLoad = function() {
            var style = document.createElement('style');
            style.innerHTML = [
              '@media (max-width: 768px) {',
              '  .tawk-max-container { max-width: 360px !important; width: 92vw !important; right: 10px !important; left: auto !important; }',
              '  iframe[title="chat widget"] { max-width: 360px !important; width: 92vw !important; right: 10px !important; left: auto !important; }',
              '}'
            ].join('');
            document.head.appendChild(style);
          };

          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a73e3515f56bb1d4bf60900/1jvaavujp';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
