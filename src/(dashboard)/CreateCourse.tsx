import { TextField } from "@mui/material";
import { Box, Button } from "@u_ui/u-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";
import { supabase } from "../supabase";


export default function CreateCourse() {
  const [courseName, setCourseName] = useState<string>("");
  const { user } = useAuth();
  const { refreshCourses } = useDashboard();
  const navigate = useNavigate();

  const validateName = (name: string): boolean => {
    const regex = /^[a-zA-Z0-9\s]+$/;
    return regex.test(name);
  };

  const handleCreateCourse = async () => {
    if (!courseName.trim() || !user?.id) {
      alert("Por favor, ingresa un nombre válido para el curso.");
      return;
    }

    if (!validateName(courseName)) {
      alert("El nombre no puede contener caracteres especiales ni tildes.");
      return;
    }

    const slug = slugify(courseName, {
      lower: true,
      strict: true,
      locale: "es",
    });

    const { data: existing } = await supabase
      .from("courses")
      .select("id")
      .eq("owner_id", user.id)
      .eq("slug", slug)
      .single();

    if (existing) {
      alert("Ya existe un curso con un nombre similar bajo tu cuenta.");
      return;
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        name: courseName,
        owner_id: user.id,
        slug: slug,
      })
      .select();

    if (error) {
      console.error("Error creando curso:", error);
      if (error.code === "23505") {
        alert("Ya existe un curso con ese nombre bajo tu cuenta.");
      } else {
        alert("Error al crear el curso. Intenta nuevamente.");
      }
      return;
    }

    await refreshCourses();

    setCourseName("");
    if (data?.[0]) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile?.username) {
        navigate(`/course/${profile.username}/${data[0].slug}`);
      } else {
        navigate(`/course/${data[0].id}`); // Fallback a UUID si no hay username
      }
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        width: "100%",
        minHeight: "calc(100dvh - 58px)",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", p: 2 }}>
        <TextField
          placeholder="Nombre del curso"
          label="Nombre del curso"
          size="small"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          fullWidth // Opcional, para que ocupe todo el ancho
          sx={{ mb: 2 }} // Espacio abajo para el botón
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateCourse}
        >
          Crear Curso
        </Button>
      </Box>
    </Box>
  );
}
