const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("OK SERVER 🚀");
});

app.post("/webhook", (req, res) => {
  console.log("WEBHOOK HIT");
  console.log(req.body);

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SERVER RUNNING ON", PORT);
});