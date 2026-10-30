import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore,
  type Firestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey || "placeholder-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aoga-9e496.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aoga-9e496",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aoga-9e496.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "564346120463",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:564346120463:web:2e8d2f393558bc999d367a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NJYM0CT3TM",
};

// Safe initialization that never crashes during builds or test runs
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  dbInstance = getFirestore(appInstance);
  if (apiKey) {
    authInstance = getAuth(appInstance);
  }
  storageInstance = getStorage(appInstance);
} catch (e) {
  // Safe fallback if Firebase is initialized in a restricted script/test environment
  console.warn("Firebase initialization warning (non-fatal):", e);
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;

// Analytics runs only on client side in supported environments
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && app && (await isSupported())) {
    try {
      return getAnalytics(app);
    } catch {
      return null;
    }
  }
  return null;
};

export interface NotificationInfo {
  emailSentAt?: string;
  whatsappSentAt?: string;
  emailError?: string;
  whatsappError?: string;
  lastAttemptAt?: string;
  resendCount?: number;
}

export interface RegistrationRecord {
  regId: string;
  name: string;
  dob?: string;
  phone: string;
  email: string;
  city?: string;
  association?: string;
  category: string;
  fee: number;
  originalFee?: number;
  status: "Awaiting payment" | "Paid" | "Verified" | "Failed";
  source?: string;
  utr?: string;
  ticketNo?: string;
  ticketUrl?: string;
  isTest?: boolean;
  notifications?: NotificationInfo;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationFailureRecord {
  regId: string;
  type: "email" | "whatsapp";
  recipient: string;
  error: string;
  timestamp: string;
}

/** Record failed notification in notificationFailures collection */
export async function recordNotificationFailure(record: NotificationFailureRecord) {
  if (!db) return false;
  try {
    const ref = doc(collection(db, "notificationFailures"));
    await setDoc(ref, {
      ...record,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Firestore recordNotificationFailure error:", err);
    return false;
  }
}

/** Save a registration to Firestore in real-time */
export async function saveRegistrationToFirestore(record: RegistrationRecord) {
  if (!db) return false;
  try {
    const ref = doc(db, "registrations", record.regId);
    await setDoc(ref, {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Firestore saveRegistration error:", err);
    return false;
  }
}

/** Update registration payment status and ticket details */
export async function updateRegistrationInFirestore(
  regId: string,
  update: Partial<RegistrationRecord>
) {
  if (!db) return false;
  try {
    const ref = doc(db, "registrations", regId);
    await updateDoc(ref, {
      ...update,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Firestore updateRegistration error:", err);
    return false;
  }
}

/** Get a registration by ID from Firestore */
export async function getRegistrationFromFirestore(regId: string): Promise<RegistrationRecord | null> {
  if (!db) return null;
  try {
    const ref = doc(db, "registrations", regId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as RegistrationRecord;
  } catch (err) {
    console.error("Firestore getRegistration error:", err);
    return null;
  }
}

/** Get all registrations associated with a specific email */
export async function getRegistrationsByEmail(email: string): Promise<RegistrationRecord[]> {
  if (!db || !email) return [];
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(collection(db, "registrations"), where("email", "==", cleanEmail));
    const snap = await getDocs(q);
    const list: RegistrationRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as RegistrationRecord);
    });
    return list;
  } catch (err) {
    console.error("Firestore getRegistrationsByEmail error:", err);
    return [];
  }
}

/** Claim an existing registration by Client ID + mobile and link to user email */
export async function claimRegistration(
  regId: string,
  phone: string,
  targetEmail: string
): Promise<{ success: boolean; error?: string; registration?: RegistrationRecord }> {
  if (!db) return { success: false, error: "Database not connected" };
  try {
    const cleanId = regId.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanId || !cleanPhone || !cleanEmail) {
      return { success: false, error: "Please enter your Registration ID, mobile number and email." };
    }

    const reg = await getRegistrationFromFirestore(cleanId);
    if (!reg) {
      return { success: false, error: "Registration ID not found. Please check and try again." };
    }

    const recordPhone = (reg.phone || "").replace(/\D/g, "").slice(-10);
    if (recordPhone !== cleanPhone) {
      return { success: false, error: "Mobile number does not match this registration record." };
    }

    // Link registration to user's Google email
    await updateRegistrationInFirestore(cleanId, {
      email: cleanEmail,
    });

    return {
      success: true,
      registration: { ...reg, email: cleanEmail },
    };
  } catch (err) {
    console.error("Firestore claimRegistration error:", err);
    return { success: false, error: "Failed to claim registration. Please try again later." };
  }
}

