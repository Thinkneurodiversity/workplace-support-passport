// Content for the 8-section passport flow plus the sharing/consent step,
// transcribed exactly (wording, order) from reference-prototype.html per
// CLAUDE.md. This is the single source of truth the form renderer, the
// consent table, and the eventual report step (build step 3) all read from.
//
// field `key` values match the prototype's original input `id`/`name`
// attributes so later work (e.g. the EEES translation dictionary, which is
// keyed by these same names) can reuse them without renaming anything.

export type FieldType = "text" | "email" | "textarea" | "checkbox-group" | "radio-group";

export interface FieldOption {
  value: string;
  label: string;
  /** Renders as the muted "none of the above" tile, styled apart from real options. */
  isNoneOption?: boolean;
}

export type ConditionalRule =
  // Show only when the named radio/select field currently holds one of `values`.
  | { kind: "radioEquals"; field: string; values: string[] }
  // Show only when the named checkbox-group field has at least one value
  // checked that isn't in `excluding` (used for "tell us more" follow-ups
  // that shouldn't appear just because someone ticked "None currently").
  | { kind: "checkboxAnyExcluding"; field: string; excluding: string[] };

export interface PassportField {
  key: string;
  type: FieldType;
  label: string;
  hint?: string;
  optionalTag?: string;
  placeholder?: string;
  options?: FieldOption[];
  conditional?: ConditionalRule;
}

export interface PassportSection {
  /** Also the `section` value stored on each passport_responses row. */
  key: string;
  icon: string;
  title: string;
  description: string;
  fields: PassportField[];
}

export const SECTIONS: PassportSection[] = [
  {
    key: "about",
    icon: "👤",
    title: "About You",
    description: "Basic details to personalise your passport. All fields are optional.",
    fields: [
      { key: "f-name", type: "text", label: "Your name", optionalTag: "optional", placeholder: "First name or preferred name" },
      { key: "f-email", type: "email", label: "Your email", optionalTag: "optional, only needed to email you a copy", placeholder: "you@example.com" },
      { key: "f-role", type: "text", label: "Your job title or role", optionalTag: "optional", placeholder: "e.g. Project Manager, Support Worker" },
      { key: "f-org", type: "text", label: "Organisation", optionalTag: "optional", placeholder: "e.g. NHS, Local Authority, or leave blank" },
      { key: "f-date", type: "text", label: "Date completed", optionalTag: "optional", placeholder: "e.g. May 2026" },
      {
        key: "f-contact-name",
        type: "text",
        label: "Do you want to include contact details for a named person who can discuss your needs?",
        hint: "This could be a GP, occupational therapist, workplace assessor, or anyone you choose.",
        optionalTag: "optional",
        placeholder: "Contact name and role (optional)",
      },
      { key: "f-contact-detail", type: "text", label: "", placeholder: "Phone or email (optional)" },
    ],
  },
  {
    key: "env",
    icon: "🏢",
    title: "Working Environment",
    description: "Where and how your physical workspace affects your ability to work well.",
    fields: [
      {
        key: "work-location",
        type: "checkbox-group",
        label: "Where do you work best?",
        optionalTag: "select all that apply",
        options: [
          { value: "Quiet private space", label: "Quiet, private space with minimal interruptions" },
          { value: "Open plan but with noise management", label: "Open plan but with noise management (e.g. headphones, screens)" },
          { value: "Home working", label: "Home working, at least part of the time" },
          { value: "Fixed consistent location", label: "Fixed, consistent location rather than hot-desking" },
          { value: "Flexible/varied locations", label: "Flexible or varied locations suit me well" },
          { value: "No preference", label: "No strong preference", isNoneOption: true },
        ],
      },
      {
        key: "env-sensory",
        type: "checkbox-group",
        label: "Are there physical or sensory aspects of your workspace that affect you?",
        optionalTag: "select all that apply",
        options: [
          { value: "Lighting - natural or adjustable", label: "Lighting: I need natural light or adjustable levels" },
          { value: "Lighting - avoid fluorescent", label: "Lighting: fluorescent or bright overhead lights are difficult" },
          { value: "Temperature sensitivity", label: "Temperature: I am sensitive to heat or cold" },
          { value: "Background noise", label: "Background noise significantly affects my concentration" },
          { value: "Scent sensitivity", label: "Strong scents or fragrances affect me" },
          { value: "Crowded or busy spaces", label: "Crowded or very busy spaces are difficult to manage" },
          { value: "Visual clutter", label: "Visual clutter or disorganised environments affect my focus" },
          { value: "None of these", label: "None of these apply", isNoneOption: true },
        ],
      },
      {
        key: "env-other",
        type: "textarea",
        label: "Anything else about your working environment you would like to note?",
        optionalTag: "optional",
        placeholder: "e.g. I need to be near accessible toilet facilities, I find shared kitchens difficult...",
      },
    ],
  },
  {
    key: "equipment",
    icon: "💻",
    title: "Equipment and Technology",
    description: "Tools, software and physical equipment that help you perform at your best.",
    fields: [
      {
        key: "equipment",
        type: "checkbox-group",
        label: "Do you currently use, or think you would benefit from, any specialist equipment?",
        optionalTag: "select all that apply",
        options: [
          { value: "Ergonomic seating or adjustable desk", label: "Ergonomic seating or a height-adjustable desk" },
          { value: "Specialist keyboard or mouse", label: "Specialist keyboard, mouse or input device" },
          { value: "Noise cancelling headphones", label: "Noise-cancelling headphones" },
          { value: "Larger or additional screens", label: "Larger monitor or dual screens" },
          { value: "Screen magnification", label: "Screen magnification or high-contrast display settings" },
          { value: "Hearing aids or loop system", label: "Hearing aids or access to a hearing loop system" },
          { value: "Mobility aids at workstation", label: "Mobility aids or adaptations at my workstation" },
          { value: "Fidget or sensory tools", label: "Fidget tools or sensory regulation items" },
          { value: "None currently", label: "None currently", isNoneOption: true },
        ],
      },
      {
        key: "software",
        type: "checkbox-group",
        label: "Do you use, or would you benefit from, any assistive technology or specialist software?",
        optionalTag: "select all that apply",
        options: [
          { value: "Text-to-speech (e.g. Read&Write)", label: "Text-to-speech software (e.g. Read&Write, NaturalReader)" },
          { value: "Speech-to-text (e.g. Dragon)", label: "Speech-to-text / dictation software (e.g. Dragon, voice typing)" },
          { value: "Screen reader (e.g. JAWS, NVDA)", label: "Screen reader (e.g. JAWS, NVDA)" },
          { value: "Mind mapping tools", label: "Mind mapping or visual planning tools" },
          { value: "Task management / reminder apps", label: "Task management or reminder apps" },
          { value: "Magnification software", label: "Screen magnification software" },
          { value: "Colour overlay / tinted reading tools", label: "Colour overlay or tinted screen tools" },
          { value: "AI writing or summarising tools", label: "AI writing or summarising tools" },
          { value: "None currently", label: "None currently", isNoneOption: true },
        ],
      },
      {
        key: "software-info",
        type: "radio-group",
        label: "Would you like information about what is available and how it might help?",
        optionalTag: "optional",
        options: [
          { value: "Yes", label: "Yes please" },
          { value: "No", label: "No, I am already aware" },
        ],
        conditional: { kind: "checkboxAnyExcluding", field: "software", excluding: ["None currently"] },
      },
      {
        key: "equipment-other",
        type: "textarea",
        label: "Any other equipment or technology you find helpful or would like to try?",
        optionalTag: "optional",
        placeholder: "Describe anything not covered above...",
      },
    ],
  },
  {
    key: "travel",
    icon: "🚌",
    title: "Getting To and From Work",
    description: "Travel and access to the workplace.",
    fields: [
      {
        key: "travel",
        type: "checkbox-group",
        label: "Do you need any support with getting to or from work?",
        optionalTag: "select all that apply",
        options: [
          { value: "Reserved or accessible parking", label: "Reserved or accessible parking close to the building" },
          { value: "Flexible start or finish times", label: "Flexible start or finish times (e.g. to avoid rush hour)" },
          { value: "Taxi or funded travel support", label: "Taxi or funded travel support (potentially via Access to Work)" },
          { value: "Vehicle adaptations", label: "Adaptations to a vehicle" },
          { value: "Travel buddy or support", label: "A travel companion or support when commuting" },
          { value: "Remote working to reduce travel", label: "Working remotely to reduce or remove commuting" },
          { value: "No travel support needed", label: "No travel support needed", isNoneOption: true },
        ],
      },
      {
        key: "access",
        type: "checkbox-group",
        label: "Do you need any support accessing the building or site?",
        optionalTag: "select all that apply",
        options: [
          { value: "Step-free or lift access", label: "Step-free access or lift availability" },
          { value: "Accessible toilets nearby", label: "Accessible toilets close to my workspace" },
          { value: "Clear signage", label: "Clear signage throughout the building" },
          { value: "Quiet or less busy entrance", label: "A quieter or less busy entrance route" },
          { value: "Widened doors or adapted spaces", label: "Widened doors or physically adapted spaces" },
          { value: "No access adjustments needed", label: "No access adjustments needed", isNoneOption: true },
        ],
      },
      {
        key: "travel-other",
        type: "textarea",
        label: "Anything else about travel or site access you would like to note?",
        optionalTag: "optional",
        placeholder: "Anything not listed above...",
      },
    ],
  },
  {
    key: "comm",
    icon: "💬",
    title: "Communication and Interaction",
    description: "How you communicate most effectively and what helps conversations and meetings work well for you.",
    fields: [
      {
        key: "info-receive",
        type: "checkbox-group",
        label: "How do you prefer to receive information?",
        optionalTag: "select all that apply",
        options: [
          { value: "Written instructions or summaries", label: "Written instructions or summaries after verbal discussions" },
          { value: "Verbal explanation first, then written", label: "Verbal explanation first, followed by written confirmation" },
          { value: "Bullet points and short paragraphs", label: "Information broken into bullet points or short paragraphs" },
          { value: "Visual diagrams or flowcharts", label: "Visual diagrams, flowcharts or mind maps" },
          { value: "Time to read/process before discussing", label: "Time to read and process information before a discussion" },
          { value: "Agenda in advance for meetings", label: "An agenda in advance before meetings" },
          { value: "Repeated or summarised at end", label: "Key points repeated or summarised at the end" },
        ],
      },
      {
        key: "comm-style",
        type: "checkbox-group",
        label: "How do you communicate most effectively?",
        optionalTag: "select all that apply",
        options: [
          { value: "One to one rather than groups", label: "One-to-one conversations rather than group settings" },
          { value: "Written over verbal when possible", label: "Written communication (email, message) over verbal where possible" },
          { value: "Extra processing time in conversations", label: "Extra time to process and formulate responses in conversation" },
          { value: "Direct and literal communication", label: "Direct, literal communication (I can miss implied meaning)" },
          { value: "Structured meetings with clear purpose", label: "Structured meetings with a clear purpose and outcomes" },
          { value: "BSL interpreter or relay service", label: "British Sign Language interpreter or relay service" },
          { value: "Notetaker in meetings", label: "A notetaker present in meetings" },
        ],
      },
      {
        key: "interview",
        type: "checkbox-group",
        label: "At interviews or formal assessments, would you benefit from any of the following?",
        optionalTag: "select all that apply",
        options: [
          { value: "Questions provided in writing", label: "Questions provided in writing in advance or during the interview" },
          { value: "Extra time to answer", label: "Extra time to answer questions" },
          { value: "Prompts to expand or clarify", label: "Prompts to expand or clarify my answers" },
          { value: "Smaller panel", label: "A smaller interview panel" },
          { value: "Accessible format alternative", label: "An alternative format (e.g. task-based, portfolio review)" },
          { value: "No interview adjustments", label: "No adjustments needed at interview", isNoneOption: true },
        ],
      },
      {
        key: "comm-other",
        type: "textarea",
        label: "Anything else about communication or interaction you would like to note?",
        optionalTag: "optional",
        placeholder: "e.g. I find phone calls difficult and prefer email; I may need to take breaks during long meetings...",
      },
    ],
  },
  {
    key: "workload",
    icon: "📋",
    title: "Planning, Organisation and Workload",
    description: "How you manage tasks, time and competing demands most effectively.",
    fields: [
      {
        key: "workload",
        type: "checkbox-group",
        label: "What helps you manage your workload effectively?",
        optionalTag: "select all that apply",
        options: [
          { value: "Clear written task lists", label: "Clear written task lists with priorities ranked" },
          { value: "Deadlines broken into steps", label: "Deadlines broken into smaller steps with interim check-ins" },
          { value: "Protected time for focused work", label: "Protected time for deep, focused work with limited interruptions" },
          { value: "Regular check-ins with manager", label: "Regular brief check-ins with my manager for direction and feedback" },
          { value: "Consistent routines", label: "Consistent routines and predictable schedules" },
          { value: "Advance notice of changes", label: "Advance notice of changes to tasks, priorities or plans" },
          { value: "Reminders and prompts", label: "Reminders and prompts for appointments and deadlines" },
          { value: "Flexibility on how tasks are completed", label: "Flexibility in how tasks are completed, as long as outcomes are met" },
        ],
      },
      {
        key: "exec-difficulty",
        type: "checkbox-group",
        label: "Are there aspects of planning or organisation that are particularly difficult for you?",
        optionalTag: "select all that apply",
        options: [
          { value: "Starting tasks", label: "Getting started on tasks, especially complex or unfamiliar ones" },
          { value: "Switching between tasks", label: "Switching between tasks, especially when interrupted" },
          { value: "Estimating time", label: "Estimating how long tasks will take" },
          { value: "Managing multiple priorities", label: "Managing multiple competing priorities simultaneously" },
          { value: "Remembering verbal instructions", label: "Remembering verbal instructions without a written record" },
          { value: "Paperwork or admin tasks", label: "Paperwork or administrative tasks" },
          { value: "None of these", label: "None of these present significant difficulty", isNoneOption: true },
        ],
      },
      {
        key: "workload-other",
        type: "textarea",
        label: "Anything else about managing your workload you would like to note?",
        optionalTag: "optional",
        placeholder: "e.g. I work better on tasks that allow deep focus; I struggle when expectations change without notice...",
      },
    ],
  },
  {
    key: "wellbeing",
    icon: "🌱",
    title: "Wellbeing and In-Work Support",
    description: "What helps you manage your energy, wellbeing and resilience at work.",
    fields: [
      {
        key: "wellbeing",
        type: "checkbox-group",
        label: "Do any of the following affect your experience at work?",
        optionalTag: "select all that apply",
        options: [
          { value: "Managing energy and fatigue", label: "Managing energy levels or fatigue across the working day" },
          { value: "Managing stress or anxiety", label: "Managing stress, anxiety or emotional overwhelm at work" },
          { value: "Recovery time after demanding periods", label: "Need for recovery time after demanding meetings, tasks or interactions" },
          { value: "Navigating workplace relationships", label: "Navigating workplace relationships or conflict" },
          { value: "Managing the impact of medication or treatment", label: "Managing the effects of medication, treatment or appointments" },
          { value: "Unpredictable symptoms or flare-ups", label: "Unpredictable symptoms or health fluctuations that vary day to day" },
          { value: "None of these", label: "None of these significantly affect my work", isNoneOption: true },
        ],
      },
      {
        key: "in-work-support",
        type: "checkbox-group",
        label: "What in-work support would help you most?",
        optionalTag: "select all that apply",
        options: [
          { value: "Regular structured check-ins", label: "Regular structured check-ins with my manager" },
          { value: "A named buddy or mentor at work", label: "A named buddy or peer mentor in the workplace" },
          { value: "Job coach or workplace assessor", label: "Access to a job coach or workplace needs assessor" },
          { value: "Occupational health referral", label: "A referral to occupational health for assessment or advice" },
          { value: "Access to Work support", label: "Application support for Access to Work funding" },
          { value: "Flexibility for appointments", label: "Flexibility to attend medical or therapeutic appointments" },
          { value: "Mental health first aider access", label: "Access to a mental health first aider or EAP" },
          { value: "No in-work support needed", label: "No in-work support currently needed", isNoneOption: true },
        ],
      },
      {
        key: "varies",
        type: "radio-group",
        label: "Does your condition or situation vary?",
        hint: "For example, symptoms may be worse at certain times of day, in certain environments, or during particular periods.",
        optionalTag: "optional",
        options: [
          { value: "Yes", label: "Yes, it varies significantly" },
          { value: "Somewhat", label: "It varies somewhat" },
          { value: "No", label: "It is fairly consistent" },
          { value: "Prefer not to say", label: "Prefer not to say" },
        ],
      },
      {
        key: "varies-detail",
        type: "textarea",
        label: "Tell us more about when things are harder and what would help most in those periods:",
        optionalTag: "optional",
        placeholder: "e.g. Mornings are harder; certain types of meetings drain me significantly; I may need to work from home on difficult days...",
        conditional: { kind: "radioEquals", field: "varies", values: ["Yes", "Somewhat"] },
      },
      {
        key: "wellbeing-other",
        type: "textarea",
        label: "Anything else about your wellbeing or in-work support you would like to note?",
        optionalTag: "optional",
        placeholder: "e.g. I have experience of previous support that was helpful; I would like a review date to be set...",
      },
    ],
  },
  {
    key: "priorities",
    icon: "✅",
    title: "Your Priorities and Next Steps",
    description: "A chance to summarise what matters most and how you want to use this passport.",
    fields: [
      {
        key: "top-three",
        type: "textarea",
        label: "In your own words, what are the three most important things that would help you work at your best?",
        hint: "There is no right answer. This is your space to be direct about what you genuinely need.",
        optionalTag: "optional",
        placeholder: "1. ...\n2. ...\n3. ...",
      },
      {
        key: "prev-support",
        type: "textarea",
        label: "Have you received any support in education or a previous role that you found particularly helpful?",
        optionalTag: "optional",
        placeholder: "e.g. I had extra time in exams; I previously had a job coach funded through Access to Work...",
      },
      {
        key: "shared-with",
        type: "checkbox-group",
        label: "Who have you already shared your support needs with?",
        optionalTag: "select all that apply",
        options: [
          { value: "Current manager", label: "My current manager" },
          { value: "HR", label: "HR or People team" },
          { value: "Occupational Health", label: "Occupational health" },
          { value: "Previous employer", label: "A previous employer" },
          { value: "Nobody yet", label: "Nobody yet" },
        ],
      },
      {
        key: "passport-use",
        type: "checkbox-group",
        label: "How do you want to use this passport?",
        optionalTag: "select all that apply",
        options: [
          { value: "Conversation with manager", label: "As a starting point for a conversation with my manager" },
          { value: "HR or Access to Work application", label: "To support an HR process or an Access to Work application" },
          { value: "Personal record", label: "As a personal record of my needs that I keep and review" },
          { value: "Preparation for new role", label: "Preparation when starting a new role or post" },
          { value: "After a period of absence", label: "Following a period of absence or significant change" },
        ],
      },
      {
        key: "add-notes",
        type: "textarea",
        label: "Anything else you would like to record?",
        optionalTag: "optional",
        placeholder: "Any other context, preferences or things you want noted...",
      },
    ],
  },
];

/** The 7 content sections that can be shared, in the order they appear in
 * the consent table. "about" is excluded deliberately, it's included
 * automatically wherever anything is shared, same as the prototype. */
export const CONSENT_SECTIONS = SECTIONS.filter((s) => s.key !== "about").map((s) => ({
  key: s.key,
  icon: s.icon,
  label: s.title,
}));

export const RECIPIENTS = [
  { key: "manager", label: "Manager" },
  { key: "hr", label: "HR" },
  { key: "occupational_health", label: "Occ. Health" },
] as const;

export type RecipientKey = (typeof RECIPIENTS)[number]["key"];

export const SHARE_METHOD_FIELD_KEY = "share-method";
export const SHARE_METHOD_OTHER_FIELD_KEY = "share-method-other-detail";
export const RECIPIENT_EMAIL_FIELD_KEYS: Partial<Record<RecipientKey, string>> = {
  manager: "email-manager",
  hr: "email-hr",
  // Occupational Health has no email field, it's an external recipient with
  // no dashboard, see CLAUDE.md, consistent with the reference prototype.
};

export const SHARE_METHOD_OPTIONS: FieldOption[] = [
  { value: "I'll share it myself", label: "I'll share it myself, in a conversation or by email" },
  { value: "I'd like HR to share it on my behalf", label: "I'd like HR to share the relevant sections on my behalf" },
  { value: "By email only, no meeting needed", label: "By email only, I'd rather not discuss it verbally straight away" },
  { value: "Other", label: "Other" },
];

/** Every field key across the whole flow, used to validate that every
 * autosaved key actually belongs somewhere before it's written. */
export const ALL_FIELD_KEYS: ReadonlySet<string> = new Set([
  ...SECTIONS.flatMap((s) => s.fields.map((f) => f.key)),
  SHARE_METHOD_FIELD_KEY,
  SHARE_METHOD_OTHER_FIELD_KEY,
  ...Object.values(RECIPIENT_EMAIL_FIELD_KEYS),
]);

export function findFieldSection(fieldKey: string): string {
  for (const section of SECTIONS) {
    if (section.fields.some((f) => f.key === fieldKey)) return section.key;
  }
  return "sharing";
}

/** Evaluates a field's `conditional` rule against the current answers.
 * Fields with no rule are always visible. Shared by the section renderer
 * (client) so a "tell us more" follow-up only appears once its trigger
 * answer actually warrants it, matching reference-prototype.html's
 * `.conditional.visible` toggling. */
export function isFieldVisible(
  field: Pick<PassportField, "conditional">,
  answers: Record<string, string | string[] | undefined>,
): boolean {
  const rule = field.conditional;
  if (!rule) return true;

  if (rule.kind === "radioEquals") {
    const current = answers[rule.field];
    return typeof current === "string" && rule.values.includes(current);
  }

  // checkboxAnyExcluding
  const current = answers[rule.field];
  return Array.isArray(current) && current.some((v) => !rule.excluding.includes(v));
}
