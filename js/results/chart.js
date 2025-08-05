// chart.js - レーダーチャート描画

export class ResultChart {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.centerX = 150;
        this.centerY = 150;
        this.radius = 100;
        this.levels = 5;
    }

    draw(data, labels) {
        this.canvas = document.getElementById('radar-chart');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const angleStep = (Math.PI * 2) / data.length;
        
        // 背景グリッドを描画
        this.drawGrid(data.length, angleStep);
        
        // ラベルを描画
        this.drawLabels(labels, angleStep);
        
        // データを描画
        this.drawData(data, angleStep);
    }

    drawGrid(dataCount, angleStep) {
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        
        // 同心円を描画
        for (let level = 1; level <= this.levels; level++) {
            const levelRadius = (this.radius / this.levels) * level;
            
            this.ctx.beginPath();
            for (let i = 0; i <= dataCount; i++) {
                const angle = angleStep * i - Math.PI / 2;
                const x = this.centerX + Math.cos(angle) * levelRadius;
                const y = this.centerY + Math.sin(angle) * levelRadius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
            
            // パーセンテージラベル
            if (level % 2 === 0) {
                const percentage = (level / this.levels) * 100;
                this.ctx.fillStyle = '#9ca3af';
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText(`${percentage}%`, this.centerX + 5, this.centerY - levelRadius + 5);
            }
        }
        
        // 軸線を描画
        for (let i = 0; i < dataCount; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const x = this.centerX + Math.cos(angle) * this.radius;
            const y = this.centerY + Math.sin(angle) * this.radius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }

    drawLabels(labels, angleStep) {
        this.ctx.fillStyle = '#4b5563';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        labels.forEach((label, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const labelRadius = this.radius + 25;
            const x = this.centerX + Math.cos(angle) * labelRadius;
            const y = this.centerY + Math.sin(angle) * labelRadius;
            
            // ラベルの位置を調整
            if (Math.abs(x - this.centerX) < 10) {
                // 上下の位置
                this.ctx.textAlign = 'center';
            } else if (x < this.centerX) {
                // 左側
                this.ctx.textAlign = 'right';
            } else {
                // 右側
                this.ctx.textAlign = 'left';
            }
            
            this.ctx.fillText(label, x, y);
        });
    }

    drawData(data, angleStep) {
        // データポリゴンを描画
        this.ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        this.ctx.strokeStyle = 'rgb(99, 102, 241)';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        data.forEach((value, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const dataRadius = (this.radius * value) / 100;
            const x = this.centerX + Math.cos(angle) * dataRadius;
            const y = this.centerY + Math.sin(angle) * dataRadius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // データポイントを描画
        this.ctx.fillStyle = 'rgb(79, 70, 229)';
        data.forEach((value, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const dataRadius = (this.radius * value) / 100;
            const x = this.centerX + Math.cos(angle) * dataRadius;
            const y = this.centerY + Math.sin(angle) * dataRadius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}