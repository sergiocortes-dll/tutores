import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Para user
import { supabase } from "../supabase";
import { type CourseInterface, type StudentInterface } from "../types"; // Asegúrate de tener estas interfaces

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
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseInterface[]>([]);
  const [currentCourse, setCurrentCourse] = useState<CourseInterface | null>(
    null
  );
  const [students, setStudents] = useState<StudentInterface[]>([]);

  const refreshCourses = async () => {
    if (!user?.id) return;

    try {
      // Fetch owned courses
      const { data: owned, error: ownedError } = await supabase
        .from("courses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (ownedError) {
        console.error("Error fetching owned courses:", ownedError);
        return;
      }

      // Fetch all shares for the user, including coder permissions
      const { data: shares, error: sharesError } = await supabase
        .from("course_shares")
        .select("course_id, permission, student_id")
        .eq("user_id", user.id);

      if (sharesError) {
        console.error("Error fetching shares:", sharesError);
        return;
      }

      let sharedCourses: CourseInterface[] = [];
      if (shares?.length > 0) {
        const courseIds = shares.map((s) => s.course_id);
        const { data: sharedCoursesData, error: sharedCoursesError } =
          await supabase
            .from("courses")
            .select("*")
            .in("id", courseIds)
            .order("created_at", { ascending: false });

        if (sharedCoursesError) {
          console.error("Error fetching shared courses:", sharedCoursesError);
        } else {
          sharedCourses = sharedCoursesData || [];
        }
      }

      // Combine owned and shared courses, filter duplicates
      const allCourses = [...(owned || []), ...sharedCourses];
      const uniqueCourses = allCourses.filter(
        (course, index, self) =>
          index === self.findIndex((c) => c.id === course.id)
      );

      setCourses(uniqueCourses);
      if (!currentCourse && uniqueCourses.length > 0) {
        setCurrentCourse(uniqueCourses[0]);
      } else if (uniqueCourses.length === 0 && currentCourse) {
        setCurrentCourse(null); // Clear if no courses available
      }
    } catch (error) {
      console.error("Unexpected error in refreshCourses:", error);
    }
  };

  const refreshStudents = async () => {
    if (!currentCourse?.id) {
      setStudents([]);
      return;
    }

    try {
      // Fetch user's share for this course to determine permission and student_id
      const { data: share, error: shareError } = await supabase
        .from("course_shares")
        .select("permission, student_id")
        .eq("course_id", currentCourse.id)
        .eq("user_id", user?.id)
        .single();

      if (shareError && shareError.code !== "PGRST116") {
        console.error("Error fetching share:", shareError);
        return;
      }

      let query = supabase
        .from("students")
        .select("*")
        .eq("course_id", currentCourse.id);

      // If user is coder, filter by assigned student_id
      if (share?.permission === "coder" && share.student_id) {
        query = query.eq("id", share.student_id);
        console.log(
          "Filtering students for coder, student_id:",
          share.student_id
        );
      } else if (!share && currentCourse.owner_id !== user?.id) {
        console.log("No share found and not owner, clearing students");
        setStudents([]);
        return;
      }

      const { data, error } = await query.order("last_name", {
        ascending: true,
      });

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      setStudents(data || []);
      console.log("Students fetched:", data);
    } catch (error) {
      console.error("Unexpected error in refreshStudents:", error);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCourses();
    }
  }, [user]);

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
