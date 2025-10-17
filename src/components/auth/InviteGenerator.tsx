import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext"; // Para currentCourse, students
import { supabase } from "../../supabase";

export default function InviteGenerator() {
  const { currentCourse, students } = useDashboard();
  const { user } = useAuth();
  const [permission, setPermission] = useState<"tl" | "coder">("tl");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");

  const handleGenerateInvite = async () => {
    if (!currentCourse?.id || !user?.id) return;

    // Verifica si es owner (opcional, pero recomendado)
    if (currentCourse.owner_id !== user.id) {
      alert("Solo el owner puede generar invitaciones.");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de expiración

    const { data, error } = await supabase
      .from("invites")
      .insert({
        course_id: currentCourse.id,
        permission,
        student_id: permission === "coder" ? studentId : null,
        expires_at: expiresAt.toISOString(),
      })
      .select("token");

    if (error) {
      console.error("Error generating invite:", error);
      alert("Error al generar la invitación.");
      return;
    }

    const token = data[0].token;
    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
    navigator.clipboard.writeText(link); // Copia al portapapeles
    alert("Enlace copiado al portapapeles!");
  };

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 400 }}>
      <Typography variant="h6">
        Generar Invitación para {currentCourse?.name}
      </Typography>
      <Select
        value={permission}
        onChange={(e) => setPermission(e.target.value as "tl" | "coder")}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      >
        <MenuItem value="tl">TL (Acceso completo de lectura)</MenuItem>
        <MenuItem value="coder">
          Coder (Acceso limitado a un estudiante)
        </MenuItem>
      </Select>
      {permission === "coder" && (
        <Select
          value={studentId || ""}
          onChange={(e) => setStudentId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Selecciona un estudiante</MenuItem>
          {students.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </MenuItem>
          ))}
        </Select>
      )}
      <Button variant="contained" onClick={handleGenerateInvite}>
        Generar Enlace
      </Button>
      {inviteLink && (
        <TextField
          label="Enlace de Invitación"
          value={inviteLink}
          fullWidth
          sx={{ mt: 2 }}
          InputProps={{ readOnly: true }}
        />
      )}
    </Box>
  );
}
