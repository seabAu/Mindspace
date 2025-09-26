
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SidebarDataManager from "./SidebarDataManager";
import SidebarCalendarView from "./SidebarCalendarView";
import { SidebarContent } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader, SidebarInset } from "../../../../../components/ui/sidebar";
import { CONTENT_HEADER_HEIGHT } from "../../../../../lib/config/constants";
import { ReflectProvider, useReflectContext } from "@/features/Reflect/context/ReflectProvider";

const ReflectStatsSidebar = () => {
    return (
        <ReflectProvider>
            <SidebarDataManager />
        </ReflectProvider>
    );
};


export default ReflectStatsSidebar;
