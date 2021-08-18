import express from "express";
import fs from "fs";
const app = express();
app.get("*", (req, res) => {
  let { url } = req;
  if (url === "/") {
    const content = fs.readFileSync("./index.html"); // 返回 index.html 文件
    res.status(200).type("html").send(content);
  } else if (url.includes(".js") || !url.includes(".")) {
    if (!url.includes(".")) {
      // js 文件，假设没有后缀 / 后缀含 .js 的都是 JS 文件
      url += ".js";
    }
    const content = fs.readFileSync("./" + url);
    res
      .status(200)
      .set({ "Content-Type": "application/javascript" })
      .send(content);
  }
});
app.listen(6100);
console.log("http://localhost:6100");
