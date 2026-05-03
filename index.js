app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    let event;

    try {
      event = JSON.parse(req.body.toString());
    } catch (e) {
      return res.sendStatus(400);
    }

    console.log("🔥 EVENT :", event.type);

    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});