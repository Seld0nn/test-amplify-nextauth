import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import type { UserToken } from '~/utils/User';

export default async function isAuthenticated({
  req,
}: {
  req: NextRequest;
}): Promise<UserToken | Response> {
  const token: UserToken | null = (await getToken({ req })) as UserToken;

  if (!token) {
    return new Response('User is not authorized.', { status: 401 });
  }

  return {
    id: token.id,
    email: token.email,
  };
}