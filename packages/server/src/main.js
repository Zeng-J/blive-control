export default class Controll {
  mouthTimer = null;
  ws = null;

  constructor(wss, vtsClient) {
    this.wss = wss;
    this.vtsClient = vtsClient;
    this.wssStart();
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
          this.test();
        }
      });
      ws.on("close", () => {
        console.log("WebSocket 连接已关闭");
      });
    });
  }

  test() {
    const texts = [
      "有个人从一列特快列车上掉了下来，却没有受伤，这是怎么回事？",
      "小李、小王和小张排成一队，小李说“我前面的人是小王”，小王说“我前面的人是小李”，怎么回事？",
      "外国人为什么要到中国来游长城？",
      "有一个人走在沙滩上，回头却看不见自己的脚印，这是怎么回事？",
    ];
    if (this.ws) {
      this.ws.send(texts[Math.floor(Math.random() * 4)]);
    }
  }
}
