import { PrismaAdapter } from "@auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
// import CognitoProvider from "next-auth/providers/cognito";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { db } from "~/server/db";
import type { UserData } from "~/auth.types";
import { getCurrentUser } from "aws-amplify/auth";
import type {
  SignInOutput,
  AuthError,
  GetCurrentUserOutput,
  JWT,
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import * as crypto from "crypto";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
      data: UserData;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

const client = new CognitoIdentityProviderClient({ region: "us-east-2" });

function generateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string,
): string {
  return crypto
    .createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_ADMIN_USER_POOL_ID ?? "",
      userPoolClientId: process.env.COGNITO_CLIENT_ID ?? "",
    },
  },
});


declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    data?: UserData;
  }
}


export enum FORM_STATE {
  INITIALIZED = "INITIALIZED",
  CONFIRM_SIGN_UP = "CONFIRM_SIGN_UP",
  COMPLETE_AUTO_SIGN_IN = "COMPLETE_AUTO_SIGN_IN",
  DONE = "DONE",
  CONFIRM_RESET_PASSWORD_WITH_CODE = "CONFIRM_RESET_PASSWORD_WITH_CODE",
}

const getUser = async () => {
  const user: GetCurrentUserOutput = await getCurrentUser();
  return {
    id: user.userId,
    email: user.signInDetails?.loginId,
  };
};

export const DEFAULT_SESSION_AGE_IN_SECONDS = 2 * 24 * 60 * 60;

const applySignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const secretHash = generateSecretHash(
      email,
      process.env.COGNITO_CLIENT_ID ?? "",
      process.env.COGNITO_CLIENT_SECRET ?? "",
    );
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID ?? "",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });
    const response = await client.send(command);
    return response;
  } catch (ex) {
    const error = ex as AuthError;

    if (error.name === "NotAuthorizedException") {
      error.message = "Credenciales invalidas";
    }

    throw error;
  }
};

async function refreshAccessToken(token: JWT) {
  try {
    const refreshToken = token.payload.refreshToken as string;
    const clientId = process.env.COGNITO_CLIENT_ID ?? "";

    const command = new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const { AuthenticationResult } = await client.send(command);

    return {
      ...token,
      accessToken: AuthenticationResult?.AccessToken,
      accessTokenExpires: Date.now() + 3600 * 1000, // 1 hora más
      idToken: AuthenticationResult?.IdToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }
        if (!credentials.email || !credentials.password) {
          throw new Error("No email or password provided");
        }
        const { email, password } = credentials;

        try {
          const { AuthenticationResult } = await applySignIn({
            email,
            password,
          });
          const user = await db.user.findUnique({
            where: { email: email },
            select: { id: true },
          });

          if (!user) {
            throw new Error("User not found");
          }

          const userId = user.id;
          if (AuthenticationResult) {
            console.log("AuthenticationResult IS: ", AuthenticationResult);
            return {
              id: userId.toString(),
              email: email,
              data: {
                accessToken: AuthenticationResult?.AccessToken,
                idToken: AuthenticationResult?.IdToken,
                refreshToken: AuthenticationResult?.RefreshToken,
              },
            };
          }
          return null;
        } catch (error) {
          console.error("Error during sign in:", error);
          return null;
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt(props) {
      try {
        const { token, user, account } = props;
        console.log("JWT callback started with props:", { token, user, account });

        if (user) {
          token.id = user.id;
          token.email = user.email;
        }
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        }
        //add session to db, first check if exists, if not, create it
        const sessionExists = await db.account.findFirst({
          where: {
            userId: Number(token.sub),
          },
        });
        console.log("Session exists:", sessionExists);

        if (sessionExists) {
          await db.account.update({
            where: { id: sessionExists.id },
            data: {
              id_token: user.data?.idToken ?? "",
              access_token: user.data?.accessToken ?? "",
              expires_at: Number(token.ExpiresIn) + Date.now(),
              refresh_token: user.data?.refreshToken ?? "",
              token_type: "Bearer",
              providerAccountId: token.jti as string,
              provider: "cognitos",
            },
          });
        } else {
          await db.account.create({
            data: {
              userId: token.sub as unknown as number,
              type: "oauth",
              provider: "cognito",
              providerAccountId: token.jti as string,
              id_token: user.data?.idToken ?? "",
              access_token: user.data?.accessToken ?? "",
              expires_at: Number(token.ExpiresIn) + Date.now(),
              refresh_token: user.data?.refreshToken ?? "",
              token_type: "Bearer",
            },
          });
        }
        // Add user data to the token
        if (user.data) {
          token.accessToken = user.data.accessToken;
          token.idToken = user.data.idToken;
          token.refreshToken = user.data.refreshToken;
        }

        // Add additional session data
        token.sessionData = {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Error in jwt callback:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        // Ensure we always return a token, even if it's the original one
        console.log("Returning original token due to error:", props.token);
        return props.token;
      }
    },
    async session ({ session, user, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email!;
        session.user.data.accessToken = token.AccessToken as string;
        session.user.data.idToken = token.IdToken as string;
        session.user.data.refreshToken = token.RefreshToken as string;
      }
      return session;
    },

  },
  events: {
    signIn: () => {
      console.log("signIn event");
    },
    signOut: () => {
      console.log("signOut event");
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
