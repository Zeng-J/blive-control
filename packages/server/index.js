import open from "open";
import Controll from "./src/main.js";
import serverStart from "./src/server.js";
// import vstStart from "./src/vts.js";
import blibliStart from "./src/blibli.js";

Promise.all([serverStart(), blibliStart()]).then(([ws, blibli]) => {
  const controller = new Controll(ws, blibli);
  console.log("准备就绪");
  open("http://localhost:5500", 'edge')
});
