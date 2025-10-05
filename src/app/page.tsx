import Categories from "@/app/components/ui/Categories";
import SearchBar from "./components/ui/SearchBar";


export default function Home() {
  return (
    <div className="w-full ">
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 shadow-sm px-[30px] h-[90px] flex items-center">
        <SearchBar />
      </div>
      <div>
        <Categories />
        <p>products will be displayed here</p>
      </div>

    </div>
  );
}
