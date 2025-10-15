import { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext"; // Asume currentCourse
import { supabase } from "../supabase";

interface StatDay {
  day: string;
  day_avg: number;
  activities: StatActivity[];
}

interface StatActivity {
  activity_name: string;
  activity_avg: number;
  students: StatStudent[];
}

interface StatStudent {
  student_name: string;
  score: number;
  notes: string;
}

export default function Stats() {
  const { currentCourse } = useDashboard();
  const [stats, setStats] = useState<StatDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentCourse?.id) return;

    const fetchStats = async () => {
      const { data, error } = await supabase.rpc("get_course_stats", {
        p_course_id: currentCourse.id,
      });

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      setStats(data || []);
      setLoading(false);
    };

    fetchStats();
  }, [currentCourse]);

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div>
      <h1>Estadísticas del Curso: {currentCourse?.name}</h1>
      {stats.map((day) => (
        <div key={day.day}>
          <h2>
            Día: {day.day} (Promedio general: {day.day_avg.toFixed(2)})
          </h2>
          {day.activities.map((activity) => (
            <div key={activity.activity_name}>
              <h3>
                Actividad: {activity.activity_name} (Promedio:{" "}
                {activity.activity_avg.toFixed(2)})
              </h3>
              <ul>
                {activity.students.map((student) => (
                  <li key={student.student_name}>
                    {student.student_name}: Score {student.score} - Notas:{" "}
                    {student.notes || "N/A"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
