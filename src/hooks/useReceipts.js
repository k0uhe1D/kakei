import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { uploadReceipt, triggerOCR } from "../services/receipts";
import { saveReceipt } from "../services/firestore";

export default function useReceipts() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file) => {
    if (!user) return;
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setOcrResult(null);

    try {
      const result = await uploadReceipt(user.uid, file, (progress) => {
        setUploadProgress(progress);
      });

      setCurrentReceipt(result);
      setUploading(false);
      setProcessing(true);

      // Trigger OCR
      const ocrData = await triggerOCR(result.receiptId, result.storagePath);
      setOcrResult(ocrData.ocrResult);
      setProcessing(false);

      return {
        receiptId: result.receiptId,
        imageUrl: result.imageUrl,
        ocrResult: ocrData.ocrResult,
      };
    } catch (err) {
      setError(err.message || "アップロードに失敗しました");
      setUploading(false);
      setProcessing(false);
      throw err;
    }
  }, [user]);

  const confirmReceipt = useCallback(async (receiptId, confirmedData) => {
    if (!user) return;
    await saveReceipt(user.uid, {
      id: receiptId,
      confirmedAmount: confirmedData.amount,
      confirmedCategory: confirmedData.category,
      confirmedStoreName: confirmedData.storeName,
      confirmedDate: confirmedData.date,
      monthKey: confirmedData.monthKey,
      status: "confirmed",
    });
  }, [user]);

  const reset = useCallback(() => {
    setUploading(false);
    setProcessing(false);
    setUploadProgress(0);
    setOcrResult(null);
    setCurrentReceipt(null);
    setError(null);
  }, []);

  return {
    upload,
    confirmReceipt,
    reset,
    uploading,
    processing,
    uploadProgress,
    ocrResult,
    currentReceipt,
    error,
  };
}
