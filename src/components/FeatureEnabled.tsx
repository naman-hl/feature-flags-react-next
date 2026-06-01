import { canViewFeature, FeatureFlagName } from '@/lib/featureFlags';
import { getUser } from '@/lib/getUser';
import { ReactNode } from 'react';

/**
 * Conditionally renders its children based on whether the current user
 * has access to the specified feature flag.
 *
 * Internally it calls `canViewFeature` with the result of `getUser()`,
 * so no extra wiring is needed at the call site — just wrap the UI you
 * want to gate and pass the flag name.
 *
 * @example
 * // Only renders the beta banner for users in the ADVANCED_ANALYTICS rollout
 * <FeatureEnabled featureFlag="ADVANCED_ANALYTICS">
 *   <BetaBanner />
 * </FeatureEnabled>
 *
 * @param featureFlag - The name of the feature flag to check.
 * @param children - The UI to render when the feature is enabled for this user.
 * @returns The children if the feature is enabled, otherwise `null`.
 */
export function FeatureEnabled({
  featureFlag,
  children,
}: {
  featureFlag: FeatureFlagName;
  children: ReactNode;
}) {
  return canViewFeature(featureFlag, getUser()) ? children : null;
}
