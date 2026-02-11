export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = PublicUser & {
  password: string;
};

const USERS_KEY = "sportsEvent.users";
const CURRENT_USER_KEY = "sportsEvent.currentUser";

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return [];
  return safeJsonParse<StoredUser[]>(window.localStorage.getItem(USERS_KEY), []);
};

const setUsers = (users: StoredUser[]) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): PublicUser | null => {
  if (typeof window === "undefined") return null;
  return safeJsonParse<PublicUser | null>(
    window.localStorage.getItem(CURRENT_USER_KEY),
    null
  );
};

export const setCurrentUser = (user: PublicUser | null) => {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createId = () => {
  const uuidFn = globalThis.crypto?.randomUUID;
  if (typeof uuidFn === "function") return uuidFn.call(globalThis.crypto);
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const registerUser = (input: {
  name: string;
  email: string;
  password: string;
}): PublicUser => {
  if (typeof window === "undefined") {
    throw new Error("Registration is only available in the browser.");
  }

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  const users = getUsers();
  const existing = users.find((u) => normalizeEmail(u.email) === email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: createId(),
    name,
    email,
    password,
  };

  setUsers([user, ...users]);

  const publicUser: PublicUser = { id: user.id, name: user.name, email: user.email };
  setCurrentUser(publicUser);
  return publicUser;
};

export const loginUser = (input: {
  email: string;
  password: string;
}): PublicUser => {
  if (typeof window === "undefined") {
    throw new Error("Login is only available in the browser.");
  }

  const email = normalizeEmail(input.email);
  const password = input.password;

  const users = getUsers();
  const match = users.find(
    (u) => normalizeEmail(u.email) === email && u.password === password
  );

  if (!match) {
    throw new Error("Invalid email or password.");
  }

  const publicUser: PublicUser = { id: match.id, name: match.name, email: match.email };
  setCurrentUser(publicUser);
  return publicUser;
};

export const logoutUser = () => {
  setCurrentUser(null);
};
