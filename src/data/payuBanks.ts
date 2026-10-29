// Official PayU Net Banking codes and payment method configurations.
// Source: https://docs.payu.in/docs/net-banking-codes

export interface PayUBank {
  name: string;
  bankcode: string;
  popular?: boolean;
}

/**
 * Global payment methods configuration.
 * Change allowed methods or dropped categories in this single place.
 */
export const PAYU_ALLOWED_PAYMENT_METHODS = "creditcard|debitcard|netbanking|upi";
export const PAYU_DROP_CATEGORY = "EMI";

/**
 * Top popular banks shown at the top of the dropdown for fast athlete selection.
 */
export const POPULAR_BANK_CODES = [
  "SBIB",     // State Bank of India
  "HDFB",     // HDFC Bank
  "ICIB",     // ICICI Bank
  "AXIB",     // AXIS Bank
  "PNBB",     // Punjab National Bank
  "BBRB",     // Bank of Baroda
  "UBIB",     // Union Bank - Retail Netbanking
  "162B",     // Kotak Mahindra Bank
  "CABB",     // Canara Bank
  "INDB",     // Indian Bank
  "UCOB",     // UCO Bank
  "BOINB",    // Bank of India - Retail
] as const;

/**
 * Merged / legacy bank aliases mapped to their successor bank codes on PayU.
 */
export const MERGED_BANK_ALIASES: Record<string, { successorName: string; bankcode: string }> = {
  ALLB: { successorName: "Indian Bank", bankcode: "INDB" },
  ADBB: { successorName: "Union Bank of India", bankcode: "UBIB" },
  CRPB: { successorName: "Union Bank of India", bankcode: "UBIB" },
  OBCB: { successorName: "Punjab National Bank", bankcode: "PNBB" },
  SYNDB: { successorName: "Canara Bank", bankcode: "CABB" },
  UNIB: { successorName: "Punjab National Bank", bankcode: "PNBB" },
};

/**
 * Complete list of 65+ official PayU Net Banking codes.
 */
export const RAW_PAYU_BANKS: PayUBank[] = [
  { name: "Airtel Payments Bank", bankcode: "AIRNB" },
  { name: "AU Small Finance Bank", bankcode: "AUSFNB" },
  { name: "AU Small Finance Bank - Corporate", bankcode: "AUSFCNB" },
  { name: "AXIS Bank", bankcode: "AXIB" },
  { name: "Axis Corporate Netbanking", bankcode: "AXISCNB" },
  { name: "Bandhan Bank", bankcode: "BANDNB" },
  { name: "Bank of Baroda", bankcode: "BBRB" },
  { name: "Bank of India - Corporate", bankcode: "BOIB" },
  { name: "Bank of India - Retail", bankcode: "BOINB" },
  { name: "Bank of Maharashtra", bankcode: "BOMB" },
  { name: "Canara Bank", bankcode: "CABB" },
  { name: "Canara Bank (Erstwhile - Syndicate Bank)", bankcode: "SYNDB" },
  { name: "Capital Small Finance Bank Corporate", bankcode: "CSFBC" },
  { name: "Capital Small Finance Bank Retail", bankcode: "CSFBR" },
  { name: "Catholic Syrian Bank", bankcode: "CSBN" },
  { name: "Central Bank Of India", bankcode: "CBIB" },
  { name: "City Union Bank", bankcode: "CUBB" },
  { name: "Cosmos Bank", bankcode: "CSMSNB" },
  { name: "DCB Bank", bankcode: "DCBB" },
  { name: "Deutsche Bank", bankcode: "DSHB" },
  { name: "Deutsche Bank - Corporate", bankcode: "DCBCORP" },
  { name: "Dhanlaxmi Bank - Corporate", bankcode: "DLNBCORP" },
  { name: "Dhanlaxmi Bank - Retail", bankcode: "DLSB" },
  { name: "Federal Bank", bankcode: "FEDB" },
  { name: "Federal Bank Corporate", bankcode: "FEDCORP" },
  { name: "HDFC Bank", bankcode: "HDFB" },
  { name: "HDFC Bank - Corporate Banking", bankcode: "HDFCCONB" },
  { name: "ICICI Bank", bankcode: "ICIB" },
  { name: "ICICI Corporate Netbanking", bankcode: "ICICICNB" },
  { name: "IDBI Bank", bankcode: "IDBB" },
  { name: "IDBI Corp Netbanking", bankcode: "IDBICORP" },
  { name: "IDFC FIRST Bank", bankcode: "IDFCNB" },
  { name: "Indian Bank", bankcode: "INDB" },
  { name: "Indian Bank (Erstwhile Allahabad Bank)", bankcode: "ALLB" },
  { name: "Indian Overseas Bank", bankcode: "INOB" },
  { name: "IndusInd Bank", bankcode: "INIB" },
  { name: "Jammu & Kashmir Bank", bankcode: "JAKB" },
  { name: "Jana Small Finance Bank", bankcode: "JANANB" },
  { name: "Janata Sahakari Bank Pune", bankcode: "JSBNB" },
  { name: "Karnataka Bank", bankcode: "KRKB" },
  { name: "Karnataka Gramin Bank", bankcode: "KGBNB" },
  { name: "Karur Vysya - Corporate Banking", bankcode: "KRVBC" },
  { name: "Karur Vysya Bank", bankcode: "KRVB" },
  { name: "Kerala Gramin Bank", bankcode: "KEGBNB" },
  { name: "Kotak Mahindra Bank", bankcode: "162B" },
  { name: "Kotak Mahindra Bank - Corp Net Banking", bankcode: "KTKBCORP" },
  { name: "PNB (Erstwhile - Oriental Bank of Commerce)", bankcode: "OBCB" },
  { name: "PNB (Erstwhile - United Bank of India)", bankcode: "UNIB" },
  { name: "Punjab & Sind Bank", bankcode: "PSBNB" },
  { name: "Punjab National Bank", bankcode: "PNBB" },
  { name: "Punjab National Bank - Corporate Banking", bankcode: "CPNB" },
  { name: "RBL Bank", bankcode: "RBLNB" },
  { name: "RBL Corporate Netbanking", bankcode: "RBLCNB" },
  { name: "Saraswat Bank", bankcode: "SRSWT" },
  { name: "Shivalik Small Finance Bank", bankcode: "SHIVANB" },
  { name: "South Indian Bank", bankcode: "SOIB" },
  { name: "Standard Chartered Bank", bankcode: "SCBNB" },
  { name: "State Bank of India", bankcode: "SBIB" },
  { name: "State Bank of India - Corporate", bankcode: "SBNCORP" },
  { name: "SVC Co-operative Bank Limited", bankcode: "SVCNB" },
  { name: "SVC Co-operative Bank - Corporate", bankcode: "SVCCB" },
  { name: "Tamilnad Mercantile Bank", bankcode: "TMBB" },
  { name: "UCO Bank", bankcode: "UCOB" },
  { name: "UCO Corporate", bankcode: "UCOCNB" },
  { name: "Union Bank - Retail Netbanking", bankcode: "UBIB" },
  { name: "Union Bank - Corporate Netbanking", bankcode: "UBIBC" },
  { name: "Yes Bank", bankcode: "YESB" },
];

/**
 * Validates whether a given bankcode is recognized in the official PayU list.
 */
export function isValidPayUBankCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  const upper = code.trim().toUpperCase();
  return RAW_PAYU_BANKS.some((b) => b.bankcode.toUpperCase() === upper) || upper in MERGED_BANK_ALIASES;
}

/**
 * Formatted and sorted banks: Popular on top, then all other banks A-Z.
 */
export function getSortedPayUBanks(): PayUBank[] {
  const popularMap = new Map<string, PayUBank>();
  const others: PayUBank[] = [];

  RAW_PAYU_BANKS.forEach((bank) => {
    if ((POPULAR_BANK_CODES as readonly string[]).includes(bank.bankcode)) {
      popularMap.set(bank.bankcode, { ...bank, popular: true });
    } else {
      others.push({ ...bank, popular: false });
    }
  });

  const popularSorted = POPULAR_BANK_CODES
    .map((code) => popularMap.get(code))
    .filter((b): b is PayUBank => !!b);

  const othersSorted = others.sort((a, b) => a.name.localeCompare(b.name));

  return [...popularSorted, ...othersSorted];
}

