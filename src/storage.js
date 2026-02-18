/**
 * localStorage ラッパー
 * 仕様書の window.storage API 互換インターフェース
 */
const storage = {
    async get(key) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? { value } : null;
        } catch {
            return null;
        }
    },

    async set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // ストレージ容量超過時は無視
        }
    },

    async remove(key) {
        try {
            localStorage.removeItem(key);
        } catch {
            // 無視
        }
    },
};

export default storage;
