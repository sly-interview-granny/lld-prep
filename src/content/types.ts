export interface InterviewConcept {
  title: string;
  /** Rich narrative markdown body (preferred for detail view). */
  body?: string;
  /** One-line summary shown in the card header area */
  description: string;
  /** Expanded definition (4–6 sentences, interview depth) */
  definition: string;
  /** Real-world analogy or scenario (2–3 sentences) */
  analogy: string;
  /** When interviewers ask about it — questions and how to answer */
  whenAsked: string;
  /** Concrete software example beyond the analogy */
  detailedExample?: string;
  /** Interview-ready Python example */
  codePython: string;
  /** Interview-ready Java example */
  codeJava: string;
  /** Key points to mention in an interview (5–7 bullets) */
  interviewTips: string[];
  /** Pitfalls and misconceptions to avoid */
  commonMistakes?: string[];
  tag?: string;
}

export interface SolidPrinciple extends InterviewConcept {
  letter: string;
}
