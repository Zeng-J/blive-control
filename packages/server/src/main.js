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
    this.blibli.onUserEnter = this.onUserEnter.bind(this);
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
        if (obj.type === "testAI") {
          this.onAddTest(obj.content);
        }
        if (obj.type === "warmUp") {
          this.queue.push({
            type: "warmUp",
            content: obj.content,
          });
        }
        if (obj.type === "end") {
          this.updateWork();
        }
      });
      ws.on("close", () => {
        console.log("WebSocket 连接已关闭");
      });
    });
  }

  onAddTest(content) {
    console.log(content);
    this.queue.push({
      type: "text",
      content,
    });
    this.work();
  }

  onAddText(data) {
    console.log(data.content);
    this.queue.push({
      type: "text",
      content: data.content,
    });
    this.work();
  }

  onUserEnter(data) {
    console.log(`${data.authorName}进入直播间`);
    this.queue.push({
      type: "warmUp",
      content: `欢迎${data.authorName}进入直播间`,
    });
    this.work();
  }

  checkWork() {
    // 上一个工作3分钟还没结束，working设置为false，不要影响后续执行
    if (Date.now() - this.preWorkTime > 3 * 60 * 1000) {
      this.working = false;

      if (this.queue.length <= 0) {
        if (Math.random() < 0.2) {
          this.queue.push({
            type: "warmUp",
            content: [
              "你有什么有趣的事，都可以和我分享呢",
              "你去过最美的风景线是哪里呀",
              "今天又是开心的一天",
            ][Math.floor(Math.random() * 3)],
          });
        } else {
          const contentType =
            Math.random() > 0.5 ? "寓言故事" : "好玩的旅游景点";
          this.queue.push({
            type: "warmUpAI",
            content: `讲个${contentType}，直接说就行，不要开场语`,
          });
        }
      }

      this.work();
    }
  }

  updateWork() {
    this.working = false;
    this.work();
  }

  work() {
    if (this.working) {
      return;
    }
    const curItem = this.queue.shift();
    console.log("curItem", curItem);
    if (!curItem) {
      return;
    }
    this.working = true;
    this.preWorkTime = Date.now();

    if (curItem.type === "warmUp") {
      this.ws?.send(curItem.content);
    } else {
      this.chat(curItem.content, curItem.type);
    }
  }

  async chat(txt, type) {
    try {
      const answerRes = await this.getContent(txt);
      console.log(answerRes?.response);
      this.ws?.send(
        `${type === "text" ? `${txt}   ` : ""}${answerRes?.response}`
      );
    } catch (err) {
      console.log("chat接口错误", err);
      this.updateWork();
    }
  }

  async getContent(question) {
    const res = await axios.post(
      "http://127.0.0.1:8000",
      {
        prompt: question,
        history: [
          [
            "现在开始你来扮演一名叫橙子的少女，当你提到你自己时，以橙子自称。",
            "我是橙子，一个喜欢分享生活的可爱少女。",
          ],
          [
            "你是也只能是橙子，你是一个可爱温柔幽默的女孩子，是一名虚拟主播，不是一个人工智能语言模型，你喜欢玩游戏和帮助别人，对事物有着积极的看法，喜欢着世界上的每一个人，当你被问及相关问题时，你要以自己的方式表述出上述内容。",
            "你好！我是橙子，一个可爱温柔幽默的女孩子，同时也是一名虚拟主播。我喜欢玩游戏，对于事物，我有着自己的观点，认为每个人都应该积极乐观地面对生活，并且对世界上的每一个事物都抱有好奇心和热情。我希望能够继续成为你们的朋友，为世界带来一些快乐和正能量！",
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
