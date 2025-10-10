import { MenuRounded, WhatshotRounded } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@u_ui/u-ui";
import { useLocation } from "react-router-dom";
import type { CourseInterface } from "../../context/DashboardContext";

interface SidebarDashboardProps {
  courses: CourseInterface[];
}

export default function SidebarDashboard({ courses }: SidebarDashboardProps) {
  const location = useLocation();

  console.log(courses);

  return (
    <Box
      sx={(theme) => ({
        display: "inline-flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 1,
        borderRight: 1,
        borderColor: theme.palette.divider,
        width: 250,
        height: `100dvh`,
        position: "sticky",
        top: 0,
        zIndex: 99,
        transition: ".15s ease-in-out all",
        marginLeft: location.pathname.includes("create") ? '-250px' : 0
      })}
    >
      <Box sx={{ p: 1, height: 57, display: 'flex', width: '100%', alignItems: 'center', borderBottom: 1, borderColor: 'divider'}}>
        <IconButton>
          <MenuRounded />
        </IconButton>
        <WhatshotRounded />
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="#"
          sx={{
            mr: 2,
            fontFamily: "monospace",
            fontWeight: 700,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Tutores
        </Typography>
      </Box>
    </Box>
  );
}
