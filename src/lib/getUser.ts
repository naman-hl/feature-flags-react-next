export type UserRole = 'admin' | 'tester' | 'user';
export type User = {
  id: string;
  role: UserRole;
};

/**
 * Returns the currently authenticated user.
 *
 * In production this would read from a session, JWT, or auth provider.
 * For now it returns a hardcoded stub so the feature flag system has a
 * user to evaluate rules against during development.
 *
 * @returns A `User` object with an `id` and a `role`.
 */
export function getUser() {
  return { id: 'e', role: 'tester' } as User;
}
