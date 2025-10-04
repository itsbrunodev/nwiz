/**
 * Represents a user account configured locally on a device for authentication.
 */
export interface LocalUser {
  /**
   * A unique identifier for React list rendering.
   */
  id: string;
  username: string;
  password?: string;
  privilege?: number; // Optional: For role-based access control
}
