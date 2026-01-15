import UpdateMenu from "@/app/components/UpdateMenu";
import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex h-[calc(100vh-5rem)] bg-[#FFEAF6] fixed top-[5rem] w-[100vw] z-50">
      <div className="min-w-[20rem]">
        <UpdateMenu />
      </div>
      <div className="flex w-full">{children}</div>
    </section>
  );
}
