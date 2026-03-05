import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vsmyszxswnkfqffnxmvd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbXlzenhzd25rZnFmZm54bXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mzc5OTksImV4cCI6MjA4ODMxMzk5OX0.F5gAMH3ua2-u84f7CDi5Ek1tmQgFEsHvRIBN-aZwej0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);