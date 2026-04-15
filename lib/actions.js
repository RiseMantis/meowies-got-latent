"use server";

import { signIn, signOut, auth} from '../auth';

export const login = async () => {
  await signIn("github", {redirectTo: '/'});
}

export const logout = async () => {
  await signOut({redirectTo: '/'});
}

export const googleIn = async () => {
  await signIn("google", {redirectTo:'/'})
}