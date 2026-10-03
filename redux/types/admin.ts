/** What the backend returns for a valid staff invitation link. */
export type InviteInfo = {
  /** The email the invitation was sent to (locked on the setup form) */
  email: string;
  /** e.g. "operations_manager" */
  role: string;
};

export type AcceptInviteRequest = {
  /** The token from the emailed link */
  token: string;
  name: string;
  password: string;
};
