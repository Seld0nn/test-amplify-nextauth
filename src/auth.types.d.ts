import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./server/api/root";

type routerOutput = inferRouterOutputs<AppRouter>;

export interface UserData {
  id: string;
  name: string;
  email: string;
  cognitoId: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}


declare module 'next-auth' {
  interface Session {
    idToken?: string;
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    COGNITO_CLIENT_ID: string
    COGNITO_CLIENT_SECRET: string
  }
}