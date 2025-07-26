'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET_KEY_WEB;
const encodedKey = new TextEncoder().encode(secretKey);

export type Session = {
  user: {
    id: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
};

export async function createSession(payload: Session) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 1000);

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/'
  });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256']
    });
    return payload as Session;
  } catch (error) {
    console.error('Session verification failed:', error);
    redirect('/auth/signin');
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function updateToken({
  accessToken,
  refreshToken
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookie = (await cookies()).get('session')?.value;
  if(!cookie)
    return null;

  const { payload } = await jwtVerify<Session>(cookie, encodedKey);
  if(!payload) throw new Error('Session not found');

  const newPayload: Session = {
    user : {
      ...payload.user
    },
    accessToken,
    refreshToken
  }

  await createSession(newPayload);
}
