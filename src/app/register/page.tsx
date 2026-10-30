import type { Metadata } from "next";
import { RegisterFlow } from "@/components/RegisterFlow";
import { isTestEntryTokenValid, TEST_SPORT_ID, TEST_DIVISION_ID, TEST_CLASS_ID } from "@/lib/test-entry";

export const metadata: Metadata = { title: "Register · Sports Festival 2026" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const testParam = one(q.test);
  const isTestAuthorized = isTestEntryTokenValid(testParam);

  return (
    <main className="t-ink min-h-[100svh]">
      <RegisterFlow
        initial={{
          sport: isTestAuthorized ? TEST_SPORT_ID : one(q.sport),
          division: isTestAuthorized ? TEST_DIVISION_ID : one(q.division),
          cls: isTestAuthorized ? TEST_CLASS_ID : one(q.class),
          test: isTestAuthorized,
          name: one(q.name),
          dob: one(q.dob),
          phone: one(q.phone),
          email: one(q.email),
          city: one(q.city),
          association: one(q.association),
        }}
        testEntryToken={isTestAuthorized ? testParam : undefined}
      />
    </main>
  );
}
