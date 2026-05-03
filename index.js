const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const app = express();

/* =========================
   STRIPE INIT
========================= */
const stripe = Stripe("sk_test_51TT4FwJ7NjMs2QUfrJgbUBlezblsr6nlB7QlogaHFkTAbIhFE9gKdvwhhW4l85UgF6qV32uvtFfJM3pPOLcGQ3h200pXE8N61G");

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  "https://yntlcknrkduzbjsfrjuj.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludGxja25ya2R1emJqc2ZyanVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgyMTA3NCwiZXhwIjoyMDkzMzk3MDc0fQ.6qnu7s8CNbcmY7uF8yNWMLh2-qAIKUrtR-YGiXTwoz8"
);

/* =========================
   WEBHOOK STRIPE (DOIT ÊTRE AVANT express.json)
========================= */
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());

    console.log("🔥 WEBHOOK :", event.type);

    if (event.type === "checkout.session.completed") {
      const email = event.data.object.customer_details?.email;

      console.log("💰 PAIEMENT OK :", email);

      const { error } = await supabase
        .from("profiles")
        .update({
          active: true,
          subscription: "pro",
        })
        .eq("email", email);

      if (error) {
        console.log("❌ SUPABASE ERROR :", error.message);
      } else {
        console.log("✅ USER ACTIVÉ :", email);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.log("❌ ERROR WEBHOOK :", err.message);
    res.sendStatus(400);
  }
});

/* =========================
   JSON MIDDLEWARE (APRES WEBHOOK)
========================= */
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

/* =========================
   CHECKOUT STRIPE
========================= */
app.post("/create-checkout", async (req, res) => {
  try {
    const { email } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TT7QYJ7NjMs2QUfoYTHU7iE",
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: "https://saas-excel-backend-production.up.railway.app/success",
      cancel_url: "https://saas-excel-backend-production.up.railway.app/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log("❌ CHECKOUT ERROR :", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER OK ON PORT", PORT);
});