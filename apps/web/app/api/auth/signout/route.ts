import { authFetch } from '@/lib/authFetch';
import { BACKEND_URL } from '@/lib/constants';
import { deleteSession } from '@/lib/session';
import { redirect, RedirectType } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response = await authFetch(`${BACKEND_URL}/auth/signout`, {
    method: 'POST'
  });
  if (response.ok){
    await deleteSession();
  }

  redirect('/', RedirectType.push);
}
