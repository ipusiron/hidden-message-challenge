// dataLoader.js - チャレンジデータの動的読み込み

export class DataLoader {
    constructor() {
        this.challengeData = null;
        this.loadPromise = null;
    }

    async loadChallengeData() {
        if (this.challengeData) {
            return this.challengeData;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._fetchData();
        this.challengeData = await this.loadPromise;
        return this.challengeData;
    }

    async _fetchData() {
        try {
            const response = await fetch('./js/data/challenges.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load challenge data:', error);
            // フォールバック: 埋め込みデータを返す
            return this._getFallbackData();
        }
    }

    _getFallbackData() {
        return {
            "headline": [
                {
                    "id": "h1",
                    "text": "今日は晴れていて気持ちがいい\n日本の四季は美しいと思います\n本当に素晴らしい一日でした\n大切な思い出になりました\n好きな場所で過ごせて幸せです",
                    "answer": "きょうにほんだいすき",
                    "hint": "各行の最初の文字を上から順に読んでみましょう"
                },
                {
                    "id": "h2", 
                    "text": "桜の花が咲く季節になりました\nはるかに美しい景色が広がります\n楽しい時間を過ごしましょう\n死ぬまでに一度は見たい景色です\nいつまでも心に残る思い出です",
                    "answer": "さくらはたのしい",
                    "hint": "春の代表的な花に関するメッセージが隠れています"
                }
            ],
            "removeChar": [
                {
                    "id": "r1",
                    "cipher": "こごんごにむちむはごよごろむしむいご天ご気",
                    "hint": "🧽「けしごむ」",
                    "removeChars": ["ご", "む"],
                    "answer": "こんにちはよろしいてんき"
                }
            ],
            "position": [
                {
                    "id": "p1",
                    "text": "今日は、明日本を読みました。楽園のような場所で、静しかに過ごしました。大いに満足です。好ましい結果でした。",
                    "rule": "句読点の3文字後を読め",
                    "answer": "にほんえんかにだいすき",
                    "hint": "「、」と「。」の3文字後の文字を順番に読んでください"
                }
            ],
            "stencil": [
                {
                    "id": "s1",
                    "grid": [
                        ["あ", "い", "う", "え", "お"],
                        ["か", "き", "く", "け", "こ"],
                        ["さ", "し", "す", "せ", "そ"],
                        ["た", "ち", "つ", "て", "と"],
                        ["な", "に", "ぬ", "ね", "の"]
                    ],
                    "stencil": [
                        [1, 0, 0, 0, 0],
                        [0, 0, 0, 0, 1],
                        [0, 0, 1, 0, 0],
                        [0, 1, 0, 0, 0],
                        [0, 0, 0, 0, 1]
                    ],
                    "answer": "あこすちの",
                    "hint": "型紙の穴が開いている部分（■）の文字を左上から順に読んでください"
                }
            ]
        };
    }
}

// シングルトンインスタンス
export const dataLoader = new DataLoader();