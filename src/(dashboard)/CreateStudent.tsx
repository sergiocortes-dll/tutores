import { TextField } from "@mui/material";
import { Avatar, Box, Button, Typography } from "@u_ui/u-ui";
import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../supabase";

export default function CreateStudent() {
  const { currentCourse, refreshStudents } = useDashboard();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [cell, setCell] = useState<string>("");

  const handleAddStudent = async () => {
    if (!firstName.trim() || !lastName.trim() || !currentCourse?.id) {
      alert("Por favor, ingresa al menos el nombre y apellido.");
      return;
    }

    const { error } = await supabase
      .from("students")
      .insert({
        first_name: firstName,
        last_name: lastName,
        cell: cell || null,
        course_id: currentCourse.id,
        photo_url: photoUrl || null
      });

    if (error) {
      console.error("Error añadiendo estudiante:", error);
      alert("Error al añadir el estudiante. Intenta nuevamente.");
      return;
    }

    // Refresca la lista de estudiantes
    await refreshStudents();

    // Limpia los inputs
    setFirstName("");
    setLastName("");
    setCell("");
  };

  if (!currentCourse) {
    return <Typography>No hay curso seleccionado.</Typography>;
  }

  return (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Añadir Estudiante al Curso: {currentCourse.name}
      </Typography>
      <Avatar
        src={photoUrl}
        alt="Sergio Cortes"
      />
      <TextField
        label="Link foto"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Nombre"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Célula/Grupo (opcional)"
        value={cell}
        onChange={(e) => setCell(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddStudent}
      >
        Añadir Estudiante
      </Button>
    </Box>
  );
}
