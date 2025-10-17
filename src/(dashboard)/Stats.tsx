import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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

const StatChip = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export default function Stats() {
  const { currentCourse } = useDashboard();
  const [stats, setStats] = useState<StatDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCourse?.id) return;

    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_course_stats", {
        p_course_id: currentCourse.id,
      });

      if (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
        return;
      }

      setStats(data || []);
      setLoading(false);
    };

    fetchStats();
  }, [currentCourse]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentCourse) {
    return <Typography>No hay curso seleccionado.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Estadísticas del Curso: {currentCourse.name}
      </Typography>
      {stats.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          No hay estadísticas disponibles para este curso.
        </Typography>
      ) : (
        stats.map((day) => (
          <StyledPaper key={day.day}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`day-${day.day}-content`}
                id={`day-${day.day}-header`}
              >
                <Typography variant="h6">
                  Día: {day.day}{" "}
                  <StatChip
                    label={`Promedio General: ${day.day_avg.toFixed(2)}`}
                    color="primary"
                  />
                  <Link
                    component={RouterLink}
                    to={`/dashboard/stats/${encodeURIComponent(day.day)}`}
                    sx={{ ml: 2, textDecoration: "none" }}
                  >
                    Ver Detalles
                  </Link>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {day.activities.map((activity) => (
                  <Box key={activity.activity_name} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {activity.activity_name}{" "}
                      <StatChip
                        label={`Promedio: ${activity.activity_avg.toFixed(2)}`}
                        color="secondary"
                      />
                    </Typography>
                    <List>
                      {activity.students.map((student) => (
                        <ListItem key={student.student_name} disablePadding>
                          <ListItemText
                            primary={student.student_name}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  Score: {student.score}
                                </Typography>
                                <br />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Notas: {student.notes || "N/A"}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </StyledPaper>
        ))
      )}
    </Box>
  );
}
