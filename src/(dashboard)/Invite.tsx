import { Box, Button, CircularProgress, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { signInWithGithub } from "../auth/github";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!token) return;

    if (session === undefined) return;

    const fetchInvite = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Invitación inválida o expirada.");
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("La invitación ha expirado.");
        setLoading(false);
        return;
      }

      // Validar que el invite con permission 'coder' tenga student_id
      if (data.permission === "coder" && !data.student_id) {
        setError(
          "Invitación inválida: falta asignar un estudiante para 'coder'."
        );
        setLoading(false);
        return;
      }

      setInviteData(data);
      setLoading(false);

      if (!session) {
        handleLogin();
      } else {
        setShowAcceptModal(true);
      }
    };

    fetchInvite();
  }, [token, session]);

  const handleLogin = async () => {
    const currentUrl = window.location.href;
    const { error } = await signInWithGithub(currentUrl);
    if (error) {
      setError("Error al iniciar sesión con GitHub.");
    }
  };

  const handleAccept = async () => {
    if (!session?.user?.id || !inviteData) return;

    try {
      const { error } = await supabase.from("course_shares").upsert(
        {
          course_id: inviteData.course_id,
          user_id: session.user.id,
          permission: inviteData.permission,
          student_id:
            inviteData.permission === "coder" ? inviteData.student_id : null,
        },
        {
          onConflict: ["course_id", "user_id"], // Usa la constraint existente
          ignoreDuplicates: false, // No ignorar, actualizar
        }
      );

      if (error) {
        setError(`Error al aceptar la invitación: ${error.message}`);
        console.error("Upsert error:", error);
        return;
      }

      // Borra el invite para uso único
      await supabase.from("invites").delete().eq("token", token);

      alert("Invitación aceptada! Ahora tienes acceso al curso.");
      navigate(`/course/${inviteData.course_id}`);
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
      console.error("Unexpected error in handleAccept:", err);
    }
  };

  console.error(error);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h5">Invitación a Curso</Typography>
      {!session ? (
        <Button variant="contained" onClick={handleLogin}>
          Iniciar Sesión con GitHub para Aceptar
        </Button>
      ) : (
        <Modal open={showAcceptModal} onClose={() => setShowAcceptModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">¿Aceptar invitación al curso?</Typography>
            <Typography>Permiso: {inviteData?.permission}</Typography>
            {inviteData?.permission === "coder" && inviteData?.student_id && (
              <Typography>
                Estudiante asignado: {inviteData.student_id}
              </Typography>
            )}
            <Button variant="contained" onClick={handleAccept} sx={{ mr: 2 }}>
              Aceptar
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowAcceptModal(false)}
            >
              Cancelar
            </Button>
          </Box>
        </Modal>
      )}
    </Box>
  );
}
