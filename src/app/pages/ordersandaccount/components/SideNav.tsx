import SideBarComp from "./SideBarComp";
import { SideBarItem, sidebarItems } from "../data/sidebarData";
type SideNavProps = {
    setActiveItem: (item: string) => void;
};


const SideNav = () => {
    return (
        <div>
            <SideBarComp items={sidebarItems} />
        </div>
    )

}

export default SideNav;