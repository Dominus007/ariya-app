/**
 * Central, typed access to public runtime config.
 * Values come from `.env` (see `.env.example`) via Expo's built-in
 * EXPO_PUBLIC_ env var support — no extra config needed.
 * https://docs.expo.dev/guides/environment-variables/
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in real values, then restart the dev server.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ),
  paystackPublicKey: required(
    'EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY',
    process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY
  ),
};
