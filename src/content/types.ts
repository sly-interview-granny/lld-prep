export interface InterviewConcept {
  title: string;
  /** One-line summary shown in the card header area */
  description: string;
  /** Expanded definition (2–3 sentences) */
  definition: string;
  /** Real-world analogy or scenario */
  analogy: string;
  /** When interviewers ask about it and common follow-ups */
  whenAsked: string;
  /** Interview-ready Python example */
  codePython: string;
  /** Interview-ready Java example */
  codeJava: string;
  /** Key points to mention in an interview */
  interviewTips: string[];
  tag?: string;
}

export interface SolidPrinciple extends InterviewConcept {
  letter: string;
}
