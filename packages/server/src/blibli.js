import ChatClientDirect from "./ChatClientDirect/index.js";

export default function blibliStart() {
  return new Promise((resolve) => {
    const chatClient = new ChatClientDirect(27831626);
    chatClient.start();
    resolve(chatClient);
  });
}
