// main.js - メイン制御
import { HeadlineChallenge } from './challenges/headline.js';
import { RemoveCharChallenge } from './challenges/removeChar.js';
import { PositionChallenge } from './challenges/position.js';
import { StencilChallenge } from './challenges/stencil.js';
import { ResultsManager } from './results/score.js';
import { Storage } from './common/storage.js';
import { utils } from './common/utils.js';

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

        // ヘルプボタン
        document.getElementById('help-button').addEventListener('click', () => {
            this.showHelpModal();
        });

        // ヘルプモーダルの閉じるボタン
        document.querySelector('.help-modal-close').addEventListener('click', () => {
            this.closeHelpModal();
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
        utils.showModal(message);
    }

    closeModal() {
        utils.closeModal();
    }

    showHelpModal() {
        const helpModal = document.getElementById('help-modal');
        const helpContent = document.getElementById('help-content');
        
        // ヘルプコンテンツを生成
        helpContent.innerHTML = this.generateHelpContent();
        
        helpModal.style.display = 'block';
    }

    closeHelpModal() {
        const helpModal = document.getElementById('help-modal');
        helpModal.style.display = 'none';
    }

    generateHelpContent() {
        return `
            <h2>🔍 Hidden Message Challenge - 使い方ガイド</h2>
            
            <h3>🎯 このツールについて</h3>
            <p>「Hidden Message Challenge」は、分置式暗号（concealment cipher）に隠されたメッセージを見つける教育的なチャレンジツールです。4つの異なる暗号方式を通じて、暗号解読のスキルを身につけることができます。</p>
            
            <div class="challenge-type">
                <h4>📝 行頭読みチャレンジ (Level: ★)</h4>
                <p>各行の最初の文字を上から順に読むことで隠されたメッセージを発見する方式です。最も基本的な分置式暗号の一つです。</p>
            </div>
            
            <div class="challenge-type">
                <h4>🧩 除去文字チャレンジ (Level: ★★)</h4>
                <p>ヒントをもとに特定の文字を除去することで、隠されたメッセージが現れる方式です。「だじゃれヒント」が除去する文字を示しています。</p>
            </div>
            
            <div class="challenge-type">
                <h4>🎯 位置抽出チャレンジ (Level: ★★)</h4>
                <p>指定されたルール（例：「句読点の3文字後」）に従って、特定の位置の文字を抽出する方式です。パターン認識が重要になります。</p>
            </div>
            
            <div class="challenge-type">
                <h4>🎭 ステンシルチャレンジ (Level: ★★★)</h4>
                <p>ステンシル（穴空き型紙）を重ねて、見える部分の文字を読み取る方式です。移動や回転を駆使して正しい位置を見つけましょう。</p>
                <ul>
                    <li><strong>ステンシルを乗せる</strong>：型紙を表示します</li>
                    <li><strong>移動ボタン</strong>：ステンシルを細かく移動できます</li>
                    <li><strong>回転ボタン</strong>：ステンシルを90度ずつ回転します</li>
                    <li><strong>ステンシルを外す</strong>：型紙を非表示にします</li>
                </ul>
            </div>
            
            <h3>🎮 操作方法</h3>
            <ul>
                <li><strong>💡 ヒント</strong>：困った時は遠慮なくヒントボタンを押してください</li>
                <li><strong>✓ 確認</strong>：答えを入力したら確認ボタンで正解をチェック</li>
                <li><strong>→ 次の問題</strong>：正解すると自動的に次の問題に進みます</li>
                <li><strong>🏆 成果タブ</strong>：全体的な進捗とスコアを確認できます</li>
            </ul>
            
            <div class="tip">
                <strong>💡 コツ：</strong>分置式暗号は「隠す」ことが目的です。一見無意味に見える文章でも、ルールを理解すれば美しいメッセージが現れます。焦らずじっくり取り組んでみてください。
            </div>
            
            <h3>📊 スコアシステム</h3>
            <p>各チャレンジは5問ずつ用意されており、正解するとスコアが蓄積されます。全20問をクリアして、暗号解読マスターを目指しましょう！</p>
            
            <div class="tip">
                <strong>🔄 リセット機能：</strong>成果タブの「もう一度挑戦」ボタンで、すべての進捗をリセットして最初からやり直すことができます。
            </div>
        `;
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', async () => {
    const app = new HiddenMessageChallenge();
    await app.init();
});

// グローバルに公開（デバッグ用）
window.HiddenMessageChallenge = HiddenMessageChallenge;