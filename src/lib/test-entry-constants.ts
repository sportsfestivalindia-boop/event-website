import type { Championship } from "@/data/festival";

export const TEST_SPORT_ID = "test-sports";
export const TEST_DIVISION_ID = "test-entry-1";
export const TEST_CLASS_ID = "Live Gateway Verification";
export const TEST_CATEGORY_LABEL = "TEST ENTRY (₹1)";
export const TEST_FEE = 1;

/** Championship definition for the test entry (injected only when authorized). */
export const TEST_CHAMPIONSHIP: Championship = {
  id: TEST_SPORT_ID,
  sport: "TEST ENTRY (₹1)",
  name: "Live Payment Test",
  level: "Gateway Verification",
  tagline: "Live ₹1 verification test for payment confirmation flow",
  when: "Testing Mode",
  divisions: [
    {
      id: TEST_DIVISION_ID,
      name: "TEST ENTRY (₹1)",
      classes: [TEST_CLASS_ID],
      prizes: [],
      fee: TEST_FEE,
      note: "Temporary test entry. Not valid for actual athletic event entry.",
    },
  ],
};
