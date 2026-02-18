import {
  doc, collection, getDoc, getDocs, setDoc, deleteDoc, updateDoc,
  onSnapshot, writeBatch, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// ─── User Profile ───
export function getUserRef(userId) {
  return doc(db, "users", userId);
}

export async function getUserProfile(userId) {
  const snap = await getDoc(getUserRef(userId));
  return snap.exists() ? snap.data() : null;
}

export async function updateBalance(userId, balance) {
  await updateDoc(getUserRef(userId), { balance, updatedAt: serverTimestamp() });
}

export async function initUserProfile(userId, data = {}) {
  await setDoc(getUserRef(userId), {
    balance: data.balance || 0,
    displayName: data.displayName || "",
    migratedFromLocalStorage: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─── Budget Items ───
function itemsCol(userId) {
  return collection(db, "users", userId, "items");
}

export function subscribeBudgetItems(userId, callback) {
  return onSnapshot(itemsCol(userId), (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

export async function saveBudgetItem(userId, item) {
  const ref = item.id
    ? doc(db, "users", userId, "items", item.id)
    : doc(itemsCol(userId));
  const { id, ...data } = item;
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function deleteBudgetItem(userId, itemId) {
  await deleteDoc(doc(db, "users", userId, "items", itemId));
}

// ─── Actuals ───
function actualsCol(userId) {
  return collection(db, "users", userId, "actuals");
}

export function subscribeActuals(userId, monthKey, callback) {
  const q = query(actualsCol(userId), where("monthKey", "==", monthKey));
  return onSnapshot(q, (snap) => {
    const actuals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(actuals);
  });
}

export function subscribeAllActuals(userId, callback) {
  return onSnapshot(actualsCol(userId), (snap) => {
    const actuals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(actuals);
  });
}

export async function saveActual(userId, actual) {
  const ref = actual.id
    ? doc(db, "users", userId, "actuals", actual.id)
    : doc(actualsCol(userId));
  const { id, ...data } = actual;
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function deleteActual(userId, actualId) {
  await deleteDoc(doc(db, "users", userId, "actuals", actualId));
}

// ─── Receipts ───
function receiptsCol(userId) {
  return collection(db, "users", userId, "receipts");
}

export function subscribeReceipts(userId, monthKey, callback) {
  const q = query(receiptsCol(userId), where("monthKey", "==", monthKey));
  return onSnapshot(q, (snap) => {
    const receipts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(receipts);
  });
}

export async function saveReceipt(userId, receipt) {
  const ref = receipt.id
    ? doc(db, "users", userId, "receipts", receipt.id)
    : doc(receiptsCol(userId));
  const { id, ...data } = receipt;
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

// ─── Batch Migration ───
export async function migrateLocalStorageToFirestore(userId, localData) {
  const batch = writeBatch(db);

  // User profile
  const userRef = getUserRef(userId);
  batch.set(userRef, {
    balance: localData.balance || 0,
    migratedFromLocalStorage: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Items
  (localData.items || []).forEach((item) => {
    const ref = doc(itemsCol(userId));
    const { id, ...data } = item;
    batch.set(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });

  await batch.commit();
}
