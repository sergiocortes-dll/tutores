import { TextField } from "@mui/material";
import { Avatar, Box, Button, Typography } from "@u_ui/u-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../supabase";

export default function CreateStudent() {
  const navigate = useNavigate();
  const { currentCourse, refreshStudents } = useDashboard();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [cell, setCell] = useState<string>("");
  const [loading, setLoading] = useState<boolean>();

  const handleAddStudent = async () => {
    setLoading(true);

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
      setLoading(false);
      alert("Error al añadir el estudiante. Intenta nuevamente.");
      return;
    }

    // Refresca la lista de estudiantes
    await refreshStudents();

    navigate("/dashboard");
  };

  if (!currentCourse) {
    return <Typography>No hay curso seleccionado.</Typography>;
  }

  return (
    <Box component="form" onSubmit={(e) => {e.preventDefault();handleAddStudent();}} sx={{ p: 2, maxWidth: 400 }}>
      <Box
        sx={{
          transition: ".2s ease all",
          position: "fixed",
          inset: 0,
          background: "hsla(0, 0%, 0%, .2)",
          zIndex: 99,
          opacity: loading ? 1 : 0,
          visibility: loading ? "visible" : "hidden",
        }}
      />
      <Typography variant="h6" gutterBottom>
        Añadir Estudiante al Curso: {currentCourse.name}
      </Typography>
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
          }}
          src={photoUrl}
          alt={firstName}
        />
      </Box>
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
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Apellido"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Célula/Grupo (opcional)"
        value={cell}
        onChange={(e) => setCell(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        fullWidth
        loading={loading}
        type="submit"
      >
        Añadir Estudiante
      </Button>
    </Box>
  );
}
