export default function Head() {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="favicon.png" />
      <link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192" />
      <link rel="icon" type="image/png" href="/icon-512.png" sizes="512x512" />
      <link rel="apple-touch-icon" href="/icon-192.png" sizes="192x192" />
      <link rel="apple-touch-icon" href="/icon-512.png" sizes="512x512" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
      {/* Default for iOS */}
      <meta name="theme-color" content="#A600FF" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="AJ Empire" />
      <meta name="application-name" content="AJ Empire" />
      <meta name="msapplication-TileColor" content="#FF008C" />
    </>
  );
}
