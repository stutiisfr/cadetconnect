const express = require('express');
const router = express.Router();

// Knowledge Base for CadetConnect AI Assistant (Veer AI)
const DEFENCE_KNOWLEDGE_BASE = {
  ssb: [
    "In SSB Stage I PPDT (Picture Perception & Discussion Test), observe the background, number of characters, mood, and age within 30 seconds. Write a positive, realistic, and action-oriented story focused on problem-solving within 3 minutes.",
    "The 15 Officer Like Qualities (OLQs) evaluated in SSB are divided into 4 Factors: Factor I (Effective Intelligence, Reasoning, Organizing Ability, Power of Expression), Factor II (Social Adaptability, Cooperation, Sense of Responsibility), Factor III (Initiative, Self-Confidence, Speed of Decision, Resourcefulness), Factor IV (Determination, Courage, Stamina).",
    "For GTO Ground Tasks, always look for natural levers, fulcrums, and support structures (planks, ropes, wooden logs). Maintain high team enthusiasm and never break GTO rules (Color rule, Distance rule, Rigidity rule)."
  ],
  ncc: [
    ".22 Deluxe Rifle Specifications: Calibre .22 inch, Length 43 inches, Weight 6 Lbs 2 Oz, Magazine Capacity 05 rounds, Muzzle Velocity 2700 ft/sec, Effective Range 25 yards.",
    "7.62mm SLR (Self Loading Rifle) Specifications: Calibre 7.62mm, Weight 4.4 kg (empty mag) / 5.1 kg (full mag), Effective Range 275m (300 yds), Magazine Capacity 20 rounds, Rate of Fire: Normal 5 rds/min, Rapid 20 rds/min.",
    "5.56mm INSAS Rifle Specifications: Calibre 5.56mm, Weight 3.6 kg (empty mag), Effective Range 400m, Mode of Fire: Single Shot & 3 Round Burst (TRB), Magazine Capacity 20 rounds.",
    "Foot Drill Cadence: Quick March cadence is 120 paces/min (116 for NCC boys, 110 for NCC girls), Slow March is 70 paces/min, Double Time is 180 paces/min. Pace length in quick march is 30 inches."
  ],
  exams: [
    "UPSC CDS Exam Pattern: Written exam consists of English (100 marks), General Knowledge (100 marks), and Elementary Mathematics (100 marks) for IMA, INA, AFA. OTA candidates appear for English and GK only.",
    "UPSC NDA Exam Pattern: Mathematics (300 marks, 120 questions) and General Ability Test (GAT) (600 marks, 150 questions comprising English & General Science)."
  ]
};

// Interactive AI Chat Assistant Endpoint
router.post('/chat', (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const q = message.toLowerCase();
    let reply = "";

    if (q.includes('ssb') || q.includes('interview') || q.includes('ppdt') || q.includes('tat') || q.includes('wat') || q.includes('gto') || q.includes('olq')) {
      reply = `Jai Hind! Regarding SSB & Officer Selection:\n\n• ${DEFENCE_KNOWLEDGE_BASE.ssb[0]}\n\n• ${DEFENCE_KNOWLEDGE_BASE.ssb[1]}\n\n💡 Pro Tip: Focus on authentic leadership, self-awareness, and team cooperation in group tasks.`;
    } else if (q.includes('.22') || q.includes('rifle') || q.includes('slr') || q.includes('insas') || q.includes('weapon') || q.includes('firing')) {
      reply = `Jai Hind! Here are official weapon specifications for NCC Cadets:\n\n1. ${DEFENCE_KNOWLEDGE_BASE.ncc[0]}\n2. ${DEFENCE_KNOWLEDGE_BASE.ncc[1]}\n3. ${DEFENCE_KNOWLEDGE_BASE.ncc[2]}\n\n🎯 Range Safety Rule: Keep the muzzle pointing in a safe direction at all times!`;
    } else if (q.includes('drill') || q.includes('savdhan') || q.includes('vishram') || q.includes('march') || q.includes('cadence')) {
      reply = `Jai Hind! Drill & Ceremonial Standards:\n\n• ${DEFENCE_KNOWLEDGE_BASE.ncc[3]}\n\n• Drill builds implicit obedience to orders, smartness in turnout, and unit esprit-de-corps. Keep knees braced and shoulders square in Savdhan!`;
    } else if (q.includes('cds') || q.includes('nda') || q.includes('afcat') || q.includes('capf') || q.includes('exam') || q.includes('syllabus')) {
      reply = `Jai Hind! Defence Written Examination Guidance:\n\n• ${DEFENCE_KNOWLEDGE_BASE.exams[0]}\n\n• ${DEFENCE_KNOWLEDGE_BASE.exams[1]}\n\n📚 Check out the Defence Knowledge Hub on CadetConnect for free peer-reviewed PDF notes & cheat sheets!`;
    } else if (q.includes('camp') || q.includes('rdc') || q.includes('catc') || q.includes('tsc') || q.includes('certificate')) {
      reply = `Jai Hind! NCC Camps & Certificate Info:\n\n• C-Certificate exam eligibility requires 75% attendance in 3rd year SD/SW training + 2 ATCs (or 1 ATC + 1 Centrally Organised Camp like RDC, TSC, or EBSB).\n\n• Bonus Marks: 'C' Certificate holders get direct entry to SSB for Army (100 seats/yr OTA), Navy (6 seats/course), and Air Force (10% seats), skipping written exams!`;
    } else {
      reply = `Jai Hind! I am Veer AI, your CadetConnect Defence & NCC Assistant.\n\nI can guide you on:\n1. SSB Interview Preparation (PPDT, TAT, WAT, GTO, OLQs)\n2. NCC Syllabus & Weapon Specs (.22, SLR, INSAS, Drill)\n3. Written Exam Strategy (CDS, NDA, AFCAT, CAPF)\n4. Camp Selection (CATC, RDC, TSC, EBSB)\n5. Physical Fitness & Obstacle Course\n\nHow can I help you today?`;
    }

    return res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
