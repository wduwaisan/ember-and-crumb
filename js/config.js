/* ==========================================================================
   Ember & Crumb — backend configuration
   --------------------------------------------------------------------------
   Leave the two strings empty and the whole site runs exactly as it did
   before: accounts, orders, recipes, reviews and cart in this browser's
   localStorage. Fill them in and it switches to Supabase automatically.

   The anon key belongs in client-side code — that is what it is for. It is
   protected by the Row Level Security policies in supabase/schema.sql.
   NEVER put the service_role key here. It bypasses RLS entirely.
   ========================================================================== */
const EC_CONFIG = {
  /* Supabase → Project Settings → API */
  supabaseUrl:     '',   // e.g. 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: '',   // the long eyJ... key labelled "anon" / "publishable"

  /* Which sign-in methods you have actually switched on in
     Supabase → Authentication → Providers. A method left false still shows
     its button, but explains what needs configuring instead of failing oddly. */
  providers: {
    email:    true,      // on by default in every Supabase project
    phone:    false,     // needs a paid SMS provider (Twilio, MessageBird, Vonage)
    google:   false,     // needs a Google Cloud OAuth client id + secret
    facebook: false,     // needs a Meta for Developers app id + secret
  },

  /* Default dialling code for the phone field. Kuwait is +965. */
  defaultDialCode: '+965',
};

EC_CONFIG.enabled = !!(EC_CONFIG.supabaseUrl && EC_CONFIG.supabaseAnonKey);
