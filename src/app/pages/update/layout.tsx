import UpdateMenu from "@/app/components/UpdateMenu";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <section className="grid grid-cols-1 h-screen md:grid-cols-5 bg-[#FFEAF6] fixed md:top-[5rem] w-[100vw] z-50 font-poppins" >
      <div className="md:col-span-1">
        <UpdateMenu />
      </div>
      <div className="md:col-span-4">{children}</div>
    </section>
  );
}
