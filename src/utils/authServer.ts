import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { amplifyConfig } from "./amplifyconfiguration";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
});

export async function AuthGetCurrentUserServer() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return false;
  }
}

export async function AuthGetCurrentSessionServer() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? false;
  } catch (error) {
    console.error("Error fetching auth session:", error);
    return false;
  }
}
