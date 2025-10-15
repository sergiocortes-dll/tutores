import { AddRounded, ArrowBack } from "@mui/icons-material";
import { Select, type SelectChangeEvent } from "@mui/material";
import { Box, Button, Paper } from "@u_ui/u-ui";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDashboard, type CourseInterface } from '../../context/DashboardContext';

interface HeaderDashboardProps {
  courses: CourseInterface[];
}

export default function HeaderDashboard({ courses }: HeaderDashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { currentCourse, setCurrentCourse } = useDashboard();

  const handleCurrentCourse = (
    event: SelectChangeEvent<string>
  ) => {
    const selected = event.target.value;

    if (selected === "-1") {
      navigate("/dashboard/create/course");
      return;
    }

    const found = courses.find((c) => String(c.id) === selected);
    setCurrentCourse(found ?? null);
  };


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
          <Select
            size="small"
            native
            value={currentCourse?.id ?? ""}
            onChange={handleCurrentCourse}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="-1">Crear curso</option>
          </Select>
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
