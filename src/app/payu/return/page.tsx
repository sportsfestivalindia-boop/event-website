import { redirect } from "next/navigation";

/**
 * PayU redirects athletes here via return route.
 * Forwards to dedicated /thank-you or /payment-failed pages.
 */
export default async function PayUReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const status = String(p.status ?? "").toLowerCase();
  const txnid = String(p.txnid ?? "").toUpperCase();
  const error = String(p.error_Message ?? p.field9 ?? "");

  if (status === "success" && txnid) {
    redirect(`/thank-you?id=${encodeURIComponent(txnid)}`);
  }

  if (txnid || error) {
    redirect(`/payment-failed?id=${encodeURIComponent(txnid)}&error=${encodeURIComponent(error)}`);
  }

  redirect("/");
}
