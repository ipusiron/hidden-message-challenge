// main.js - メイン制御
import { HeadlineChallenge } from './challenges/headline.js';
import { RemoveCharChallenge } from './challenges/removeChar.js';
import { PositionChallenge } from './challenges/position.js';
import { StencilChallenge } from './challenges/stencil.js';
import { ResultsManager } from './results/score.js';
import { Storage } from './common/storage.js';

class HiddenMessageChallenge {
    constructor() {
        this.challenges = {
            headline: null,
            removeChar: null,
            position: null,
            stencil: null
        };
        this.resultsManager = null;
        this.storage = new Storage();
        this.currentTab = 'headline';
    }

    async init() {
        // チャレンジの初期化
        this.challenges.headline = new HeadlineChallenge();
        this.challenges.removeChar = new RemoveCharChallenge();
        this.challenges.position = new PositionChallenge();
        this.challenges.stencil = new StencilChallenge();
        this.resultsManager = new ResultsManager();

        // イベントリスナーの設定
        this.setupTabListeners();
        this.setupButtonListeners();
        
        // 初期データのロード
        await this.loadProgress();
        
        // 最初のチャレンジを表示
        await this.challenges.headline.loadChallenge();
    }

    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const tabName = e.target.dataset.tab;
                await this.switchTab(tabName);
            });
        });
    }

    async switchTab(tabName) {
        // タブボタンのアクティブ状態を更新
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブパネルの表示を切り替え
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // 成果タブの場合は結果を更新
        if (tabName === 'results') {
            this.resultsManager.updateResults();
        } else if (this.challenges[tabName]) {
            // 各チャレンジのロード
            await this.challenges[tabName].loadChallenge();
        }
    }

    setupButtonListeners() {
        // ヒントボタン
        document.querySelectorAll('.hint-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const challengeName = e.target.dataset.challenge;
                this.challenges[challengeName].showHint();
            });
        });

        // 確認ボタン
        document.querySelectorAll('.check-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const challengeName = e.target.dataset.challenge;
                this.challenges[challengeName].checkAnswer();
            });
        });

        // 次の問題ボタン
        document.querySelectorAll('.next-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const challengeName = e.target.dataset.challenge;
                this.challenges[challengeName].nextChallenge();
            });
        });

        // 成果タブのボタン
        document.getElementById('share-twitter').addEventListener('click', () => {
            this.resultsManager.shareTwitter();
        });

        document.getElementById('download-image').addEventListener('click', () => {
            this.resultsManager.downloadImage();
        });

        document.getElementById('retry-all').addEventListener('click', () => {
            this.resetAllChallenges();
        });

        // モーダルの閉じるボタン
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
    }

    loadProgress() {
        // 各チャレンジの進捗をロード
        Object.keys(this.challenges).forEach(challengeName => {
            const progress = this.storage.getProgress(challengeName);
            if (progress && this.challenges[challengeName]) {
                this.challenges[challengeName].setProgress(progress);
            }
        });
    }

    resetAllChallenges() {
        if (confirm('すべての進捗をリセットしてもよろしいですか？')) {
            this.storage.clearAll();
            Object.values(this.challenges).forEach(challenge => {
                if (challenge) challenge.reset();
            });
            this.resultsManager.updateResults();
            this.showModal('すべての進捗をリセットしました。');
            this.switchTab('headline');
        }
    }

    showModal(message) {
        const modal = document.getElementById('message-modal');
        const modalMessage = document.getElementById('modal-message');
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('message-modal').style.display = 'none';
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', async () => {
    const app = new HiddenMessageChallenge();
    await app.init();
});

// グローバルに公開（デバッグ用）
window.HiddenMessageChallenge = HiddenMessageChallenge;