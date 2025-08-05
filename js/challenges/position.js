// position.js - 位置抽出チャレンジ

import { utils } from '../common/utils.js';
import { Storage } from '../common/storage.js';
import { dataLoader } from '../common/dataLoader.js';

export class PositionChallenge {
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
            this.challenges = challengeData.position;
            this.dataLoaded = true;
        }
        
        this.currentIndex = this.storage.getCurrentIndex('position');
        this.completedProblems = this.storage.getCompletedProblems('position');
        this.updateProgressDisplay();
    }

    async loadChallenge() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.position;
            this.dataLoaded = true;
        }
        
        if (this.currentIndex >= this.challenges.length) {
            this.currentIndex = 0;
        }
        
        const challenge = this.challenges[this.currentIndex];
        this.displayChallenge(challenge);
        this.hintLevel = 0;
        
        // 入力欄をクリア
        document.getElementById('position-answer').value = '';
    }

    displayChallenge(challenge) {
        // ルール表示
        const ruleDiv = document.getElementById('position-rule');
        ruleDiv.textContent = `ルール: ${challenge.rule}`;
        
        // 暗号文表示
        const cipherDiv = document.getElementById('position-cipher');
        cipherDiv.textContent = challenge.text;
    }

    showHint() {
        const challenge = this.challenges[this.currentIndex];
        
        if (this.hintLevel === 0) {
            utils.showModal(challenge.hint);
            this.hintLevel = 1;
        } else if (this.hintLevel === 1) {
            // 対象位置をハイライト
            this.highlightPositions(challenge);
            utils.showModal('黄色でハイライトされた文字を順番に読んでください');
            this.hintLevel = 2;
        } else {
            // 答えの一部を表示
            const answer = challenge.answer;
            const partialAnswer = answer.substring(0, Math.ceil(answer.length / 3)) + '...';
            utils.showModal(`答えの最初の部分: ${partialAnswer}`);
        }
    }

    highlightPositions(challenge) {
        const cipherDiv = document.getElementById('position-cipher');
        const text = challenge.text;
        let highlightedText = '';
        
        if (challenge.rule.includes('句読点の3文字後')) {
            let index = 0;
            while (index < text.length) {
                const char = text[index];
                if ((char === '、' || char === '。') && index + 3 < text.length) {
                    highlightedText += char + text.substring(index + 1, index + 3);
                    highlightedText += `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${text[index + 3]}</span>`;
                    index += 4;
                } else {
                    highlightedText += char;
                    index++;
                }
            }
        } else if (challenge.rule.includes('句読点の2文字後')) {
            let index = 0;
            while (index < text.length) {
                const char = text[index];
                if ((char === '、' || char === '。') && index + 2 < text.length) {
                    highlightedText += char + text[index + 1];
                    highlightedText += `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${text[index + 2]}</span>`;
                    index += 3;
                } else {
                    highlightedText += char;
                    index++;
                }
            }
        } else if (challenge.rule.includes('。の1文字前')) {
            let index = 0;
            while (index < text.length) {
                const char = text[index];
                if (char === '。' && index > 0) {
                    highlightedText = highlightedText.slice(0, -1);
                    highlightedText += `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${text[index - 1]}</span>`;
                    highlightedText += char;
                } else {
                    highlightedText += char;
                }
                index++;
            }
        } else if (challenge.rule.includes('、の1文字前')) {
            let index = 0;
            while (index < text.length) {
                const char = text[index];
                if (char === '、' && index > 0) {
                    highlightedText = highlightedText.slice(0, -1);
                    highlightedText += `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${text[index - 1]}</span>`;
                    highlightedText += char;
                } else {
                    highlightedText += char;
                }
                index++;
            }
        } else if (challenge.rule.includes('数字の2文字後')) {
            let index = 0;
            while (index < text.length) {
                const char = text[index];
                if (/\d/.test(char) && index + 2 < text.length) {
                    highlightedText += char + text[index + 1];
                    highlightedText += `<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px;">${text[index + 2]}</span>`;
                    index += 3;
                } else {
                    highlightedText += char;
                    index++;
                }
            }
        }
        
        cipherDiv.innerHTML = highlightedText;
    }

    checkAnswer() {
        const userAnswer = document.getElementById('position-answer').value;
        const challenge = this.challenges[this.currentIndex];
        
        if (utils.compareAnswer(userAnswer, challenge.answer)) {
            // 正解
            utils.showModal('正解です！素晴らしい観察力です！');
            
            // 完了済みに追加
            if (!this.completedProblems.includes(challenge.id)) {
                this.completedProblems.push(challenge.id);
                this.storage.saveCompletedProblems('position', this.completedProblems);
            }
            
            // スコアを更新
            this.updateScore();
            
            // 次の問題へ自動的に進む
            setTimeout(() => {
                this.nextChallenge();
            }, 1500);
        } else {
            // 不正解
            utils.showModal('もう一度ルールを確認してみましょう');
        }
    }

    nextChallenge() {
        this.currentIndex = (this.currentIndex + 1) % this.challenges.length;
        this.storage.saveCurrentIndex('position', this.currentIndex);
        this.loadChallenge();
    }

    updateScore() {
        const score = {
            completed: this.completedProblems.length,
            total: this.challenges.length
        };
        this.storage.saveScore('position', score);
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const progressDots = utils.createProgressDots(
            this.completedProblems.length,
            this.challenges.length
        );
        document.getElementById('position-progress').innerHTML = progressDots;
        
        const progressCount = document.querySelector('#position .progress-count');
        progressCount.textContent = `${this.completedProblems.length}/${this.challenges.length}`;
    }

    reset() {
        this.currentIndex = 0;
        this.completedProblems = [];
        this.storage.clearChallenge('position');
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