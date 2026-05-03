const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");

const app = express();

/* =========================
   STRIPE
========================= */
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   SUPABASE
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/* =========================
   STRIPE WEBHOOK (IMPORTANT: AVANT express.json)
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
    console.log("❌ WEBHOOK ERROR :", err.message);
    res.sendStatus(400);
  }
});

/* =========================
   JSON MIDDLEWARE (APRÈS WEBHOOK)
========================= */
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("SERVER OK 🚀");
});

/* =========================
   CREATE CHECKOUT SESSION
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
   START SERVER (RAILWAY SAFE)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 SERVER OK ON PORT", PORT);
});