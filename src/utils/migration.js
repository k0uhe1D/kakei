import storage from "../storage";
import { STORAGE_KEY } from "../constants/defaults";
import { getUserProfile, migrateLocalStorageToFirestore } from "../services/firestore";

export async function checkAndMigrateLocalStorage(userId) {
  // Check if user already has Firestore data
  const profile = await getUserProfile(userId);
  if (profile?.migratedFromLocalStorage) {
    return { migrated: false, reason: "already_migrated" };
  }

  // Check if localStorage has data
  const res = await storage.get(STORAGE_KEY);
  if (!res?.value) {
    return { migrated: false, reason: "no_local_data" };
  }

  try {
    const localData = JSON.parse(res.value);
    if (!localData.items || localData.items.length === 0) {
      return { migrated: false, reason: "empty_local_data" };
    }

    return {
      migrated: false,
      reason: "ready",
      localData,
      itemCount: localData.items.length,
      balance: localData.balance,
    };
  } catch {
    return { migrated: false, reason: "parse_error" };
  }
}

export async function performMigration(userId, localData) {
  await migrateLocalStorageToFirestore(userId, localData);
  return { migrated: true };
}
