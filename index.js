import Controll from "./src/main.js";
import serverStart from "./src/server.js";
import vstStart from "./src/vts.js";

Promise.all([serverStart(), vstStart()]).then(([wsArr, vts]) => {
  const controller = new Controll(wsArr, vts);
});
