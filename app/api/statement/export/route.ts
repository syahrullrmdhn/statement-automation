import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { exportStatement } from "@/lib/statement/export-service";

const schema = z.object({
  title: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^\d{2}$/),
  accounts: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  const result = await exportStatement({
    title: parsed.data.title,
    year: parsed.data.year,
    month: parsed.data.month,
    accounts: parsed.data.accounts,
    createdBy: user.username,
  });

  return NextResponse.json(result);
}
