import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const { courses, currentCourse, setCurrentCourse, refreshCourses } =
    useDashboard();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      refreshCourses().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, refreshCourses]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography>No has iniciado sesión.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Perfil de Usuario
      </Typography>
      <Typography variant="h6">Email: {user.email}</Typography>
      <Typography variant="body1">ID: {user.id}</Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Tus Cursos
      </Typography>
      {courses.length === 0 ? (
        <Typography>No tienes cursos asignados.</Typography>
      ) : (
        <>
          <Select
            value={currentCourse?.id || ""}
            onChange={(e) =>
              setCurrentCourse(
                courses.find((c) => c.id === e.target.value) || null
              )
            }
            fullWidth
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecciona un curso
            </MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
          {currentCourse && (
            <Typography>
              Curso Actual: {currentCourse.name} (Creado:{" "}
              {currentCourse.created_at})
            </Typography>
          )}
        </>
      )}

      <Button
        variant="contained"
        color="secondary"
        onClick={signOut}
        sx={{ mt: 2 }}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );
}
