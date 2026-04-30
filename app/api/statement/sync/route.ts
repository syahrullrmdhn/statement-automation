import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { syncStatementFromS3 } from "@/lib/statement/sync-service";

const schema = z.object({
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^\d{2}$/),
  server: z.string().optional(),
  force: z.boolean().optional(),
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

  const result = await syncStatementFromS3({
    year: parsed.data.year,
    month: parsed.data.month,
    server: parsed.data.server === "ALL" ? undefined : parsed.data.server,
    force: parsed.data.force,
    createdBy: user.username,
  });

  return NextResponse.json(result);
}
