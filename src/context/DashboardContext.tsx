import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase"; // Asegúrate de importar tu cliente Supabase
import { useAuth } from "./AuthContext"; // Asumiendo que tienes AuthContext con user

export interface CourseInterface {
  id: string; // Cambiado a string para UUID
  name: string;
  owner_id: string; // Cambiado a string para UUID
  created_at: string; // TIMESTAMP como string, o usa Date si parseas
}

export interface StudentInterface {
  id: string;
  first_name: string;
  last_name: string;
  cell: string | null;
  course_id: string;
}

interface DashboardContextType {
  courses: CourseInterface[];
  currentCourse: CourseInterface | null;
  students: StudentInterface[];
  setCurrentCourse: (course: CourseInterface | null) => void;
  refreshCourses: () => Promise<void>;
  refreshStudents: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth(); // Obtén el user del AuthContext
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [currentCourse, setCurrentCourse] = useState<CourseInterface | null>(
    null
  );
  const [students, setStudents] = useState<StudentInterface[]>([]);

  // Función para cargar todos los cursos del usuario (propios + compartidos)
  const refreshCourses = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .or(
        `owner_id.eq.${user.id},id.in.(SELECT course_id FROM course_shares WHERE user_id = '${user.id}')`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching courses:", error);
      return;
    }

    setCourses(data || []);
    // Si no hay curso actual, setea el primero por default
    if (!currentCourse && data?.length > 0) {
      setCurrentCourse(data[0]);
    }
  };

  // Función para cargar estudiantes del curso actual
  const refreshStudents = async () => {
    if (!currentCourse?.id) {
      setStudents([]);
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("course_id", currentCourse.id)
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      return;
    }

    setStudents(data || []);
  };

  // Carga cursos al montar o cuando user cambia
  useEffect(() => {
    if (user) {
      refreshCourses();
    }
  }, [user]);

  // Carga estudiantes cuando currentCourse cambia
  useEffect(() => {
    refreshStudents();
  }, [currentCourse]);

  return (
    <DashboardContext.Provider
      value={{
        courses,
        currentCourse,
        students,
        setCurrentCourse,
        refreshCourses,
        refreshStudents,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used within ContextProvider.");
  return context;
};
