import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Para date handling
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Instala @mui/x-date-pickers si no
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs"; // Instala dayjs
import { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext"; // Para currentCourse, students
import { supabase } from "../supabase";

export interface ActivityInterface {
  id: string;
  course_id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface RatingInterface {
  id: string;
  student_id: string;
  activity_id: string;
  score: number;
  notes: string;
}

export default function Tracking() {
  const { currentCourse, students, refreshStudents } = useDashboard();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [activities, setActivities] = useState<ActivityInterface[]>([]);
  const [ratings, setRatings] = useState<{
    [activityId: string]: {
      [studentId: string]: { score: number; notes: string };
    };
  }>({});
  const [newActivityName, setNewActivityName] = useState<string>("");

  useEffect(() => {
    if (selectedDate && currentCourse?.id) {
      fetchActivitiesAndRatings();
    }
  }, [selectedDate, currentCourse]);

  const fetchActivitiesAndRatings = async () => {
    const dateStr = selectedDate?.format("YYYY-MM-DD");

    // Fetch activities para la fecha
    const { data: acts } = await supabase
      .from("activities")
      .select("*")
      .eq("course_id", currentCourse?.id)
      .eq("date", dateStr);

    setActivities(acts || []);

    // Fetch ratings para esas activities
    const activityIds = acts?.map((a) => a.id) || [];
    const { data: rats } = await supabase
      .from("ratings")
      .select("*")
      .in("activity_id", activityIds);

    // Map ratings a estructura fácil (activityId -> studentId -> {score, notes})
    const ratingsMap: {
      [activityId: string]: {
        [studentId: string]: { score: number; notes: string };
      };
    } = {};
    rats?.forEach((r) => {
      if (!ratingsMap[r.activity_id]) ratingsMap[r.activity_id] = {};
      ratingsMap[r.activity_id][r.student_id] = {
        score: r.score,
        notes: r.notes || "",
      };
    });
    setRatings(ratingsMap);
  };

  const handleAddActivity = async () => {
    if (!newActivityName.trim() || !selectedDate) return;

    const dateStr = selectedDate.format("YYYY-MM-DD");
    const { data, error } = await supabase
      .from("activities")
      .insert({
        course_id: currentCourse?.id,
        date: dateStr,
        name: newActivityName,
      })
      .select();

    if (error) {
      console.error("Error adding activity:", error);
      return;
    }

    setActivities((prev) => [...prev, data[0]]);
    setNewActivityName("");
    fetchActivitiesAndRatings(); // Refresh
  };

  const handleUpdateRating = (
    activityId: string,
    studentId: string,
    field: "score" | "notes",
    value: string | number
  ) => {
    setRatings((prev) => ({
      ...prev,
      [activityId]: {
        ...(prev[activityId] || {}),
        [studentId]: {
          ...(prev[activityId]?.[studentId] || { score: 0, notes: "" }),
          [field]: value,
        },
      },
    }));
  };

  const handleSaveRatings = async (activityId: string) => {
    const activityRatings = ratings[activityId] || {};
    const inserts = Object.entries(activityRatings).map(
      ([studentId, { score, notes }]) => ({
        student_id: studentId,
        activity_id: activityId,
        score,
        notes: notes || null,
      })
    );

    const { data, error } = await supabase
      .from("ratings")
      .upsert(inserts, { onConflict: "student_id, activity_id" }) // Usa la nueva constraint
      .select(); // Opcional: retorna datos insertados/actualizados

    if (error) {
      console.error("Error saving ratings:", error);
      alert("Error al guardar las calificaciones. Verifica los datos.");
      return;
    }

    alert("Calificaciones guardadas exitosamente.");
    // Opcional: Refresca datos si usas subscriptions o fetch
  };

  if (!currentCourse)
    return <Typography>No hay curso seleccionado.</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5">
          Seguimiento para {currentCourse.name}
        </Typography>
        <DatePicker
          label="Seleccionar Fecha"
          value={selectedDate}
          onChange={setSelectedDate}
          sx={{ mt: 2, mb: 2 }}
        />

        {/* Agregar nueva actividad */}
        <Box sx={{ display: "flex", mb: 2 }}>
          <TextField
            label="Nueva Actividad (e.g., Exposición)"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="outlined" onClick={handleAddActivity}>
            Agregar Actividad
          </Button>
        </Box>

        {activities.length === 0 ? (
          <Typography>
            No hay actividades para esta fecha. Agrega una.
          </Typography>
        ) : activities.length === 1 ? (
          // Vista simple si solo una activity
          <Box>
            <Typography variant="h6">{activities[0].name}</Typography>
            {renderStudentsTable(activities[0].id)}
          </Box>
        ) : (
          // Collapse si múltiples
          activities.map((act) => (
            <Accordion key={act.id}>
              <AccordionSummary>{act.name}</AccordionSummary>
              <AccordionDetails>{renderStudentsTable(act.id)}</AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </LocalizationProvider>
  );

  function renderStudentsTable(activityId: string) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Estudiante</TableCell>
            <TableCell>Score (0-10)</TableCell>
            <TableCell>Notas/Observaciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={ratings[activityId]?.[student.id]?.score || ""}
                  onChange={(e) =>
                    handleUpdateRating(
                      activityId,
                      student.id,
                      "score",
                      parseFloat(e.target.value)
                    )
                  }
                  inputProps={{ min: 0, max: 10, step: 0.1 }}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={ratings[activityId]?.[student.id]?.notes || ""}
                  onChange={(e) =>
                    handleUpdateRating(
                      activityId,
                      student.id,
                      "notes",
                      e.target.value
                    )
                  }
                  multiline
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <Button
          variant="contained"
          onClick={() => handleSaveRatings(activityId)}
          sx={{ mt: 2 }}
        >
          Guardar Calificaciones
        </Button>
      </Table>
    );
  }
}
