// utils.js - 共通ユーティリティ関数

export const utils = {
    // ひらがなをカタカナに変換
    hiraganaToKatakana(str) {
        return str.replace(/[\u3041-\u3096]/g, (match) => {
            const chr = match.charCodeAt(0) + 0x60;
            return String.fromCharCode(chr);
        });
    },

    // カタカナをひらがなに変換
    katakanaToHiragana(str) {
        return str.replace(/[\u30a1-\u30f6]/g, (match) => {
            const chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    },

    // 文字列の正規化（比較用）
    normalizeString(str) {
        return str
            .trim()
            .toLowerCase()
            .replace(/[ー]/g, '')
            .replace(/\s/g, '');
    },

    // 答えの比較（ひらがな・カタカナを区別しない）
    compareAnswer(userAnswer, correctAnswer) {
        const normalizedUser = this.normalizeString(this.katakanaToHiragana(userAnswer));
        const normalizedCorrect = this.normalizeString(this.katakanaToHiragana(correctAnswer));
        return normalizedUser === normalizedCorrect;
    },

    // 進捗ドットの生成（スタイリッシュなHTML版）
    createProgressDots(completed, total) {
        let html = '';
        for (let i = 0; i < total; i++) {
            const isCompleted = i < completed;
            html += `<span class="progress-dot ${isCompleted ? 'completed' : 'pending'}"></span>`;
        }
        return html;
    },

    // ランダムな要素を取得
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    // 配列をシャッフル
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // モーダル表示用のタイマーID
    modalTimer: null,

    // モーダル表示
    showModal(message) {
        const modal = document.getElementById('message-modal');
        const modalMessage = document.getElementById('modal-message');
        modalMessage.textContent = message;
        modal.style.display = 'block';
        
        // 既存のタイマーをクリア
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
        }
        
        // 3秒後に自動で閉じる
        this.modalTimer = setTimeout(() => {
            modal.style.display = 'none';
            this.modalTimer = null;
        }, 3000);
    },

    // モーダルを閉じる
    closeModal() {
        const modal = document.getElementById('message-modal');
        modal.style.display = 'none';
        
        // 既存のタイマーをクリア
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
            this.modalTimer = null;
        }
    }
};