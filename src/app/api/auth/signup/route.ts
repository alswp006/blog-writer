import { NextResponse } from "next/server";
import { createUser } from "@/lib/models/user";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await createUser(email.trim().toLowerCase(), password, name?.trim() ?? "");
    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Signup failed";
    if (msg.includes("already in use")) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
