import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  try {
    const body = await request.json();
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    const res = await fetch(`${API_URL}/api/agent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Agent backend error:", res.status, err);
      return NextResponse.json(
        { reply: "The AI agent could not be reached. Is the backend running?", tools_used: [] },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent proxy error:", error);
    return NextResponse.json(
      { reply: "Failed to reach the AI agent. Please try again.", tools_used: [] },
      { status: 500 }
    );
  }
}
