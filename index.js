const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

/* =========================
   SUPABASE CONNECTION
========================= */
const supabase = createClient(
  "https://yntlcknrkduzbjsfrjuj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludGxja25ya2R1emJqc2ZyanVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgyMTA3NCwiZXhwIjoyMDkzMzk3MDc0fQ.6qnu7s8CNbcmY7uF8yNWMLh2-qAIKUrtR-YGiXTwoz8"
);

/* =========================
   TEST SERVER
========================= */
app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

/* =========================
   STRIPE WEBHOOK
========================= */
app.post("/webhook", async (req, res) => {

  const event = req.body;

  // paiement réussi
  if (event.type === "checkout.session.completed") {

    const email = event.data.object.customer_details.email;

    console.log("💰 PAIEMENT OK :", email);

    // 🔥 ACTIVER USER DANS SUPABASE
    const { data, error } = await supabase
      .from("profiles")
      .update({
        active: true,
        subscription: "pro"
      })
      .eq("email", email);

    if (error) {
      console.log("❌ ERREUR SUPABASE:", error.message);
    } else {
      console.log("✅ USER ACTIVÉ :", email);
    }
  }

  res.sendStatus(200);
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 SERVER OK");
});