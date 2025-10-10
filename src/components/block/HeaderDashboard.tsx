import { AddRounded, ArrowBack } from "@mui/icons-material";
import { Box, Button, Paper } from "@u_ui/u-ui";
import { Link, useLocation } from "react-router-dom";
import type { CourseInterface } from '../../context/DashboardContext';

interface HeaderDashboardProps {
  courses: CourseInterface[];
}

export default function HeaderDashboard({ courses }: HeaderDashboardProps) {
  const location = useLocation();
  console.log(courses);

  return (
    <>
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 1,
          px: 2,
          flex: 1,
          borderBottom: 1,
          borderColor: theme.palette.divider,
          position: "sticky",
          top: 0,
          height: 57,
          zIndex: 99,
        })}
      >
        {courses.length < 1 ? (
          <Button
            component={Link}
            to="/dashboard/create"
            variant="outlined"
            size="small"
            startIcon={<AddRounded />}
          >
            Crear curso
          </Button>
        ) : (
          <div>{courses[0].name}</div>
        )}
        <Paper
          sx={{
            position: "absolute",
            inset: 0,
            height: "57px",
            borderRadius: 0,
            borderBottom: 1,
            borderColor: "divider",
            opacity: location.pathname.includes("create") ? 1 : 0,
            visibility: location.pathname.includes("create")
              ? "visible"
              : "hidden",
            transition: ".2s ease-in-out all",
          }}
          elevation={0}
        >
          <Button
            sx={{
              borderRadius: 0,
              height: "100%",
              width: "100%",
              p: 2,
            }}
            component={Link}
            to="/dashboard"
            justify="start"
            startIcon={<ArrowBack />}
          >
            Volver
          </Button>
        </Paper>
      </Box>
    </>
  );
}
