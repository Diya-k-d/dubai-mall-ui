import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // FREE MOCK RESPONSE (no API key needed)
    const last = messages[messages.length - 1]?.content || "";

    let reply = "Our team will assist you shortly.";

    if (last.toLowerCase().includes("lease")) {
      reply = "We offer premium retail leasing options. Would you like our leasing brochure?";
    } else if (last.toLowerCase().includes("event")) {
      reply = "Dubai Mall hosts world-class events. Want details on venues?";
    } else if (last.toLowerCase().includes("sponsor")) {
      reply = "We have sponsorship packages reaching millions of visitors.";
    }

    return NextResponse.json({ reply });

  } catch (err) {
    return NextResponse.json({ reply: "Error occurred" }, { status: 500 });
  }
}