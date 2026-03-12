import { createClient } from '@supabase/supabase-js';

// 这些值应该从环境变量中读取，为了演示方便我们暂时硬编码
// 后续建议用户在 .env.local 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY
const supabaseUrl = 'https://uzlcidyvuifxbgzzkcwj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU';

export const supabase = createClient(supabaseUrl, supabaseKey);
