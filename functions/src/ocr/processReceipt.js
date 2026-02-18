const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { GoogleGenerativeAI } = require("@google/generative-ai");

initializeApp();

const VALID_CATEGORIES = [
  "家賃", "光熱費", "通信費", "食費", "日用品", "育児用品", "保育費", "出産費",
  "保険", "交通費", "教育費", "医療費", "娯楽", "衣服", "貯蓄", "ローン",
  "税金", "冠婚葬祭", "旅行", "家電・家具", "その他支出",
];

const GEMINI_PROMPT = `このレシート画像から以下のJSON形式で情報を抽出してください。
必ず有効なJSONのみを返してください。マークダウンのコードフェンスは不要です。

{
  "totalAmount": 合計金額(数値、税込),
  "storeName": "店舗名",
  "date": "YYYY-MM-DD",
  "suggestedCategory": "カテゴリ(次のリストから最も適切なものを選択: ${VALID_CATEGORIES.join(", ")})",
  "items": [{"name": "商品名", "amount": 金額, "quantity": 数量}],
  "rawText": "レシート全文テキスト"
}

注意:
- 金額は数値のみ（カンマや円記号は除く）
- 日付が読み取れない場合は null
- 店舗名が読み取れない場合は "不明"
- カテゴリは上記リストから選択。判断できない場合は "その他支出"`;

exports.processReceipt = onCall(
  { region: "asia-northeast1", maxInstances: 10 },
  async (request) => {
    // Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "認証が必要です");
    }

    const { storagePath, receiptId } = request.data;
    if (!storagePath || !receiptId) {
      throw new HttpsError("invalid-argument", "storagePath と receiptId が必要です");
    }

    const userId = request.auth.uid;
    const db = getFirestore();
    const receiptRef = db.doc(`users/${userId}/receipts/${receiptId}`);

    try {
      // Update status to processing
      await receiptRef.update({ status: "processing" });

      // Download image from Storage
      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);
      const [imageBuffer] = await file.download();
      const base64Image = imageBuffer.toString("base64");

      // Get file metadata for mime type
      const [metadata] = await file.getMetadata();
      const mimeType = metadata.contentType || "image/jpeg";

      // Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new HttpsError("internal", "Gemini API key が設定されていません");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent([
        GEMINI_PROMPT,
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
      ]);

      const responseText = result.response.text();

      // Parse response - remove markdown code fences if present
      let cleaned = responseText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      let ocrResult;
      try {
        ocrResult = JSON.parse(cleaned);
      } catch {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          ocrResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Gemini応答のJSON解析に失敗しました");
        }
      }

      // Validate and sanitize
      const sanitized = {
        totalAmount: typeof ocrResult.totalAmount === "number" ? ocrResult.totalAmount : 0,
        storeName: ocrResult.storeName || "不明",
        date: ocrResult.date || null,
        suggestedCategory: VALID_CATEGORIES.includes(ocrResult.suggestedCategory)
          ? ocrResult.suggestedCategory
          : "その他支出",
        items: Array.isArray(ocrResult.items) ? ocrResult.items : [],
        rawText: ocrResult.rawText || "",
        confidence: ocrResult.totalAmount > 0 ? "high" : "low",
      };

      // Update receipt with OCR result
      await receiptRef.update({
        ocrResult: sanitized,
        status: "review",
        confirmedAmount: sanitized.totalAmount,
        confirmedCategory: sanitized.suggestedCategory,
        confirmedStoreName: sanitized.storeName,
        confirmedDate: sanitized.date,
      });

      return { success: true, ocrResult: sanitized };
    } catch (error) {
      // Update status to error
      await receiptRef.update({
        status: "error",
        errorMessage: error.message,
      });

      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", `OCR処理に失敗しました: ${error.message}`);
    }
  }
);
