// stencil.js - ステンシルチャレンジ

import { utils } from '../common/utils.js';
import { Storage } from '../common/storage.js';
import { dataLoader } from '../common/dataLoader.js';

export class StencilChallenge {
    constructor() {
        this.storage = new Storage();
        this.challenges = [];
        this.currentIndex = 0;
        this.completedProblems = [];
        this.hintLevel = 0;
        this.stencilPosition = { x: 0, y: 0 };
        this.rotation = 0;
        this.dataLoaded = false;
    }

    async loadProgress() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.stencil;
            this.dataLoaded = true;
        }
        
        this.currentIndex = this.storage.getCurrentIndex('stencil');
        this.completedProblems = this.storage.getCompletedProblems('stencil');
        this.updateProgressDisplay();
    }

    async loadChallenge() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.stencil;
            this.dataLoaded = true;
        }
        
        if (this.currentIndex >= this.challenges.length) {
            this.currentIndex = 0;
        }
        
        const challenge = this.challenges[this.currentIndex];
        this.displayChallenge(challenge);
        this.hintLevel = 0;
        this.stencilPosition = { x: 0, y: 0 };
        this.rotation = 0;
        
        // 入力欄をクリア
        document.getElementById('stencil-answer').value = '';
        
        // コントロールボタンの設定
        this.setupControls();
    }

    displayChallenge(challenge) {
        const container = document.querySelector('.stencil-container');
        container.innerHTML = '';
        
        // グリッドテキストを作成
        const textDiv = document.createElement('div');
        textDiv.className = 'stencil-text';
        textDiv.id = 'stencil-cipher';
        
        // グリッドを表示
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '1.2rem';
        table.style.margin = '0 auto';
        
        challenge.grid.forEach((row, y) => {
            const tr = document.createElement('tr');
            row.forEach((char, x) => {
                const td = document.createElement('td');
                td.textContent = char;
                td.style.padding = '8px 12px';
                td.style.border = '1px solid #e5e7eb';
                td.style.textAlign = 'center';
                td.dataset.x = x;
                td.dataset.y = y;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        
        textDiv.appendChild(table);
        container.appendChild(textDiv);
        
        // ステンシルオーバーレイを作成
        this.createStencilOverlay(challenge);
    }

    createStencilOverlay(challenge) {
        const container = document.querySelector('.stencil-container');
        const existingOverlay = document.getElementById('stencil-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'stencil-overlay';
        overlay.id = 'stencil-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.pointerEvents = 'none';
        
        // ステンシルグリッドを作成
        const stencilTable = document.createElement('table');
        stencilTable.style.borderCollapse = 'collapse';
        
        challenge.stencil.forEach((row, y) => {
            const tr = document.createElement('tr');
            row.forEach((isHole, x) => {
                const td = document.createElement('td');
                td.style.width = '44px';
                td.style.height = '40px';
                
                if (isHole) {
                    // 穴（透明）
                    td.style.backgroundColor = 'transparent';
                    td.style.border = '2px solid #6366f1';
                } else {
                    // 型紙（不透明）
                    td.style.backgroundColor = 'rgba(99, 102, 241, 0.9)';
                }
                
                tr.appendChild(td);
            });
            stencilTable.appendChild(tr);
        });
        
        overlay.appendChild(stencilTable);
        container.appendChild(overlay);
        
        // 見える文字を更新
        this.updateVisibleChars(challenge);
    }

    setupControls() {
        const moveButtons = document.querySelectorAll('.stencil-move');
        const rotateButton = document.querySelector('.stencil-rotate');
        
        // 既存のリスナーを削除
        moveButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        const newRotateButton = rotateButton.cloneNode(true);
        rotateButton.parentNode.replaceChild(newRotateButton, rotateButton);
        
        // 新しいリスナーを設定
        const newMoveButtons = document.querySelectorAll('.stencil-move');
        newMoveButtons[0].addEventListener('click', () => this.moveStencil(0, -1));
        newMoveButtons[1].addEventListener('click', () => this.moveStencil(0, 1));
        newMoveButtons[2].addEventListener('click', () => this.moveStencil(-1, 0));
        newMoveButtons[3].addEventListener('click', () => this.moveStencil(1, 0));
        
        document.querySelector('.stencil-rotate').addEventListener('click', () => this.rotateStencil());
    }

    moveStencil(dx, dy) {
        this.stencilPosition.x += dx;
        this.stencilPosition.y += dy;
        
        const overlay = document.getElementById('stencil-overlay');
        const currentTransform = overlay.style.transform;
        const rotation = this.rotation * 90;
        
        overlay.style.transform = `translate(calc(-50% + ${this.stencilPosition.x * 44}px), calc(-50% + ${this.stencilPosition.y * 40}px)) rotate(${rotation}deg)`;
        
        this.updateVisibleChars(this.challenges[this.currentIndex]);
    }

    rotateStencil() {
        this.rotation = (this.rotation + 1) % 4;
        
        const overlay = document.getElementById('stencil-overlay');
        const rotation = this.rotation * 90;
        
        overlay.style.transform = `translate(calc(-50% + ${this.stencilPosition.x * 44}px), calc(-50% + ${this.stencilPosition.y * 40}px)) rotate(${rotation}deg)`;
        
        this.updateVisibleChars(this.challenges[this.currentIndex]);
    }

    updateVisibleChars(challenge) {
        // 現在の位置で見える文字を計算
        const visibleChars = [];
        const stencil = challenge.stencil;
        
        for (let sy = 0; sy < stencil.length; sy++) {
            for (let sx = 0; sx < stencil[sy].length; sx++) {
                if (stencil[sy][sx] === 1) {
                    // 回転を考慮した実際の位置を計算
                    let actualX = sx + this.stencilPosition.x;
                    let actualY = sy + this.stencilPosition.y;
                    
                    // グリッド内の文字を取得
                    if (actualY >= 0 && actualY < challenge.grid.length &&
                        actualX >= 0 && actualX < challenge.grid[actualY].length) {
                        visibleChars.push({
                            char: challenge.grid[actualY][actualX],
                            x: actualX,
                            y: actualY
                        });
                    }
                }
            }
        }
        
        // テーブルのセルをハイライト
        const cells = document.querySelectorAll('.stencil-text td');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.fontWeight = 'normal';
        });
        
        visibleChars.forEach(vc => {
            const cell = document.querySelector(`.stencil-text td[data-x="${vc.x}"][data-y="${vc.y}"]`);
            if (cell) {
                cell.style.backgroundColor = '#fef3c7';
                cell.style.fontWeight = 'bold';
            }
        });
    }

    showHint() {
        const challenge = this.challenges[this.currentIndex];
        
        if (this.hintLevel === 0) {
            utils.showModal(challenge.hint);
            this.hintLevel = 1;
        } else if (this.hintLevel === 1) {
            utils.showModal('型紙を移動させたり回転させたりして、意味のある言葉を探してください');
            this.hintLevel = 2;
        } else {
            // 正解位置のヒント
            utils.showModal('型紙を初期位置のまま使ってみてください');
            this.stencilPosition = { x: 0, y: 0 };
            this.rotation = 0;
            this.moveStencil(0, 0);
        }
    }

    checkAnswer() {
        const userAnswer = document.getElementById('stencil-answer').value;
        const challenge = this.challenges[this.currentIndex];
        
        if (utils.compareAnswer(userAnswer, challenge.answer)) {
            // 正解
            utils.showModal('正解です！見事に解読できました！');
            
            // 完了済みに追加
            if (!this.completedProblems.includes(challenge.id)) {
                this.completedProblems.push(challenge.id);
                this.storage.saveCompletedProblems('stencil', this.completedProblems);
            }
            
            // スコアを更新
            this.updateScore();
            
            // 次の問題へ自動的に進む
            setTimeout(() => {
                this.nextChallenge();
            }, 1500);
        } else {
            // 不正解
            utils.showModal('型紙の位置を調整して、もう一度試してみましょう');
        }
    }

    nextChallenge() {
        this.currentIndex = (this.currentIndex + 1) % this.challenges.length;
        this.storage.saveCurrentIndex('stencil', this.currentIndex);
        this.loadChallenge();
    }

    updateScore() {
        const score = {
            completed: this.completedProblems.length,
            total: this.challenges.length
        };
        this.storage.saveScore('stencil', score);
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const progressDots = utils.createProgressDots(
            this.completedProblems.length,
            this.challenges.length
        );
        document.getElementById('stencil-progress').textContent = progressDots;
        
        const progressCount = document.querySelector('#stencil .progress-count');
        progressCount.textContent = `${this.completedProblems.length}/${this.challenges.length}`;
    }

    reset() {
        this.currentIndex = 0;
        this.completedProblems = [];
        this.storage.clearChallenge('stencil');
        this.updateProgressDisplay();
        this.loadChallenge();
    }

    setProgress(progress) {
        if (progress.currentIndex !== undefined) {
            this.currentIndex = progress.currentIndex;
        }
        if (progress.completedProblems) {
            this.completedProblems = progress.completedProblems;
        }
        this.updateProgressDisplay();
    }
}