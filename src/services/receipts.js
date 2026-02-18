import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { storageRef, functions } from "../config/firebase";
import { saveReceipt } from "./firestore";

function resizeImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = (h * maxWidth) / w;
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadReceipt(userId, file, onProgress) {
  // Resize image
  const resized = await resizeImage(file);

  // Create receipt document first
  const timestamp = Date.now();
  const storagePath = `users/${userId}/receipts/${timestamp}.jpg`;
  const receiptId = await saveReceipt(userId, {
    storagePath,
    imageUrl: "",
    status: "uploading",
    ocrResult: null,
    confirmedAmount: null,
    confirmedCategory: null,
    confirmedStoreName: null,
    confirmedDate: null,
    monthKey: null,
    actualId: null,
    createdAt: new Date(),
  });

  // Upload to Storage
  const storageReference = ref(storageRef, storagePath);
  const uploadTask = uploadBytesResumable(storageReference, resized, {
    contentType: "image/jpeg",
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Update receipt with URL
        await saveReceipt(userId, {
          id: receiptId,
          imageUrl: downloadURL,
          status: "uploading",
        });

        resolve({ receiptId, storagePath, imageUrl: downloadURL });
      }
    );
  });
}

export async function triggerOCR(receiptId, storagePath) {
  const processReceiptFn = httpsCallable(functions, "processReceipt");
  const result = await processReceiptFn({ receiptId, storagePath });
  return result.data;
}
