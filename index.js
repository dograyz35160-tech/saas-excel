const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
"https://yntlcknrkduzbjsfrjuj.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludGxja25ya2R1emJqc2ZyanVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgyMTA3NCwiZXhwIjoyMDkzMzk3MDc0fQ.6qnu7s8CNbcmY7uF8yNWMLh2-qAIKUrtR-YGiXTwoz8"
);

/* =========================
   WEBHOOK STRIPE (IMPORTANT AVANT JSON GLOBAL)
========================= */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());

    console.log("🔥 WEBHOOK :", event.type);

    if (event.type === "checkout.session.completed") {
      const email = event.data.object.customer_details?.email;

      console.log("💰 PAIEMENT OK :", email);

      await supabase
        .from("profiles")
        .update({
          active: true,
          subscription: "pro",
        })
        .eq("email", email);
    }

    res.sendStatus(200);
  } catch (err) {
    console.log("❌ ERROR :", err.message);
    res.sendStatus(400);
  }
});

/* =========================
   GLOBAL JSON (APRÈS WEBHOOK)
========================= */
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

/* =========================
   START
========================= */
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 SERVER OK");
});