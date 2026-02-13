export const AUTH_TOKEN_KEY = "sportsEvent.auth.token";
export const AUTH_EMAIL_KEY = "sportsEvent.auth.email";

export type StoredAuth = {
  token: string | null;
  email: string | null;
};

export const readStoredAuth = (): StoredAuth => {
  if (typeof window === "undefined") return { token: null, email: null };
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const email = window.localStorage.getItem(AUTH_EMAIL_KEY);
  return {
    token: token && token.trim() ? token : null,
    email: email && email.trim() ? email : null,
  };
};

export const writeStoredAuth = (auth: { token: string | null; email: string | null }) => {
  if (typeof window === "undefined") return;

  if (auth.token) window.localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
  else window.localStorage.removeItem(AUTH_TOKEN_KEY);

  if (auth.email) window.localStorage.setItem(AUTH_EMAIL_KEY, auth.email);
  else window.localStorage.removeItem(AUTH_EMAIL_KEY);
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_EMAIL_KEY);
};
