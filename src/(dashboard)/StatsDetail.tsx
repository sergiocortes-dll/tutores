import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

export default function StatsDetail() {
  const { idStat } = useParams<{ idStat: string }>(); // Obtiene el day desde la URL
  const { currentCourse } = useDashboard();
  const [statDay, setStatDay] = useState<StatDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCourse?.id || !idStat) return;

    const fetchStat = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_course_stats", {
        p_course_id: currentCourse.id,
      });

      if (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
        return;
      }

      // Filtra por el day específico
      const decodedDay = decodeURIComponent(idStat);
      const foundDay = data?.find((d: StatDay) => d.day === decodedDay) || null;
      setStatDay(foundDay);
      setLoading(false);
    };

    fetchStat();
  }, [currentCourse, idStat]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentCourse || !statDay) {
    return (
      <Typography>
        No se encontraron estadísticas para el día seleccionado.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Detalles del Día: {statDay.day} - {currentCourse.name}
      </Typography>
      <StyledPaper>
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`day-${statDay.day}-content`}
            id={`day-${statDay.day}-header`}
          >
            <Typography variant="h6">
              Promedio General: {statDay.day_avg.toFixed(2)}{" "}
              <StatChip label={`Día: ${statDay.day}`} color="primary" />
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {statDay.activities.map((activity) => (
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
    </Box>
  );
}
