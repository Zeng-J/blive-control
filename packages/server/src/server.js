import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function serverStart() {
  return new Promise((resolve) => {
    const app = express();
    const server = createServer(app);
    const wss = new WebSocketServer({ server });

    app.use(express.static(path.join(__dirname, "../../frontend/dist")));

    // 启动服务器
    server.listen(5500, () => {
      console.log("服务器已启动，端口号：5500");
      resolve(wss);
    });
  });
}
