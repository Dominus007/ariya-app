import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '../lib/env';

/**
 * Shared Supabase client for the whole app: auth, Postgres (catalog,
 * playlists, subscriptions), storage (artwork/thumbnails) and realtime.
 *
 * AsyncStorage persists the session between app launches; autoRefreshToken
 * keeps it alive while the app is open. detectSessionInUrl is disabled
 * because there's no browser URL to parse on native.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
