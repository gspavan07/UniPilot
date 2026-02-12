/**
 * FormulaEngine
 * Handles dynamic result calculation based on regulation-defined formulas
 */

class FormulaEngine {
  /**
   * Best 80% + Worst 20% Formula
   * Common in AP universities: (max × 0.8) + (min × 0.2)
   */
  static BEST_80_WORST_20(scores) {
    if (!scores || scores.length === 0) return 0;
    if (scores.length === 1) return scores[0];

    const sorted = [...scores].sort((a, b) => b - a);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    return best * 0.8 + worst * 0.2;
  }

  /**
   * Average of all scores
   */
  static AVERAGE(scores) {
    if (!scores || scores.length === 0) return 0;
    const sum = scores.reduce((acc, val) => acc + val, 0);
    return sum / scores.length;
  }

  /**
   * Direct pass-through (no calculation)
   * Used for single exams like End Semester
   */
  static DIRECT(scores) {
    if (!scores || scores.length === 0) return 0;
    return scores[0] || 0;
  }

  /**
   * Best score only
   */
  static BEST_OF_ALL(scores) {
    if (!scores || scores.length === 0) return 0;
    return Math.max(...scores);
  }

  /**
   * Worst score only (for penalties)
   */
  static WORST_OF_ALL(scores) {
    if (!scores || scores.length === 0) return 0;
    return Math.min(...scores);
  }

  /**
   * Best 2 of 3 (average)
   */
  static BEST_2_OF_3(scores) {
    if (!scores || scores.length === 0) return 0;
    if (scores.length <= 2) return this.AVERAGE(scores);

    const sorted = [...scores].sort((a, b) => b - a);
    return (sorted[0] + sorted[1]) / 2;
  }

  /**
   * Drop lowest score, average the rest
   */
  static DROP_LOWEST(scores) {
    if (!scores || scores.length === 0) return 0;
    if (scores.length === 1) return scores[0];

    const sorted = [...scores].sort((a, b) => b - a);
    const validScores = sorted.slice(0, -1); // Remove last (lowest)
    return this.AVERAGE(validScores);
  }

  /**
   * Execute formula by name
   */
  static execute(formulaName, scores) {
    const formula = this[formulaName];
    if (!formula) {
      throw new Error(`Unknown formula: ${formulaName}`);
    }
    return formula(scores);
  }

  /**
   * Get all available formulas
   */
  static getAvailableFormulas() {
    return {
      BEST_80_WORST_20: {
        name: "Best 80% + Worst 20%",
        description: "Weighted average favoring the best score",
        example: "(28 × 0.8) + (25 × 0.2) = 27.4",
      },
      AVERAGE: {
        name: "Average",
        description: "Simple average of all scores",
        example: "(25 + 28) / 2 = 26.5",
      },
      DIRECT: {
        name: "Direct",
        description: "Use the score as-is (no calculation)",
        example: "70 → 70",
      },
      BEST_OF_ALL: {
        name: "Best Score Only",
        description: "Take the highest score",
        example: "max(25, 28) = 28",
      },
      WORST_OF_ALL: {
        name: "Worst Score Only",
        description: "Take the lowest score",
        example: "min(25, 28) = 25",
      },
      BEST_2_OF_3: {
        name: "Best 2 of 3",
        description: "Average the top 2 scores",
        example: "avg(28, 26) = 27",
      },
      DROP_LOWEST: {
        name: "Drop Lowest",
        description: "Remove lowest score, average the rest",
        example: "(28 + 26) / 2 = 27",
      },
    };
  }
}

module.exports = FormulaEngine;
