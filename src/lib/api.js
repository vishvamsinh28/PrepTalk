import { NextResponse } from "next/server";

export function json(data, status = 200, init = {}) {
  return NextResponse.json(data, { ...init, status });
}

export function errorJson(message, status = 500) {
  return json({ message }, status);
}
