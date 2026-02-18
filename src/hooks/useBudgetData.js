import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeBudgetItems, saveBudgetItem, deleteBudgetItem,
  getUserProfile, updateBalance, initUserProfile,
} from "../services/firestore";
import { checkAndMigrateLocalStorage, performMigration } from "../utils/migration";

export default function useBudgetData() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [migrationInfo, setMigrationInfo] = useState(null);

  useEffect(() => {
    if (!user) return;

    let unsubItems = null;

    const init = async () => {
      // Initialize user profile if needed
      const profile = await getUserProfile(user.uid);
      if (!profile) {
        await initUserProfile(user.uid, { displayName: user.displayName || "" });
      }
      setBalance(profile?.balance || 0);

      // Check for localStorage migration
      const migCheck = await checkAndMigrateLocalStorage(user.uid);
      if (migCheck.reason === "ready") {
        setMigrationInfo(migCheck);
      }

      // Subscribe to items
      unsubItems = subscribeBudgetItems(user.uid, (items) => {
        setItems(items);
        setLoading(false);
      });
    };

    init();
    return () => { if (unsubItems) unsubItems(); };
  }, [user]);

  const saveItem = useCallback(async (item) => {
    if (!user) return;
    await saveBudgetItem(user.uid, item);
  }, [user]);

  const deleteItem = useCallback(async (itemId) => {
    if (!user) return;
    await deleteBudgetItem(user.uid, itemId);
  }, [user]);

  const saveBalance = useCallback(async (newBalance) => {
    if (!user) return;
    setBalance(newBalance);
    await updateBalance(user.uid, newBalance);
  }, [user]);

  const doMigration = useCallback(async () => {
    if (!user || !migrationInfo?.localData) return;
    await performMigration(user.uid, migrationInfo.localData);
    setMigrationInfo(null);
  }, [user, migrationInfo]);

  const dismissMigration = useCallback(() => {
    setMigrationInfo(null);
  }, []);

  return {
    items,
    balance,
    loading,
    saveItem,
    deleteItem,
    saveBalance,
    migrationInfo,
    doMigration,
    dismissMigration,
    data: { balance, items },
  };
}
