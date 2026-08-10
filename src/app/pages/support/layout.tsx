import TawkToWidget from "@/components/TawkToWidget";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TawkToWidget />
    </>
  );
}
