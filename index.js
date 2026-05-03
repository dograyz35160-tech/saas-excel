const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    console.log("WEBHOOK :", event.type);
    if (event.type === "checkout.session.completed") {
      const email = event.data.object.customer_details?.email;
      const { error } = await supabase.from("profiles").update({ active: true, subscription: "pro" }).eq("email", email);
      if (error) { console.log("SUPABASE ERROR :", error.message); }
      else { console.log("USER ACTIVE :", email); }
    }
    res.sendStatus(200);
  } catch (err) {
    console.log("WEBHOOK ERROR :", err.message);
    res.sendStatus(400);
  }
});

app.use(express.json());

app.get("/", (req, res) => { res.send("SERVER OK"); });

app.post("/create-checkout", async (req, res) => {
  try {
    const { email } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: "price_1TT7QYJ7NjMs2QUfoYTHU7iE", quantity: 1 }],
      customer_email: email,
      success_url: "https://saas-excel-backend-production.up.railway.app/success",
      cancel_url: "https://saas-excel-backend-production.up.railway.app/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    console.log("CHECKOUT ERROR :", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => { console.log("SERVER OK ON PORT", PORT); });