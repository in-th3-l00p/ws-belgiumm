import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyByzQMGNXDiyP8yDnaGN-tEsvewCrm2Z3I',
  authDomain: 'ws-belgium.firebaseapp.com',
  projectId: 'ws-belgium',
  storageBucket: 'ws-belgium.firebasestorage.app',
  messagingSenderId: '287882612967',
  appId: '1:287882612967:web:e0d46837013852487bd242',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper function to ensure session exists
export async function ensureSession(
  competitorId: string,
  day: number,
  module: 'morning' | 'evening'
) {
  const sessionsRef = collection(db, 'sessions');
  await addDoc(sessionsRef, {
    competitorId,
    day,
    module,
    startTime: null,
    endTime: null,
    totalTime: 0,
  });
}

export async function createAdminUser(email: string, password: string) {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Add admin role in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
}
