import { NextResponse } from "next/server";

export function json(data, status = 200, init = {}) {
  return NextResponse.json(data, { ...init, status });
}

export function serverError(message = "Internal server error") {
  return json({ message }, 500);
}
