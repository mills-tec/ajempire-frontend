import { sidebarItems } from "../data/sidebarData";
import SideBarComp from "./SideBarComp";


const SideNav = () => {
    return (
        <div className="">
            <SideBarComp items={sidebarItems} />
        </div>
    )

}

export default SideNav;