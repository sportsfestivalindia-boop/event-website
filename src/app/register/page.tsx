import type { Metadata } from "next";
import { RegisterFlow } from "@/components/RegisterFlow";

export const metadata: Metadata = { title: "Register · Sports Festival 2026" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <main className="t-ink min-h-[100svh]">
      <RegisterFlow initial={{ sport: one(q.sport), division: one(q.division), cls: one(q.class) }} />
    </main>
  );
}
