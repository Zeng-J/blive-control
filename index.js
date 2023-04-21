const vts = require("vtubestudio");
const fs = require("fs");
const WebSocket = require("ws");

const apiClient = new vts.ApiClient({
  authTokenGetter: () => fs.readFileSync("./auth-token.txt", "utf-8"),
  authTokenSetter: (authenticationToken) =>
    fs.writeFileSync("./auth-token.txt", authenticationToken, {
      encoding: "utf-8",
    }),
  pluginName: "VTS.JS-ZJ",
  pluginDeveloper: "Hawkbar",
  webSocketFactory: (url) => new WebSocket(url),
});

apiClient.on("connect", async () => {
  const stats = await apiClient.statistics();

  console.log(`Connected to VTube Studio v${stats.vTubeStudioVersion}`);

  console.log("Getting list of available models");
  const { availableModels } = await apiClient.availableModels();

  console.log("Adding event callback whenever a model is loaded");
  await apiClient.events.modelLoaded.subscribe((data) => {
    console.log("Model loaded:" + data.modelName);
  });

  // await apiClient.events.modelMoved.subscribe(data => {
  //   console.log("Model moved:" + data);
  // })
  // console.log(await apiClient.inputParameterList());
  let tag = 0;
  setInterval(() => {
    tag = tag === 0 ? 1 : 0;
    apiClient
      .injectParameterData({
        mode: "set",
        parameterValues: [
          {
            id: "MouthOpen",
            value: tag === 0 ? 0.7 : 0,
          },
        ],
      })
      .catch((err) => {
        console.error(err);
      });
  }, 500);
});
