import { TextField } from "@mui/material";
import { Box, Button } from "@u_ui/u-ui";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { useAuth } from "../context/AuthContext";
import { useDashboard, type CourseInterface } from "../context/DashboardContext";
import { supabase } from "../supabase";


export default function CreateCourse() {
  const [courseName, setCourseName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { refreshCourses } = useDashboard();
  const navigate = useNavigate();

  const validateName = (name: string): boolean => {
    const regex = /^[a-zA-Z0-9\s]+$/;
    return regex.test(name);
  };

  const handleCreateCourse = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 2000);

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

    const current = data as CourseInterface[];

    await refreshCourses(current);

    setCourseName("");
    navigate('/dashboard');
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
      <Box
        sx={{
          transition: '.2s ease all',
          position: 'fixed',
          inset: 0,
          background: 'hsla(0, 0%, 0%, .2)',
          zIndex: 99,
          opacity: loading ? 1 : 0,
          visibility: loading ? 'visible' : 'hidden'
        }}
      />
      <Box component="form" onSubmit={(e) => {
        e.preventDefault();
        handleCreateCourse();
      }} sx={{ width: "100%", p: 2 }}>
        <TextField
          placeholder="Nombre del curso"
          label="Nombre del curso"
          size="small"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          fullWidth // Opcional, para que ocupe todo el ancho
          sx={{ mb: 2, opacity: loading ? .5 : 1 }} // Espacio abajo para el botón
          InputProps={{
            readOnly: loading
          }}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          loading={loading}
        >
          Crear Curso
        </Button>
      </Box>
    </Box>
  );
}
