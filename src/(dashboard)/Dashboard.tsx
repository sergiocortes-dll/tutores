import { Add } from "@mui/icons-material";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { Button } from "@u_ui/u-ui";
import { Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext"; // Asume que tienes este contexto para students

export default function Dashboard() {
  const { students } = useDashboard(); // Obtiene los estudiantes del contexto (fetch en refreshStudents)

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        width: "100%",
        p: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Lista de Estudiantes
      </Typography>
      <Button
        component={Link}
        to="/dashboard/create/student"
        startIcon={<Add />}
        size="small"
        sx={{ py: 1, gap: 0.5, lineHeight: 1 }}
        disableIconAnimation
        variant="contained"
      >
        Añadir estudiante
      </Button>
      {students.length === 0 ? (
        <Typography>No hay estudiantes disponibles.</Typography>
      ) : (
        <List>
          {students.map((student) => (
            <ListItem key={student.id} divider>
              <ListItemAvatar>
                <Avatar
                  alt={`${student.first_name} ${student.last_name}`}
                  src={student.photo_url || undefined} // Asume campo 'photo_url' en students; si no, placeholder
                >
                  {!student.photo_url && student.first_name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${student.first_name} ${student.last_name}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Email: {student.email || "N/A"}{" "}
                      {/* Asume campo 'email' en students */}
                    </Typography>
                    <br />
                    Grupo/Célula: {student.cell || "N/A"}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
