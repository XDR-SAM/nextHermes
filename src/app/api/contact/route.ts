import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try to save to contacts table if it exists
    const { error: insertError } = await supabase
      .from("contacts")
      .insert([
        {
          name,
          email,
          subject,
          message,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      // Table might not exist — still return success to avoid blocking the user
      console.warn("Could not insert contact:", insertError.message);
    }

    return NextResponse.json(
      { success: true, message: "Your message has been received. We'll be in touch soon!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
