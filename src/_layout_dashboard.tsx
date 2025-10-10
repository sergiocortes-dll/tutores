import { Box } from "@u_ui/u-ui";
import { Outlet } from "react-router-dom";
import HeaderDashboard from "./components/block/HeaderDashboard";
import SidebarDashboard from "./components/block/SidebarDashboard";
import { useDashboard } from "./context/DashboardContext";

export default function LayoutDashboard() {
  const { courses } = useDashboard();
  return (
    <Box sx={{ display: 'flex', width: '100%'}}>
      <SidebarDashboard courses={courses} />
      <Box sx={{ flex: 1}}>
        <HeaderDashboard courses={courses} />
        <Outlet />
      </Box>
    </Box>
  );
}
