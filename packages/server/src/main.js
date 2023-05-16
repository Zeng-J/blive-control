import axios from "axios";

export default class Controll {
  ws = null;
  queue = [];
  working = false;
  preWorkTime = Date.now();

  constructor(wss, blibli) {
    this.wss = wss;
    this.blibli = blibli;
    this.wssStart();
    this.blibliHandler();

    setInterval(() => {
      this.checkWork();
    }, 10000);
  }

  blibliHandler() {
    this.blibli.onAddText = this.onAddText.bind(this);
  }

  wssStart() {
    // 处理WebSocket连接
    this.wss.on("connection", (ws) => {
      console.log("WebSocket连接已建立");
      // 只保留最新的一个
      if (this.ws) {
        this.ws.close();
      }
      this.ws = ws;
      ws.on("message", (json) => {
        const obj = JSON.parse(json);
        console.log("received: %s", json);
        if (obj.type === "test") {
          this.chat(obj.content);
        }
        if (obj.type === "end") {
          this.working = false;
          this.work();
        }
      });
      ws.on("close", () => {
        console.log("WebSocket 连接已关闭");
      });
    });
  }

  onAddText(data) {
    console.log(data.content);
    this.queue.push({
      type: "text",
      content: data.content,
    });
    this.work();
  }

  checkWork() {
    // 上一个工作5分钟还没结束，估计出报错了，working设置为false，不要影响后续执行
    if (Date.now() - this.preWorkTime > 5 * 60 * 1000) {
      this.working = false;

      if (this.queue.length <= 0) {
        if (Math.random() < 0.2) {
          this.queue.push({
            type: "warmUp",
            content: "你有什么有趣的事，都可以和我分享呢",
          });
        } else {
          const contentType = Math.random() > 0.5 ? "寓言故事" : "笑话";
          this.queue.push({
            type: "warmUp",
            content: `我来讲个${contentType}吧`,
          });
          this.queue.push({
            type: "text",
            content: `给大家讲个${contentType}`,
          });
        }
      }

      this.work();
    }
  }

  work() {
    const curItem = this.queue.shift();
    if (this.working || !curItem) {
      return;
    }
    this.working = true;
    this.preWorkTime = Date.now();
    if (curItem.type === "text") {
      this.chat(curItem.content);
    }
    if (curItem.type === "warmUp") {
      this.ws?.send(curItem.content);
    }
  }

  async chat(txt) {
    try {
      const answerRes = await this.getContent(txt);
      console.log(answerRes);
      this.ws?.send(answerRes.response);
    } catch (_) {
      console.log(_);
    }
  }

  async getContent(question) {
    const res = await axios.post(
      "http://127.0.0.1:8000",
      {
        prompt: question,
        history: [
          [
            "我让你来扮演一名可爱风趣的ai主播",
            "你有什么可以和我聊天的，我都可以回答你",
          ],
        ],
      },
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  }
}
