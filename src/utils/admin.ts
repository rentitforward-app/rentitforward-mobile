/**
 * Admin utility functions for the mobile app
 */

/**
 * Check if a user is an admin based on their email
 * @param userEmail - The user's email address
 * @returns boolean - True if user is admin, false otherwise
 */
export function isAdminUser(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false;
  
  const adminEmails = [
    'rentitforward.app@gmail.com',
    'digitallinked.au@gmail.com'
  ];
  
  return adminEmails.includes(userEmail.toLowerCase());
}

/**
 * Check if a user object is an admin
 * @param user - User object with email property
 * @returns boolean - True if user is admin, false otherwise
 */
export function isUserAdmin(user: { email?: string | null } | null | undefined): boolean {
  return isAdminUser(user?.email);
}
