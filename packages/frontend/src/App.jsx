import { useState } from "react";
import ws, { controller } from "./utils/Controller";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [voiceText, setVoiceText] = useState("");

  const handleSend = () => {
    ws.send(
      JSON.stringify({
        type: "testAI",
        content: question,
      })
    );
    setQuestion("");
  };

  const handleSendVoiceText = () => {
    ws.send(
      JSON.stringify({
        type: "warmUp",
        content: voiceText,
      })
    );
    setVoiceText("");
  };

  return (
    <div className="container">
      <div className="card">
        <textarea
          value={question}
          placeholder="测试向AI聊天"
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="button" onClick={handleSend}>
          send
        </button>
      </div>
      <div className="card">
        <textarea
          value={voiceText}
          placeholder="测试语音"
          onChange={(e) => setVoiceText(e.target.value)}
        />
        <button type="button" onClick={handleSendVoiceText}>
          send
        </button>
      </div>
    </div>
  );
}

export default App;
