type OffsetUnit = [start: number, end: number];

type HighlightUnit = {
  start: number;
  end: number;
  text?: string;
};

export type DiaryCorrectionUnit = {
  original: string;
  original_highlights: Array<string>;
  correction: string;
  correction_highlights: Array<string>;
  explanation: string;
};

export type ParsedDiaryCorrectionUnit = {
  original: string;
  original_offset: OffsetUnit | null;
  original_highlights: Array<HighlightUnit>;
  correction: string;
  correction_offset: OffsetUnit | null;
  correction_highlights: Array<HighlightUnit>;
  explanation: string;
};

export type DiaryCorrectionResult = {
  /**
   * @desc The complete corrected version of the diary entry
   */
  corrected_diary: string;
  /**
   * @desc A high-level overall feedback summary written in Korean
   */
  overall_feedback: string;
  corrections: Array<DiaryCorrectionUnit>;
};

export type ParsedDiaryCorrectionResult = {
  corrected_diary: string;
  overall_feedback: string;
  corrections: Array<ParsedDiaryCorrectionUnit>;
};
