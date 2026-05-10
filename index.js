const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const Stripe = require("stripe");
const OpenAI = require("openai");
const cors = require("cors");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// CORS — autorise Excel local (file://) et tout navigateur
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json());

// Santé Railway
app.get("/", (req, res) => {
  res.json({ status: "Trackyon Railway OK", version: "6.0" });
});

// Vérifier email seul — appelé par Excel avant d'ouvrir le chat
app.post("/api/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, error: "Email manquant." });

  const { data, error } = await supabase
    .from("profiles")
    .select("email, subscription, active")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !data) {
    return res.json({ ok: false, error: "Email non reconnu dans Trackyon." });
  }
  if (!data.active) {
    return res.json({ ok: false, error: "Abonnement inactif. Contactez support@trackyon.app" });
  }
  return res.json({ ok: true, subscription: data.subscription });
});

// Analyse IA principale
app.post("/api/analyze", async (req, res) => {
  const { prompt, email } = req.body;

  if (!email || email.trim() === "") {
    return res.status(401).json({ error: "Email requis. Relancez depuis Excel." });
  }

  // Vérification Supabase — table "profiles"
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email, subscription, active")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (error || !profile) {
    return res.status(403).json({
      error: "Acces refuse : " + email + " n'est pas dans Trackyon. Verifiez votre abonnement."
    });
  }

  if (!profile.active) {
    return res.status(403).json({
      error: "Abonnement inactif pour " + email + ". Contactez support@trackyon.app"
    });
  }

  // Appel OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    });
    const result = completion.choices[0].message.content;
    return res.json({ result });
  } catch (err) {
    console.error("OpenAI error:", err);
    return res.status(500).json({ error: "Erreur serveur OpenAI : " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Trackyon Railway port " + PORT));
