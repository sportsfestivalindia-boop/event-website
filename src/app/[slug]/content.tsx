// Policy & information pages — keep them complete, specific and
// consistent with the facts file (fees, dates, refund rules all come from @/data/festival).
import Link from "next/link";
import { CHAMPIONSHIPS, DOCUMENTS, EVENT, ORGANISERS, REFUND } from "@/data/festival";
import { STALLS } from "@/data/partners";
import { inr } from "@/lib/format";

export const UPDATED = "6 October 2026";

type Page = { title: string; lead: string; body: React.ReactNode };

const H = ({ children }: { children: React.ReactNode }) => <h2 className="display mt-12 text-2xl text-gold md:text-3xl">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-4">{children}</p>;
const L = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-gold">
    {items.map((x, i) => (
      <li key={i}>{x}</li>
    ))}
  </ul>
);
const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="font-semibold text-gold underline-offset-4 hover:underline">
    {children}
  </Link>
);

const org = `${EVENT.organiser} (“${EVENT.organiserShort}”, “we”, “us”)`;
// one line per championship, straight from the facts file (Star Category listed on its own)
const fees = (
  <L
    items={[
      ...CHAMPIONSHIPS.map((c) => {
        const paid = [...new Set(c.divisions.map((d) => d.fee ?? EVENT.fee).filter((f) => f > 0))];
        return (
          <>
            {c.sport}: {paid.map(inr).join(" / ")} per category
          </>
        );
      }),
      <>Star Category (physically disabled / para athletes): free</>,
    ]}
  />
);
const contactBlock = (
  <L
    items={[
      <>
        <b>{EVENT.organiser}</b> — {EVENT.address}
      </>,
      <>
        Phone / WhatsApp: <a href={EVENT.phoneHref} className="text-gold">{EVENT.phone}</a>
      </>,
      <>
        Email: <a href={`mailto:${EVENT.email}`} className="text-gold">{EVENT.email}</a>
      </>,
    ]}
  />
);
const notChance =
  "India’s Biggest Sports Festival is a physical sports competition. Results are decided solely by athletic performance — judges’ scores, weigh-ins, lifts, bouts and finish times — under published rules. There is no lottery, lucky draw, betting, wagering or game of chance of any kind. The registration fee is a participation fee for competition entry and athlete services; it is not a stake, and it does not buy a chance of winning.";

export const PAGES: Record<string, Page> = {
  about: {
    title: "About us",
    lead: `${EVENT.name} ${EVENT.year} is organised by the ${EVENT.organiser} — the state body for gyms and fitness in Odisha.`,
    body: (
      <>
        <H>Who we are</H>
        <P>
          The {EVENT.organiser} ({EVENT.organiserShort}) brings together gym owners, coaches and athletes across Odisha to grow strength sports, fitness
          and the state’s wrestling tradition. Our motto: {EVENT.tagline}.
        </P>
        <H>The festival</H>
        <P>
          {EVENT.name} {EVENT.year} takes place on {EVENT.dateLabel} at {EVENT.venue}, {EVENT.city}. Over three days, athletes from across India compete in
          six championships:
        </P>
        <L
          items={CHAMPIONSHIPS.map((c) => (
            <>
              <b>{c.name}</b> — {c.sport} ({c.level}) · {c.when}
            </>
          ))}
        />
        <H>What we offer</H>
        <L
          items={[
            <>Athlete registration for the championships (fees shown on each category, in INR).</>,
            <>Exhibition stalls at the venue for brands, from {inr(STALLS[0].price)}.</>,
            <>
              Sponsorship partnerships — see <A href="/partner">Brand partners</A>.
            </>,
          ]}
        />
        <H>Office bearers</H>
        <L
          items={ORGANISERS.map((o) => (
            <>
              {o.name} — {o.role}
            </>
          ))}
        />
        <H>Contact</H>
        {contactBlock}
      </>
    ),
  },

  contact: {
    title: "Contact us",
    lead: "Questions about registration, payments, refunds, stalls or sponsorship — a real person from the AOGA team will help.",
    body: (
      <>
        <H>Organiser</H>
        <P>
          <b>{EVENT.organiser}</b>
          {EVENT.regdNo && <> · Regd. No. {EVENT.regdNo}</>}
          {EVENT.gstin && <> · GSTIN {EVENT.gstin}</>}
          <br />
          {EVENT.address}
        </P>
        <H>Reach us</H>
        <L
          items={[
            <>
              Phone: <a href={EVENT.phoneHref} className="text-gold">{EVENT.phone}</a>
            </>,
            <>
              WhatsApp:{" "}
              <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="text-gold">
                {EVENT.phone}
              </a>{" "}
              — usually the fastest way to reach us
            </>,
            <>
              Email: <a href={`mailto:${EVENT.email}`} className="text-gold">{EVENT.email}</a>
            </>,
            ...EVENT.socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener" className="text-gold">
                {s.label}
              </a>
            )),
          ]}
        />
        <H>Payment or refund issue?</H>
        <P>
          Send your registration ID (starts with “SF26-”) and, if you paid, the 12-digit UTR number of your UPI payment. We reply within 24 hours.
        </P>
        <H>Venue</H>
        <P>
          {EVENT.venue}, {EVENT.city} ·{" "}
          <a href={EVENT.mapsUrl} target="_blank" rel="noopener" className="text-gold">
            Open in Google Maps
          </a>
        </P>
      </>
    ),
  },

  terms: {
    title: "Terms & conditions",
    lead: `These terms apply to everyone who uses this website, registers as an athlete, books a stall or makes a payment for ${EVENT.name} ${EVENT.year}.`,
    body: (
      <>
        <H>1. Who we are</H>
        <P>
          This website and the event are operated by the {org}, {EVENT.address}. By registering, booking or paying, you agree to these terms, the{" "}
          <A href="/refund">Refund &amp; cancellation policy</A>, the <A href="/privacy">Privacy policy</A>, the{" "}
          <A href="/prizes">Prize &amp; payout policy</A> and the <A href="/rules">Rules</A>.
        </P>
        <H>2. A sports competition — not a game of chance</H>
        <P>{notChance}</P>
        <H>3. Eligibility</H>
        <L
          items={[
            "Athletes from all associations and federations are welcome.",
            "Masters is for athletes aged 45 years and above on the event date. The Star Category is for physically disabled / para athletes.",
            "Athletes under 18 may compete only with the written consent of a parent or guardian, presented at check-in.",
            "The name on your registration must match your government ID.",
          ]}
        />
        <H>4. Registration and fees</H>
        <P>Fees are charged in Indian Rupees (INR), per category entered:</P>
        {fees}
        <P>
          Each category is a separate entry. A registration is confirmed only when payment succeeds (or, for the free Star Category, when the form is
          submitted), and you receive a registration ID. Registrations close on 20 November 2026 or earlier if a category fills.
        </P>
        <H>5. Payments</H>
        <P>
          Payments are made by UPI (GPay, PhonePe, Paytm, BHIM or any UPI app) to the organiser’s collection account ({EVENT.upi.payee}, {EVENT.upi.bank}), using the QR shown at
          registration. We never see your UPI PIN or banking credentials. Your registration is confirmed on WhatsApp once AOGA matches your UTR number.
        </P>
        <H>6. Cancellations, refunds and transfers</H>
        <P>
          Full refund if we cancel or postpone the event; {REFUND.partialPct}% refund if you cancel on or before {REFUND.partialUntil}; free transfer or
          category change until registrations close. Details: <A href="/refund">Refund &amp; cancellation policy</A>.
        </P>
        <H>7. Rules, judging and anti-doping</H>
        <P>
          Competition is conducted under rules approved by the Organising and Technical Committees. Decisions of the judges and jury are final. Weigh-in
          is compulsory for weight categories. Athletes must comply with any anti-doping testing. Breaking the rules, misconduct or false information can
          lead to disqualification and withdrawal of awards, without a refund.
        </P>
        <H>8. Prizes</H>
        <P>
          Prizes are awarded only to athletes placed by the official results and are paid as set out in the <A href="/prizes">Prize &amp; payout policy</A>.
        </P>
        <H>9. Health and safety</H>
        <P>
          You confirm you are medically fit to compete. Strength and combat sports carry a risk of injury; you take part at your own risk. First aid,
          medical personnel and emergency coordination are provided at the venue.
        </P>
        <H>10. Photos, video and live stream</H>
        <P>
          The event is photographed, filmed and live-streamed. By taking part you consent to your name, image and performance being used for event
          coverage, results and promotion of the festival.
        </P>
        <H>11. Exhibitors and sponsors</H>
        <P>
          Stall locations are allotted by AOGA. Exhibitors follow the exhibitor rules shared with their booking. Sponsorships are governed by a separate
          written agreement.
        </P>
        <H>12. Changes to the event</H>
        <P>
          Timings may be adjusted by the Technical Committee. If the event is cancelled or postponed, you receive a full refund as set out in the refund
          policy.
        </P>
        <H>13. Liability</H>
        <P>To the extent permitted by law, our total liability to you is limited to the amount you paid us.</P>
        <H>14. Governing law</H>
        <P>These terms are governed by the laws of India. Courts at Bhubaneswar, Odisha have exclusive jurisdiction.</P>
        <H>15. Contact</H>
        {contactBlock}
      </>
    ),
  },

  privacy: {
    title: "Privacy policy",
    lead: `How the ${EVENT.organiser} collects, uses and protects your personal data, in line with the Digital Personal Data Protection Act, 2023.`,
    body: (
      <>
        <H>What we collect</H>
        <L
          items={[
            "Athletes: name, date of birth, mobile number, email, city, association / federation, chosen category.",
            "Exhibitors and sponsors: company name, contact person, mobile, email, GSTIN (optional), business sector.",
            "Payments: the UTR / UPI reference number you send us, to match your payment. Your UPI PIN and bank credentials stay with your UPI app and bank.",
            "Website usage: pages visited and ad-campaign source, through cookies and the Meta Pixel, to measure our advertising.",
          ]}
        />
        <H>How we use it</H>
        <L
          items={[
            "To process your registration or booking and confirm it to you by screen, email, SMS or WhatsApp.",
            "To run the competition — start lists, weigh-ins, results and certificates.",
            "To pay prizes (KYC and tax compliance).",
            "To send event updates. We do not send unrelated marketing.",
            "To meet legal, accounting and tax obligations.",
          ]}
        />
        <H>Who we share it with</H>
        <L
          items={[
                        "Our technical officials and judges — only what is needed to run your category.",
            "Our website host and Meta (advertising measurement).",
            "Government authorities, when required by law.",
          ]}
        />
        <P>We do not sell your personal data. Athlete names, categories, photos and results may be published as part of the event coverage.</P>
        <H>How long we keep it</H>
        <P>For as long as needed to run the event and pay prizes, and afterwards only as long as accounting and tax law requires.</P>
        <H>Your rights</H>
        <P>
          You can ask to access, correct or delete your data, or withdraw consent, by emailing <a href={`mailto:${EVENT.email}`} className="text-gold">{EVENT.email}</a>.
          We respond within 30 days. Data of athletes under 18 is processed with a parent’s or guardian’s consent.
        </P>
        <H>Contact</H>
        {contactBlock}
      </>
    ),
  },

  refund: {
    title: "Refund & cancellation policy",
    lead: "Clear rules for cancellations, refunds, transfers and failed payments — for athletes and exhibitors.",
    body: (
      <>
        <H>Athlete registrations</H>
        <L
          items={[
            <>
              <b>Event cancelled or postponed by the organiser:</b> 100% refund of the registration fee.
            </>,
            <>
              <b>You cancel on or before {REFUND.partialUntil}:</b> {REFUND.partialPct}% refund of the registration fee.
            </>,
            <>
              <b>You cancel after {REFUND.partialUntil}:</b> no refund — but you can transfer your entry to another athlete or change category free of
              charge until registrations close (20 November 2026).
            </>,
            <>
              <b>No-show, missed weigh-in or disqualification:</b> no refund.
            </>,
          ]}
        />
        <H>Exhibition stalls</H>
        <L
          items={[
            <>
              <b>Event cancelled or postponed by the organiser:</b> 100% refund.
            </>,
            <>
              <b>Cancelled by the exhibitor on or before {REFUND.partialUntil}:</b> {REFUND.partialPct}% refund.
            </>,
            <>
              <b>Cancelled by the exhibitor after {REFUND.partialUntil}:</b> no refund.
            </>,
          ]}
        />
        <P>Sponsorship refunds follow the sponsor’s written agreement.</P>
        <H>Failed or duplicate payments</H>
        <P>
          If money was deducted but your registration was not confirmed, or you paid twice, the extra or failed amount is refunded in full. Payments that
          fail midway are usually reversed automatically by your bank.
        </P>
        <H>How to request a refund</H>
        <P>
          WhatsApp <a href={EVENT.whatsappHref} target="_blank" rel="noopener" className="text-gold">{EVENT.phone}</a> or email{" "}
          <a href={`mailto:${EVENT.email}`} className="text-gold">{EVENT.email}</a> with your registration / booking ID and the UTR number of your payment.
        </P>
        <H>When you get your money</H>
        <P>
          Approved refunds are processed within {REFUND.creditDays} to the original payment method — the same UPI account, card or bank account you paid
          with. Your bank may take a few additional days to show the credit.
        </P>
      </>
    ),
  },

  shipping: {
    title: "Shipping & delivery policy",
    lead: "We sell event services, not physical goods. Nothing is shipped — here is exactly how and when each service is delivered.",
    body: (
      <>
        <H>Athlete registration</H>
        <L
          items={[
            "Right after you send your UTR: your registration ID and digital athlete pass on screen, marked “payment verifying”.",
            "Within 24 hours: confirmation from the AOGA team on WhatsApp.",
            <>
              On your competition day at {EVENT.venue}, {EVENT.city}: check-in, athlete ID, athlete kit and T-shirt, handed over in person.
            </>,
            "After your competition: medal and participation certificate at the venue; stage photos and your reel delivered digitally within 72 hours.",
          ]}
        />
        <H>Exhibition stalls</H>
        <P>
          You receive a booking ID on screen and send the booking to AOGA on WhatsApp. The team confirms availability and shares payment details
          (bank transfer for larger stalls). Stall allotment and the invoice follow by email / WhatsApp. The stall is available at the venue for the event days, {EVENT.dateLabel}.
        </P>
        <H>Where the service is delivered</H>
        <P>
          {EVENT.venue}, {EVENT.city}, on {EVENT.dateLabel}. Day-wise timings are on the <A href="/rules">Rules</A> page.
        </P>
        <H>Problems with delivery</H>
        <P>
          Didn’t receive your pass or receipt? Contact us with your registration ID — see <A href="/contact">Contact us</A>.
        </P>
      </>
    ),
  },

  prizes: {
    title: "Prize & payout policy",
    lead: `${inr(EVENT.prizePool)} in prize money, committed by the organisers — how winners are decided and how prizes are paid.`,
    body: (
      <>
        <H>Commitment</H>
        <P>
          The {inr(EVENT.prizePool)} prize money is committed by the {EVENT.organiser}. It does not depend on how many athletes register. Prize amounts for
          every category are published on the <A href="/#arena">category finder</A>.
        </P>
        <H>How winners are decided</H>
        <P>{notChance}</P>
        <P>
          Placings are decided by a panel of qualified judges led by a Chief Judge, with jury and statisticians, appointed by the Technical Committee —
          or by objective results (weights lifted, bouts won, finish times). Only athletes who complete weigh-in and comply with the rules and any
          anti-doping testing are eligible.
        </P>
        <H>How prizes are paid</H>
        <L
          items={[
            "Winners are announced on stage.",
            "Cash prizes are paid by bank transfer to an account in the winner’s own name, after KYC: PAN, bank account details and government ID.",
            "Tax (TDS) is deducted as required by Indian income-tax law, and a TDS certificate is issued.",
            "Non-cash prizes (such as the Royal Enfield Bullet for Utkal Kesari) are handed over to the winner after KYC.",
          ]}
        />
        <H>Forfeiture</H>
        <P>A prize is withdrawn if the athlete is disqualified, fails an anti-doping test, or gave false registration details.</P>
      </>
    ),
  },

  rules: {
    title: "Rules & competition guide",
    lead: "The essentials every athlete needs. Sport-specific technical rules are conducted under the Organising and Technical Committees.",
    body: (
      <>
        <H>Schedule by championship</H>
        <L
          items={CHAMPIONSHIPS.map((c) => (
            <>
              <b>{c.name}</b> ({c.sport}) — {c.when}
            </>
          ))}
        />
        <H>Weigh-in</H>
        <P>Compulsory for all weight categories, within the scheduled time. Missing the weigh-in means elimination.</P>
        <H>Judging</H>
        <P>
          A Chief Judge, judges, jury and statisticians are appointed by the Technical Committee. Judges must stay impartial, follow the official criteria,
          and may not coach or photograph competitors while judging. Decisions of the judges and jury are final.
        </P>
        <H>Anti-doping</H>
        <P>Every athlete signs an anti-doping consent at registration and must cooperate with any authorised testing.</P>
        <H>Special categories</H>
        <L items={["Masters — athletes aged 45 years and above.", "Star Category — physically disabled / para athletes; free registration."]} />
        <H>Bring on event day</H>
        <L items={DOCUMENTS} />
        <H>Conduct</H>
        <P>
          Follow the instructions of officials and marshals. Misconduct, false information or rule violations can lead to disqualification and withdrawal
          of awards.
        </P>
      </>
    ),
  },
};
