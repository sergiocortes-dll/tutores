export interface CourseInterface {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  slug: string;
}

export interface StudentInterface {
  id: string;
  first_name: string;
  last_name: string;
  cell: string | null;
  photo_url: string;
  course_id: string;
}
