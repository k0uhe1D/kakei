import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeAllActuals, saveActual, deleteActual } from "../services/firestore";

export default function useActuals() {
  const { user } = useAuth();
  const [actuals, setActuals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeAllActuals(user.uid, (data) => {
      setActuals(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addActual = useCallback(async (actual) => {
    if (!user) return;
    return await saveActual(user.uid, actual);
  }, [user]);

  const removeActual = useCallback(async (actualId) => {
    if (!user) return;
    await deleteActual(user.uid, actualId);
  }, [user]);

  const getActualsByMonth = useCallback((monthKey) => {
    return actuals.filter(a => a.monthKey === monthKey);
  }, [actuals]);

  return { actuals, loading, addActual, removeActual, getActualsByMonth };
}
