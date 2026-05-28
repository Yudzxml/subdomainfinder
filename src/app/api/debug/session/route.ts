import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const sessionCookie = cookieStore.get('session');
    const sessionHeader = request.headers.get('X-Session-Token');

    let session = null;
    let tokenUsed = null;

    if (sessionCookie?.value) {
      session = await verifySession(sessionCookie.value);
      tokenUsed = 'cookie';
    }

    if (!session && sessionHeader) {
      session = await verifySession(sessionHeader);
      tokenUsed = 'header';
    }

    return NextResponse.json({
      success: true,
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        sessionExists: !!sessionCookie,
      },
      headers: {
        sessionHeaderExists: !!sessionHeader,
      },
      session: {
        tokenUsed,
        valid: !!session,
        data: session,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}