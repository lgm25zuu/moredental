import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = "https://script.google.com/macros/s/AKfycbzlPMW7j4B2iUUby2sw-vJWkhWujHhUtF5KDy_c7L68T7Kr3-akmQFr_qxkw0oSS-vYNw/exec";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || '';
  const rowIndex = searchParams.get('rowIndex') || '';
  let gasUrl = `${GAS_URL}?action=${action}`;
  if (rowIndex) gasUrl += `&rowIndex=${rowIndex}`;
  const res = await fetch(gasUrl, { redirect: 'follow' });
  const json = await res.json();
  return NextResponse.json(json);
}
