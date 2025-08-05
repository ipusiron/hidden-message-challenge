// share.js - 共有機能

export class ShareManager {
    constructor() {
        this.twitterBaseUrl = 'https://twitter.com/intent/tweet';
    }

    shareToTwitter(results) {
        const { scores, totalScore, rank, challengeLabels } = results;
        
        // ツイートテキストを生成
        let text = `🔍 Hidden Message Challengeで総合ランク${rank.rank}を獲得！\n\n`;
        
        Object.keys(scores).forEach(key => {
            const score = scores[key];
            const percentage = score.total > 0 ? Math.round((score.completed / score.total) * 100) : 0;
            text += `${challengeLabels[key]}: ${percentage}%\n`;
        });
        
        text += `\n総合: ${totalScore.percentage}%\n`;
        text += `#分置式暗号 #HiddenMessageChallenge`;
        
        // URLを生成
        const url = 'https://ipusiron.github.io/hidden-message-challenge/';
        
        // Twitterシェア用URLを構築
        const params = new URLSearchParams({
            text: text,
            url: url
        });
        
        // 新しいウィンドウで開く
        window.open(`${this.twitterBaseUrl}?${params.toString()}`, '_blank', 'width=550,height=420');
    }

    downloadResultImage(canvas, results) {
        // 結果画像を生成するための新しいキャンバスを作成
        const imageCanvas = document.createElement('canvas');
        imageCanvas.width = 1200;
        imageCanvas.height = 630;
        const ctx = imageCanvas.getContext('2d');
        
        // 背景を白で塗りつぶし
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
        
        // タイトル
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Hidden Message Challenge', imageCanvas.width / 2, 80);
        
        // サブタイトル
        ctx.fillStyle = '#4b5563';
        ctx.font = '24px sans-serif';
        ctx.fillText('分置式暗号文解読チャレンジ 成果', imageCanvas.width / 2, 130);
        
        // レーダーチャートを描画
        if (canvas) {
            ctx.drawImage(canvas, 100, 180, 300, 300);
        }
        
        // スコア情報を描画
        const { scores, totalScore, rank, challengeLabels } = results;
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('各チャレンジ結果', 500, 220);
        
        ctx.font = '20px sans-serif';
        let yOffset = 260;
        Object.keys(scores).forEach(key => {
            const score = scores[key];
            const percentage = score.total > 0 ? Math.round((score.completed / score.total) * 100) : 0;
            
            ctx.fillStyle = '#4b5563';
            ctx.fillText(`${challengeLabels[key]}:`, 500, yOffset);
            
            // 進捗バー
            const barWidth = 200;
            const barHeight = 20;
            const barX = 650;
            const barY = yOffset - 15;
            
            // バーの背景
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // バーの進捗
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(barX, barY, barWidth * (percentage / 100), barHeight);
            
            // パーセンテージテキスト
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(`${percentage}%`, barX + barWidth + 10, yOffset);
            
            yOffset += 40;
        });
        
        // 総合スコア
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`総合スコア: ${totalScore.percentage}%`, 500, yOffset + 20);
        
        // ランク（下部中央に配置）
        const rankColors = {
            'S': '#fbbf24',
            'A': '#ef4444',
            'B': '#3b82f6',
            'C': '#10b981',
            'D': '#6b7280'
        };
        
        ctx.fillStyle = rankColors[rank.rank] || '#6366f1';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`ランク ${rank.rank}`, imageCanvas.width / 2, 520);
        
        ctx.fillStyle = '#4b5563';
        ctx.font = '28px sans-serif';
        ctx.fillText(rank.title, imageCanvas.width / 2, 560);
        
        // フッター
        ctx.fillStyle = '#9ca3af';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ipusiron.github.io/hidden-message-challenge', imageCanvas.width / 2, 590);
        
        // 画像をダウンロード
        imageCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hidden-message-challenge-result-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    copyUrl() {
        const url = 'https://ipusiron.github.io/hidden-message-challenge/';
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                alert('URLをコピーしました！');
            }).catch(() => {
                this.fallbackCopy(url);
            });
        } else {
            this.fallbackCopy(url);
        }
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('URLをコピーしました！');
    }
}