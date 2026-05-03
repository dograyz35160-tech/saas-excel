app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT OK");

    const body = req.body.toString();
    console.log("RAW BODY:", body);

    let event;
    try {
      event = JSON.parse(body);
    } catch (e) {
      console.log("❌ JSON ERROR");
      return res.sendStatus(400);
    }

    console.log("EVENT TYPE:", event.type);

    res.sendStatus(200);
  } catch (err) {
    console.log("❌ FATAL WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});