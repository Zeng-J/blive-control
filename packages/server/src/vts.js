import vts from "vtubestudio";
import fs from "fs";
import WebSocket from "ws";

export default async function vtsStart() {
  return new Promise((resolve) => {
    const apiClient = new vts.ApiClient({
      authTokenGetter: () => fs.readFileSync("../auth-token.txt", "utf-8"),
      authTokenSetter: (authenticationToken) =>
        fs.writeFileSync("../auth-token.txt", authenticationToken, {
          encoding: "utf-8",
        }),
      pluginName: "VTS.JS-ZJ",
      pluginDeveloper: "Hawkbar",
      webSocketFactory: (url) => new WebSocket(url),
      url: "ws://127.0.0.1:8001",
    });
    console.log('vts startting')
    apiClient.on("error", async (err) => {
      console.error(err)
    })
    apiClient.on("connect", async () => {
      const stats = await apiClient.statistics();

      console.log(`Connected to VTube Studio v${stats.vTubeStudioVersion}`);

      await apiClient.events.modelLoaded.subscribe((data) => {
        console.log("Model loaded:" + data.modelName);
      });
      resolve(apiClient);
    });
  });
}
