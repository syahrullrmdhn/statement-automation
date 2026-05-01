import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { exportStatement } from "@/lib/statement/export-service";

const schema = z.object({
  title: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^\d{2}$/),
  accounts: z.array(z.string()).min(1),
  specificDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rangeStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rangeEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  lookbackDays: z.number().int().min(0).max(60).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Sesi Anda sudah berakhir. Silakan login kembali." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Data export belum lengkap atau formatnya belum sesuai." }, { status: 400 });
  }

  if (parsed.data.rangeStart && parsed.data.rangeEnd && parsed.data.rangeStart > parsed.data.rangeEnd) {
    return NextResponse.json({ message: "Range tanggal tidak valid." }, { status: 400 });
  }

  const result = await exportStatement({
    title: parsed.data.title,
    year: parsed.data.year,
    month: parsed.data.month,
    accounts: parsed.data.accounts,
    specificDate: parsed.data.specificDate,
    rangeStart: parsed.data.rangeStart,
    rangeEnd: parsed.data.rangeEnd,
    lookbackDays: parsed.data.lookbackDays,
    createdBy: user.username,
  });

  return NextResponse.json(result);
}
