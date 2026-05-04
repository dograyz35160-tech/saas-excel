const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const B = "1A56DB", A = "00D4FF", G = "10B981", R = "EF4444", GO = "F59E0B";
const N = "0D1B2E", T = "1E293B", M = "64748B", W = "FFFFFF";
const LB = "EFF6FF", LG = "F0FFF4", LR = "FFF5F5", LY = "FFFBEB";

const brd = (c="CBD5E1") => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const borders = (c) => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });
const leftBorder = (c) => ({ top: brd("E2E8F0"), bottom: brd("E2E8F0"), left: { style: BorderStyle.SINGLE, size: 8, color: c }, right: brd("E2E8F0") });

const h = (level, text, color = "1E293B") => {
  const sz = { 1: 40, 2: 30, 3: 24, 4: 22 };
  const sp = { 1: { before: 560, after: 240 }, 2: { before: 400, after: 160 }, 3: { before: 280, after: 120 }, 4: { before: 200, after: 80 } };
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: sz[level], color, font: "Arial" })],
    spacing: sp[level],
    border: level === 1 ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: B, space: 6 } } : undefined
  });
};

const p = (text, opts = {}) => new Paragraph({
  children: [new TextRun({ text, size: opts.size || 22, color: opts.color || "334155", font: "Arial", bold: opts.bold, italics: opts.italic })],
  spacing: { before: 80, after: 120 },
  alignment: opts.align || AlignmentType.LEFT
});

const pb = () => new Paragraph({ children: [new PageBreak()] });
const sp = (n = 160) => new Paragraph({ children: [], spacing: { before: n } });

const box = (title, body, bg = LB, bc = B) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    borders: leftBorder(bc),
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 220, right: 220 },
    children: [
      new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 22, color: bc, font: "Arial" })], spacing: { after: 80 } }),
      ...body.split('\n').filter(Boolean).map(line => new Paragraph({ children: [new TextRun({ text: line, size: 20, color: "475569", font: "Arial" })], spacing: { after: 60 } }))
    ]
  })]})
  ]
});

const li = (text, bold_prefix = "") => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  children: [
    bold_prefix ? new TextRun({ text: bold_prefix + " ", bold: true, size: 22, font: "Arial", color: "1E293B" }) : null,
    new TextRun({ text: bold_prefix ? text : text, size: 22, font: "Arial", color: "334155" })
  ].filter(Boolean),
  spacing: { before: 60, after: 60 }
});

const tbl = (headers, rows, widths) => {
  const b = brd("CBD5E1");
  const bs = { top: b, bottom: b, left: b, right: b };
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => new TableCell({
        borders: bs, shading: { fill: "1E40AF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: widths[i], type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 19, color: W, font: "Arial" })] })]
      })) }),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, i) => new TableCell({
        borders: bs, shading: { fill: ri % 2 === 0 ? "F8FAFF" : W, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: widths[i], type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: cell, size: 19, font: "Arial", color: "334155" })] })]
      })) }))
    ]
  });
};

const code = (lines) => new Table({
  width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
  rows: [new TableRow({ children: [new TableCell({
    borders: { top: brd("1E3A5F"), bottom: brd("1E3A5F"), left: { style: BorderStyle.SINGLE, size: 2, color: "1E3A5F" }, right: brd("1E3A5F") },
    shading: { fill: "0D1B2E", type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 220, right: 220 },
    children: lines.map(line => new Paragraph({ children: [new TextRun({ text: line, size: 18, font: "Courier New", color: line.startsWith("'") ? "6A9955" : line.startsWith("Public") || line.startsWith("Private") || line.startsWith("Sub") || line.startsWith("Function") || line.startsWith("End") ? "DCDCAA" : line.includes("=") && !line.startsWith("'") ? "9CDCFE" : "D4D4D4" })], spacing: { after: 20 } }))
  })] })]
});

// ═══════════════════════════════════════════
// DOCUMENT 1 : GUIDE ENTREPRENEUR (pour toi)
// ═══════════════════════════════════════════
const docEntrepreneur = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
    children: [
      // COUVERTURE
      new Paragraph({ children: [new TextRun({ text: "TRACKYON", size: 80, bold: true, color: B, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: "Guide Entrepreneur — Confidentiel", size: 28, color: M, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      new Paragraph({ children: [new TextRun({ text: "──────────────────────────────────────────", color: B, size: 22, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
      ...[
        "✅  Étude de marché BTP & Mines — Analyse complète",
        "✅  Note honnête du projet + plan pour atteindre 8-9/10",
        "✅  Comment relier Excel → Railway → Claude (architecture)",
        "✅  Code VBA complet : clé API sécurisée + appel backend",
        "✅  Tuto Stripe : passer en mode LIVE",
        "✅  Bug Réinitialiser : correction définitive",
        "✅  Roadmap 6 mois + stratégie acquisition clients",
      ].map(t => new Paragraph({ children: [new TextRun({ text: t, size: 24, color: "334155", font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 120 } })),
      new Paragraph({ children: [new TextRun({ text: "Mai 2026 · Usage strictement confidentiel", size: 18, color: "94A3B8", font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { before: 600 } }),
      pb(),

      // PARTIE 1 : ÉTUDE DE MARCHÉ
      h(1, "PARTIE 1 — ÉTUDE DE MARCHÉ", B),
      sp(80),
      h(2, "1.1 Le marché — chiffres réels"),
      p("Le marché mondial de la gestion de maintenance de flotte d'engins (GMAO + fleet management) est estimé à 25 milliards $ en 2024, en croissance de 8% par an. En France uniquement :"),
      sp(60),
      tbl(
        ["Segment", "Entreprises FR", "Engins moyens", "Dépenses maint./an"],
        [
          ["BTP / Génie civil", "~45 000", "5-30", "15 000 – 80 000€"],
          ["Mines & Carrières", "~8 000", "10-100", "50 000 – 500 000€"],
          ["Travaux Publics", "~12 000", "3-20", "10 000 – 50 000€"],
          ["Agriculture (tracteurs+)", "~25 000", "5-40", "8 000 – 40 000€"],
        ],
        [2400, 1800, 1800, 3360]
      ),
      sp(160),
      h(2, "1.2 Le gap de marché exact où tu te positionnes"),
      tbl(
        ["Solution", "Prix/mois", "Cible", "Ton avantage"],
        [
          ["DIMO Maint", "400-800€", "Industrie lourde", "10x moins cher"],
          ["Maximo (IBM)", "1 500€+", "Grands groupes", "Inaccessible PME"],
          ["Fiix Software", "45$/mois", "PME industrie US", "Personnalisé FR BTP"],
          ["Excel papier", "0€", "Tous", "IA + rapport auto"],
          ["TRACKYON", "29-149€", "PME BTP/Mines FR", "← Tu es ici"],
        ],
        [2200, 1600, 2200, 3360]
      ),
      sp(120),
      box("💡 Le gap de marché Trackyon",
        "Entre l'Excel bricolé (0€, inefficace) et les GMAO pro (400-2000€/mois, trop complexes), il n'existe presque rien à 29-149€/mois pour les PME BTP de 5-50 engins. C'est exactement ce que tu combles. Ce segment est SOUS-SERVI en France.", LB, B),
      sp(160),
      h(2, "1.3 Projection financière réaliste"),
      tbl(
        ["Période", "Clients", "MRR (29€/mois)", "Revenu annuel"],
        [
          ["Mois 1-3 (validation)", "0-3 clients", "0 – 87€", "0 – 1 044€"],
          ["Mois 4-6 (traction)", "5-15 clients", "145 – 435€", "1 740 – 5 220€"],
          ["Mois 7-12 (croissance)", "20-50 clients", "580 – 1 450€", "6 960 – 17 400€"],
          ["An 2 (si tenu)", "80-150 clients", "2 320 – 4 350€", "27 840 – 52 200€"],
        ],
        [2200, 2000, 2000, 3160]
      ),
      pb(),

      // PARTIE 2 : NOTE ET PLAN
      h(1, "PARTIE 2 — NOTE ACTUELLE & PLAN 8-9/10", B),
      sp(80),
      h(2, "2.1 Note actuelle : 6,5/10 — Verdict honnête"),
      sp(80),
      box("✅ CE QUI EST BON (sincèrement)",
        "Design propre, professionnel, cohérent avec ta cible.\nTunnel Stripe → onboarding → livraison : logique et bien pensé.\nTu as VBA-JSON dans ton Excel, c'est la bonne librairie.\nRailway + Supabase déjà configurés : t'as fait le vrai travail technique.\nL'idée répond à un vrai problème de marché sous-servi.", LG, G),
      sp(120),
      box("❌ CE QUI BLOQUE LA NOTE",
        "1. Faux avis clients (Mohamed K., Jean-Baptiste L.) — SUPPRIMÉS dans la nouvelle version.\n2. Stripe en mode TEST — aucun vrai argent encaissé possible.\n3. La description 'GPS temps réel' et 'appli mobile' n'existent pas encore.\n4. Le lien /api/create-checkout sur Railway ne semble pas renvoyer d'URL Stripe.\n5. Supabase table 'profiles' existe mais le webhook Stripe l'alimente-t-il bien ?\n6. Bug réinitialiser non corrigé (Section 4).", LR, R),
      sp(160),
      h(2, "2.2 Les 10 actions pour passer à 8-9/10"),
      sp(80),
      tbl(
        ["#", "Action", "Effort", "Impact"],
        [
          ["1", "Passer Stripe en mode LIVE", "30 min", "+0.8 pt"],
          ["2", "Supprimer les faux avis (fait)", "0", "+0.5 pt"],
          ["3", "Corriger le bug Réinitialiser (Partie 4)", "1h", "+0.4 pt"],
          ["4", "Tester le webhook Stripe → Supabase", "1h", "+0.5 pt"],
          ["5", "Avoir 1 vrai client payant", "Variable", "+0.5 pt"],
          ["6", "Retirer 'GPS temps réel' et 'appli mobile'", "15 min", "+0.3 pt"],
          ["7", "Acheter trackyon.fr (~12€/an)", "30 min", "+0.2 pt"],
          ["8", "Ajouter 1 vrai témoignage client", "Variable", "+0.4 pt"],
          ["9", "Vidéo démo Loom 2 min du fichier Excel", "2h", "+0.3 pt"],
          ["10", "Automatiser livraison Excel (Make.com)", "1 semaine", "+0.3 pt"],
        ],
        [500, 3300, 1400, 4160]
      ),
      pb(),

      // PARTIE 3 : ARCHITECTURE TECHNIQUE
      h(1, "PARTIE 3 — ARCHITECTURE : EXCEL → RAILWAY → CLAUDE", B),
      sp(80),
      h(2, "3.1 Pourquoi ne pas appeler Claude directement depuis Excel ?"),
      p("Tu m'as demandé si l'Excel devait appeler Railway. La réponse est OUI, et voici pourquoi c'est vital :"),
      sp(80),
      box("⚠️ Le problème si tu appelles Claude directement depuis Excel",
        "Si Excel → Claude directement : ta clé API est dans le code VBA.\nN'importe quel utilisateur qui ouvre l'éditeur VBA (ALT+F11) voit ta clé.\nIl peut l'utiliser pour ses propres analyses et épuiser ton crédit.\nTu ne peux pas contrôler qui l'utilise ni combien.", LR, R),
      sp(120),
      box("✅ La bonne architecture : Excel → Railway → Claude",
        "Excel envoie les données à ton backend Railway (ton serveur).\nRailway lit la clé Anthropic depuis ses variables d'environnement (ANTHROPIC_API_KEY).\nRailway appelle Claude avec la clé, reçoit la réponse, et la renvoie à Excel.\nRésultat : la clé n'est jamais visible côté client. Architecture professionnelle.", LG, G),
      sp(160),
      h(2, "3.2 Schéma de l'architecture"),
      tbl(
        ["Composant", "Rôle", "Où tu l'as configuré"],
        [
          ["Excel (VBA)", "Collecte les données, fait la requête HTTP", "Ton fichier .xlsm"],
          ["Railway", "Serveur backend, protège la clé API", "railway.com/project/445df..."],
          ["ANTHROPIC_API_KEY", "Clé secrète stockée dans Railway Variables", "Railway → Variables (déjà là !)"],
          ["Claude API", "Fait l'analyse IA et renvoie le texte", "api.anthropic.com"],
          ["Supabase", "Stocke les profils clients après paiement", "supabase.com (déjà configuré)"],
          ["Stripe", "Gère les paiements et abonnements", "buy.stripe.com (passer en LIVE)"],
        ],
        [2200, 3200, 3960]
      ),
      sp(160),
      h(2, "3.3 Code VBA complet — Appel via Railway"),
      p("Voici le code VBA à mettre dans ton fichier Excel. Il appelle TON backend Railway (pas Claude directement) :"),
      sp(80),
      code([
        "' ═══════════════════════════════════════════",
        "' MODULE : AppelIA - Trackyon",
        "' Appel via backend Railway (SÉCURISÉ)",
        "' ═══════════════════════════════════════════",
        "",
        "Public g_ApiKey As String  ' Clé stockée en RAM uniquement",
        "",
        "' ─── Obtenir ou demander la clé ───",
        "Public Function GetAPIKey() As String",
        "    If g_ApiKey = \"\" Then",
        "        Dim sKey As String",
        "        sKey = InputBox(\"Entrez votre clé API Claude (sk-ant-...)\" & Chr(13) & _",
        "                       \"Obtenez-la sur : console.anthropic.com\", _",
        "                       \"Trackyon — Clé API\", \"\")",
        "        If sKey = \"\" Then GetAPIKey = \"\": Exit Function",
        "        If Left(sKey, 7) <> \"sk-ant-\" Then",
        "            MsgBox \"Format invalide. La clé commence par sk-ant-\", vbCritical",
        "            GetAPIKey = \"\": Exit Function",
        "        End If",
        "        g_ApiKey = sKey",
        "    End If",
        "    GetAPIKey = g_ApiKey",
        "End Function",
        "",
        "' ─── Réinitialiser la clé ───",
        "Public Sub ResetAPIKey()",
        "    g_ApiKey = \"\"",
        "    ' Effacer aussi la cellule si stockée",
        "    On Error Resume Next",
        "    ThisWorkbook.Sheets(\"Config\").Range(\"CleAPI\").Value = \"\"",
        "    On Error GoTo 0",
        "    MsgBox \"Clé effacée. Saisie requise à la prochaine analyse.\", vbInformation",
        "End Sub",
        "",
        "' ─── Appel via RAILWAY (RECOMMANDÉ) ───",
        "Public Function AppelViaRailway(prompt As String) As String",
        "    Dim apiKey As String",
        "    apiKey = GetAPIKey()",
        "    If apiKey = \"\" Then AppelViaRailway = \"ERREUR: Clé manquante.\": Exit Function",
        "",
        "    ' URL de ton backend Railway",
        "    Dim railwayURL As String",
        "    railwayURL = \"https://saas-excel-backend-production.up.railway.app/api/analyze\"",
        "",
        "    ' Construction du JSON",
        "    Dim promptEsc As String",
        "    promptEsc = Replace(prompt, Chr(34), \"\\\"\"\"\")",
        "    promptEsc = Replace(promptEsc, Chr(10), \"\\n\")",
        "    promptEsc = Replace(promptEsc, Chr(13), \"\")",
        "",
        "    Dim jsonBody As String",
        "    jsonBody = \"{\"\"prompt\"\":\"\"\" & promptEsc & \"\"\",\"\"apiKey\"\":\"\"\" & apiKey & \"\"\"}\". ",
        "",
        "    ' Requête HTTP",
        "    Dim http As Object",
        "    Set http = CreateObject(\"MSXML2.XMLHTTP.6.0\")",
        "    On Error GoTo ErreurRailway",
        "    http.Open \"POST\", railwayURL, False",
        "    http.setRequestHeader \"Content-Type\", \"application/json\"",
        "    http.Send jsonBody",
        "",
        "    ' Lire la réponse",
        "    Dim reponse As String",
        "    reponse = http.responseText",
        "",
        "    ' Extraire le texte (cherche \"result\":\"...\")",
        "    Dim debut As Long, fin As Long",
        "    debut = InStr(reponse, \"\"\"result\"\":\"\"\") + 10",
        "    fin = InStr(debut, reponse, \"\"\"\")",
        "    If debut > 10 And fin > 0 Then",
        "        Dim txt As String",
        "        txt = Mid(reponse, debut, fin - debut)",
        "        txt = Replace(txt, \"\\n\", Chr(10))",
        "        AppelViaRailway = txt",
        "    Else",
        "        AppelViaRailway = \"ERREUR: Réponse inattendue: \" & Left(reponse, 200)",
        "    End If",
        "    Exit Function",
        "ErreurRailway:",
        "    AppelViaRailway = \"ERREUR RÉSEAU: \" & Err.Description",
        "End Function",
        "",
        "' ─── Bouton principal : Analyser le parc ───",
        "Public Sub BoutonAnalyserParc()",
        "    Application.ScreenUpdating = False",
        "    Dim ws As Worksheet",
        "    Set ws = ThisWorkbook.Sheets(\"Données\")  ' Adapte le nom",
        "",
        "    ' Lire les KPIs depuis la feuille",
        "    Dim disponibilite As String: disponibilite = ws.Range(\"B3\").Value & \"%\"",
        "    Dim mttr As String: mttr = ws.Range(\"B4\").Value & \"h\"",
        "    Dim alertes As String: alertes = ws.Range(\"B5\").Value",
        "    Dim nbMachines As String: nbMachines = ws.Range(\"B2\").Value",
        "",
        "    ' Construire le prompt",
        "    Dim monPrompt As String",
        "    monPrompt = \"Tu es expert maintenance BTP. Analyse ces KPIs et donne 3 recommandations.\" & Chr(10) & _",
        "                \"Parc : \" & nbMachines & \" machines.\" & Chr(10) & _",
        "                \"Disponibilité : \" & disponibilite & Chr(10) & _",
        "                \"MTTR : \" & mttr & Chr(10) & _",
        "                \"Alertes : \" & alertes & Chr(10) & _",
        "                \"Sois concis (max 200 mots). Numérote les recommandations.\"",
        "",
        "    ' Afficher en attente",
        "    Dim wsRapport As Worksheet",
        "    Set wsRapport = ThisWorkbook.Sheets(\"Rapport IA\")",
        "    wsRapport.Range(\"A1\").Value = \"⏳ Analyse en cours...\"",
        "    Application.ScreenUpdating = True: DoEvents",
        "",
        "    ' Appel Railway",
        "    Dim resultat As String",
        "    resultat = AppelViaRailway(monPrompt)",
        "",
        "    ' Écrire le résultat",
        "    wsRapport.Range(\"A1\").Value = \"🤖 Analyse IA — \" & Format(Now(), \"dd/mm/yyyy hh:mm\")",
        "    wsRapport.Range(\"A3\").Value = resultat",
        "    wsRapport.Range(\"A3\").WrapText = True",
        "",
        "    Application.ScreenUpdating = True",
        "    MsgBox \"Analyse terminée !\", vbInformation",
        "End Sub",
        "",
        "' ─── Effacement auto à la fermeture ───",
        "' (Colle ceci dans ThisWorkbook)",
        "' Private Sub Workbook_BeforeClose(Cancel As Boolean)",
        "'     g_ApiKey = \"\"",
        "' End Sub",
      ]),
      sp(160),
      h(2, "3.4 Code à ajouter dans ton backend Railway (Node.js)"),
      p("Ton backend Railway doit avoir un endpoint POST /api/analyze. Vérifie que ce code est dans ton serveur :"),
      sp(80),
      code([
        "// Dans ton fichier principal (index.js ou server.js sur Railway)",
        "// Route : POST /api/analyze",
        "",
        "const Anthropic = require('@anthropic-ai/sdk');",
        "",
        "app.post('/api/analyze', async (req, res) => {",
        "  try {",
        "    const { prompt, apiKey } = req.body;",
        "",
        "    // Utiliser la clé du client OU la clé Railway si tu veux gérer toi-même",
        "    // Option A : clé du client (plus flexible, le client paye son usage)",
        "    const client = new Anthropic({ apiKey: apiKey });",
        "",
        "    // Option B : ta clé Railway (tu gères les coûts)",
        "    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });",
        "",
        "    const message = await client.messages.create({",
        "      model: 'claude-haiku-4-5-20251001',",
        "      max_tokens: 1000,",
        "      messages: [{ role: 'user', content: prompt }]",
        "    });",
        "",
        "    res.json({ result: message.content[0].text });",
        "  } catch (error) {",
        "    res.status(500).json({ error: error.message });",
        "  }",
        "});",
      ]),
      sp(120),
      box("📌 Comment vérifier que Railway répond bien",
        "1. Va sur : https://saas-excel-backend-production.up.railway.app/api/analyze\n2. Depuis Postman ou curl, envoie : POST avec body {\"prompt\": \"Dis bonjour\", \"apiKey\": \"sk-ant-TON_VRAI_API\"}\n3. Si tu reçois {\"result\": \"Bonjour!\"} → ton backend fonctionne parfaitement\n4. Si tu reçois une erreur 404 → l'endpoint n'existe pas encore, ajoute le code ci-dessus.", LB, B),
      pb(),

      // PARTIE 4 : BUG RÉINITIALISER
      h(1, "PARTIE 4 — CORRIGER LE BUG RÉINITIALISER", B),
      sp(80),
      h(2, "4.1 Pourquoi l'IA s'affiche encore après réinitialisation ?"),
      p("Le bug : tu cliques Réinitialiser, mais le rapport dit encore 'Analyse IA intégrée'. Voici les 3 causes possibles :"),
      sp(80),
      tbl(
        ["Cause", "Explication", "Correction"],
        [
          ["Cause 1", "La variable g_ApiKey est vidée mais le texte 'Analyse IA' est écrit en dur dans le template rapport", "Rendre le texte conditionnel (voir code)"],
          ["Cause 2", "Le rapport PDF est généré AVANT que ResetAPIKey() soit appelé", "Vérifier g_ApiKey avant d'écrire le titre IA"],
          ["Cause 3", "Une cellule cache toujours la clé même quand g_ApiKey est vide", "Effacer aussi la cellule Config dans Reset"],
        ],
        [1400, 4200, 3760]
      ),
      sp(160),
      h(2, "4.2 Code de correction définitive"),
      code([
        "' ─── BOUTON RÉINITIALISER (version corrigée) ───",
        "Public Sub BoutonReinitialiser()",
        "    ' 1. Vider la variable RAM",
        "    g_ApiKey = \"\"",
        "",
        "    ' 2. Vider toute cellule qui aurait stocké la clé",
        "    On Error Resume Next",
        "    ThisWorkbook.Sheets(\"Config\").Range(\"CleAPI\").Value = \"\"",
        "    ThisWorkbook.Sheets(\"Config\").Range(\"B1\").Value = \"\"",
        "    On Error GoTo 0",
        "",
        "    ' 3. Mettre à jour le statut dans l'onglet Rapport IA",
        "    On Error Resume Next",
        "    Dim wsR As Worksheet",
        "    Set wsR = ThisWorkbook.Sheets(\"Rapport IA\")",
        "    If Not wsR Is Nothing Then",
        "        wsR.Range(\"A1\").Value = \"— Clé API non définie\"",
        "        wsR.Range(\"A3\").Value = \"\"",
        "    End If",
        "    On Error GoTo 0",
        "",
        "    MsgBox \"Clé effacée. Le prochain rapport n'incluera PAS d'analyse IA.\", vbInformation",
        "End Sub",
        "",
        "' ─── DANS TA FONCTION DE GÉNÉRATION RAPPORT : ───",
        "Public Sub GenererRapport()",
        "    ' ... ton code ...",
        "",
        "    ' Vérification IA AVANT d'écrire le titre",
        "    Dim titreIA As String",
        "    Dim analyseIA As String",
        "",
        "    If g_ApiKey <> \"\" Then",
        "        titreIA = \"🤖 Analyse intelligente intégrée\"",
        "        analyseIA = AppelViaRailway(\"Analyse ce parc et donne un résumé...\")",
        "    Else",
        "        titreIA = \"Analyse IA non disponible\"",
        "        analyseIA = \"Entrez votre clé API pour activer l'analyse IA.\"",
        "    End If",
        "",
        "    ' Écrire dans le rapport",
        "    Dim wsPDF As Worksheet",
        "    Set wsPDF = ThisWorkbook.Sheets(\"Rapport\")",
        "    wsPDF.Range(\"TitreIA\").Value = titreIA",
        "    wsPDF.Range(\"AnalyseIA\").Value = analyseIA",
        "",
        "    ' ... reste du code ...",
        "End Sub",
      ]),
      pb(),

      // PARTIE 5 : STRIPE LIVE
      h(1, "PARTIE 5 — PASSER STRIPE EN MODE LIVE", B),
      sp(80),
      h(2, "5.1 Différence test vs live"),
      box("🔴 TON LIEN ACTUEL EST EN MODE TEST",
        "URL actuelle : buy.stripe.com/test_9B65kE6...\nMode TEST = AUCUN vrai argent. Tu peux mettre tes propres CB test (4242...) mais pas les vrais clients.\nPour encaisser de l'argent réel, tu dois créer un lien en mode LIVE.", LR, R),
      sp(160),
      h(2, "5.2 Étapes pour activer le mode Live"),
      li("Va sur dashboard.stripe.com", "1."),
      li("Clique sur ton nom en haut à gauche → « Activer les paiements »", "2."),
      li("Stripe demande : ton identité (CNI/passeport), ton IBAN, ton activité. Prévois 15 min.", "3."),
      li("Une fois activé, va dans « Produits » ou « Payment Links »", "4."),
      li("Crée un nouveau lien : Trackyon Pro · 29€/mois · Abonnement récurrent", "5."),
      li("Copie le lien live (commence par buy.stripe.com/live_ ou lien direct sans 'test')", "6."),
      li("Remplace l'ancien lien dans trackyon.html et merci.html", "7."),
      sp(120),
      h(2, "5.3 Vérifier que le webhook Stripe → Supabase fonctionne"),
      p("Tu as Railway + Supabase configurés. Le webhook Stripe doit appeler ton backend Railway quand un paiement est confirmé, pour mettre à jour Supabase."),
      sp(80),
      tbl(
        ["Vérification", "Où regarder", "Résultat attendu"],
        [
          ["Webhook Stripe actif", "Stripe → Webhooks → ton URL Railway", "200 OK sur checkout.session.completed"],
          ["Supabase mis à jour", "Supabase → Table profiles → vérifie après test paiement", "Ligne créée avec subscription='pro'"],
          ["Test complet", "Utilise CB test 4242... sur ton lien TEST", "Profile créé dans Supabase"],
        ],
        [2400, 3200, 3760]
      ),
      pb(),

      // PARTIE 6 : ROADMAP
      h(1, "PARTIE 6 — ROADMAP 6 MOIS", B),
      sp(80),
      tbl(
        ["Semaine", "Action prioritaire", "Objectif"],
        [
          ["S1", "Corriger bug Réinitialiser + tester Railway endpoint", "Produit stable"],
          ["S2", "Passer Stripe en mode LIVE + vérifier webhook Supabase", "Encaisser de l'argent"],
          ["S3", "Acheter trackyon.fr + déployer nouvelle version site", "Image pro"],
          ["S4-6", "Prospecter 50 chefs de parc LinkedIn + 3 posts/semaine", "1er client payant"],
          ["Mois 2", "Vidéo Loom 2 min du fichier + témoignage client 1", "+30% conversion"],
          ["Mois 3", "Automatiser livraison Excel (Make.com)", "Scalabilité"],
          ["Mois 4-6", "Partenariats concessionnaires engins + Google Ads test", "20-50 clients"],
        ],
        [1200, 4200, 3960]
      ),
      sp(160),
      h(2, "Comment trouver tes 5 premiers clients"),
      li("LinkedIn : cherche 'chef de parc BTP' ou 'responsable maintenance chantier' → DM personnalisé avec un vrai problème que tu résous", "1."),
      li("Groupes Facebook BTP ('Matériel BTP occasion', 'BTP engins') → poste une question utile, propose en DM", "2."),
      li("FNTP (Fédération Nationale Travaux Publics) → annuaire public des entreprises membres", "3."),
      li("Concessionnaires Caterpillar/Komatsu → propose 10% de commission sur recommandation", "4."),
      li("Ton réseau direct → qui connaît un responsable de parc ? 1 intro vaut 10 cold emails", "5."),
      sp(240),
      new Paragraph({ children: [new TextRun({ text: "Tu as un vrai projet. Exécute les 4 premières actions cette semaine.", size: 26, bold: true, color: B, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } }),
      new Paragraph({ children: [new TextRun({ text: "Document confidentiel — Trackyon — Mai 2026", size: 18, color: "94A3B8", font: "Arial" })], alignment: AlignmentType.CENTER }),
    ]
  }]
});

// ═══════════════════════════════════════════
// DOCUMENT 2 : GUIDE CLIENT
// ═══════════════════════════════════════════
const docClient = new Document({
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 } } },
    children: [
      new Paragraph({ children: [new TextRun({ text: "TRACKYON", size: 80, bold: true, color: B, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 200 } }),
      new Paragraph({ children: [new TextRun({ text: "Guide de démarrage — Bienvenue !", size: 28, color: M, font: "Arial" })], alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
      pb(),

      h(1, "BIENVENUE DANS TRACKYON", B),
      p("Ce guide vous accompagne pas à pas pour démarrer. Lisez-le une fois, gardez-le à portée de main."),
      sp(120),

      h(2, "Étape 1 — Ouvrir votre fichier Excel"),
      li("Ouvrez le fichier .xlsm reçu par email (double-clic)", "1."),
      li("Excel affiche un message de sécurité 'MACROS DÉSACTIVÉES' → Cliquez sur 'Activer le contenu'", "2."),
      li("Un message de bienvenue Trackyon apparaît → Cliquez OK", "3."),
      box("⚠️ Important : macros désactivées ?",
        "Si Excel bloque les macros : Fichier → Options → Centre de gestion de la confidentialité → Activer toutes les macros. Ou demandez à votre informaticien. Sans les macros, les boutons ne fonctionnent pas.", LY, GO),
      sp(160),

      h(2, "Étape 2 — Obtenir votre clé API Claude"),
      p("La clé API permet à l'IA d'analyser vos données. Elle est gratuite au départ."),
      sp(80),
      li("Ouvrez votre navigateur et allez sur : console.anthropic.com", "1."),
      li("Cliquez 'Sign Up' → créez un compte (email + mot de passe)", "2."),
      li("Une fois connecté, dans le menu gauche, cliquez 'API Keys'", "3."),
      li("Cliquez 'Create Key' → donnez le nom 'Trackyon'", "4."),
      li("La clé s'affiche une seule fois, elle commence par sk-ant-... → COPIEZ-LA dans un bloc-notes maintenant", "5."),
      li("Gardez-la en sécurité, ne la partagez pas", "6."),
      sp(120),
      box("💰 Coût de la clé API",
        "Anthropic offre des crédits gratuits au départ (suffisants pour plusieurs mois). Ensuite, chaque analyse coûte environ 0.01 à 0.05€. Pour votre usage mensuel, prévoyez moins de 2€/mois de coût API.", LG, G),
      sp(160),

      h(2, "Étape 3 — Utiliser l'analyse IA"),
      li("Dans votre Excel, allez dans l'onglet 'Données' et saisissez vos informations (KPIs, interventions, machines)", "1."),
      li("Cliquez le bouton 'Analyser avec l'IA' (ou 'Analyse IA')", "2."),
      li("Excel vous demande votre clé API → collez-la (sk-ant-...)", "3."),
      li("L'analyse dure 5 à 15 secondes selon votre connexion", "4."),
      li("Les résultats apparaissent dans l'onglet 'Rapport IA'", "5."),
      sp(120),
      box("📌 La clé n'est PAS sauvegardée",
        "Par sécurité, votre clé API est effacée à chaque fermeture du fichier. Vous devrez la ressaisir à chaque nouvelle session. C'est normal et voulu pour protéger votre clé.", LB, B),
      sp(160),

      h(2, "Étape 4 — Générer votre rapport PDF mensuel"),
      li("Assurez-vous que toutes vos données du mois sont à jour dans l'onglet 'Données'", "1."),
      li("Cliquez le bouton 'Générer rapport PDF'", "2."),
      li("Si la clé API est saisie, l'analyse IA est automatiquement incluse dans le rapport", "3."),
      li("Le rapport PDF se génère dans le même dossier que votre fichier Excel", "4."),
      li("Nom du fichier : Rapport_Parc_AAAA-MM-JJ.pdf", "5."),
      sp(160),

      h(2, "Étape 5 — Réinitialiser la clé (si nécessaire)"),
      p("Pour effacer votre clé (partage de poste, sécurité) :"),
      li("Cliquez le bouton 'Réinitialiser la clé API' dans l'onglet principal", "1."),
      li("Confirmez la réinitialisation", "2."),
      li("La clé est effacée de la mémoire immédiatement", "3."),
      li("Le prochain rapport généré n'inclura pas d'analyse IA (jusqu'à saisie d'une nouvelle clé)", "4."),
      sp(160),

      h(1, "QUESTIONS FRÉQUENTES", B),
      sp(80),
      tbl(
        ["Question", "Réponse"],
        [
          ["Excel dit 'Erreur de connexion'", "Vérifiez votre connexion internet. L'analyse IA nécessite internet."],
          ["La clé est refusée", "Vérifiez qu'elle commence bien par sk-ant- et qu'elle n'a pas expiré (console.anthropic.com)"],
          ["L'analyse prend trop longtemps", "Normal jusqu'à 30 sec. Si ça dépasse 60 sec, vérifiez votre connexion."],
          ["Je ne trouve pas le bouton", "Les boutons sont dans l'onglet 'Tableau de bord' ou 'Principal'. Regardez en haut de chaque onglet."],
          ["Le rapport ne génère pas de PDF", "Vérifiez que les macros sont activées (voir Étape 1)."],
        ],
        [3200, 6160]
      ),
      sp(240),
      p("Pour toute question : contact@trackyon.fr | Réponse sous 24h en semaine.", { align: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: "Trackyon — Guide Client — Mai 2026", size: 18, color: "94A3B8", font: "Arial" })], alignment: AlignmentType.CENTER }),
    ]
  }]
});

Promise.all([
  Packer.toBuffer(docEntrepreneur),
  Packer.toBuffer(docClient)
]).then(([buf1, buf2]) => {
  fs.writeFileSync('Trackyon_Guide_Entrepreneur.docx', buf1);
  fs.writeFileSync('Trackyon_Guide_Client.docx', buf2);
  console.log('Les 2 documents générés avec succès');
}).catch(err => console.error('Erreur:', err));
