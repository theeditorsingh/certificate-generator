import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "882fa78e-f7a2-43f8-9ebf-ef1ab6d6c51a");
  requestHeaders.set("x-createxyz-project-group-id", "f6d56a71-4813-49e1-8b0b-bec91cb1f64c");


  request.nextUrl.href = `https://www.create.xyz/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}