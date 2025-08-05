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
    createProgressDots(completedParam, total, challengeName = '', currentIndex = 0, incorrectIndices = []) {
        let html = '';
        // completedParamが配列の場合（インデックスリスト）と数値の場合の両方に対応
        const completedIndices = Array.isArray(completedParam) ? completedParam : [];
        const completedCount = Array.isArray(completedParam) ? completedParam.length : completedParam;
        
        for (let i = 0; i < total; i++) {
            // 配列の場合はインデックスをチェック、数値の場合は従来通り
            const isCompleted = Array.isArray(completedParam) ? 
                completedIndices.includes(i) : 
                i < completedCount;
            const isIncorrect = incorrectIndices.includes(i);
            const isCurrent = i === currentIndex;
            
            let statusClass = 'pending';
            if (isCompleted) statusClass = 'completed';
            else if (isIncorrect) statusClass = 'incorrect';
            
            const className = `progress-dot ${statusClass} ${isCurrent ? 'current' : ''}`;
            const dataAttr = challengeName ? `data-challenge="${challengeName}" data-index="${i}"` : '';
            const clickable = challengeName ? 'clickable' : '';
            const title = challengeName ? `title="問題 ${i + 1}"` : '';
            html += `<span class="${className} ${clickable}" ${dataAttr} ${title}></span>`;
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