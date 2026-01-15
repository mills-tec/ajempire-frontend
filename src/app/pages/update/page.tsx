import UpdateMenu from "@/app/components/UpdateMenu";
import UpdateVideoContainer from "@/app/components/UpdateVideoContainer";
import React from "react";

export default function UpdatePage() {
  return (
    <section className="flex w-full">
      {/* <div className="min-w-[20rem]">
        <UpdateMenu />
      </div> */}
      <UpdateVideoContainer />
    </section>
  );
}
