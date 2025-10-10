import { createClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string,
          role: 'tutor' | 'tl';
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
