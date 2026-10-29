import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
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
  status: "Awaiting payment" | "Paid" | "Verified" | "Failed";
  source?: string;
  utr?: string;
  ticketNo?: string;
  ticketUrl?: string;
  isTest?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
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
