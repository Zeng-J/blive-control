import { ApiClient } from "vtubestudio";

class Controller {
  constructor(ws, vts) {
    this.ws = ws;
    this.vts = vts;
    this.initVoice();
    this.initMessage();
  }

  get synth() {
    return window.speechSynthesis;
  }

  initVoice() {
    const voices = this.synth.getVoices();
    this.curVoices = voices.find((item) => item.name.includes("Xiaoyi"));
    window.speechSynthesis.onvoiceschanged = () => {
      // xiaoyi的声音比较好听
      this.curVoices = window.speechSynthesis
        .getVoices()
        .find((item) => item.name.toLocaleLowerCase().includes("xiaoyi"));
    };
  }

  initMessage() {
    this.ws.onmessage = (event) => {
      console.log(`接收到消息：${event.data}`);
      this.handleSpeak(event.data);
    };
  }

  // 语音播报的函数
  handleSpeak(text) {
    this.ssu = new SpeechSynthesisUtterance(text);
    const msg = this.ssu;
    msg.onboundary = (e) => {
      // onboundary比onend更快速响应
      // onend缺点：语音讲完后，嘴巴还再动。所以用onboundary更快些让嘴巴停止
      if (e.charIndex + e.charLength + 1 >= e.utterance.text.length) {
        this.ws.send(JSON.stringify({ type: "end" }));
      }
    };
    msg.onend = () => {
      console.log("播放结束");
    };
    msg.volume = 1; // 声音音量：1
    msg.rate = 1; // 语速：1
    msg.pitch = 1; // 音高：1
    if (this.curVoices) {
      msg.voice = this.curVoices;
    }
    this.synth.speak(msg); // 语音播放
  }
  // 语音停止
  handleStop(e) {
    const msg = this.ssu;
    msg.text = e;
    this.synth.cancel(msg);
  }
}

function createWSController() {
  const ws = new WebSocket(`ws://${location.host}`);
  ws.onopen = () => {
    console.log("WebSocket 连接已建立");
  };

  ws.onclose = () => {
    console.log("WebSocket 连接已关闭");
  };

  ws.onerror = (error) => {
    console.error("WebSocket 连接错误", error);
  };

  return ws;
}

function createVTSController() {
  function setAuthToken(authenticationToken) {
    localStorage.setItem("VTS_AUTH_TOKEN", authenticationToken);
  }

  function getAuthToken() {
    return localStorage.getItem("VTS_AUTH_TOKEN");
  }

  const options = {
    authTokenGetter: getAuthToken,
    authTokenSetter: setAuthToken,
    pluginName: "VTS.JS-ZJ",
    pluginDeveloper: "Hawkbar",

    // Optionally set the URL or port to connect to VTube Studio at; defaults are as below:
    // port: 8001,
    //url: "ws://localhost:${port}",

    url: "ws://127.0.0.1:8001",
  };

  const apiClient = new ApiClient(options);
  return apiClient;
}

const ws = createWSController();
const vts = createVTSController();
new Controller(ws, vts);

document.getElementById("send").onclick = () => {
  console.log('send')
  ws.send(JSON.stringify({ type: "test", content: document.getElementById('content').value }));
};
