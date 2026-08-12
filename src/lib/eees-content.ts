// The EEES / "Which Means What" translation dictionary. Matt's proprietary
// IP per CLAUDE.md: static content in the codebase, reviewed and updated by
// him directly in source, never exposed as an admin-editable feature.
// Transcribed exactly (wording, structure) from reference-prototype.html's
// TRANSLATIONS / TEXT_FIELD_TAGS / QUOTE_PROMPTS / ACTION_FLAGS / EEES_META
// / EEES_POLICY / LEGAL_NOTE constants.
//
// Maps each reported checkbox value to an EEES tag (or tags), a
// plain-language meaning, a short set of questions to explore it together,
// and a short set of concrete adjustment ideas. Options like "None
// currently" / "No preference" are omitted deliberately, there is nothing
// to translate for a manager.

export type EeesTag = "ef" | "er" | "env" | "sen";

export interface Translation {
  tags: EeesTag[];
  meaning: string;
  questions?: string[];
  adjustments?: string[];
}

/** field key -> checkbox value -> translation. */
export const TRANSLATIONS: Record<string, Record<string, Translation>> = {
  "work-location": {
    "Quiet private space": { tags: ["env"], meaning: "Open-plan or high-traffic settings may make sustained focus harder, and can create an uneven starting point compared with colleagues less affected by noise or interruption.", questions: ["What does a typical hour in the current space feel like?", "Is it the noise, the interruptions, or something else that matters most?"], adjustments: ["A quiet room or booth for focused work, even part of the day", "A protected desk away from walkways or high-traffic areas"] },
    "Open plan but with noise management": { tags: ["env", "sen"], meaning: "Shared space can work well once noise is actively managed rather than left to chance.", questions: ["What's already helping, and what would help further?", "Is there a specific time of day or task where noise matters most?"], adjustments: ["Confirm the headphones policy explicitly", "Review desk position relative to noise sources like printers or meeting pods"] },
    "Home working": { tags: ["env"], meaning: "Home may reduce sensory load or offer more control over the environment, a legitimate reason for flexibility rather than a simple preference.", questions: ["Which days or tasks benefit most from working at home?", "Is there something specific about the office this is compensating for?"], adjustments: ["Agree a hybrid pattern reflecting when home working helps most", "Review the pattern after a few weeks rather than fixing it permanently from day one"] },
    "Fixed consistent location": { tags: ["env", "ef"], meaning: "Hot-desking adds a daily setup and decision cost on top of the work itself, which can disproportionately affect anyone who relies on routine and predictability.", questions: ["What specifically makes moving desks difficult, the setup, the unfamiliarity, something else?", "Would a reserved zone work as well as one fixed desk?"], adjustments: ["Allocate a consistent desk or zone rather than rotating", "If hot-desking can't be avoided, agree a small, predictable set of options rather than the whole floor"] },
    "Flexible/varied locations": { tags: ["env"], meaning: "Variety in location may genuinely support engagement rather than being a barrier.", questions: ["Is there anything that would make moving around even easier?"], adjustments: ["Likely no adjustment needed, just confirm this flexibility stays available"] },
  },
  "env-sensory": {
    "Lighting - natural or adjustable": { tags: ["sen"], meaning: "Fixed artificial lighting may cause discomfort or fatigue that builds across the day.", questions: ["Does it affect focus, physical comfort, or both?", "Is there a time of day it's more noticeable?"], adjustments: ["A desk near natural light", "A desk lamp instead of relying on overhead lighting"] },
    "Lighting - avoid fluorescent": { tags: ["sen"], meaning: "Fluorescent lighting can be a genuine sensory trigger, not simply a dislike.", questions: ["Is it flicker, brightness, or colour temperature that's the issue?"], adjustments: ["Alternative lighting where possible", "Repositioning away from direct overhead strips"] },
    "Temperature sensitivity": { tags: ["sen"], meaning: "Office temperature swings can be more disruptive than they appear from the outside.", questions: ["Does it affect concentration, physical comfort, or both?"], adjustments: ["A desk away from vents, windows or doors", "Explicit permission to layer clothing regardless of dress code"] },
    "Background noise": { tags: ["sen"], meaning: "Ambient noise may be actively reducing concentration, not just mild annoyance.", questions: ["Is it constant noise, sudden noise, or specific sounds that matter most?", "What's the impact on the work itself, errors, speed, fatigue?"], adjustments: ["Noise-cancelling headphones", "A quieter desk or protected focus slots away from busy periods"] },
    "Scent sensitivity": { tags: ["sen"], meaning: "Strong fragrances can cause real physical discomfort, not just mild dislike.", questions: ["Is it particular products, communal areas, or something else?"], adjustments: ["A fragrance-light area or desk placement away from shared spaces", "A general team reminder about strong scents, framed neutrally"] },
    "Crowded or busy spaces": { tags: ["sen", "env"], meaning: "Busy areas may be genuinely harder to regulate in, not just uncomfortable.", questions: ["Is it specific spaces (kitchen, lifts, entrance) or busyness generally?", "Does timing make a difference?"], adjustments: ["Adjusted timing for moving around the building", "A calmer base to return to between busy periods"] },
    "Visual clutter": { tags: ["sen"], meaning: "A visually disorganised environment can compete for attention throughout the day.", questions: ["Is it the desk itself, shared spaces, or screen-based clutter?"], adjustments: ["Support with desk organisation", "Screening off busy sightlines where practical"] },
  },
  equipment: {
    "Ergonomic seating or adjustable desk": { tags: ["env"], meaning: "Physical discomfort can quietly erode focus and energy across the day.", questions: ["Is this about a specific pain point, or general comfort over a full day?"], adjustments: ["A workstation (DSE) assessment to confirm what's needed", "Adjustable seating or a sit-stand desk, potentially funded via Access to Work"] },
    "Specialist keyboard or mouse": { tags: ["env"], meaning: "Standard input devices may cause discomfort or reduce efficiency.", questions: ["Have they tried alternatives before, and what worked or didn't?"], adjustments: ["A short trial of alternative devices before committing to a purchase"] },
    "Noise cancelling headphones": { tags: ["sen"], meaning: "Suggests auditory input is a real barrier to concentration, not a preference for music.", questions: ["Is this for open-plan noise, meetings, or both?"], adjustments: ["Provide directly if the cost is low relative to the benefit"] },
    "Larger or additional screens": { tags: ["env", "ef"], meaning: "Small or single screens can increase the effort of switching between tasks and documents.", questions: ["Which tasks make the biggest difference, side-by-side comparison, multitasking, something else?"], adjustments: ["A second monitor to reduce task-switching load"] },
    "Screen magnification": { tags: ["sen"], meaning: "Visual demands may be adding strain that isn't obvious day to day.", questions: ["Is built-in magnification enough, or is dedicated software needed?"], adjustments: ["Check OS-level magnification and contrast settings first", "Dedicated magnification software if built-in tools aren't enough"] },
    "Hearing aids or loop system": { tags: ["sen"], meaning: "May need confirmed access to induction-loop equipped meeting spaces, not just personal equipment.", questions: ["Which rooms or situations are hardest currently?"], adjustments: ["Confirm meeting rooms and reception have working loop systems", "Check this is tested periodically, not just installed once"] },
    "Mobility aids at workstation": { tags: ["env"], meaning: "Workstation layout may need adapting around physical access needs.", questions: ["What does the current layout make difficult, reach, clearance, routes?"], adjustments: ["A workplace needs assessment covering desk height, clearances and routes"] },
    "Fidget or sensory tools": { tags: ["sen", "er"], meaning: "Sensory regulation tools can support focus and reduce overwhelm.", questions: ["Are these used at a desk, in meetings, or both?"], adjustments: ["Simply allow their use at a desk and in meetings, this typically costs nothing"] },
  },
  software: {
    "Text-to-speech (e.g. Read&Write)": { tags: ["sen", "ef"], meaning: "Reading long text may take more time or effort than it appears to from the outside.", questions: ["Which types of document are hardest, long reports, dense emails, something else?"], adjustments: ["Check what's already used and whether a licence can be provided or extended organisation-wide"] },
    "Speech-to-text (e.g. Dragon)": { tags: ["ef"], meaning: "Getting thoughts into written form may be a bigger barrier than typing speed alone.", questions: ["Is this for drafting, editing, or both?"], adjustments: ["Check whether dictation tools are already licensed organisation-wide"] },
    "Screen reader (e.g. JAWS, NVDA)": { tags: ["sen"], meaning: "Suggests a significant visual access need.", questions: ["Which systems are hardest to use currently?"], adjustments: ["Confirm core systems are screen-reader compatible, this usually needs IT involved early", "Test any new software procurement for compatibility before rollout"] },
    "Mind mapping tools": { tags: ["ef"], meaning: "Linear formats like long documents may be harder to plan from than visual ones.", questions: ["Is this for personal planning, or would it help in shared/team planning too?"], adjustments: ["Let planning work happen in whatever format helps it click, not just the standard template"] },
    "Task management / reminder apps": { tags: ["ef"], meaning: "External prompts may be doing real work that memory alone can't reliably do.", questions: ["Which types of deadline or task get missed most easily?"], adjustments: ["Normalise shared reminders and calendar invites rather than relying on verbal follow-up"] },
    "Magnification software": { tags: ["sen"], meaning: "On-screen visual demands may be adding strain beyond what's obvious.", questions: ["Is this consistent, or worse for certain systems or screens?"], adjustments: ["Check display settings and dedicated magnification software are both available"] },
    "Colour overlay / tinted reading tools": { tags: ["sen"], meaning: "On-screen or printed text may be visually uncomfortable without adjustment.", questions: ["Does it affect screen reading, paper reading, or both?"], adjustments: ["Simple colour, contrast or font changes, which often help immediately and cost nothing"] },
    "AI writing or summarising tools": { tags: ["ef"], meaning: "Structuring or condensing written work may take disproportionate effort.", questions: ["Is this for drafting from scratch, or condensing existing material?"], adjustments: ["Check organisational policy so this can be used openly, not covertly"] },
  },
  travel: {
    "Reserved or accessible parking": { tags: ["env"], meaning: "Physical access to parking may affect their ability to arrive comfortably and on time.", questions: ["What's the current gap, distance, availability, or something else?"], adjustments: ["Reserved or accessible parking close to the entrance"] },
    "Flexible start or finish times": { tags: ["ef", "er"], meaning: "Fixed commute timing may add avoidable pressure before the working day even starts.", questions: ["Is it the commute itself, or the fixed time that's harder?"], adjustments: ["A flexed start or finish window that doesn't affect output"] },
    "Taxi or funded travel support": { tags: ["env"], meaning: "Standard commuting may not be practically accessible for this person.", questions: ["Would this help for the whole commute, or a specific leg of it?"], adjustments: ["Explore Access to Work funded travel support together"] },
    "Vehicle adaptations": { tags: ["env"], meaning: "Suggests a specific physical access need connected to driving or commuting.", questions: ["Has this been raised with Access to Work or occupational health already?"], adjustments: ["Likely best handled through an Access to Work or occupational health referral rather than internally"] },
    "Travel buddy or support": { tags: ["er", "env"], meaning: "Commuting alone may be a source of anxiety or practical difficulty.", questions: ["Is this about safety, confidence, or practical navigation?"], adjustments: ["Flexible arrival to align with a colleague's schedule where that helps informally"] },
    "Remote working to reduce travel": { tags: ["env"], meaning: "The commute itself may be a significant barrier, separate from the work.", questions: ["How much remote working would meaningfully reduce this?"], adjustments: ["A remote or hybrid pattern that reduces commuting days"] },
  },
  access: {
    "Step-free or lift access": { tags: ["env"], meaning: "Physical access to the building or floor needs confirming, not assuming.", questions: ["Has the actual route been walked/tested end to end recently?"], adjustments: ["Confirm accessible routes are genuinely step-free from entry to desk, not just at the main door"] },
    "Accessible toilets nearby": { tags: ["env"], meaning: "Distance to facilities may matter more than it first appears.", questions: ["Is the nearest accessible facility a reasonable distance from their usual desk?"], adjustments: ["Confirm proximity, or adjust desk location if it isn't"] },
    "Clear signage": { tags: ["env", "ef"], meaning: "Navigating an unfamiliar or complex building can add real cognitive load, especially early on.", questions: ["Is this ongoing, or mainly an issue when starting or visiting somewhere new?"], adjustments: ["A simple printed or digital wayfinding guide, especially useful for new starters or visitors"] },
    "Quiet or less busy entrance": { tags: ["sen"], meaning: "A busy entrance or reception area can be a difficult start to the working day.", questions: ["Is a quieter access point available, or would staggered arrival help instead?"], adjustments: ["A quieter access point if one exists", "A slightly staggered arrival time to avoid the busiest period"] },
    "Widened doors or adapted spaces": { tags: ["env"], meaning: "Suggests a specific physical access requirement.", questions: ["Has this been confirmed through a formal assessment yet?"], adjustments: ["Best confirmed through a workplace needs assessment for accuracy"] },
  },
  "info-receive": {
    "Written instructions or summaries": { tags: ["ef"], meaning: "Verbal-only information may not reliably land or be retained, whatever the person's ability.", questions: ["Is this mainly for tasks, meetings, or both?"], adjustments: ["Follow up key verbal points with a short written note or email as standard practice"] },
    "Verbal explanation first, then written": { tags: ["ef"], meaning: "May process better hearing something first, then having it available to refer back to.", questions: ["Is a quick verbal run-through enough, or is more detail needed before it's written up?"], adjustments: ["Combine a brief verbal explanation with written confirmation shortly after"] },
    "Bullet points and short paragraphs": { tags: ["ef"], meaning: "Dense prose may take longer to process than the same content in bullet form.", questions: ["Does this apply to emails, documents, or both?"], adjustments: ["Format instructions and updates as short bullet points where practical"] },
    "Visual diagrams or flowcharts": { tags: ["ef"], meaning: "Visual structure may be easier to follow than narrative text for processes and sequences.", questions: ["Which kinds of information would benefit most, processes, structures, timelines?"], adjustments: ["Use diagrams or flowcharts for processes wherever that's practical"] },
    "Time to read/process before discussing": { tags: ["ef", "er"], meaning: "Being asked to respond immediately may not reflect their actual thinking speed or quality of thought.", questions: ["How much lead time typically makes a difference?"], adjustments: ["Share materials in advance rather than expecting reactions in the moment"] },
    "Agenda in advance for meetings": { tags: ["ef"], meaning: "Unstructured or surprise meetings can be harder to prepare for and engage with fully.", questions: ["Is a brief list of topics enough, or is more detail needed?"], adjustments: ["Send a short agenda ahead of meetings, even an informal one"] },
    "Repeated or summarised at end": { tags: ["ef"], meaning: "Long discussions can lose their key points along the way, for anyone.", questions: ["Would a written summary afterwards help as well as a verbal one?"], adjustments: ["Close meetings with a quick summary of what's been agreed"] },
  },
  "comm-style": {
    "One to one rather than groups": { tags: ["er"], meaning: "Group settings may be harder to contribute in or process, independent of the person's knowledge or ability.", questions: ["Is it group size, unpredictability, or something specific about groups?"], adjustments: ["Offer key discussions one to one where possible, rather than in a group"] },
    "Written over verbal when possible": { tags: ["ef"], meaning: "Written channels may allow more accurate, considered communication.", questions: ["Is this for all communication, or mainly for anything important or complex?"], adjustments: ["Default to email or message for non-urgent matters"] },
    "Extra processing time in conversations": { tags: ["ef", "er"], meaning: "A pause before responding isn't disengagement, it's processing time.", questions: ["Does prompting for a quicker answer make things harder, or is silence genuinely fine?"], adjustments: ["Allow silence in conversation rather than filling it or repeating the question quickly"] },
    "Direct and literal communication": { tags: ["ef"], meaning: "Indirect language, hints, or sarcasm may not land as intended.", questions: ["Has anything been misread as blunt or rude in the past that was meant plainly?"], adjustments: ["Say what you mean plainly, it will likely be received better, not worse"] },
    "Structured meetings with clear purpose": { tags: ["ef"], meaning: "Open-ended meetings without a clear purpose can be harder to engage with productively.", questions: ["Would a stated purpose and desired outcome at the start help most meetings, or just longer ones?"], adjustments: ["State the purpose and desired outcome at the start of meetings"] },
    "BSL interpreter or relay service": { tags: ["env"], meaning: "A specific access requirement for spoken communication.", questions: ["Is current provision reliable and booked automatically, or does it need requesting each time?"], adjustments: ["Arrange as standard practice for relevant meetings, not requested fresh each time"] },
    "Notetaker in meetings": { tags: ["ef"], meaning: "Listening and writing at the same time can be very difficult to do well together.", questions: ["Would shared notes afterwards be enough, or is live notetaking needed?"], adjustments: ["Provide a notetaker, or share notes afterwards as standard"] },
  },
  interview: {
    "Questions provided in writing": { tags: ["ef"], meaning: "Verbal-only questions delivered in the moment may disadvantage strong candidates who process information differently.", questions: ["In writing, or read aloud with visible text at the same time?"], adjustments: ["Share questions in writing at the same time they're asked, or in advance"] },
    "Extra time to answer": { tags: ["ef", "er"], meaning: "Time pressure can affect performance independent of a candidate's actual ability.", questions: ["Is a fixed extra allowance enough, or does it vary by question?"], adjustments: ["Build in extra time as standard practice, not as a special favour"] },
    "Prompts to expand or clarify": { tags: ["ef"], meaning: "A short first answer may not reflect the full extent of someone's knowledge.", questions: ["Would a gentle prompt to expand usually surface more, based on past experience?"], adjustments: ["Use gentle follow-up prompts rather than moving straight on after a brief answer"] },
    "Smaller panel": { tags: ["er"], meaning: "Large panels can be harder to engage with under pressure.", questions: ["Is there a maximum panel size that tends to feel manageable?"], adjustments: ["Keep the panel small where possible, or introduce everyone clearly beforehand"] },
    "Accessible format alternative": { tags: ["ef"], meaning: "A standard interview format may not showcase this person's actual strengths.", questions: ["What format has worked well for them before, if any?"], adjustments: ["Consider a task-based or portfolio-led alternative where appropriate for the role"] },
  },
  workload: {
    "Clear written task lists": { tags: ["ef"], meaning: "Verbal or ambiguous priorities are hard to hold in mind alongside everything else already on the go.", questions: ["Is a simple ranked list enough, or is more structure needed?"], adjustments: ["Provide task lists in writing with a clear order of priority"] },
    "Deadlines broken into steps": { tags: ["ef"], meaning: "A large deadline without interim points can be overwhelming to plan backwards from.", questions: ["What size of step tends to feel manageable?"], adjustments: ["Break bigger deadlines into smaller checkpoints together, agreed in advance"] },
    "Protected time for focused work": { tags: ["ef"], meaning: "Frequent interruption may be disproportionately costly to their output compared with colleagues.", questions: ["How long a stretch of uninterrupted time tends to make the biggest difference?"], adjustments: ["Agree protected focus time where interruptions are genuinely minimised, e.g. a no-meeting block"] },
    "Regular check-ins with manager": { tags: ["ef", "er"], meaning: "Infrequent contact can let small issues drift into larger ones before anyone notices.", questions: ["Is a short, frequent check-in preferred over a longer, occasional one?"], adjustments: ["Set a short, regular check-in rather than relying on ad hoc conversations"] },
    "Consistent routines": { tags: ["ef"], meaning: "Unpredictability adds a planning cost on top of the work itself.", questions: ["Which routines matter most, meeting days, task order, something else?"], adjustments: ["Keep patterns like meeting days and formats consistent where you can"] },
    "Advance notice of changes": { tags: ["ef", "er"], meaning: "Sudden changes can be disproportionately destabilising, even when the change itself is small.", questions: ["How much notice tends to make the biggest difference?"], adjustments: ["Flag upcoming changes as early as possible, even in draft or provisional form"] },
    "Reminders and prompts": { tags: ["ef"], meaning: "Relying on memory alone for deadlines may not be reliable, regardless of effort or care.", questions: ["Do calendar invites work, or is a more direct reminder needed?"], adjustments: ["Normalise calendar invites and reminder prompts rather than assuming they'll remember"] },
    "Flexibility on how tasks are completed": { tags: ["ef"], meaning: "The method may need to flex even where the outcome doesn't.", questions: ["Which parts of the current process feel most fixed unnecessarily?"], adjustments: ["Focus conversations on outcomes, and stay open on the route to get there"] },
  },
  "exec-difficulty": {
    "Starting tasks": { tags: ["ef"], meaning: "Task initiation can be a genuine, specific barrier, separate from motivation or ability.", questions: ["Does this apply to all tasks, or mainly unfamiliar or complex ones?"], adjustments: ["Help break the very first step down into something small and concrete"] },
    "Switching between tasks": { tags: ["ef"], meaning: "Interruptions may cost more time and effort to recover from than they appear to.", questions: ["Roughly how long does it take to refocus after an interruption?"], adjustments: ["Batch similar tasks together and protect against unnecessary context-switching"] },
    "Estimating time": { tags: ["ef"], meaning: "Time estimation can be a specific, measurable difficulty rather than carelessness.", questions: ["Does this tend towards under-estimating, over-estimating, or both depending on the task?"], adjustments: ["Work out realistic time estimates together rather than relying on self-estimates alone"] },
    "Managing multiple priorities": { tags: ["ef"], meaning: "Holding several priorities at once can be harder than any of the individual tasks themselves.", questions: ["Is it the number of priorities, or the lack of clear ranking, that's harder?"], adjustments: ["Help rank priorities explicitly rather than leaving it implicit"] },
    "Remembering verbal instructions": { tags: ["ef"], meaning: "Verbal instructions without a written record may not be reliably retained.", questions: ["Is a quick written follow-up enough, or does it need to be provided at the time?"], adjustments: ["Always follow up verbal instructions with something written, even a short message"] },
    "Paperwork or admin tasks": { tags: ["ef"], meaning: "Administrative tasks can be disproportionately draining despite seeming simple from the outside.", questions: ["Is it the tasks themselves, or the way they're batched or timed?"], adjustments: ["Streamline or share the admin load on repetitive tasks where possible"] },
  },
  wellbeing: {
    "Managing energy and fatigue": { tags: ["er"], meaning: "Energy may not be evenly available across the day or week, which affects timing as much as workload.", questions: ["Is there a pattern to when energy is higher or lower?"], adjustments: ["Flex timing or pacing of demanding work around higher-energy periods where possible"] },
    "Managing stress or anxiety": { tags: ["er"], meaning: "Day-to-day stress may be a bigger factor in performance than it appears from the outside.", questions: ["What tends to raise stress most, workload, uncertainty, something else?"], adjustments: ["Check in periodically as a matter of course, not only when something visibly goes wrong"] },
    "Recovery time after demanding periods": { tags: ["er"], meaning: "Back-to-back demands without recovery time can compound rather than resolve on their own.", questions: ["What does useful recovery time actually look like for them?"], adjustments: ["Build in buffer time after intense meetings, events or deadlines where possible"] },
    "Navigating workplace relationships": { tags: ["er"], meaning: "Interpersonal dynamics may take more conscious effort to manage than they do for others.", questions: ["Is there a specific situation, or is this more general?"], adjustments: ["Be a clear, calm point of contact if conflict or misunderstanding arises"] },
    "Managing the impact of medication or treatment": { tags: ["er", "ef"], meaning: "Treatment can affect energy, focus or mood in ways that vary day to day, often predictably around appointments or dosage changes.", questions: ["Is the impact predictable around specific times, or more variable?"], adjustments: ["Some flexibility around appointment timing and expectations on those days"] },
    "Unpredictable symptoms or flare-ups": { tags: ["er", "env"], meaning: "Needs may genuinely vary day to day rather than being static, which is worth planning for rather than treating as inconsistency.", questions: ["What would a helpful response look like on a harder day, practically?"], adjustments: ["Agree in advance what flexibility on harder days looks like, so it doesn't need renegotiating each time"] },
  },
  "in-work-support": {
    "Regular structured check-ins": { tags: ["ef", "er"], meaning: "Consistent contact helps catch issues early, before they grow into something larger.", questions: ["What frequency and format tends to work best?"], adjustments: ["Set a regular, protected time for this rather than relying on ad hoc chats"] },
    "A named buddy or mentor at work": { tags: ["er"], meaning: "Informal support from a peer can reduce the load on formal management channels.", questions: ["Is there someone already in mind, or would this need arranging?"], adjustments: ["Consider whether a buddy or mentor pairing could be arranged"] },
    "Job coach or workplace assessor": { tags: ["ef"], meaning: "External expertise may identify adjustments that aren't obvious from inside the organisation.", questions: ["Has this been explored before, and if so what came of it?"], adjustments: ["Consider a referral, potentially funded via Access to Work"] },
    "Occupational health referral": { tags: ["er"], meaning: "A professional assessment can strengthen and formalise support that's already being discussed informally.", questions: ["Would they like to be involved in shaping the referral question?"], adjustments: ["Discuss making a referral, with the employee involved throughout the process"] },
    "Access to Work support": { tags: ["env"], meaning: "Funded external support may cover equipment, travel or coaching costs that would otherwise fall to the organisation.", questions: ["Have they applied before, or would this be a first application?"], adjustments: ["Support the application together, HR or a job coach can often help directly"] },
    "Flexibility for appointments": { tags: ["ef", "er"], meaning: "Ongoing appointments may need accommodating as a standing pattern, not a one-off request each time.", questions: ["Are appointments on a predictable schedule, or more ad hoc?"], adjustments: ["Agree a standing approach to appointment time rather than negotiating case by case"] },
    "Mental health first aider access": { tags: ["er"], meaning: "Knowing support is visibly available can matter as much as actually using it.", questions: ["Do they already know who the first aiders are and how to reach them?"], adjustments: ["Make sure they know who the first aiders are and how to reach them"] },
  },
};

/** Which EEES tag(s) a section's free-text "anything else" field maps to,
 * since free text can't be looked up in TRANSLATIONS by value. */
export const TEXT_FIELD_TAGS: Record<string, EeesTag[]> = {
  "env-other": ["env"],
  "equipment-other": ["env"],
  "travel-other": ["env"],
  "comm-other": ["ef"],
  "workload-other": ["ef"],
  "wellbeing-other": ["er"],
  "varies-detail": ["er"],
};

/** Generic, non-presumptuous prompts for exploring free-text notes, since
 * these don't map to a fixed item and shouldn't be guessed at. */
export const QUOTE_PROMPTS: Record<EeesTag, string[]> = {
  ef: ["What would make this easier to plan or follow day to day?", "Is there a small change to how information or deadlines are shared that would help here?"],
  er: ["What does a harder day look like compared with a good one?", "What's helped with this before, if anything?"],
  env: ["Is this mainly about the physical space, the equipment, or both?", "Would walking the space together help pin down what to change?"],
  sen: ["Is this about one particular sense, or several at once?", "Does it vary by time of day or how busy things are?"],
};

/** field key -> checkbox value -> a follow-up action worth flagging for HR
 * specifically (funding applications, referrals, standing arrangements). */
export const ACTION_FLAGS: Record<string, Record<string, string>> = {
  "in-work-support": {
    "Access to Work support": "Employee may want help applying for Access to Work funding.",
    "Occupational health referral": "Consider making an occupational health referral, with the employee's involvement.",
    "Job coach or workplace assessor": "Employee may benefit from a workplace needs assessment or job coach referral.",
    "Mental health first aider access": "Confirm the employee knows how to reach a mental health first aider or EAP.",
  },
  travel: {
    "Taxi or funded travel support": "May be eligible for Access to Work funded travel, worth exploring together.",
    "Vehicle adaptations": "Likely needs an Access to Work or occupational health-led conversation.",
  },
  "comm-style": {
    "BSL interpreter or relay service": "Arrange interpreter or relay service access as standard practice.",
  },
  equipment: {
    "Mobility aids at workstation": "A workplace needs assessment may help confirm workstation adaptations.",
  },
};

export const EEES_META: { key: EeesTag; label: string; icon: string }[] = [
  { key: "ef", label: "Executive Function", icon: "🧩" },
  { key: "er", label: "Emotional Regulation", icon: "💛" },
  { key: "env", label: "Environment", icon: "🏢" },
  { key: "sen", label: "Sensory", icon: "🔆" },
];

/** Reasonable adjustments framing shown once per EEES category so managers
 * can connect what's below to their own policy, not a checklist.
 *
 * The duty to make reasonable adjustments (Equality Act 2010, s.20-21) has
 * three distinct triggers: a provision, criterion or practice (PCP), a
 * physical feature, or the absence of an auxiliary aid. In practice a
 * single real-world barrier often engages more than one at once, e.g.
 * noise in an open-plan office can be about the physical layout, a PCP
 * like hot-desking that removes control over where someone sits, and a
 * PCP that everyone uses the same standard-issue headset, all at the same
 * time. These are written as prompts to consider which duty (or duties)
 * might be involved, not a fixed diagnosis that assigns one category to
 * one duty. */
export const EEES_POLICY: Record<EeesTag, string> = {
  ef: "Items here often trace back to a provision, criterion or practice (PCP), a fixed way of working such as verbal-only instructions, unbroken deadlines, or an expectation of unprompted task-switching. It's also worth asking whether an auxiliary aid, planning software, a reminder system, would remove the barrier as well as or instead of changing the practice. The adjustments below are typically low-cost and quick to put in place, which matters because the law only expects what's reasonable, not everything conceivable.",
  er: "Items here often trace back to a PCP around pace, exposure, or recovery time, for example an expectation to move straight from one demanding meeting to the next with no buffer. This sits alongside general wellbeing support, but from a reasonable adjustments perspective the useful question is what in how work is structured is creating the disadvantage, not what's \"wrong\" with the person.",
  env: "Environment items can trigger any of the three duties, often more than one at once. Desk allocation or building layout may be a physical feature; an expectation like hot-desking or a fixed commuting pattern may be a PCP; a piece of equipment that closes the gap, an adjustable desk, specialist seating, may be an auxiliary aid. Rather than settling on one, it's usually more useful to ask which is actually doing the work here, since that can point to a different kind of fix.",
  sen: "Sensory items are a good example of how these duties overlap. Take noise in an open-plan office: it might be about the physical layout, a PCP like hot-desking that removes control over where someone sits, or a PCP that everyone uses the same standard-issue headset. An auxiliary aid, noise-cancelling headphones, a loop system, a tinted overlay, is often the fastest fix regardless of which duty is technically engaged, but naming the underlying duty can still help build the case for it.",
};

export const LEGAL_NOTE =
  "This connects what's been shared to how reasonable adjustments typically work under the Equality Act 2010. The duty can be engaged by a provision, criterion or practice (PCP), a physical feature, or the absence of an auxiliary aid, and the same real-world barrier often engages more than one at once. Treat the categories below as a guide to what might be involved, not a fixed diagnosis, then adjust in a way that isn't a disproportionate burden. It's guidance to support a conversation, not legal advice, check individual cases against your own policy and HR where needed.";

/** Which answer fields feed into each shareable section's report content,
 * matching reference-prototype.html's CONSENT_SECTIONS checkFields/
 * textFields. Icon/label for these sections live in passport-content.ts's
 * CONSENT_SECTIONS, this is the report-building half only. */
export const REPORT_SECTION_FIELDS: Record<string, { checkFields: string[]; textFields: string[] }> = {
  env: { checkFields: ["work-location", "env-sensory"], textFields: ["env-other"] },
  equipment: { checkFields: ["equipment", "software"], textFields: ["equipment-other"] },
  travel: { checkFields: ["travel", "access"], textFields: ["travel-other"] },
  comm: { checkFields: ["info-receive", "comm-style", "interview"], textFields: ["comm-other"] },
  workload: { checkFields: ["workload", "exec-difficulty"], textFields: ["workload-other"] },
  wellbeing: { checkFields: ["wellbeing", "in-work-support"], textFields: ["wellbeing-other", "varies-detail"] },
  priorities: { checkFields: [], textFields: ["top-three", "prev-support", "add-notes"] },
};
