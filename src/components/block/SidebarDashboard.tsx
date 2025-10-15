import {
  MenuRounded,
  School,
  SchoolOutlined,
  ShowChart
} from "@mui/icons-material";
import { Box, IconButton, MenuItem, Typography } from "@u_ui/u-ui";
import { Link, useLocation } from "react-router-dom";
import type { CourseInterface } from "../../context/DashboardContext";

interface SidebarDashboardProps {
  courses: CourseInterface[];
}

const navigation = [
  {
    name: "Estudiantes",
    icon: {
      active: <School />,
      default: <SchoolOutlined />,
    },
    slug: "/dashboard",
  },
  {
    name: "Estadísticas",
    icon: {
      active: <ShowChart />,
      default: <ShowChart />,
    },
    slug: "/dashboard/stats",
  },
];

export default function SidebarDashboard({ courses }: SidebarDashboardProps) {
  const location = useLocation();

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
        marginLeft: location.pathname.includes("create") ? "-250px" : 0,
      })}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          height: 57,
          display: "flex",
          width: "100%",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton>
          <MenuRounded />
        </IconButton>
        <Typography
          variant="h1"
          noWrap
          component="a"
          href="#"
          sx={{
            ml: 1,
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Tutores
        </Typography>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          px: 1,
          "& .uiMenuItem-root": { gap: 1.5, px: 1 },
        }}
      >
        {navigation.map((nav) => {
          const isActive = location.pathname === nav.slug;
          return (
            <MenuItem
              key={nav.slug}
              component={Link}
              to={nav.slug}
              sx={{
                bgcolor: isActive ? "action.selected" : "transparent",
                minHeight: 'initial',
                py: 1
              }}
            >
              {isActive ? nav.icon.active : nav.icon.default}
              {nav.name}
            </MenuItem>
          );
        })}
      </Box>
    </Box>
  );
}
