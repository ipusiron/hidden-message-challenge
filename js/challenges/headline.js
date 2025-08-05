// headline.js - 行頭読みチャレンジ

import { utils } from '../common/utils.js';
import { Storage } from '../common/storage.js';
import { dataLoader } from '../common/dataLoader.js';

export class HeadlineChallenge {
    constructor() {
        this.storage = new Storage();
        this.challenges = [];
        this.currentIndex = 0;
        this.completedProblems = [];
        this.hintLevel = 0;
        this.dataLoaded = false;
    }

    async loadProgress() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.headline;
            this.dataLoaded = true;
        }
        
        this.currentIndex = this.storage.getCurrentIndex('headline');
        this.completedProblems = this.storage.getCompletedProblems('headline');
        this.updateProgressDisplay();
    }

    async loadChallenge() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.headline;
            this.dataLoaded = true;
        }
        
        if (this.currentIndex >= this.challenges.length) {
            this.currentIndex = 0;
        }
        
        const challenge = this.challenges[this.currentIndex];
        this.displayChallenge(challenge);
        this.hintLevel = 0;
        
        // 入力欄をクリア
        document.getElementById('headline-answer').value = '';
    }

    displayChallenge(challenge) {
        const cipherDiv = document.getElementById('headline-cipher');
        const lines = challenge.text.split('\n');
        
        let html = '';
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const firstChar = line.charAt(0);
            const restOfLine = line.substring(1);
            
            html += `<div class="cipher-line">
                <span class="line-number">${lineNumber}</span>
                <span class="first-char-initial">${firstChar}</span>${restOfLine}
            </div>`;
        });
        
        cipherDiv.innerHTML = html;
    }

    showHint() {
        const challenge = this.challenges[this.currentIndex];
        
        if (this.hintLevel === 0) {
            utils.showModal(challenge.hint);
            this.hintLevel = 1;
        } else if (this.hintLevel === 1) {
            // 頭文字を強調表示
            const firstChars = document.querySelectorAll('.first-char-initial');
            firstChars.forEach(char => {
                char.style.backgroundColor = '#fef3c7';
                char.style.color = '#ef4444';
                char.style.fontWeight = 'bold';
                char.style.padding = '2px 4px';
                char.style.borderRadius = '3px';
            });
            utils.showModal('黄色でハイライトされた文字を上から順に読んでください');
            this.hintLevel = 2;
        } else {
            // 答えの一部を表示
            const answer = challenge.answer;
            const partialAnswer = answer.substring(0, Math.ceil(answer.length / 2)) + '...';
            utils.showModal(`答えの前半: ${partialAnswer}`);
        }
    }

    checkAnswer() {
        const userAnswer = document.getElementById('headline-answer').value;
        const challenge = this.challenges[this.currentIndex];
        
        if (utils.compareAnswer(userAnswer, challenge.answer)) {
            // 正解
            utils.showModal('正解です！素晴らしい！');
            
            // 完了済みに追加
            if (!this.completedProblems.includes(challenge.id)) {
                this.completedProblems.push(challenge.id);
                this.storage.saveCompletedProblems('headline', this.completedProblems);
            }
            
            // スコアを更新
            this.updateScore();
            
            // 次の問題へ自動的に進む（1.5秒後）
            setTimeout(() => {
                this.nextChallenge();
            }, 1500);
        } else {
            // 不正解
            utils.showModal('残念！もう一度考えてみましょう');
        }
    }

    nextChallenge() {
        this.currentIndex = (this.currentIndex + 1) % this.challenges.length;
        this.storage.saveCurrentIndex('headline', this.currentIndex);
        this.loadChallenge();
    }

    updateScore() {
        const score = {
            completed: this.completedProblems.length,
            total: this.challenges.length
        };
        this.storage.saveScore('headline', score);
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const progressDots = utils.createProgressDots(
            this.completedProblems.length,
            this.challenges.length
        );
        document.getElementById('headline-progress').innerHTML = progressDots;
        
        const progressCount = document.querySelector('#headline .progress-count');
        progressCount.textContent = `${this.completedProblems.length}/${this.challenges.length}`;
    }

    reset() {
        this.currentIndex = 0;
        this.completedProblems = [];
        this.storage.clearChallenge('headline');
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