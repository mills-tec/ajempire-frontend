import UpdateGallery from "@/app/components/UpdateGallery";
import React from "react";
import img1 from "../../../../assets/uimg1.png";
import img2 from "../../../../assets/uimg2.png";
import img3 from "../../../../assets/uimg3.png";
import img4 from "../../../../assets/uimg4.png";

const images = [
  { id: 1, image: img1, title: "hello", description: "hi" },
  { id: 1, image: img2, title: "", description: "" },
  { id: 1, image: img3, title: "", description: "" },
  { id: 1, image: img4, title: "", description: "" },
];

export default function Page() {
  return (
    <section className="w-full overflow-auto px-8 py-10">
      <UpdateGallery items={images} />
    </section>
  );
}
