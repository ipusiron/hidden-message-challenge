// storage.js - LocalStorage管理

export class Storage {
    constructor() {
        this.prefix = 'hiddenMessage_';
    }

    // 進捗の保存
    saveProgress(challengeName, data) {
        const key = `${this.prefix}${challengeName}_progress`;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // 進捗の取得
    getProgress(challengeName) {
        const key = `${this.prefix}${challengeName}_progress`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // スコアの保存
    saveScore(challengeName, score) {
        const key = `${this.prefix}${challengeName}_score`;
        localStorage.setItem(key, JSON.stringify(score));
    }

    // スコアの取得
    getScore(challengeName) {
        const key = `${this.prefix}${challengeName}_score`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : { completed: 0, total: 5 };
    }

    // すべてのスコアを取得
    getAllScores() {
        const challenges = ['headline', 'removeChar', 'position', 'stencil'];
        const scores = {};
        
        challenges.forEach(challenge => {
            scores[challenge] = this.getScore(challenge);
        });
        
        return scores;
    }

    // 現在の問題インデックスを保存
    saveCurrentIndex(challengeName, index) {
        const key = `${this.prefix}${challengeName}_currentIndex`;
        localStorage.setItem(key, index.toString());
    }

    // 現在の問題インデックスを取得
    getCurrentIndex(challengeName) {
        const key = `${this.prefix}${challengeName}_currentIndex`;
        const index = localStorage.getItem(key);
        return index ? parseInt(index) : 0;
    }

    // 解答済み問題のIDを保存
    saveCompletedProblems(challengeName, completedIds) {
        const key = `${this.prefix}${challengeName}_completed`;
        localStorage.setItem(key, JSON.stringify(completedIds));
    }

    // 解答済み問題のIDを取得
    getCompletedProblems(challengeName) {
        const key = `${this.prefix}${challengeName}_completed`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    // 特定のチャレンジのデータをクリア
    clearChallenge(challengeName) {
        const keys = [
            `${this.prefix}${challengeName}_progress`,
            `${this.prefix}${challengeName}_score`,
            `${this.prefix}${challengeName}_currentIndex`,
            `${this.prefix}${challengeName}_completed`
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // すべてのデータをクリア
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // 最終アクセス日時を保存
    saveLastAccess() {
        const key = `${this.prefix}lastAccess`;
        localStorage.setItem(key, new Date().toISOString());
    }

    // 最終アクセス日時を取得
    getLastAccess() {
        const key = `${this.prefix}lastAccess`;
        const date = localStorage.getItem(key);
        return date ? new Date(date) : null;
    }
}