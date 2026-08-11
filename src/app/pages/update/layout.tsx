import UpdateMenu from "@/app/components/UpdateMenu";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="grid grid-cols-1 grid-rows-[auto_1fr] fixed h-[calc(100dvh-80px)] md:h-screen md:grid-cols-5 md:grid-rows-1 bg-[#FFEAF6] md:top-[5rem] w-[100vw] lg:z-40 z-50 font-poppins">
      <div className="md:col-span-1">
        <UpdateMenu />
      </div>
      <div className="md:col-span-4 h-full min-h-0">{children}</div>
    </section>
  );
}
