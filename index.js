const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ── Webhook Stripe ──
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    if (event.type === "checkout.session.completed") {
      const email = event.data.object.customer_details?.email;
      const { error } = await supabase.from("profiles").update({ active: true, subscription: "pro" }).eq("email", email);
    }
    res.sendStatus(200);
  } catch (err) { res.sendStatus(400); }
});

app.use(express.json());

// ── Page d'accueil ──
app.get("/", (req, res) => { res.send("SERVER OK"); });

// ── Checkout Stripe ──
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Analyse IA depuis Excel (OpenAI) ──
// C'est ici qu'Excel envoie les donnees du parc
// Railway recoit le prompt + la cle du client
// Railway appelle OpenAI et renvoie la reponse a Excel
app.post("/api/analyze", async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;

    if (!prompt || !apiKey) {
      return res.status(400).json({ error: "prompt et apiKey sont requis" });
    }

    // On utilise la cle du client (il paye son propre usage OpenAI)
    const openai = new OpenAI({ apiKey: apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "Tu es un expert en maintenance de parc d'engins BTP. Tu analyses des KPIs et donnes des recommandations concretes et courtes en francais."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const result = completion.choices[0].message.content;
    res.json({ result: result });

  } catch (err) {
    console.error("Erreur OpenAI:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Analyse IA depuis le site web (devis modal) ──
app.post("/api/ai-devis", async (req, res) => {
  try {
    const { engins, secteur, difficulte, outil } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Tu es conseiller Trackyon. Prospect : secteur=${secteur}, engins=${engins}, difficulte=${difficulte}, outil=${outil}. Ecris 3 phrases courtes en tutoyant le prospect : 1) son probleme, 2) comment Trackyon le resout, 3) un resultat concret. Pas de liste, juste des phrases.`
      }]
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    res.json({ text: "" });
  }
});

// ── Analyse IA depuis la modale devis du site ──
app.post("/api/ai-devis-modal", async (req, res) => {
  try {
    const { prenom, email, secteur, engins, diff, msg } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 250,
      messages: [{
        role: "user",
        content: `Tu es conseiller Trackyon. Prospect : prenom=${prenom}, secteur=${secteur}, engins=${engins}, difficulte=${diff}${msg ? ", message=" + msg : ""}. Ecris 3 phrases courtes en tutoyant ${prenom} : 1) son probleme, 2) comment Trackyon le resout, 3) un resultat concret. Pas de liste, juste des phrases.`
      }]
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    res.json({ text: "" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => { console.log("SERVER OK ON PORT", PORT); });