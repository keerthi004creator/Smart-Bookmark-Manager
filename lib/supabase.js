import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swxfpntmrwncupnaanta.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3eGZwbnRtcnduY3VwbmFhbnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNTc3MzQsImV4cCI6MjA4NjYzMzczNH0.FcPrd5htMcR345O2QN0yXs57F8gezS3nOInbiKvEvc0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)