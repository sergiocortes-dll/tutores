import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../supabase";

interface StatDay {
  day: string;
  day_avg: number;
  activities: StatActivity[];
}

interface StatActivity {
  activity_name: string;
  activity_avg: number;
  students: StatStudent[];
}

interface StatStudent {
  student_name: string;
  score: number;
  notes: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
}));

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { currentCourse, students, setCurrentCourse } = useDashboard();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!id) {
        setError("No course ID provided.");
        setLoading(false);
        return;
      }

      // Set the current course based on the ID
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError || !course) {
        setError("Course not found or access denied.");
        setLoading(false);
        return;
      }

      setCurrentCourse(course);

      // Fetch stats for the course
      const { data, error: statsError } = await supabase.rpc("get_course_stats", {
        p_course_id: id,
      });

      if (statsError) {
        setError("Error fetching course statistics.");
        console.error("Stats error:", statsError);
      } else {
        setStats(data || []);
      }

      setLoading(false);
    };

    loadCourseData();
  }, [id, setCurrentCourse]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!currentCourse) return <Typography>No course data available.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Curso: {currentCourse.name}
      </Typography>
      <StyledPaper>
        <Typography variant="h6">Estudiantes</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Celular</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.first_name} {student.last_name}
                  </TableCell>
                  <TableCell>{student.cell || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {students.length === 0 && (
          <Typography color="text.secondary">No students available.</Typography>
        )}
      </StyledPaper>
      <StyledPaper>
        <Typography variant="h6">Estadísticas</Typography>
        {stats.length > 0 ? (
          stats.map((day) => (
            <Box key={day.day} sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Día: {day.day} (Promedio: {day.day_avg.toFixed(2)})
              </Typography>
              {day.activities.map((activity) => (
                <Box key={activity.activity_name} sx={{ ml: 2, mb: 1 }}>
                  <Typography variant="body1">
                    {activity.activity_name} (Promedio:{" "}
                    {activity.activity_avg.toFixed(2)})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Estudiante</TableCell>
                          <TableCell>Puntaje</TableCell>
                          <TableCell>Notas</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activity.students.map((student) => (
                          <TableRow key={student.student_name}>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>{student.score}</TableCell>
                            <TableCell>{student.notes || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary">
            No statistics available.
          </Typography>
        )}
      </StyledPaper>
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate("/dashboard")}>
          Volver al Dashboard
        </Button>
      </Box>
    </Box>
  );
}
