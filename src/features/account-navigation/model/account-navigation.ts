// A presentation model; map validated session data into it when auth is available.
export type AccountNavigation =
  | { status: 'loading' }
  | { status: 'signed-out'; signInHref?: string; signUpHref?: string }
  | {
      status: 'signed-in';
      displayName: string;
      avatarUrl?: string;
      profileHref: string;
      notificationsHref: string;
      hasUnreadNotifications?: boolean;
    };
