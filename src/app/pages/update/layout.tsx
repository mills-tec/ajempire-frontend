import UpdateMenu from "@/app/components/UpdateMenu";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="grid grid-cols-1 fixed h-screen md:grid-cols-5 bg-[#FFEAF6]  md:top-[5rem] w-[100vw] lg:z-40 z-50 font-poppins">
      <div className="md:col-span-1">
        <UpdateMenu />
      </div>
      <div className="md:col-span-4">{children}</div>
    </section>
  );
}
