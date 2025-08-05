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
        this.stencilVisible = false;
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
        // 初期位置を少しずらして手動調整を促す
        this.stencilPosition = { x: 1.5, y: -0.75 };
        this.rotation = 0;
        this.stencilVisible = false;
        
        // 入力欄をクリア
        document.getElementById('stencil-answer').value = '';
        
        // ボタンの初期状態を設定
        this.updateButtonState();
        
        // コントロールボタンの設定
        this.setupControls();
    }

    displayChallenge(challenge) {
        const container = document.querySelector('.stencil-container');
        container.innerHTML = '';
        
        // ベース暗号文グリッド（背景レイヤー）
        const baseGrid = document.createElement('div');
        baseGrid.className = 'cipher-grid';
        baseGrid.id = 'cipher-grid';
        baseGrid.style.position = 'absolute';
        baseGrid.style.top = '50%';
        baseGrid.style.left = '50%';
        baseGrid.style.transform = 'translate(-50%, -50%)';
        baseGrid.style.zIndex = '1';
        
        const baseTable = document.createElement('table');
        baseTable.style.borderCollapse = 'collapse';
        baseTable.style.fontSize = '1.2rem';
        baseTable.id = 'cipher-table';
        
        // 暗号文グリッドを作成
        challenge.grid.forEach((row, y) => {
            const tr = document.createElement('tr');
            row.forEach((char, x) => {
                const td = document.createElement('td');
                td.textContent = char;
                td.style.width = '44px';
                td.style.height = '44px';
                td.style.border = '1px solid #d1d5db';
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
                td.style.padding = '0';
                td.style.backgroundColor = '#f9fafb';
                td.dataset.x = x;
                td.dataset.y = y;
                tr.appendChild(td);
            });
            baseTable.appendChild(tr);
        });
        
        baseGrid.appendChild(baseTable);
        container.appendChild(baseGrid);
        
        // ステンシルオーバーレイ（前景レイヤー）
        const stencilOverlay = document.createElement('div');
        stencilOverlay.className = 'stencil-overlay';
        stencilOverlay.id = 'stencil-overlay';
        stencilOverlay.style.position = 'absolute';
        stencilOverlay.style.top = '50%';
        stencilOverlay.style.left = '50%';
        stencilOverlay.style.transformOrigin = 'center center';
        stencilOverlay.style.zIndex = '2';
        stencilOverlay.style.pointerEvents = 'none';
        stencilOverlay.style.display = 'none';
        
        const stencilTable = document.createElement('table');
        stencilTable.style.borderCollapse = 'collapse';
        stencilTable.id = 'stencil-table';
        
        // ステンシルグリッドを作成
        challenge.stencil.forEach((row, y) => {
            const tr = document.createElement('tr');
            row.forEach((cell, x) => {
                const td = document.createElement('td');
                td.style.width = '44px';
                td.style.height = '44px';
                td.style.border = 'none';
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
                td.style.padding = '0';
                td.dataset.x = x;
                td.dataset.y = y;
                
                if (cell === 1) {
                    // 穴（透明）
                    td.style.backgroundColor = 'transparent';
                } else {
                    // ステンシル本体（半透明の青）
                    td.style.backgroundColor = 'rgba(99, 102, 241, 0.7)';
                }
                
                tr.appendChild(td);
            });
            stencilTable.appendChild(tr);
        });
        
        stencilOverlay.appendChild(stencilTable);
        container.appendChild(stencilOverlay);
        
        // 初期状態ではステンシルを非表示
        this.stencilVisible = false;
    }

    // 新しい独立レイヤーシステム
    updateStencilDisplay() {
        const stencilOverlay = document.getElementById('stencil-overlay');
        if (!stencilOverlay) return;
        
        if (this.stencilVisible) {
            stencilOverlay.style.display = 'block';
            // ステンシルの位置と回転を更新（中央基準での移動）
            const offsetX = this.stencilPosition.x * 44; // セルサイズ44px
            const offsetY = this.stencilPosition.y * 44;
            const rotationDegrees = this.rotation * 90;
            stencilOverlay.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${rotationDegrees}deg)`;
        } else {
            stencilOverlay.style.display = 'none';
        }
    }

    // 簡素化された移動システム（transformで直接制御）

    setupControls() {
        // ステンシル表示/非表示ボタン
        const applyButton = document.getElementById('stencil-apply');
        const removeButton = document.getElementById('stencil-remove');
        
        // 既存のリスナーを削除して新しく設定
        const newApplyButton = applyButton.cloneNode(true);
        applyButton.parentNode.replaceChild(newApplyButton, applyButton);
        
        const newRemoveButton = removeButton.cloneNode(true);
        removeButton.parentNode.replaceChild(newRemoveButton, removeButton);
        
        document.getElementById('stencil-apply').addEventListener('click', () => this.applyStencil());
        document.getElementById('stencil-remove').addEventListener('click', () => this.removeStencil());
        
        // 移動・回転ボタン
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
        newMoveButtons[0].addEventListener('click', () => this.moveStencil(0, -0.25));
        newMoveButtons[1].addEventListener('click', () => this.moveStencil(0, 0.25));
        newMoveButtons[2].addEventListener('click', () => this.moveStencil(-0.25, 0));
        newMoveButtons[3].addEventListener('click', () => this.moveStencil(0.25, 0));
        
        document.querySelector('.stencil-rotate').addEventListener('click', () => this.rotateStencil());
    }

    applyStencil() {
        this.stencilVisible = true;
        // 初期位置を少しずらして表示
        this.stencilPosition = { x: 1.5, y: -0.75 };
        this.updateButtonState();
        this.updateStencilDisplay();
    }

    removeStencil() {
        this.stencilVisible = false;
        this.updateButtonState();
        this.updateStencilDisplay();
    }

    updateButtonState() {
        const applyButton = document.getElementById('stencil-apply');
        const removeButton = document.getElementById('stencil-remove');
        const moveControls = document.querySelector('.stencil-move-controls');
        
        if (this.stencilVisible) {
            applyButton.style.display = 'none';
            removeButton.style.display = 'inline-block';
            moveControls.style.display = 'block';
        } else {
            applyButton.style.display = 'inline-block';
            removeButton.style.display = 'none';
            moveControls.style.display = 'none';
        }
    }

    moveStencil(dx, dy) {
        this.stencilPosition.x += dx;
        this.stencilPosition.y += dy;
        this.updateStencilDisplay();
    }

    rotateStencil() {
        this.rotation = (this.rotation + 1) % 4;
        this.updateStencilDisplay();
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
            utils.showModal('型紙を正しい位置に調整してみてください。移動ボタンで細かく調整できます');
            this.stencilPosition = { x: 0, y: 0 };
            this.rotation = 0;
            this.updateStencilDisplay();
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
        document.getElementById('stencil-progress').innerHTML = progressDots;
        
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