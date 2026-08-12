import { supabase } from './supabase';

export type SubscriptionTier = 'nigeria' | 'family' | 'global';

export interface ActiveSubscription {
  tier: SubscriptionTier;
  currentPeriodEnd: string | null;
  amountNaira: number | null;
}

/** The user's current active subscription, if any — null means free tier. */
export async function fetchActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier, current_period_end, amount_naira')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    tier: data.tier as SubscriptionTier,
    currentPeriodEnd: data.current_period_end,
    amountNaira: data.amount_naira,
  };
}
