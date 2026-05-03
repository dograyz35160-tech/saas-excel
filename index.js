const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* =========================
   IMPORTANT (global JSON)
========================= */
app.use(express.json());

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  "https://yntlcknrkduzbjsfrjuj.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludGxja25ya2R1emJqc2ZyanVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgyMTA3NCwiZXhwIjoyMDkzMzk3MDc0fQ.6qnu7s8CNbcmY7uF8yNWMLh2-qAIKUrtR-YGiXTwoz8"
);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

/* =========================
   STRIPE WEBHOOK
========================= */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {

  try {

    const event = JSON.parse(req.body.toString());

    console.log("🔥 WEBHOOK RECU :", event.type);

    if (event.type === "checkout.session.completed") {

      const email = event.data.object.customer_details?.email;

      console.log("💰 PAIEMENT OK :", email);

      const { error } = await supabase
        .from("profiles")
        .update({
          active: true,
          subscription: "pro"
        })
        .eq("email", email);

      if (error) {
        console.log("❌ SUPABASE ERROR:", error.message);
      } else {
        console.log("✅ USER ACTIVÉ :", email);
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("❌ WEBHOOK ERROR:", err.message);
    res.sendStatus(400);
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 SERVER OK");
});