import type { Session, UserMetadata } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase"; // Tu cliente tipado

interface AuthContextType {
  session: Session | null;
  user: Session["user"] | undefined;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        handleProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
    });

    // Escuchar cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        handleProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleProfile = async (userId: string, email?: string, user_metadata?: UserMetadata) => {
    if (!email) {
      console.error("No email available for user.");
      return;
    }

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching profile:", fetchError);
      return;
    }

    if (!profile) {
      // Crear perfil si no existe
      const username = user_metadata?.user_name ?? generateUsernameFromEmail(email);
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, email, username });

      if (insertError) {
        console.error("Error creando perfil:", insertError);
      } else {
        console.log("Perfil creado exitosamente con username:", username);
      }
    } else if (!profile.username) {
      // Actualizar username si existe perfil pero username es null
      const username = generateUsernameFromEmail(email);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", userId);

      if (updateError) {
        console.error("Error actualizando username:", updateError);
      } else {
        console.log("Username actualizado exitosamente:", username);
      }
    }
  };

  const generateUsernameFromEmail = (email: string): string => {
    const base = email.split("@")[0].toLowerCase().replace(/\./g, "-");
    return base; // Puedes agregar chequeo de unicidad aquí si es necesario
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
