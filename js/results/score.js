// score.js - スコア計算・管理

import { Storage } from '../common/storage.js';
import { ResultChart } from './chart.js';
import { ShareManager } from './share.js';
import { utils } from '../common/utils.js';

export class ResultsManager {
    constructor() {
        this.storage = new Storage();
        this.chart = null;
        this.shareManager = new ShareManager();
        this.challengeNames = ['headline', 'removeChar', 'position', 'stencil'];
        this.challengeLabels = {
            headline: '行頭読み',
            removeChar: '除去文字',
            position: '位置抽出',
            stencil: 'ステンシル'
        };
    }

    updateResults() {
        const scores = this.storage.getAllScores();
        
        // 各チャレンジのスコアを更新
        this.updateScoreDisplay(scores);
        
        // 総合スコアを計算
        const totalScore = this.calculateTotalScore(scores);
        
        // ランクを判定
        const rank = this.calculateRank(totalScore.percentage);
        
        // 表示を更新
        this.updateTotalScoreDisplay(totalScore);
        this.updateRankDisplay(rank);
        
        // レーダーチャートを描画
        this.drawRadarChart(scores);
    }

    updateScoreDisplay(scores) {
        this.challengeNames.forEach(challengeName => {
            const score = scores[challengeName];
            const scoreElement = document.getElementById(`${challengeName}-score`);
            const percentElement = scoreElement.nextElementSibling;
            
            // 進捗ドットを更新（スタイリッシュ版）
            const progressDots = utils.createProgressDots(score.completed, score.total);
            scoreElement.innerHTML = progressDots;
            
            // パーセンテージを更新
            const percentage = score.total > 0 ? Math.round((score.completed / score.total) * 100) : 0;
            percentElement.textContent = `${percentage}%`;
        });
    }

    calculateTotalScore(scores) {
        let totalCompleted = 0;
        let totalProblems = 0;
        
        Object.values(scores).forEach(score => {
            totalCompleted += score.completed;
            totalProblems += score.total;
        });
        
        const percentage = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 100) : 0;
        
        return {
            completed: totalCompleted,
            total: totalProblems,
            percentage: percentage
        };
    }

    calculateRank(percentage) {
        if (percentage >= 95) return { rank: 'S', title: '暗号解読マスター' };
        if (percentage >= 80) return { rank: 'A', title: '暗号解読上級者' };
        if (percentage >= 60) return { rank: 'B', title: '暗号解読見習い' };
        if (percentage >= 40) return { rank: 'C', title: '暗号初心者' };
        return { rank: 'D', title: 'これから頑張ろう！' };
    }

    updateTotalScoreDisplay(totalScore) {
        const totalScoreElement = document.getElementById('total-score');
        totalScoreElement.textContent = `${totalScore.completed}/${totalScore.total} (${totalScore.percentage}%)`;
    }

    updateRankDisplay(rankInfo) {
        const rankElement = document.getElementById('rank');
        const messageElement = document.getElementById('rank-message');
        
        rankElement.textContent = rankInfo.rank;
        messageElement.textContent = `あなたは「${rankInfo.title}」です！`;
        
        // ランクに応じて色を変更
        const rankColors = {
            'S': '#fbbf24',  // 金色
            'A': '#ef4444',  // 赤
            'B': '#3b82f6',  // 青
            'C': '#10b981',  // 緑
            'D': '#6b7280'   // グレー
        };
        
        rankElement.style.color = rankColors[rankInfo.rank] || '#6366f1';
    }

    drawRadarChart(scores) {
        if (!this.chart) {
            this.chart = new ResultChart();
        }
        
        const data = this.challengeNames.map(name => {
            const score = scores[name];
            return score.total > 0 ? (score.completed / score.total) * 100 : 0;
        });
        
        const labels = this.challengeNames.map(name => this.challengeLabels[name]);
        
        this.chart.draw(data, labels);
    }

    shareTwitter() {
        const scores = this.storage.getAllScores();
        const totalScore = this.calculateTotalScore(scores);
        const rank = this.calculateRank(totalScore.percentage);
        
        const results = {
            scores: scores,
            totalScore: totalScore,
            rank: rank,
            challengeLabels: this.challengeLabels
        };
        
        this.shareManager.shareToTwitter(results);
    }

    downloadImage() {
        const canvas = document.getElementById('radar-chart');
        const scores = this.storage.getAllScores();
        const totalScore = this.calculateTotalScore(scores);
        const rank = this.calculateRank(totalScore.percentage);
        
        const results = {
            scores: scores,
            totalScore: totalScore,
            rank: rank,
            challengeLabels: this.challengeLabels
        };
        
        this.shareManager.downloadResultImage(canvas, results);
    }
}