import SideBarComp from "./SideBarComp";
import { sidebarItems } from "../data/sidebarData";


const SideNav = () => {
    return (
        <div className="">
            <SideBarComp items={sidebarItems} />
        </div>
    )

}

export default SideNav;