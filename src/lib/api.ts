import { NextResponse } from "next/server";

/**
 * Turns an unexpected throw into a response that says what broke.
 *
 * An opaque 500 in a browser console is nearly useless for diagnosis — the
 * stack is on the server and the client sees nothing. These handlers are the
 * owner's own back office, so returning the message costs no privacy and saves
 * a round trip through the hosting provider's log viewer.
 */
export function serverError(scope: string, error: unknown) {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[${scope}]`, error);
  return NextResponse.json({ error: `${scope} failed — ${detail}` }, { status: 500 });
}
