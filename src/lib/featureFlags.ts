import { User, UserRole } from './getUser';
import { murmurhash } from './murmurhash';

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

type FeatureFlagRule = {
  percentageOfUsers?: number;
  userRoles?: UserRole[];
} & (
  | {
      percentageOfUsers: number;
    }
  | { userRoles: UserRole[] }
);

export const FEATURE_FLAGS = {
  TEST_NEW_PRODUCTS_QUERY: true,
  ADVANCED_ANALYTICS: true,
  DISABLED_FEATURE: false,
  EXPERIMENTAL_FEATURE: false,
  MULTIPLE_ALLOWANCES: [
    { percentageOfUsers: 0.25, userRoles: ['user'] },
    { userRoles: ['admin', 'tester'] },
  ],
} as const satisfies Record<string, FeatureFlagRule[] | boolean>;

/**
 * Determines whether a given user is allowed to access a feature flag.
 *
 * If the flag is a plain boolean, it returns that value directly.
 * If the flag is a list of rules, the user gains access as soon as
 * any single rule passes (role check AND percentage bucket check).
 *
 * @param featureName - The key of the feature flag to evaluate.
 * @param user - The current user, used for role and ID checks.
 * @returns `true` if the user can view the feature, `false` otherwise.
 */
export function canViewFeature(featureName: FeatureFlagName, user: User) {
  const rules = FEATURE_FLAGS[featureName];
  if (typeof rules === 'boolean') return rules;
  return rules.some((rule) => checkRule(rule, featureName, user));
}

/**
 * Evaluates a single feature flag rule against a user.
 *
 * Both conditions must pass for the rule to grant access:
 * - The user's role must be in the allowed roles list (if specified).
 * - The user must fall within the allowed percentage bucket (if specified).
 *
 * @param rule - The rule containing optional `userRoles` and `percentageOfUsers`.
 * @param featureName - Used to generate a stable, per-feature hash bucket.
 * @param user - The user being evaluated.
 * @returns `true` if the user satisfies all conditions in the rule.
 */
function checkRule(
  { userRoles, percentageOfUsers }: FeatureFlagRule,
  featureName: FeatureFlagName,
  user: User,
) {
  return (
    userHasValidRole(userRoles, user.role) &&
    userIsWithinPercentage(featureName, percentageOfUsers, user.id)
  );
}

/**
 * Checks whether a user's role is permitted by a rule.
 *
 * If no roles are specified (`allowedRoles` is `undefined`), every role passes —
 * meaning the rule applies to all users regardless of role.
 *
 * @param allowedRoles - The list of roles that may access the feature, or `undefined` for no restriction.
 * @param userRole - The role of the current user.
 * @returns `true` if the user's role is allowed.
 */
function userHasValidRole(
  allowedRoles: UserRole[] | undefined,
  userRole: UserRole,
) {
  return allowedRoles == null || allowedRoles.includes(userRole);
}

/** Maximum value of an unsigned 32-bit integer, used to normalise the hash to a 0–1 range. */
const MAX_UINT_32 = 4294967295;

/**
 * Checks whether a user falls within the rollout percentage for a feature.
 *
 * A stable hash is computed from the combination of the feature name and the
 * user's ID, so the same user always lands in the same bucket for a given flag.
 * Dividing by MAX_UINT_32 maps the hash to [0, 1), which is then compared
 * against the allowed percentage threshold.
 *
 * If no percentage is specified, the check is skipped and access is granted.
 *
 * @param featureName - Combined with the user ID to produce a deterministic hash.
 * @param allowedPercent - A value between 0 and 1 (e.g. `0.25` = 25 % of users), or `undefined`.
 * @param flagId - The user's unique ID used as the hash seed.
 * @returns `true` if the user is within the rollout percentage.
 */
function userIsWithinPercentage(
  featureName: FeatureFlagName,
  allowedPercent: number | undefined,
  flagId: string,
) {
  if (allowedPercent == null) return true;

  return murmurhash(`${featureName}-${flagId}`) / MAX_UINT_32 < allowedPercent;
}
