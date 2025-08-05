// removeChar.js - 除去文字チャレンジ

import { utils } from '../common/utils.js';
import { Storage } from '../common/storage.js';
import { dataLoader } from '../common/dataLoader.js';

export class RemoveCharChallenge {
    constructor() {
        this.storage = new Storage();
        this.challenges = [];
        this.currentIndex = 0;
        this.completedProblems = [];
        this.incorrectProblems = [];
        this.hintLevel = 0;
        this.dataLoaded = false;
    }

    async loadProgress() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.removeChar;
            this.dataLoaded = true;
        }
        
        this.currentIndex = this.storage.getCurrentIndex('removeChar');
        this.completedProblems = this.storage.getCompletedProblems('removeChar');
        this.incorrectProblems = this.storage.getIncorrectProblems('removeChar');
        this.updateProgressDisplay();
    }

    async loadChallenge() {
        if (!this.dataLoaded) {
            const challengeData = await dataLoader.loadChallengeData();
            this.challenges = challengeData.removeChar;
            this.dataLoaded = true;
        }
        
        if (this.currentIndex >= this.challenges.length) {
            this.currentIndex = 0;
        }
        
        const challenge = this.challenges[this.currentIndex];
        this.displayChallenge(challenge);
        this.hintLevel = 0;
        
        // 進捗表示を更新（クリックリスナーも設定）
        this.updateProgressDisplay();
        
        // 入力欄をクリア
        document.getElementById('removeChar-answer').value = '';
        document.getElementById('remove-char-1').value = '';
        document.getElementById('remove-char-2').value = '';
        document.getElementById('remove-char-3').value = '';
        document.getElementById('remove-char-4').value = '';
        
        // プレビューエリアをクリア
        const removeSection = document.querySelector('#removeChar .answer-section');
        const existingPreview = removeSection.querySelector('.decrypted-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // 入力欄のイベントリスナーを設定
        this.setupInputListeners();
    }

    displayChallenge(challenge) {
        // ヒント表示
        const hintDiv = document.getElementById('removeChar-hint');
        hintDiv.innerHTML = `<span style="font-size: 1.5rem;">${challenge.hint}</span>`;
        
        // 暗号文表示（初期状態、ハイライトなし）
        const cipherDiv = document.getElementById('removeChar-cipher');
        this.originalCipher = challenge.cipher;
        cipherDiv.innerHTML = this.createCipherHTML(challenge.cipher, []);
    }

    createCipherHTML(cipher, removeChars) {
        if (removeChars.length === 0) {
            return cipher;
        }
        
        let html = '';
        for (let i = 0; i < cipher.length; i++) {
            const char = cipher[i];
            if (removeChars.includes(char)) {
                html += `<span class="remove-char-highlight">${char}</span>`;
            } else {
                html += char;
            }
        }
        return html;
    }

    setupInputListeners() {
        const inputs = [
            document.getElementById('remove-char-1'),
            document.getElementById('remove-char-2'),
            document.getElementById('remove-char-3'),
            document.getElementById('remove-char-4')
        ];
        
        inputs.forEach(input => {
            // 既存のリスナーを削除
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        });
        
        // 新しいリスナーを設定
        const newInputs = [
            document.getElementById('remove-char-1'),
            document.getElementById('remove-char-2'),
            document.getElementById('remove-char-3'),
            document.getElementById('remove-char-4')
        ];
        
        newInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateCipherHighlight();
            });
        });
    }

    updateCipherHighlight() {
        const removeChars = [
            document.getElementById('remove-char-1').value,
            document.getElementById('remove-char-2').value,
            document.getElementById('remove-char-3').value,
            document.getElementById('remove-char-4').value
        ].filter(char => char !== '');
        
        const cipherDiv = document.getElementById('removeChar-cipher');
        cipherDiv.innerHTML = this.createCipherHTML(this.originalCipher, removeChars);
        
        // プレビューも更新
        this.updatePreview();
    }

    updatePreview() {
        const removeChar1 = document.getElementById('remove-char-1').value;
        const removeChar2 = document.getElementById('remove-char-2').value;
        const removeChar3 = document.getElementById('remove-char-3').value;
        const removeChar4 = document.getElementById('remove-char-4').value;
        
        let decrypted = this.originalCipher;
        if (removeChar1) {
            decrypted = decrypted.split(removeChar1).join('');
        }
        if (removeChar2) {
            decrypted = decrypted.split(removeChar2).join('');
        }
        if (removeChar3) {
            decrypted = decrypted.split(removeChar3).join('');
        }
        if (removeChar4) {
            decrypted = decrypted.split(removeChar4).join('');
        }
        
        // プレビュー表示
        const removeSection = document.querySelector('#removeChar .answer-section');
        if (!removeSection.querySelector('.decrypted-preview')) {
            const preview = document.createElement('div');
            preview.className = 'decrypted-preview';
            preview.style.marginTop = '10px';
            preview.style.padding = '10px';
            preview.style.backgroundColor = '#f0f9ff';
            preview.style.borderRadius = '4px';
            removeSection.insertBefore(preview, removeSection.querySelector('label[for="removeChar-answer"]'));
        }
        
        const previewDiv = removeSection.querySelector('.decrypted-preview');
        if (removeChar1 || removeChar2 || removeChar3) {
            previewDiv.textContent = `除去後: ${decrypted}`;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    }

    showHint() {
        const challenge = this.challenges[this.currentIndex];
        
        if (this.hintLevel === 0) {
            utils.showModal('ヒントの言葉から、除去する文字を推測してみましょう');
            this.hintLevel = 1;
        } else if (this.hintLevel === 1) {
            // 除去する文字の一つを表示
            const firstChar = challenge.removeChars[0];
            utils.showModal(`除去する文字の一つは「${firstChar}」です`);
            document.getElementById('remove-char-1').value = firstChar;
            this.hintLevel = 2;
        } else {
            // 除去後の文字列の一部を表示
            const preview = this.getPreviewText(challenge, 10);
            utils.showModal(`除去後の最初の部分: ${preview}...`);
        }
    }

    getPreviewText(challenge, length) {
        let result = challenge.cipher;
        challenge.removeChars.forEach(char => {
            result = result.split(char).join('');
        });
        return result.substring(0, length);
    }

    checkAnswer() {
        const userAnswer = document.getElementById('removeChar-answer').value;
        const challenge = this.challenges[this.currentIndex];
        
        // 除去文字を取得
        const removeChar1 = document.getElementById('remove-char-1').value;
        const removeChar2 = document.getElementById('remove-char-2').value;
        const removeChar3 = document.getElementById('remove-char-3').value;
        const removeChar4 = document.getElementById('remove-char-4').value;
        
        // 暗号文から文字を除去
        let decrypted = this.originalCipher;
        if (removeChar1) {
            decrypted = decrypted.split(removeChar1).join('');
        }
        if (removeChar2) {
            decrypted = decrypted.split(removeChar2).join('');
        }
        if (removeChar3) {
            decrypted = decrypted.split(removeChar3).join('');
        }
        if (removeChar4) {
            decrypted = decrypted.split(removeChar4).join('');
        }
        
        if (utils.compareAnswer(userAnswer, challenge.answer) || 
            utils.compareAnswer(decrypted, challenge.answer)) {
            // 正解
            utils.showModal('正解です！よくできました！');
            
            // 完了済みに追加
            if (!this.completedProblems.includes(this.currentIndex)) {
                this.completedProblems.push(this.currentIndex);
                this.storage.saveCompletedProblems('removeChar', this.completedProblems);
            }
            
            // スコアを更新
            this.updateScore();
            
            // 次の問題へ自動的に進む
            setTimeout(() => {
                this.nextChallenge();
            }, 1500);
        } else {
            // 不正解として記録
            if (!this.incorrectProblems.includes(this.currentIndex)) {
                this.incorrectProblems.push(this.currentIndex);
                this.storage.saveIncorrectProblems('removeChar', this.incorrectProblems);
                this.updateProgressDisplay();
            }
            utils.showModal('もう一度考えてみましょう。除去する文字は合っていますか？');
        }
    }

    nextChallenge() {
        this.currentIndex = (this.currentIndex + 1) % this.challenges.length;
        this.storage.saveCurrentIndex('removeChar', this.currentIndex);
        this.loadChallenge();
    }

    updateScore() {
        const score = {
            completed: this.completedProblems.length,
            total: this.challenges.length
        };
        this.storage.saveScore('removeChar', score);
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const progressDots = utils.createProgressDots(
            this.completedProblems,  // 配列を直接渡す
            this.challenges.length,
            'removeChar',
            this.currentIndex,
            this.incorrectProblems
        );
        document.getElementById('removeChar-progress').innerHTML = progressDots;
        
        const progressCount = document.querySelector('#removeChar .progress-count');
        progressCount.textContent = `${this.completedProblems.length}/${this.challenges.length}`;
        
        // 現在の問題番号を更新
        const currentIndicator = document.getElementById('removeChar-current');
        currentIndicator.textContent = `問題${this.currentIndex + 1}`;
        
        // Setup click listeners for progress dots
        this.setupProgressDotListeners();
    }

    setupProgressDotListeners() {
        const dots = document.querySelectorAll('#removeChar-progress .progress-dot.clickable');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.jumpToProblem(index);
            });
        });
    }

    jumpToProblem(index) {
        if (index >= 0 && index < this.challenges.length) {
            this.currentIndex = index;
            this.storage.saveCurrentIndex('removeChar', this.currentIndex);
            this.loadChallenge();
        }
    }

    reset() {
        this.currentIndex = 0;
        this.completedProblems = [];
        this.incorrectProblems = [];
        this.storage.clearChallenge('removeChar');
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