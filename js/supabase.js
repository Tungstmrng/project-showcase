const SUPABASE_URL = "https://clkhjcytagpoqxyuvmns.supabase.co";
const SUPABASE_KEY = "sb_publishable_C0pZWuTY3SkOHdjolcF9aw_FKuomSUn";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("Supabase connection initialized!");
console.log(supabaseClient);
