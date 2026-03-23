import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { enrichTarotCard } from "./esotericData.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotOutputPath = path.resolve(__dirname, "../tarot_knowledge_system.json");
const runtimeOutputPath = path.resolve(__dirname, "../src/data/cards.json");

const sources = [
  {
    name: "The Pictorial Key to the Tarot",
    author: "A. E. Waite",
    role: "Primary source for original RWS card symbolism and divinatory baseline.",
    url: "https://sacred-texts.com/tarot/pkt/index.htm"
  },
  {
    name: "Seventy-Eight Degrees of Wisdom",
    author: "Rachel Pollack",
    role: "High-weight synthesis source for archetypal structure, suit-number interaction, and reading philosophy.",
    url: "https://redwheelweiser.com/book/seventy-eight-degrees-of-wisdom-9781578636655/"
  },
  {
    name: "A Complete Guide to the Tarot",
    author: "Eden Gray",
    role: "Classic RWS learning source for suit identity, numerology framing, and Fool's Journey teaching model.",
    url: "https://media.s-bol.com/3932LOP1L2OR/original.pdf"
  },
  {
    name: "Tarot Summary Charts",
    author: "Joan Bunning",
    role: "Established education reference for suit qualities, pairings, and accessible consensus meanings.",
    url: "https://www.learntarot.com/charts.htm"
  },
  {
    name: "Reading Tarot Reversals",
    author: "Bonnie Cehovet / Aeclectic Tarot",
    role: "Cross-reference for reversal modeling beyond simple opposition, drawing on Joan Bunning and Mary K. Greer.",
    url: "https://www.aeclectic.net/tarot/blog/reading-reversals.shtml"
  }
];

const numberMeanings = {
  0: "Unformed potential, freedom, openness, and the state before commitment.",
  1: "Seed, origin, concentrated force, and the first assertion of identity.",
  2: "Polarity, exchange, pairing, choice, and the need to balance forces.",
  3: "Growth, expression, multiplication, and first visible development.",
  4: "Structure, order, protection, stability, and consolidation.",
  5: "Disruption, friction, test, loss, or destabilizing change that forces adaptation.",
  6: "Adjustment, harmony, reciprocity, recovery, and rebalancing after disturbance.",
  7: "Challenge, assertion, strategy, faith, and the need to hold a position.",
  8: "Power, discipline, movement, refinement, and sustained application of force.",
  9: "Culmination, maturity, attainment, and the inward or solitary phase before closure.",
  10: "Completion, consequence, overflow, and the threshold where one cycle becomes another."
};

const courtMeanings = {
  page: "Threshold figure: message, study, beginner's awareness, and emergent embodiment of the suit.",
  knight: "Pursuing figure: motion, mission, appetite, and forceful enactment of the suit.",
  queen: "Inner mastery: receptive authority, depth, containment, and mature internal expression of the suit.",
  king: "Outer mastery: executive authority, stewardship, command, and mature external expression of the suit."
};

const suitPhilosophy = {
  wands: {
    element: "fire",
    domain: "will, vitality, creativity, confidence, initiative, enterprise",
    shadow: "impulsiveness, ego inflation, burnout, conflict for its own sake",
    logic: "Wands show how life-force wants to move. In progression they run from spark, vision, and expansion into victory, pressure, burden, then embodied leadership in the courts.",
    progression: [
      "Ace: ignition",
      "Two: vision and planning",
      "Three: enterprise and expansion",
      "Four: stabilized joy and homecoming",
      "Five: contest and friction",
      "Six: recognition and victory",
      "Seven: defense of position",
      "Eight: acceleration",
      "Nine: resilience",
      "Ten: burdened completion",
      "Page: new call",
      "Knight: pursuit",
      "Queen: charismatic mastery",
      "King: visionary command"
    ]
  },
  cups: {
    element: "water",
    domain: "emotion, attachment, intuition, imagination, relationship, receptivity",
    shadow: "dependency, fantasy, emotional excess, avoidance, sentimentality",
    logic: "Cups show how feeling binds, nourishes, idealizes, grieves, and matures. Their sequence moves from emotional opening into attachment, disappointment, healing, and emotional sovereignty.",
    progression: [
      "Ace: emotional opening",
      "Two: mutual bond",
      "Three: communal joy",
      "Four: withdrawal and reassessment",
      "Five: grief and regret",
      "Six: tenderness and memory",
      "Seven: fantasy and projection",
      "Eight: meaningful departure",
      "Nine: satisfaction",
      "Ten: shared emotional fulfillment",
      "Page: tender message",
      "Knight: romantic pursuit",
      "Queen: empathic mastery",
      "King: emotional stewardship"
    ]
  },
  swords: {
    element: "air",
    domain: "mind, speech, truth, analysis, conflict, decision, mental pressure",
    shadow: "overthinking, cruelty, alienation, anxiety, self-defeat, distortion",
    logic: "Swords show what the mind cuts apart and clarifies. Their sequence moves from idea and decision into conflict, strategy, restriction, crisis, and finally lucid authority.",
    progression: [
      "Ace: clarity and decision",
      "Two: stalemate",
      "Three: painful truth",
      "Four: recovery through pause",
      "Five: hollow conflict",
      "Six: transition",
      "Seven: strategy and evasion",
      "Eight: mental restriction",
      "Nine: anxiety",
      "Ten: collapse and ending",
      "Page: vigilance",
      "Knight: forceful action",
      "Queen: lucid boundary",
      "King: principled command"
    ]
  },
  pentacles: {
    element: "earth",
    domain: "body, work, money, health, craft, stability, material manifestation",
    shadow: "stagnation, scarcity, possessiveness, overcontrol, materialism",
    logic: "Pentacles show how value becomes tangible. Their sequence moves from seed and exchange into craft, possession, hardship, reciprocity, cultivation, fruition, and legacy.",
    progression: [
      "Ace: material seed",
      "Two: adaptive balance",
      "Three: craftsmanship",
      "Four: possession and control",
      "Five: hardship",
      "Six: reciprocity",
      "Seven: patient assessment",
      "Eight: disciplined skill",
      "Nine: cultivated independence",
      "Ten: legacy and continuity",
      "Page: practical study",
      "Knight: steady labor",
      "Queen: resourceful nurture",
      "King: stable stewardship"
    ]
  }
};

const majorArcanaProgression = [
  "0 The Fool: raw potential steps into lived experience.",
  "1 The Magician: will and skill become available.",
  "2 The High Priestess: inner knowledge and hidden law are encountered.",
  "3 The Empress: life becomes fertile, sensual, and generative.",
  "4 The Emperor: order, boundary, and social power take form.",
  "5 The Hierophant: tradition, doctrine, and collective meaning are learned.",
  "6 The Lovers: values must be chosen and aligned.",
  "7 The Chariot: will is directed toward victory through discipline.",
  "8 Strength: instinct is mastered through gentleness, not domination.",
  "9 The Hermit: truth is sought inwardly and deliberately.",
  "10 Wheel of Fortune: the seeker meets cyclical change and contingency.",
  "11 Justice: consequences, truth, and ethical balance must be faced.",
  "12 The Hanged Man: control is suspended so perspective can invert.",
  "13 Death: necessary ending clears the way for transformation.",
  "14 Temperance: opposites are blended into living balance.",
  "15 The Devil: attachment, appetite, and false bondage are exposed.",
  "16 The Tower: false structures break under reality.",
  "17 The Star: renewal, faith, and orientation return.",
  "18 The Moon: uncertainty, projection, and deep psyche must be navigated.",
  "19 The Sun: vitality, clarity, and full visibility emerge.",
  "20 Judgement: awakening, reckoning, and answering the call occur.",
  "21 The World: the cycle resolves in integration, completion, and readiness for renewal."
];

const minorProgressionRules = {
  ace_to_ten: "Read the minors as a developmental arc inside each suit: Ace is the pure seed, Two tests balance, Three expands, Four stabilizes, Five disrupts, Six restores or harmonizes, Seven defends or strategizes, Eight intensifies through motion or discipline, Nine culminates, and Ten shows completion, saturation, or burden.",
  ten_to_court: "After Ten, the energy becomes personified. The courts show how the suit is learned, pursued, embodied, and governed in human character.",
  cross_suit_pattern: "Cards with the same number across suits share structural logic but express it through different elements. For example, all Fives destabilize, but Wands fight, Cups grieve, Swords fracture, and Pentacles suffer materially."
};

const reversalLogic = {
  core_rule: "Reversals are modeled as altered energy states, not automatic opposites.",
  modes: [
    "blocked: the card's function is obstructed or not yet available",
    "internalized: the energy is real but operating inwardly, privately, or psychologically",
    "delayed: the process has started but is not fully expressed in time or form",
    "misdirected: the energy is active but pointed at the wrong target or used badly",
    "excessive_or_deficient: the card overcompensates or underfunctions instead of balancing"
  ],
  application_rules: [
    "Majors reversed usually indicate a lesson resisted, deferred, or inwardly activated.",
    "Minors reversed usually show the suit and number pattern breaking down in practical life.",
    "Courts reversed often describe distorted relational style, immature embodiment, or a difficult person dynamic.",
    "Context still governs: supportive surrounding cards can show a reversal being processed rather than simply failing."
  ]
};

const relationshipRules = {
  similar_cards:
    "Similar cards share either structural stage, archetypal charge, or a closely allied mode of expression. For pips this is weighted toward same-number resonance in non-opposite suits; for courts it is same-rank resonance; for majors it is thematic kinship.",
  contrasting_cards:
    "Contrasting cards are not enemies; they show corrective, opposing, or tension-bearing energies. For minors this is modeled through elemental opposition and opposite developmental stage inside the same suit. For majors it is hand-curated thematic counterforce.",
  transitional_cards:
    "Transitional cards show sequence logic. Majors follow the Fool's Journey in a cyclical loop. Minors follow Ace through Ten, then Page, Knight, Queen, King, then cycle back to Ace.",
  reading_use:
    "When a card appears with its similar cards, the theme is reinforced. When it appears with contrasting cards, interpretation should look for friction, compensation, or course correction. Transitional cards identify what stage is ending and what stage is emerging."
};

const systemLevelRules = [
  "Prioritize Waite for image symbolism, Pollack for system logic, and Gray for classic teaching consensus.",
  "Major Arcana describe archetypal or destiny-weighted processes; Minor Arcana describe day-to-day expression of those forces.",
  "Suit tells you the life domain; number tells you the stage of development; rank tells you how that energy is personified.",
  "When cards repeat a suit, the reading is concentrated in that domain. When numbers repeat across suits, a structural theme is repeating in different areas of life.",
  "Cards are relational: read same-number echoes, elemental tensions, and sequential movement before treating meanings as isolated keywords.",
  "Wands and Pentacles often form a fire-earth tension between inspiration and practicality; Cups and Swords often form a water-air tension between feeling and analysis.",
  "Aces are opportunities, not guarantees. Tens are full consequences, not always happy endings.",
  "Pages announce or begin learning; Knights intensify; Queens deepen and contain; Kings direct and stabilize.",
  "A Major next to a Minor often explains why the smaller event matters; several Majors together indicate a reading driven by larger life transitions.",
  "Card dignity is modified by neighboring cards: supportive cards help expression, challenging cards show cost, pressure, or distortion."
];

const majorRows = [
  [0, "The Fool", "Open potential seeking experience.", "Leap, trust, experiment, and enter life with curiosity.", "Recklessness, drift, fear of commitment, or a blocked beginning.", ["beginnings", "freedom", "faith", "risk"], ["cliff edge", "white rose", "small dog"], "Seeker", "Entry point before structure; pure possibility meets the world.", ["reckless leap", "refusal to begin", "immaturity", "misread innocence"]],
  [1, "The Magician", "Directed will turns potential into action.", "Use tools, focus intention, and act with skill.", "Manipulation, scattered will, hollow display, or unused talent.", ["will", "skill", "manifestation", "agency"], ["raised wand", "table of suit tools", "lemniscate"], "Adept", "The first focused expression of selfhood and agency.", ["misdirected power", "trickery", "underused ability", "ego inflation"]],
  [2, "The High Priestess", "Inner knowing guards hidden truth.", "Pause, listen inwardly, and trust what is not yet visible.", "Blocked intuition, secrecy, passivity, or disconnection from inner knowledge.", ["intuition", "mystery", "silence", "depth"], ["veil and pillars", "crescent moon", "scroll"], "Oracle", "Polarity held in stillness; knowledge ripens before action.", ["suppressed intuition", "withheld truth", "confusion", "passive avoidance"]],
  [3, "The Empress", "Life grows through nurture, beauty, and abundance.", "Create, receive, nourish, and let growth become fertile.", "Smothering, creative block, emptiness, or misused abundance.", ["fertility", "nurture", "sensuality", "growth"], ["wheat field", "Venus shield", "crown of stars"], "Mother", "Expansion becomes generative, embodied, and abundant.", ["overgiving", "stagnant comfort", "neglected creation", "dependency"]],
  [4, "The Emperor", "Order, structure, and authority create stability.", "Set boundaries, lead clearly, and establish durable form.", "Rigidity, domination, brittle control, or refusal to lead.", ["structure", "authority", "boundary", "order"], ["stone throne", "ram heads", "orb and scepter"], "Ruler", "Structure stabilizes the previous fertility into law and form.", ["tyranny", "avoidance of responsibility", "overcontrol", "inflexibility"]],
  [5, "The Hierophant", "Tradition transmits meaning through shared systems.", "Learn from lineage, ritual, mentorship, and tested wisdom.", "Dogma, rebellion without grounding, empty conformity, or bad counsel.", ["tradition", "teaching", "ritual", "belief"], ["triple crown", "acolytes", "crossed keys"], "Teacher", "Disruption to private identity comes through social and spiritual law.", ["rigid doctrine", "hollow rebellion", "misguidance", "spiritual bypass"]],
  [6, "The Lovers", "Union depends on conscious alignment of values.", "Choose with integrity, bond deeply, and bring desire into harmony with truth.", "Misalignment, fractured union, temptation, or avoidance of real choice.", ["union", "choice", "alignment", "values"], ["angel over couple", "tree of knowledge", "mountain"], "Beloved", "Harmony comes through chosen alignment, not passive attraction.", ["divided values", "unhealthy attachment", "avoidant choice", "projected desire"]],
  [7, "The Chariot", "Victory comes from disciplined direction of will.", "Commit, steer opposing drives, and advance with control.", "Loss of control, scattered effort, aggression, or stalled momentum.", ["willpower", "victory", "discipline", "control"], ["chariot", "black and white sphinxes", "city behind"], "Victor", "Challenge is met through focused movement and command.", ["misdirected ambition", "collapse of control", "forced movement", "defensive overdrive"]],
  [8, "Strength", "Gentle courage masters raw instinct.", "Lead with composure, patience, and heart-centered resilience.", "Self-doubt, repression, forcefulness, or inability to regulate instinct.", ["courage", "compassion", "resilience", "self-mastery"], ["woman and lion", "lemniscate", "garland"], "Tamer", "Power is refined through inner steadiness rather than domination.", ["cowardice", "coercion", "emotional leakage", "misread softness"]],
  [9, "The Hermit", "Solitude clarifies wisdom and direction.", "Withdraw, examine, and seek truth with patience.", "Isolation, avoidance, cynicism, or refusal to listen inwardly.", ["solitude", "wisdom", "guidance", "search"], ["lantern", "staff", "mountaintop"], "Sage", "Culmination turns inward; wisdom is distilled before the next turn.", ["withdrawal as escape", "alienation", "stalled search", "withheld guidance"]],
  [10, "Wheel of Fortune", "Life turns through cycles beyond full control.", "Recognize change, timing, and the turning of circumstance.", "Resistance to change, bad timing, fatalism, or clinging to a passing phase.", ["cycles", "change", "fate", "turning point"], ["turning wheel", "sphinx", "four creatures"], "Wheel-Turner", "Completion of one phase initiates another through change.", ["stuck cycle", "misread timing", "avoidance of change", "chaotic repetition"]],
  [11, "Justice", "Reality asks for truth, proportion, and accountability.", "Assess fairly, tell the truth, and accept consequences.", "Bias, evasion, unfairness, or refusal to face cause and effect.", ["justice", "truth", "balance", "accountability"], ["scales", "sword upright", "red robe"], "Judge", "Balance restores order after the wheel's change.", ["self-justification", "dishonesty", "imbalanced judgment", "avoiding consequences"]],
  [12, "The Hanged Man", "Release of control opens a new perspective.", "Surrender, pause, and allow meaning to invert before acting.", "Martyrdom, pointless suspension, delay without insight, or resistance to letting go.", ["surrender", "pause", "reversal", "insight"], ["inverted figure", "halo", "living tree"], "Sacrifice", "Progress halts so perception can change.", ["stagnation", "performative sacrifice", "fear of release", "stuck limbo"]],
  [13, "Death", "Transformation arrives through necessary ending.", "Let a chapter end so life can renew itself.", "Refusal to release, prolonged decay, fear of change, or partial transformation.", ["ending", "transformation", "release", "renewal"], ["skeletal rider", "fallen figures", "rising sun"], "Transformer", "Old form must die before integration is possible.", ["clinging", "delayed ending", "morbid fixation", "half-measures"]],
  [14, "Temperance", "Healing comes through measured integration.", "Blend, moderate, adapt, and create flow between opposites.", "Imbalance, excess, impatience, or fragmented healing.", ["balance", "healing", "integration", "moderation"], ["angel pouring cups", "iris flowers", "path to crown"], "Alchemist", "Opposites become workable through patient blending.", ["overcorrection", "misblending", "impatience", "disordered rhythm"]],
  [15, "The Devil", "Bondage persists where desire rules without consciousness.", "Name the attachment, shadow, or compulsion that keeps power chained.", "Release from bondage, denial of shadow, or being secretly ruled by appetite.", ["bondage", "temptation", "shadow", "compulsion"], ["horned figure", "loose chains", "inverted torch"], "Binder", "Material fixation tests all prior development.", ["hidden addiction", "projected shadow", "power games", "refusal to see complicity"]],
  [16, "The Tower", "False structures collapse under truth.", "Breakthrough, revelation, and necessary disruption clear what cannot stand.", "Avoided collapse, internal upheaval, denial, or controlled demolition instead of catastrophe.", ["upheaval", "revelation", "collapse", "liberation"], ["lightning strike", "falling crown", "figures cast out"], "Shatterer", "A rigid structure breaks so reality can re-enter.", ["postponed breakdown", "controlled rupture", "willful blindness", "fear of revelation"]],
  [17, "The Star", "Hope returns through openness, guidance, and replenishment.", "Trust renewal, healing, and the long arc of restoration.", "Discouragement, spiritual dryness, overidealizing, or difficulty trusting renewal.", ["hope", "healing", "guidance", "renewal"], ["naked figure pouring water", "large star", "bird in tree"], "Guide", "After rupture, meaning and orientation quietly return.", ["loss of faith", "private healing", "naive optimism", "delayed recovery"]],
  [18, "The Moon", "The path runs through ambiguity, dream, and projection.", "Respect uncertainty, intuition, and what the conscious mind cannot master directly.", "Confusion lifting, hidden fear, self-deception, or distortion mistaken for intuition.", ["uncertainty", "dream", "illusion", "subconscious"], ["moonlight path", "dog and wolf", "crayfish"], "Dreamer", "Clarity is tested by shadow, image, and instinctive fear.", ["anxiety spiral", "false intuition", "suppressed fear", "unclear signals"]],
  [19, "The Sun", "Life becomes visible, vital, and affirmed.", "Enjoy clarity, confidence, joy, and full exposure of what is true.", "Temporary dimming, inflated optimism, burnout after success, or difficulty receiving joy.", ["clarity", "joy", "vitality", "success"], ["child on white horse", "sunflowers", "walled garden"], "Child of Light", "What was uncertain becomes obvious and life-giving.", ["ego glare", "denied joy", "short-lived success", "overexposure"]],
  [20, "Judgement", "The soul is called to awaken and answer.", "Review honestly, forgive, rise, and respond to vocation or truth.", "Self-doubt, refusal of the call, harsh self-judgment, or unfinished reckoning.", ["awakening", "reckoning", "calling", "renewal"], ["angel trumpet", "rising figures", "open coffins"], "Awakened One", "The near-final stage where the past is reinterpreted and answered.", ["avoided calling", "guilt loop", "fear of rebirth", "delayed absolution"]],
  [21, "The World", "Completion integrates all parts into wholeness.", "Finish, integrate, and inhabit earned mastery.", "Incomplete closure, fragmentation, fear of ending, or difficulty entering the next cycle.", ["completion", "integration", "wholeness", "mastery"], ["dancing figure", "laurel wreath", "four creatures"], "Integrated Self", "Completion returns the seeker to a new beginning with consciousness.", ["unfinished cycle", "fear of completion", "scattered integration", "withheld arrival"]]
];

const pipRows = {
  wands: [
    [1, "Ace of Wands", "Creative force breaks into action.", "Inspiration, initiative, erotic spark, and bold beginning.", "Stalled start, scattered drive, creative frustration, or misfired impulse.", ["spark", "initiative", "desire", "potential"], ["hand from cloud", "sprouting wand", "distant castle"], "Spark", "Fire enters the world as raw ignition.", ["false start", "burnout before launch", "blocked desire", "impulsive move"]],
    [2, "Two of Wands", "Will becomes vision, range, and planning.", "Expand the horizon, claim agency, and plan from a position of power.", "Fear of the larger world, timid planning, or power without action.", ["planning", "vision", "power", "expansion"], ["globe", "battlement", "fixed and held staffs"], "Explorer", "The spark pauses to survey possibilities.", ["hesitation", "contained ambition", "overplanning", "fear of expansion"]],
    [3, "Three of Wands", "Enterprise moves from vision into outward growth.", "Expect progress, launch, trade, and widening results.", "Delayed expansion, poor foresight, or plans that do not yet carry.", ["expansion", "enterprise", "foresight", "progress"], ["figure on cliff", "ships at sea", "three planted wands"], "Merchant", "Fire becomes outward movement and venture.", ["delayed ships", "limited horizon", "scattered expansion", "weak follow-through"]],
    [4, "Four of Wands", "Energy stabilizes in celebration and safe structure.", "Celebrate milestones, enjoy welcome, and stabilize joy through community.", "Unstable home base, tension inside celebration, or difficulty landing success.", ["celebration", "homecoming", "stability", "community"], ["garlanded canopy", "two celebrants", "castle"], "Host", "Achievement becomes shared structure and ritualized joy.", ["hollow celebration", "domestic strain", "failure to ground success", "excluded belonging"]],
    [5, "Five of Wands", "Fire meets fire as contest, friction, and testing.", "Compete, spar, refine, and prove capacity through challenge.", "Chaotic conflict, ego clashes, pointless drama, or avoidance of healthy contest.", ["competition", "friction", "testing", "struggle"], ["five raised staves", "uncoordinated fighters", "open ground"], "Competitor", "Stability breaks into friction that reveals strength and ego.", ["needless conflict", "suppressed anger", "disorganization", "competitive insecurity"]],
    [6, "Six of Wands", "Effort earns visible recognition and momentum.", "Victory, praise, public success, and confidence backed by results.", "Fragile ego, hollow praise, delayed recognition, or fear of exposure after success.", ["victory", "recognition", "confidence", "momentum"], ["laurelled rider", "wreath-topped wand", "attending crowd"], "Victor", "Contest resolves in recognition and restored order.", ["vanity", "imposter syndrome", "withheld credit", "public setback"]],
    [7, "Seven of Wands", "A gained position must now be defended.", "Hold your ground, protect advantage, and resist pressure.", "Exhaustion, defensiveness, loss of nerve, or being overwhelmed by challenge.", ["defense", "assertion", "perseverance", "pressure"], ["high ground", "single defender", "six wands below"], "Defender", "Success creates new pressure to justify or preserve it.", ["overdefensiveness", "collapse of resolve", "feeling besieged", "poor boundaries"]],
    [8, "Eight of Wands", "Fire accelerates into swift movement and delivery.", "Rapid developments, messages, momentum, and clean forward motion.", "Delays, crossed signals, scattered haste, or action without coordination.", ["speed", "movement", "message", "momentum"], ["flying wands", "open sky", "empty landscape"], "Messenger", "Energy moves too fast to stay theoretical.", ["delay", "haste errors", "miscommunication", "chaotic movement"]],
    [9, "Nine of Wands", "Resilience holds after repeated strain.", "Stay alert, protect what matters, and endure the final stretch.", "Paranoia, fatigue, guardedness, or inability to trust after past struggle.", ["resilience", "persistence", "guardedness", "endurance"], ["wounded guard", "palisade of wands", "bandaged head"], "Sentinel", "Near culmination demands vigilance and memory of past conflict.", ["defensive isolation", "burnout", "hypervigilance", "reluctance to continue"]],
    [10, "Ten of Wands", "Success becomes load, duty, and overextension.", "Carry responsibility, finish the push, and confront what has become too much.", "Collapse under burden, martyrdom, refusal to delegate, or delayed release of pressure.", ["burden", "responsibility", "overload", "completion"], ["bent figure", "bundle of ten wands", "destination ahead"], "Bearer", "The suit completes in saturation: fire is productive but heavy.", ["self-imposed load", "resentment", "refusal of help", "blocked completion"]]
  ],
  cups: [
    [1, "Ace of Cups", "Feeling opens as grace, love, and receptivity.", "Emotional renewal, intimacy, compassion, and spiritual openness.", "Emotional blockage, withheld affection, numbness, or overwhelmed feeling.", ["love", "openness", "grace", "feeling"], ["overflowing cup", "dove", "lotus-filled water"], "Open Heart", "Water enters as pure receptivity and blessing.", ["emotional shutoff", "spillage", "unreceived love", "inward ache"]],
    [2, "Two of Cups", "Emotion becomes mutual exchange and chosen bond.", "Reciprocity, attraction, partnership, and emotional accord.", "Imbalance, misattunement, shallow agreement, or relational blockage.", ["union", "partnership", "reciprocity", "attraction"], ["joined cups", "caduceus", "lion's head"], "Partner", "Feeling reflects itself in another and creates mutuality.", ["one-sided bond", "misattunement", "fear of closeness", "delayed union"]],
    [3, "Three of Cups", "Shared feeling grows into friendship and celebration.", "Community joy, reunion, creative fellowship, and emotional support.", "Excess, gossip, exclusion, or strained social harmony.", ["friendship", "celebration", "community", "support"], ["three dancers", "raised cups", "fruit underfoot"], "Celebrant", "Relationship expands outward into social belonging.", ["social excess", "triangulation", "loneliness in company", "forced cheer"]],
    [4, "Four of Cups", "Emotion turns inward and disengages from what is offered.", "Contemplate, reassess desire, and notice what apathy is hiding.", "Re-engagement, emotional restlessness, self-absorption, or missed opportunity.", ["apathy", "contemplation", "withdrawal", "reassessment"], ["seated figure", "three grounded cups", "offered cup from cloud"], "Withdrawn One", "Feeling stabilizes by turning inward, sometimes too far.", ["stagnation", "missed offer", "inner resistance", "emotional sulking"]],
    [5, "Five of Cups", "Loss narrows vision toward what has gone.", "Grieve honestly, acknowledge disappointment, and face emotional fact.", "Stuck grief, refusal to mourn, bitterness, or delayed recovery.", ["loss", "grief", "regret", "mourning"], ["cloaked mourner", "spilled cups", "bridge and standing cups"], "Mourner", "Emotional disruption is felt as absence and regret.", ["grief loop", "resentment", "denial of sadness", "difficulty moving on"]],
    [6, "Six of Cups", "The heart restores itself through innocence, memory, and kindness.", "Nostalgia, tenderness, generosity, and restorative connection.", "Living in the past, sentimental distortion, immaturity, or unable to receive sweetness now.", ["nostalgia", "kindness", "memory", "innocence"], ["children exchanging flowers", "six flowered cups", "courtyard"], "Rememberer", "After grief, the suit heals through softness and recall.", ["sentimental fixation", "regressive longing", "rose-tinted memory", "withheld comfort"]],
    [7, "Seven of Cups", "Feeling and desire multiply into fantasy and projection.", "Imagine widely, but choose carefully among alluring possibilities.", "Confusion clearing, fantasy trap, wishful thinking, or inability to commit.", ["fantasy", "choice", "projection", "temptation"], ["cloud of cups", "strange visions", "single observer"], "Dreamer", "The heart is tested by imagination and desire without grounding.", ["illusion", "overchoice", "escapism", "fear of reality"]],
    [8, "Eight of Cups", "Emotional truth requires leaving what no longer satisfies.", "Walk away, seek deeper meaning, and refuse hollow fulfillment.", "Avoidance of necessary departure, drifting return, or private longing without action.", ["departure", "search", "disillusionment", "meaning"], ["figure leaving", "stacked cups", "moonlit mountains"], "Seeker of Meaning", "Water moves onward when previous satisfaction proves incomplete.", ["fear of leaving", "emotional limbo", "return to emptiness", "suppressed dissatisfaction"]],
    [9, "Nine of Cups", "Desire reaches satisfaction and personal pleasure.", "Enjoy fulfillment, gratitude, comfort, and earned emotional abundance.", "Overindulgence, smugness, dissatisfaction beneath comfort, or pleasure that does not nourish.", ["satisfaction", "pleasure", "contentment", "wish"], ["seated host", "nine arranged cups", "curtain backdrop"], "Wish-Fulfiller", "The suit culminates in felt abundance and personal enjoyment.", ["hollow pleasure", "greed", "performative contentment", "unmet deeper need"]],
    [10, "Ten of Cups", "Feeling completes as harmony, belonging, and shared blessing.", "Domestic happiness, aligned relationship, and emotional completion in community.", "Idealization cracking, family strain, or longing for harmony not yet fully lived.", ["harmony", "family", "blessing", "fulfillment"], ["rainbow", "couple and children", "ten cups in sky"], "Blessed Family", "Water overflows into collective emotional wholeness.", ["idealized family", "emotional facade", "broken harmony", "delayed fulfillment"]]
  ],
  swords: [
    [1, "Ace of Swords", "Truth cuts through confusion with decisive clarity.", "Insight, decision, clear communication, and intellectual breakthrough.", "Clouded thinking, harshness, indecision, or truth used as a weapon.", ["clarity", "truth", "decision", "breakthrough"], ["crowned sword", "hand from cloud", "mountain peaks"], "Clarifier", "Air enters as sharp discernment and naming power.", ["mental fog", "cutting words", "blocked decision", "false certainty"]],
    [2, "Two of Swords", "The mind suspends action to maintain balance.", "Pause, weigh, and hold tension until a real decision becomes possible.", "Deadlock, avoidance, denial, or information kept out to preserve peace.", ["stalemate", "balance", "decision", "truce"], ["blindfolded figure", "crossed swords", "calm sea"], "Balancer", "Thought holds opposing forces in temporary equilibrium.", ["avoidance", "self-blinding", "indecision", "suppressed truth"]],
    [3, "Three of Swords", "Truth wounds when separation becomes undeniable.", "Heartbreak, sorrow, rupture, and painful but clarifying reality.", "Lingering pain, emotional avoidance, private grief, or slow healing.", ["sorrow", "heartbreak", "truth", "separation"], ["pierced heart", "three swords", "storm clouds"], "Wounded Heart", "Mental insight becomes pain when it severs attachment.", ["grief suppression", "reopened wound", "private anguish", "resentment"]],
    [4, "Four of Swords", "The mind stabilizes through retreat and recovery.", "Rest, recuperate, meditate, and step out of conflict.", "Restlessness, burnout, avoidance disguised as rest, or refusal to pause.", ["rest", "recovery", "retreat", "stillness"], ["recumbent knight", "three swords above", "church setting"], "Retreater", "Thought regains order only by ceasing activity for a time.", ["burnout", "stalled recovery", "anxious stillness", "premature reentry"]],
    [5, "Five of Swords", "Conflict turns hollow when victory costs too much.", "See the real price of domination, ego combat, and scorched-earth thinking.", "Resentment, shame after conflict, refused accountability, or lingering hostility.", ["conflict", "defeat", "ego", "aftermath"], ["smirking victor", "fallen swords", "departing figures"], "Pyrrhic Victor", "Air destabilizes through egoic conflict and fractured trust.", ["dirty fighting", "humiliation", "private bitterness", "escalating hostility"]],
    [6, "Six of Swords", "Thought seeks calmer water after strain.", "Transition, recovery, relocation, and moving toward mental stability.", "Inability to move on, dragging the past forward, or delayed transition.", ["transition", "recovery", "movement", "passage"], ["boat crossing water", "hooded passengers", "six upright swords"], "Ferryman", "Conflict gives way to necessary passage and distance.", ["stuck transition", "unfinished healing", "reluctant departure", "mental baggage"]],
    [7, "Seven of Swords", "Mind turns strategic, secretive, or evasive.", "Use strategy, tact, and discretion; do not mistake them for clean transparency.", "Self-deception, exposed deceit, poor strategy, or avoidance of honest confrontation.", ["strategy", "secrecy", "deception", "tactics"], ["figure stealing swords", "camp behind", "two swords left"], "Trickster", "Thought tests boundaries through cunning rather than force.", ["exposed lie", "self-sabotage", "miscalculation", "avoidant tactics"]],
    [8, "Eight of Swords", "The mind becomes trapped in its own limiting frame.", "Recognize restriction, fear narratives, and the role of perception in confinement.", "Release, perspective shift, or else deeper paralysis and helplessness.", ["restriction", "fear", "limitation", "entrapment"], ["bound figure", "circle of swords", "marshy ground"], "Captive", "Air intensifies into immobilizing mental structure.", ["self-imprisonment", "learned helplessness", "private panic", "difficulty seeing options"]],
    [9, "Nine of Swords", "Thought reaches torment, anxiety, and sleepless distress.", "Face fear directly and separate real threat from anticipatory suffering.", "Inner crisis, shame spiral, hidden despair, or gradual relief after panic peaks.", ["anxiety", "nightmare", "distress", "guilt"], ["figure in bed", "hands to face", "nine swords on wall"], "Night-Watcher", "Near culmination, the mind turns against itself.", ["panic loop", "private anguish", "obsessive guilt", "slow easing"]],
    [10, "Ten of Swords", "A mental cycle ends in collapse, finality, or total exposure.", "Accept the ending, stop resisting what is over, and look for the dawn beyond ruin.", "Recovery beginning, refusal to admit the end, or repeatedly reenacting collapse.", ["ending", "collapse", "finality", "release"], ["fallen figure", "ten swords", "black sky and dawn"], "Ended One", "The suit completes when thinking can go no further and must end.", ["dragged-out ending", "victim identity", "avoided finality", "private recovery"]]
  ],
  pentacles: [
    [1, "Ace of Pentacles", "Material potential enters as seed, offer, and opportunity.", "New resources, health, work, and practical openings with real growth potential.", "Missed opportunity, poor grounding, delayed material start, or insecurity about investment.", ["opportunity", "seed", "resources", "grounding"], ["hand from cloud", "single pentacle", "garden path"], "Seed", "Earth begins as tangible possibility and investable value.", ["missed chance", "hesitant investment", "poor grounding", "stalled manifestation"]],
    [2, "Two of Pentacles", "Value must be balanced through adaptation and timing.", "Juggle priorities, stay flexible, and keep material systems moving.", "Disorganization, poor timing, financial stress, or imbalance from overhandling.", ["balance", "adaptation", "juggling", "timing"], ["juggler", "infinity loop", "ships on rough sea"], "Juggler", "Earth remains alive by staying in motion rather than freezing.", ["mismanagement", "overcommitment", "instability", "timing strain"]],
    [3, "Three of Pentacles", "Skill grows through collaboration and visible craft.", "Work well, learn from others, and build something competently.", "Poor teamwork, shoddy execution, or recognition not matching effort.", ["craft", "teamwork", "skill", "construction"], ["artisan at work", "cathedral arch", "three collaborators"], "Craftsperson", "Material growth becomes structured work and shared production.", ["lack of coordination", "mediocre work", "ignored skill", "misaligned standards"]],
    [4, "Four of Pentacles", "Security hardens into holding and control.", "Protect assets, conserve energy, and define what is worth keeping.", "Greed, fear-based hoarding, loosened control, or instability around possession.", ["security", "control", "possession", "conservation"], ["figure clutching coin", "two coins under feet", "city behind"], "Holder", "Earth stabilizes by gathering and containing resources.", ["hoarding", "scarcity fear", "loss of grip", "rigidity"]],
    [5, "Five of Pentacles", "Material strain exposes need, exclusion, and hardship.", "Name lack clearly, seek help, and survive the lean passage.", "Recovery delayed, refusal of support, scarcity mindset, or deepening disorder.", ["hardship", "need", "exclusion", "scarcity"], ["snowstorm", "two travelers", "lit church window"], "Outcast", "Earth destabilizes as lack, cold, and visible deprivation.", ["martyr stance", "rejected help", "chronic scarcity thinking", "material chaos"]],
    [6, "Six of Pentacles", "Value rebalances through giving, receiving, and fair exchange.", "Practice generosity, equitable support, and realistic reciprocity.", "Strings-attached giving, dependence, inequality, or blocked assistance.", ["charity", "exchange", "support", "fairness"], ["scales", "wealthy giver", "two recipients"], "Patron", "Material imbalance is corrected through circulation and measure.", ["power imbalance", "resentful dependence", "miserliness", "performative giving"]],
    [7, "Seven of Pentacles", "Growth requires patience, assessment, and sustained labor.", "Review progress, tend the process, and accept delayed harvest.", "Impatience, poor return, neglected cultivation, or frustration with slow growth.", ["patience", "assessment", "cultivation", "results"], ["gardener leaning on tool", "pentacles on vine", "pause in field"], "Cultivator", "Earth tests faith by making value ripen slowly.", ["impatience", "discouraged effort", "bad investment", "premature harvest"]],
    [8, "Eight of Pentacles", "Mastery comes through repetition, focus, and honest workmanship.", "Apprenticeship, diligence, skill-building, and practical concentration.", "Perfectionism, drudgery, sloppy work, or going through motions without mastery.", ["diligence", "apprenticeship", "mastery", "focus"], ["artisan carving coins", "bench and tools", "repeated pentacles"], "Apprentice", "Earth intensifies as disciplined labor and refinement.", ["busywork", "burnout", "perfectionism", "loss of craft pride"]],
    [9, "Nine of Pentacles", "Self-sufficiency culminates in cultivated abundance.", "Enjoy earned stability, refined independence, and material confidence.", "Isolation behind comfort, overcontrol, or insecurity hidden by polish.", ["abundance", "independence", "refinement", "self-sufficiency"], ["woman in vineyard", "falcon", "lush garden"], "Steward", "Near culmination, earth becomes elegant sufficiency.", ["loneliness in luxury", "image maintenance", "fear of dependence", "withheld enjoyment"]],
    [10, "Ten of Pentacles", "Material life completes as legacy, lineage, and durable wealth.", "Long-term security, inheritance, family systems, and established continuity.", "Unstable legacy, family fracture, empty status, or resources without cohesion.", ["legacy", "wealth", "lineage", "stability"], ["archway scene", "elder with dogs", "family beneath ten coins"], "Ancestor", "Earth completes in continuity that outlives the individual.", ["inheritance conflict", "hollow prestige", "family instability", "fragile security"]]
  ]
};

const courtRows = {
  wands: [
    ["page", "Page of Wands", "A new call to action arrives as message or enthusiasm.", "Curiosity, news, experiment, and youthful creative daring.", "False start, scattered enthusiasm, unreliable news, or immaturity around passion.", ["message", "curiosity", "enthusiasm", "venture"], ["desert plain", "leaf-sprouting staff", "youthful messenger"], "Herald", "Wands becomes personified as a beginner willing to explore.", ["flightiness", "reckless messaging", "empty hype", "fear of trying"]],
    ["knight", "Knight of Wands", "Passion becomes movement, pursuit, and bold risk.", "Act decisively, travel, chase the mission, and bring heat to the field.", "Impulsiveness, arrogance, burnout, or action that outruns wisdom.", ["action", "adventure", "passion", "risk"], ["rearing horse", "flaming tunic", "raised wand"], "Crusader", "The suit charges forward in concentrated fire.", ["rash action", "swagger without depth", "restlessness", "burned bridges"]],
    ["queen", "Queen of Wands", "Charisma and self-possession radiate warm authority.", "Lead confidently, attract allies, and embody creative courage.", "Jealousy, insecurity masked by bravado, or overcontrolling social energy.", ["confidence", "charisma", "warmth", "authority"], ["sunflower", "black cat", "wand in hand"], "Sovereign Flame", "Fire is mastered inwardly and expressed with steady magnetism.", ["performative confidence", "territoriality", "attention hunger", "hidden self-doubt"]],
    ["king", "King of Wands", "Vision becomes command, enterprise, and mature leadership.", "Direct energy strategically, inspire others, and lead from conviction.", "Domineering leadership, impatience, arrogance, or vision without listening.", ["leadership", "vision", "enterprise", "command"], ["salamanders", "lion throne", "flowering wand"], "Visionary King", "The suit reaches outward mastery and executive fire.", ["authoritarian heat", "ego leadership", "overpromising", "poor delegation"]]
  ],
  cups: [
    ["page", "Page of Cups", "Feeling appears as invitation, imagination, and tender message.", "Open to emotional news, intuition, apology, or creative sensitivity.", "Emotional immaturity, mixed signals, fantasy, or avoiding direct feeling.", ["message", "sensitivity", "intuition", "openness"], ["fish in cup", "blue tunic", "shoreline"], "Dreaming Messenger", "Cups becomes personified as fresh feeling and imagination.", ["wishful messaging", "emotional awkwardness", "avoidant sincerity", "immature sensitivity"]],
    ["knight", "Knight of Cups", "Emotion pursues connection, beauty, and meaningful offering.", "Romance, invitation, idealism, and movement guided by feeling.", "Moodiness, seduction without depth, disappointment, or drifting on ideals.", ["romance", "invitation", "idealism", "quest"], ["white horse", "offered cup", "flowing river"], "Romantic Seeker", "Water goes outward in pursuit of a feeling-led ideal.", ["performative romance", "escapist longing", "inconsistent feeling", "disillusioned pursuit"]],
    ["queen", "Queen of Cups", "Empathy and intuition become mature emotional wisdom.", "Listen deeply, care wisely, and trust refined emotional perception.", "Emotional enmeshment, self-pity, manipulation through sensitivity, or porous boundaries.", ["empathy", "intuition", "compassion", "depth"], ["lidded cup", "sea throne", "water all around"], "Sea Oracle", "Water is mastered inwardly as receptivity and emotional intelligence.", ["absorption", "sentimentality", "covert influence", "boundary loss"]],
    ["king", "King of Cups", "Feeling becomes stable stewardship and calm authority.", "Remain composed, compassionate, and emotionally responsible under pressure.", "Emotional distance, hidden volatility, or using calmness to control others.", ["composure", "diplomacy", "compassion", "stability"], ["stone throne at sea", "cup and scepter", "ship and fish"], "Steady Heart", "The suit reaches outward mastery through emotional regulation.", ["emotional withholding", "passive control", "flood under the surface", "avoidant authority"]]
  ],
  swords: [
    ["page", "Page of Swords", "Mind wakes as vigilance, inquiry, and restless observation.", "Ask questions, study closely, and stay mentally alert.", "Gossip, nervousness, suspicion, or information gathered without wisdom.", ["curiosity", "alertness", "inquiry", "watchfulness"], ["raised sword", "windy sky", "uneven ground"], "Scout", "Swords becomes personified as quick intellect and alert perception.", ["mental agitation", "paranoia", "immature argument", "loose talk"]],
    ["knight", "Knight of Swords", "Thought turns into forceful charge and uncompromising action.", "Move decisively, speak directly, and cut through delay.", "Reckless aggression, verbal violence, or acting faster than understanding.", ["drive", "speed", "assertion", "force"], ["charging horse", "storm clouds", "leaning sword"], "Blade Runner", "Air accelerates into confrontational motion.", ["rash speech", "combative mind", "bulldozing", "careless speed"]],
    ["queen", "Queen of Swords", "Discernment becomes clear boundary and honest judgment.", "See precisely, speak cleanly, and protect truth with maturity.", "Bitterness, overcritical distance, coldness, or pain hardened into intellect.", ["discernment", "clarity", "boundary", "truth"], ["raised hand", "cloud throne", "single upright sword"], "Truth-Keeper", "The suit is mastered inwardly as lucid discrimination.", ["cynicism", "cutting speech", "hypercriticism", "detached hurt"]],
    ["king", "King of Swords", "Mind reaches principled command and disciplined judgment.", "Lead through reason, standards, analysis, and fair structure.", "Tyrannical logic, detached severity, or intellect divorced from humanity.", ["authority", "reason", "law", "judgment"], ["butterflies", "clear sky", "upright sword"], "Lawgiver", "The suit reaches outward mastery as ordered intellect and governance.", ["ruthless logic", "dogmatic intellect", "cold authority", "misuse of rules"]]
  ],
  pentacles: [
    ["page", "Page of Pentacles", "Practical opportunity appears as study, application, and real potential.", "Learn, plan carefully, and invest attention in what can grow.", "Laziness, poor follow-through, or potential left unrealized.", ["study", "opportunity", "focus", "application"], ["figure gazing at pentacle", "green field", "mountains"], "Student of Matter", "Pentacles becomes personified as grounded curiosity and tangible promise.", ["wasted potential", "poor planning", "ungrounded study", "slow start"]],
    ["knight", "Knight of Pentacles", "Work becomes steady duty, persistence, and reliability.", "Proceed methodically, honor routine, and build through consistency.", "Stagnation, rigidity, workaholism, or motion so slow it becomes avoidance.", ["diligence", "routine", "reliability", "persistence"], ["still horse", "held pentacle", "ploughed field"], "Laborer", "Earth moves through discipline rather than speed.", ["stuck routine", "resistance to change", "tediousness", "misplaced caution"]],
    ["queen", "Queen of Pentacles", "Care becomes practical nurture, resourcefulness, and embodied comfort.", "Manage well, protect what matters, and create grounded abundance.", "Overcontrol, smothering practicality, insecurity about resources, or neglect of self-worth.", ["resourcefulness", "nurture", "comfort", "stability"], ["rabbit", "carved throne", "pentacle in lap"], "Earth Mother", "The suit is mastered inwardly as generative stewardship.", ["smothering care", "material anxiety", "overmanaging", "self-neglect"]],
    ["king", "King of Pentacles", "Material life reaches mature stewardship, stability, and responsibility.", "Lead through reliability, long-term thinking, and sound provision.", "Greed, stagnation, possessiveness, or authority built only on wealth.", ["stewardship", "security", "prosperity", "responsibility"], ["bull motifs", "vine-covered throne", "large pentacle"], "Steward King", "Earth reaches outward mastery through durable provision and command.", ["materialism", "rigid comfort", "ownership obsession", "static leadership"]]
  ]
};

const majorRelationshipMap = {
  "The Fool": { similar: ["The Star", "Page of Cups", "Ace of Wands"], contrasting: ["The Emperor", "Four of Pentacles", "The World"] },
  "The Magician": { similar: ["Ace of Wands", "Ace of Swords", "The Chariot"], contrasting: ["The High Priestess", "Seven of Cups", "The Hanged Man"] },
  "The High Priestess": { similar: ["Queen of Cups", "The Moon", "Ace of Cups"], contrasting: ["The Magician", "Knight of Swords", "The Sun"] },
  "The Empress": { similar: ["Queen of Pentacles", "Ten of Cups", "Three of Cups"], contrasting: ["The Hermit", "Five of Pentacles", "Death"] },
  "The Emperor": { similar: ["King of Wands", "King of Pentacles", "Four of Wands"], contrasting: ["The Fool", "Seven of Cups", "The Tower"] },
  "The Hierophant": { similar: ["Justice", "King of Swords", "Three of Pentacles"], contrasting: ["The Lovers", "Five of Wands", "The Devil"] },
  "The Lovers": { similar: ["Two of Cups", "Ten of Cups", "The Empress"], contrasting: ["The Devil", "Two of Swords", "Five of Swords"] },
  "The Chariot": { similar: ["Knight of Wands", "Six of Wands", "The Magician"], contrasting: ["The Hanged Man", "Four of Swords", "Eight of Swords"] },
  "Strength": { similar: ["Queen of Wands", "Nine of Wands", "Temperance"], contrasting: ["The Tower", "Knight of Swords", "Five of Wands"] },
  "The Hermit": { similar: ["Four of Swords", "Eight of Cups", "Queen of Swords"], contrasting: ["The Sun", "Three of Cups", "The Empress"] },
  "Wheel of Fortune": { similar: ["Two of Pentacles", "Judgement", "The World"], contrasting: ["Four of Pentacles", "The Emperor", "Ten of Wands"] },
  "Justice": { similar: ["King of Swords", "Six of Pentacles", "The Hierophant"], contrasting: ["Seven of Cups", "The Moon", "Five of Swords"] },
  "The Hanged Man": { similar: ["Four of Swords", "Eight of Cups", "The High Priestess"], contrasting: ["The Chariot", "Knight of Wands", "The Magician"] },
  "Death": { similar: ["Ten of Swords", "Eight of Cups", "Judgement"], contrasting: ["Four of Pentacles", "The Devil", "Six of Cups"] },
  "Temperance": { similar: ["Two of Cups", "Six of Pentacles", "Strength"], contrasting: ["The Tower", "Five of Wands", "Knight of Wands"] },
  "The Devil": { similar: ["Seven of Cups", "Five of Swords", "Four of Pentacles"], contrasting: ["The Lovers", "Temperance", "Strength"] },
  "The Tower": { similar: ["Ten of Swords", "Five of Wands", "Death"], contrasting: ["Temperance", "Four of Wands", "The Emperor"] },
  "The Star": { similar: ["Ace of Cups", "Six of Cups", "The Fool"], contrasting: ["Five of Pentacles", "The Moon", "Nine of Swords"] },
  "The Moon": { similar: ["Seven of Cups", "Queen of Cups", "The High Priestess"], contrasting: ["The Sun", "Justice", "Ace of Swords"] },
  "The Sun": { similar: ["Six of Wands", "Ten of Cups", "The World"], contrasting: ["The Moon", "Five of Cups", "The Hermit"] },
  "Judgement": { similar: ["Death", "Wheel of Fortune", "Ace of Swords"], contrasting: ["Four of Cups", "Nine of Swords", "The Devil"] },
  "The World": { similar: ["Ten of Pentacles", "The Sun", "Wheel of Fortune"], contrasting: ["The Fool", "Eight of Swords", "Five of Pentacles"] }
};

const suitOpposites = {
  wands: "pentacles",
  pentacles: "wands",
  cups: "swords",
  swords: "cups"
};

const suitTitles = {
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pentacles"
};

const contrastPairs = {
  1: 10,
  2: 7,
  3: 8,
  4: 5,
  5: 4,
  6: 9,
  7: 2,
  8: 3,
  9: 6,
  10: 1,
  page: "king",
  knight: "queen",
  queen: "knight",
  king: "page"
};

const courtMajorAffinity = {
  page: "The Fool",
  knight: "The Chariot",
  queen: "The High Priestess",
  king: "The Emperor"
};

const pipTitles = {
  1: "Ace",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten"
};

const compoundMajorNumerology = {
  11: "11 -> 2: balance amplified into ethical judgment, truth, and accountability.",
  12: "12 -> 3: growth arrives through surrender, inversion, and altered perspective.",
  13: "13 -> 4: transformation destroys old form so a truer structure can emerge.",
  14: "14 -> 5: change is disciplined into moderation, healing, and integration.",
  15: "15 -> 6: desire and attachment test what relationship and value really mean.",
  16: "16 -> 7: crisis tests integrity, exposing what cannot be defended.",
  17: "17 -> 8: hope becomes sustaining spiritual power and replenishment.",
  18: "18 -> 9: the deep psyche, fear, and solitude appear near culmination.",
  19: "19 -> 10: joy, visibility, and vitality mark a cycle at full expression.",
  20: "20 -> 2: awakening answers a call and rebalances the whole life.",
  21: "21 -> 3: integrated completion expands into wholeness and renewed possibility."
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pipCardName(number, suit) {
  return `${pipTitles[number]} of ${suitTitles[suit]}`;
}

function majorNumerologyText(number) {
  return number <= 10 ? `${number}: ${numberMeanings[number]}` : compoundMajorNumerology[number];
}

function makeMajorCard(row, previousName, nextName) {
  const [number, name, core, upright, reversed, keywords, symbolism, archetype, development, reversalModes] = row;
  return {
    name,
    arcana: "major",
    suit: null,
    number,
    core_meaning: core,
    upright,
    reversed,
    keywords,
    symbolism,
    archetype,
    numerology: majorNumerologyText(number),
    interpretation_patterns: {
      developmental_role: development,
      system_links: [
        `Fool's Journey stage ${number}.`,
        `Major Arcana express archetypal pressure more than ordinary circumstance.`,
        `Card is read as a life lesson, threshold, or fate-weighted turning point before it is read as a mood.`
      ],
      reversal_modes: reversalModes
    },
    relationships: {
      similar_cards: majorRelationshipMap[name].similar,
      contrasting_cards: majorRelationshipMap[name].contrasting,
      transitional_cards: {
        previous: previousName ? [previousName] : [],
        next: nextName ? [nextName] : []
      }
    }
  };
}

function makePipCard(suit, row, sequence) {
  const [number, name, core, upright, reversed, keywords, symbolism, archetype, development, reversalModes] = row;
  const oppositeSuit = suitOpposites[suit];
  const oppositeNumber = contrastPairs[number];
  const sameNumberAcrossSuits = Object.keys(pipRows)
    .filter((s) => s !== suit && s !== oppositeSuit)
    .map((s) => pipCardName(number, s));
  const previousIndex = sequence.findIndex((entry) => entry === name) - 1;
  const nextIndex = sequence.findIndex((entry) => entry === name) + 1;
  return {
    name,
    arcana: "minor",
    suit,
    number,
    core_meaning: core,
    upright,
    reversed,
    keywords,
    symbolism,
    archetype,
    numerology: `${number}: ${numberMeanings[number]}`,
    interpretation_patterns: {
      developmental_role: development,
      system_links: [
        `${suitTitles[suit]} govern ${suitPhilosophy[suit].domain}.`,
        `Number ${number} contributes the structural pattern of ${numberMeanings[number].toLowerCase()}`,
        "Read the card as the suit's domain passing through this numbered stage."
      ],
      reversal_modes: reversalModes
    },
    relationships: {
      similar_cards: [...sameNumberAcrossSuits, majorRows.find((major) => major[0] === number)?.[1]].filter(Boolean),
      contrasting_cards: [
        pipCardName(oppositeNumber, suit),
        pipCardName(number, oppositeSuit)
      ],
      transitional_cards: {
        previous: previousIndex >= 0 ? [sequence[previousIndex]] : [sequence[sequence.length - 1]],
        next: nextIndex < sequence.length ? [sequence[nextIndex]] : [sequence[0]]
      }
    }
  };
}

function makeCourtCard(suit, row, sequence) {
  const [rank, name, core, upright, reversed, keywords, symbolism, archetype, development, reversalModes] = row;
  const oppositeSuit = suitOpposites[suit];
  const oppositeRank = contrastPairs[rank];
  const sameRankAcrossSuits = Object.keys(courtRows)
    .filter((s) => s !== suit && s !== oppositeSuit)
    .map((s) => `${capitalize(rank)} of ${suitTitles[s]}`);
  const previousIndex = sequence.findIndex((entry) => entry === name) - 1;
  const nextIndex = sequence.findIndex((entry) => entry === name) + 1;
  return {
    name,
    arcana: "minor",
    suit,
    number: rank,
    core_meaning: core,
    upright,
    reversed,
    keywords,
    symbolism,
    archetype,
    numerology: `${capitalize(rank)}: ${courtMeanings[rank]}`,
    interpretation_patterns: {
      developmental_role: development,
      system_links: [
        `${suitTitles[suit]} govern ${suitPhilosophy[suit].domain}.`,
        `${capitalize(rank)} indicates ${courtMeanings[rank].toLowerCase()}`,
        "Court cards can indicate a person, a role, or a mode of behaving toward the suit's problem."
      ],
      reversal_modes: reversalModes
    },
    relationships: {
      similar_cards: [...sameRankAcrossSuits, courtMajorAffinity[rank]],
      contrasting_cards: [`${capitalize(oppositeRank)} of ${suitTitles[suit]}`, `${capitalize(rank)} of ${suitTitles[oppositeSuit]}`],
      transitional_cards: {
        previous: previousIndex >= 0 ? [sequence[previousIndex]] : [sequence[sequence.length - 1]],
        next: nextIndex < sequence.length ? [sequence[nextIndex]] : [sequence[0]]
      }
    }
  };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const majorCards = majorRows.map((row, index) =>
  makeMajorCard(
    row,
    majorRows[index - 1]?.[1] ?? majorRows[majorRows.length - 1][1],
    majorRows[index + 1]?.[1] ?? majorRows[0][1]
  )
);

const minorCards = Object.entries(pipRows).flatMap(([suit, rows]) => {
  const sequence = [
    ...rows.map((row) => row[1]),
    ...courtRows[suit].map((row) => row[1])
  ];
  const pips = rows.map((row) => makePipCard(suit, row, sequence));
  const courts = courtRows[suit].map((row) => makeCourtCard(suit, row, sequence));
  return [...pips, ...courts];
});

const cards = [...majorCards, ...minorCards].map((card) =>
  enrichTarotCard({
    ...card,
    slug: slugify(card.name),
  }),
);

if (cards.length !== 78) {
  throw new Error(`Expected 78 cards, got ${cards.length}`);
}

const dataset = {
  metadata: {
    deck: "Rider-Waite-Smith Tarot",
    version: "1.0.0",
    generated_on: "2026-03-22",
    synthesis_method:
      "Cross-referenced synthesis prioritizing Waite for symbolism, Pollack for system structure, Eden Gray for classic teaching consensus, and established tarot education sources for reversal and suit-pattern clarification.",
    conflict_resolution:
      "When sources diverged, meanings were normalized toward broad RWS consensus and system coherence rather than rare fortune-telling edge cases.",
    sources
  },
  system_level_rules: systemLevelRules,
  suit_philosophy: suitPhilosophy,
  number_meanings: {
    ...numberMeanings,
    major_compound_numbers: compoundMajorNumerology,
    courts: courtMeanings
  },
  reversal_logic: reversalLogic,
  relationship_rules: relationshipRules,
  progression_systems: {
    major_arcana: majorArcanaProgression,
    minor_arcana: minorProgressionRules
  },
  cards
};

const json = `${JSON.stringify(dataset, null, 2)}\n`;
fs.writeFileSync(snapshotOutputPath, json, "utf8");
fs.writeFileSync(runtimeOutputPath, json, "utf8");
console.log(`Wrote tarot knowledge system to ${snapshotOutputPath}`);
console.log(`Updated runtime tarot dataset at ${runtimeOutputPath}`);
