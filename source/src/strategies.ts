export enum StageId {
  StarterIsland = 1,
  DoublesForest = 2,
  BridgeTown = 3,
  FamilyVillage = 4,
  BigNumberMountain = 5,
  TheSummit = 6,
}

export interface Stage {
  id: StageId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  accentColor: string;
  description: string;
}

export interface Strategy {
  id: number;
  stageId: StageId;
  code: string;
  name: string;
  reason: string;
  explanation: string;
  example: string;
  thinkSteps: string[];
}

export interface MathQuestion {
  id: string;
  strategyCode: string;
  question: string;
  answer: number;
  hint: string;
  type: string;
  family?: string;
  difficulty?: number;
  stageId?: StageId;
  options?: string[];
}

export const STAGES: Stage[] = [
  {
    id: StageId.StarterIsland,
    name: "Starter Island",
    emoji: "🏝️",
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-teal-50/75",
    accentColor: "teal",
    description: "Facts you just know. No counting needed.",
  },
  {
    id: StageId.DoublesForest,
    name: "Doubles Forest",
    emoji: "🌲",
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-emerald-50/75",
    accentColor: "emerald",
    description: "Stretch doubles into nearby facts.",
  },
  {
    id: StageId.BridgeTown,
    name: "Bridge Town",
    emoji: "🌉",
    color: "from-sky-400 to-blue-500",
    bgColor: "bg-blue-50/75",
    accentColor: "blue",
    description: "Make ten do the work.",
  },
  {
    id: StageId.FamilyVillage,
    name: "Family Village",
    emoji: "🏡",
    color: "from-indigo-400 to-violet-500",
    bgColor: "bg-violet-50/75",
    accentColor: "violet",
    description: "See how addition and subtraction connect.",
  },
  {
    id: StageId.BigNumberMountain,
    name: "Big Number Mountain",
    emoji: "🏔️",
    color: "from-rose-400 to-pink-500",
    bgColor: "bg-pink-50/75",
    accentColor: "pink",
    description: "Use the same shortcuts with bigger numbers.",
  },
  {
    id: StageId.TheSummit,
    name: "The Summit",
    emoji: "🏆",
    color: "from-yellow-400 to-amber-500",
    bgColor: "bg-amber-50/75",
    accentColor: "amber",
    description: "Choose the fastest strategy and keep going.",
  },
];

export const STRATEGIES: Strategy[] = [
  { id: 1, stageId: StageId.StarterIsland, code: "same-number", name: "Zero Rule", reason: "Lesson 1", explanation: "Adding or subtracting zero keeps the number the same.", example: "7 + 0 = 7", thinkSteps: ["Adding 0 means nothing is added.", "Taking away 0 means nothing is removed.", "The number stays the same."] },
  { id: 2, stageId: StageId.StarterIsland, code: "one-more-less", name: "One More and One Fewer", reason: "Lesson 2", explanation: "Move one step forward or one step back.", example: "6 + 1 = 7", thinkSteps: ["For +1, say the next number.", "For -1, say the number before."] },
  { id: 3, stageId: StageId.StarterIsland, code: "two-more-less", name: "Two More and Two Fewer", reason: "Lesson 3", explanation: "Move two small steps forward or backward.", example: "5 + 2 = 7", thinkSteps: ["For +2, count forward two steps.", "For -2, count back two steps."] },
  { id: 4, stageId: StageId.StarterIsland, code: "doubles-small", name: "Doubles to 10", reason: "Lesson 4", explanation: "Double a small number by adding it to itself.", example: "5 + 5 = 10", thinkSteps: ["Spot the twin numbers.", "Use the double fact you know.", "Small doubles become anchor facts."] },
  { id: 5, stageId: StageId.StarterIsland, code: "bond-10", name: "Make 10 Pairs", reason: "Lesson 5", explanation: "Find the missing partner that makes 10.", example: "4 + ? = 10", thinkSteps: ["Look at the number you have.", "Think of the partner that fills 10.", "1-9, 2-8, 3-7, 4-6, 5-5 all make 10."] },
  { id: 6, stageId: StageId.StarterIsland, code: "subtract-from-10", name: "Subtract from 10", reason: "Lesson 6", explanation: "Use your make-10 partners to subtract from 10.", example: "10 - 6 = 4", thinkSteps: ["What goes with 6 to make 10?", "That partner is the answer."] },

  { id: 7, stageId: StageId.DoublesForest, code: "doubles-big", name: "Doubles to 18", reason: "Lesson 7", explanation: "Use bigger doubles as fast anchor facts.", example: "8 + 8 = 16", thinkSteps: ["Spot the twin numbers.", "Use the double fact you know.", "Big doubles help with nearby facts."] },
  { id: 8, stageId: StageId.DoublesForest, code: "near-double-one", name: "Near Doubles: One Apart", reason: "Lesson 8", explanation: "Use the higher double, then subtract 1.", example: "5 + 4 = 9", thinkSteps: ["Think of 5 + 5.", "5 + 5 is 10.", "Take away 1, so the answer is 9."] },
  { id: 9, stageId: StageId.DoublesForest, code: "near-double-two", name: "Near Doubles: Two Apart", reason: "Lesson 9", explanation: "Use the middle double when the numbers are two apart.", example: "6 + 8 = 14", thinkSteps: ["The middle number is 7.", "Think 7 + 7.", "7 + 7 = 14."] },

  { id: 10, stageId: StageId.BridgeTown, code: "make-10-add", name: "Make 10 to Add", reason: "Lesson 10", explanation: "Fill up to 10 first, then add what is left.", example: "8 + 5 = 13", thinkSteps: ["8 needs 2 to make 10.", "Split 5 into 2 and 3.", "10 + 3 = 13."] },
  { id: 11, stageId: StageId.BridgeTown, code: "bridge-back", name: "Bridge Back to Subtract", reason: "Lesson 11", explanation: "Jump back to 10 first, then subtract the rest.", example: "14 - 6 = 8", thinkSteps: ["14 goes back 4 to reach 10.", "Split 6 into 4 and 2.", "10 - 2 = 8."] },
  { id: 12, stageId: StageId.BridgeTown, code: "missing-part-10", name: "Missing Part to 10", reason: "Lesson 12", explanation: "Find the missing partner that makes 10.", example: "7 + ? = 10", thinkSteps: ["What goes with 7 to make 10?", "The missing partner is 3."] },
  { id: 13, stageId: StageId.BridgeTown, code: "strategy-bridge-1", name: "Strategy Bridge: Facts to 20", reason: "Lesson 13", explanation: "Use the fastest shortcut you see: near doubles, make 10, or a known fact.", example: "6 + 7 or 8 + 5", thinkSteps: ["Look at the numbers.", "Choose the easiest strategy in your head.", "Solve it and keep moving."] },

  { id: 14, stageId: StageId.FamilyVillage, code: "fact-family-10", name: "Fact Families to 10", reason: "Lesson 14", explanation: "Use related addition and subtraction facts.", example: "4 + 6 = 10, 10 - 4 = 6", thinkSteps: ["Think of the whole number.", "Use the two parts that make it.", "Addition and subtraction belong together."] },
  { id: 15, stageId: StageId.FamilyVillage, code: "fact-family-20", name: "Fact Families to 20", reason: "Lesson 15", explanation: "Use related facts with totals up to 20.", example: "8 + 7 = 15, 15 - 8 = 7", thinkSteps: ["Think of the addition fact.", "Use it backward for subtraction.", "The parts and whole stay connected."] },
  { id: 16, stageId: StageId.FamilyVillage, code: "missing-addend", name: "Missing Addend Thinking", reason: "Lesson 16", explanation: "Find the missing part by thinking about the difference.", example: "8 + ? = 15", thinkSteps: ["Think: 8 and what makes 15?", "Use related addition and subtraction.", "The difference is the missing part."] },
  { id: 17, stageId: StageId.FamilyVillage, code: "count-up", name: "Count Up to Subtract", reason: "Lesson 17", explanation: "Count up when subtraction is really asking for the missing part.", example: "14 - 9 = 5", thinkSteps: ["Think: 9 + ? = 14.", "Count up from 9 to 14 if needed.", "The number of jumps is the answer."] },

  { id: 18, stageId: StageId.BigNumberMountain, code: "add-tens", name: "Add and Subtract Tens", reason: "Lesson 18", explanation: "Use tens like friendly building blocks.", example: "30 + 40 = 70", thinkSteps: ["Count the tens.", "Keep the zero at the end.", "Check: adding or subtracting?"] },
  { id: 19, stageId: StageId.BigNumberMountain, code: "add-ones-two-digit", name: "Add Ones to Two-Digit Numbers", reason: "Lesson 19", explanation: "Add a small number without crossing the next ten.", example: "34 + 5 = 39", thinkSteps: ["Keep the tens the same.", "Add the ones.", "Check you didn't pass the next ten."] },
  { id: 20, stageId: StageId.BigNumberMountain, code: "subtract-ones-two-digit", name: "Subtract Ones from Two-Digit Numbers", reason: "Lesson 20", explanation: "Take away a small number from the ones place.", example: "48 - 6 = 42", thinkSteps: ["Keep the tens the same.", "Subtract the ones.", "Check if you crossed a ten."] },
  { id: 21, stageId: StageId.BigNumberMountain, code: "add-subtract-10-two-digit", name: "Add and Subtract 10", reason: "Lesson 21", explanation: "Move one ten up or down while the ones stay the same.", example: "56 - 10 = 46", thinkSteps: ["Only the tens digit changes.", "The ones digit stays the same.", "Check if you added or subtracted one ten."] },
  { id: 22, stageId: StageId.BigNumberMountain, code: "bridge-ones-two-digit", name: "Bridge Ones in Two-Digit Numbers", reason: "Lesson 22", explanation: "Use the next or previous ten when ones cross a ten.", example: "38 + 7 = 45", thinkSteps: ["Jump to the nearest ten first.", "Then finish with what is left.", "Like bridging within 20."] },
  { id: 23, stageId: StageId.BigNumberMountain, code: "two-digit-place", name: "Two-Digit Place Value", reason: "Lesson 23", explanation: "Use tens and ones to add or subtract two-digit numbers.", example: "35 + 22 = 57", thinkSteps: ["Work with the tens.", "Work with the ones.", "Put the parts together."] },
  { id: 24, stageId: StageId.BigNumberMountain, code: "compensation", name: "Compensation", reason: "Lesson 24", explanation: "Make a friendly number, then adjust.", example: "39 + 6 = 45", thinkSteps: ["Change one number to a friendly ten.", "Do the easier calculation.", "Adjust back if needed."] },
  { id: 25, stageId: StageId.BigNumberMountain, code: "strategy-bridge-2", name: "Strategy Bridge: Two-Digit Mix", reason: "Lesson 25", explanation: "Use the two-digit shortcut that feels easiest or fastest.", example: "49 + 6 or 56 - 10", thinkSteps: ["Look for tens, ones, bridging, or compensation.", "Choose the shortcut that fits.", "Solve it and keep moving."] },

  { id: 26, stageId: StageId.TheSummit, code: "summit-facts-20", name: "Strategy Bridge: Fast Facts to 20", reason: "Lesson 26", explanation: "Mix facts to 20 and choose the fastest strategy.", example: "7 + 8, 13 - 6, or 9 + 4", thinkSteps: ["Use any shortcut you know.", "You do not need to explain it.", "Just solve efficiently."] },
  { id: 27, stageId: StageId.TheSummit, code: "summit-missing-families", name: "Strategy Bridge: Missing Parts", reason: "Lesson 27", explanation: "Use fact families, missing parts, and count-up thinking.", example: "8 + ? = 15", thinkSteps: ["Think of the related fact.", "Find the missing part.", "Use counting only if you need it."] },
  { id: 28, stageId: StageId.TheSummit, code: "summit-two-digit", name: "Strategy Bridge: Two-Digit Review", reason: "Lesson 28", explanation: "Practice bigger-number shortcuts in a mixed set.", example: "28 + 5 or 47 - 3", thinkSteps: ["Look for the easiest shortcut.", "Use tens, ones, bridging, or compensation.", "Keep going."] },
  { id: 29, stageId: StageId.TheSummit, code: "speed-challenge", name: "Speed Challenge", reason: "Lesson 29", explanation: "A fast mixed review of the mental math journey.", example: "Different facts, different shortcuts", thinkSteps: ["Use the shortcut that appears first.", "Trust the facts you know.", "Keep your rhythm."] },
  { id: 30, stageId: StageId.TheSummit, code: "backup-plan", name: "The Backup Plan", reason: "Lesson 30", explanation: "If no shortcut appears, count on or count back carefully.", example: "13 + 4 = 17", thinkSteps: ["Try a known shortcut first.", "If you are truly stuck, count on or count back.", "Counting is the backup plan, not the first plan."] },
];

function normalizeIdPart(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "fact";
}

function getStageIdForStrategy(strategyCode: string): StageId | undefined {
  const strategy = STRATEGIES.find((item) => item.code === strategyCode);
  return strategy ? strategy.stageId : undefined;
}

function makeQuestion(params: {
  strategyCode: string;
  question: string;
  answer: number;
  hint: string;
  type?: string;
  family?: string;
  difficulty?: number;
  options?: string[];
}): MathQuestion {
  const family = params.family || "general";
  return {
    id: `${params.strategyCode}:${family}:${normalizeIdPart(params.question)}`,
    strategyCode: params.strategyCode,
    question: params.question,
    answer: params.answer,
    hint: params.hint,
    type: params.type || "input",
    family,
    difficulty: params.difficulty || 1,
    stageId: getStageIdForStrategy(params.strategyCode),
    options: params.options,
  };
}

function uniqueQuestions(questions: MathQuestion[]): MathQuestion[] {
  const seen: { [key: string]: boolean } = {};
  const unique: MathQuestion[] = [];
  questions.forEach((question) => {
    if (!seen[question.id]) {
      seen[question.id] = true;
      unique.push(question);
    }
  });
  return unique;
}

function range(min: number, max: number): number[] {
  const values: number[] = [];
  for (let value = min; value <= max; value++) values.push(value);
  return values;
}

function poolsForCodes(codes: string[]): MathQuestion[] {
  const groups: MathQuestion[][] = [];
  codes.forEach((code) => groups.push(buildSingleStrategyQuestionPool(code)));
  return uniqueQuestions(groups.flat());
}

function buildSingleStrategyQuestionPool(strategyCode: string): MathQuestion[] {
  const list: MathQuestion[] = [];
  switch (strategyCode) {
    case "same-number": {
      range(0, 10).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} + 0`, answer: x, hint: "Adding 0 keeps the number the same.", family: "zero-add", difficulty: 1 }));
        if (x !== 0) list.push(makeQuestion({ strategyCode, question: `0 + ${x}`, answer: x, hint: "Adding 0 keeps the number the same.", family: "zero-add", difficulty: 1 }));
        list.push(makeQuestion({ strategyCode, question: `${x} - 0`, answer: x, hint: "Subtracting 0 keeps the number the same.", family: "zero-subtract", difficulty: 1 }));
      }); break;
    }
    case "one-more-less": {
      range(0, 10).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} + 1`, answer: x + 1, hint: `Move one step forward from ${x}.`, family: "one-more", difficulty: 1 }));
        if (x !== 1) list.push(makeQuestion({ strategyCode, question: `1 + ${x}`, answer: x + 1, hint: `Move one step forward from ${x}.`, family: "one-more", difficulty: 1 }));
      });
      range(1, 11).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} - 1`, answer: x - 1, hint: `Move one step back from ${x}.`, family: "one-less", difficulty: 1 }));
      }); break;
    }
    case "two-more-less": {
      range(0, 10).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} + 2`, answer: x + 2, hint: `Move two steps forward from ${x}.`, family: "two-more", difficulty: 1 }));
        if (x !== 2) list.push(makeQuestion({ strategyCode, question: `2 + ${x}`, answer: x + 2, hint: `Move two steps forward from ${x}.`, family: "two-more", difficulty: 1 }));
      });
      range(2, 12).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} - 2`, answer: x - 2, hint: `Move two steps back from ${x}.`, family: "two-less", difficulty: 1 }));
      }); break;
    }
    case "doubles-small": {
      range(0, 5).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} + ${x}`, answer: x + x, hint: `Double ${x}.`, family: "double-small", difficulty: 1 }));
      }); break;
    }
    case "doubles-big": {
      range(6, 9).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `${x} + ${x}`, answer: x + x, hint: `Double ${x}.`, family: "double-big", difficulty: 2 }));
      }); break;
    }
    case "doubles": {
      list.push(...buildSingleStrategyQuestionPool("doubles-small"));
      list.push(...buildSingleStrategyQuestionPool("doubles-big"));
      break;
    }
    case "bond-10": {
      range(0, 10).forEach((part) => {
        const missing = 10 - part;
        const hint = `${part} and ${missing} are partners that make 10.`;
        list.push(makeQuestion({ strategyCode, question: `${part} + ? = 10`, answer: missing, hint, family: "make-10-missing-part", difficulty: 1 }));
        if (part !== missing) list.push(makeQuestion({ strategyCode, question: `? + ${part} = 10`, answer: missing, hint, family: "make-10-missing-part", difficulty: 1 }));
      });
      range(1, 5).forEach((left) => {
        const right = 10 - left;
        list.push(makeQuestion({ strategyCode, question: `${left} + ${right}`, answer: 10, hint: `${left} and ${right} are partners that make 10.`, family: "make-10-full-fact", difficulty: 1 }));
      }); break;
    }
    case "subtract-from-10": {
      range(0, 10).forEach((x) => {
        list.push(makeQuestion({ strategyCode, question: `10 - ${x}`, answer: 10 - x, hint: `Think of the partner that goes with ${x} to make 10.`, family: "subtract-from-10", difficulty: 1 }));
      }); break;
    }
    case "near-double-one": {
      range(2, 9).forEach((high) => {
        const low = high - 1;
        const sum = high + low;
        const hint = `Use the higher double ${high} + ${high}, then subtract 1.`;
        list.push(makeQuestion({ strategyCode, question: `${high} + ${low}`, answer: sum, hint, family: "near-double-one", difficulty: 2 }));
        list.push(makeQuestion({ strategyCode, question: `${low} + ${high}`, answer: sum, hint, family: "near-double-one", difficulty: 2 }));
      }); break;
    }
    case "near-double-two": {
      range(2, 8).forEach((middle) => {
        const low = middle - 1;
        const high = middle + 1;
        const sum = low + high;
        const hint = `Use the middle double ${middle} + ${middle}.`;
        list.push(makeQuestion({ strategyCode, question: `${low} + ${high}`, answer: sum, hint, family: "near-double-two", difficulty: 2 }));
        list.push(makeQuestion({ strategyCode, question: `${high} + ${low}`, answer: sum, hint, family: "near-double-two", difficulty: 2 }));
      }); break;
    }
    case "make-10-add": {
      range(6, 9).forEach((a) => {
        range(2, 9).forEach((b) => {
          const sum = a + b;
          const need = 10 - a;
          if (sum > 10 && sum <= 18 && b > need) {
            list.push(makeQuestion({ strategyCode, question: `${a} + ${b}`, answer: sum, hint: `${a} needs ${need} to make 10. Split the other number and finish from 10.`, family: "make-10-add", difficulty: 3 }));
            if (a !== b) list.push(makeQuestion({ strategyCode, question: `${b} + ${a}`, answer: sum, hint: `${a} needs ${need} to make 10. Split the other number and finish from 10.`, family: "make-10-add", difficulty: 3 }));
          }
        });
      }); break;
    }
    case "bridge-back": {
      range(11, 20).forEach((start) => {
        range(2, 9).forEach((sub) => {
          const answer = start - sub;
          if (answer >= 2 && answer < 10 && sub > start - 10) list.push(makeQuestion({ strategyCode, question: `${start} - ${sub}`, answer, hint: "Jump back to 10 first, then subtract the rest.", family: "bridge-back-subtract", difficulty: 3 }));
        });
      }); break;
    }
    case "missing-part-10": {
      range(0, 10).forEach((part) => {
        const missing = 10 - part;
        list.push(makeQuestion({ strategyCode, question: `${part} + ? = 10`, answer: missing, hint: `Find the partner that goes with ${part} to make 10.`, family: "missing-part-10", difficulty: 2 }));
        if (part !== missing) list.push(makeQuestion({ strategyCode, question: `? + ${part} = 10`, answer: missing, hint: `Find the partner that goes with ${part} to make 10.`, family: "missing-part-10", difficulty: 2 }));
      }); break;
    }
    case "fact-family-10": {
      range(1, 9).forEach((a) => {
        const b = 10 - a;
        list.push(makeQuestion({ strategyCode, question: `${a} + ${b}`, answer: 10, hint: `${a}, ${b}, and 10 are in the same fact family.`, family: "family-10-add", difficulty: 2 }));
        list.push(makeQuestion({ strategyCode, question: `10 - ${a}`, answer: b, hint: `${a}, ${b}, and 10 are in the same fact family.`, family: "family-10-subtract", difficulty: 2 }));
        list.push(makeQuestion({ strategyCode, question: `10 - ${b}`, answer: a, hint: `${a}, ${b}, and 10 are in the same fact family.`, family: "family-10-subtract", difficulty: 2 }));
        list.push(makeQuestion({ strategyCode, question: `10 = ${a} + ?`, answer: b, hint: `${a}, ${b}, and 10 are in the same fact family.`, family: "family-10-reverse-equation", difficulty: 3 }));
      }); break;
    }
    case "fact-family-20": {
      range(11, 20).forEach((total) => {
        range(2, 9).forEach((a) => {
          const b = total - a;
          if (b >= 2 && b <= 9) {
            list.push(makeQuestion({ strategyCode, question: `${a} + ${b}`, answer: total, hint: `${a}, ${b}, and ${total} are in the same fact family.`, family: "family-20-add", difficulty: 3 }));
            list.push(makeQuestion({ strategyCode, question: `${total} - ${a}`, answer: b, hint: `Think of the related addition fact ${a} + ${b} = ${total}.`, family: "family-20-subtract", difficulty: 3 }));
            list.push(makeQuestion({ strategyCode, question: `${total} - ${b}`, answer: a, hint: `Think of the related addition fact ${a} + ${b} = ${total}.`, family: "family-20-subtract", difficulty: 3 }));
            list.push(makeQuestion({ strategyCode, question: `${total} = ${a} + ?`, answer: b, hint: `Think of the related addition fact ${a} + ${b} = ${total}.`, family: "family-20-reverse-equation", difficulty: 4 }));
          }
        });
      }); break;
    }
    case "missing-addend": {
      range(11, 20).forEach((total) => {
        range(2, 9).forEach((part) => {
          const missing = total - part;
          if (missing >= 2 && missing <= 9) list.push(makeQuestion({ strategyCode, question: `${part} + ? = ${total}`, answer: missing, hint: `Think of ${total} - ${part}, or count up from ${part} to ${total}.`, family: "missing-addend", difficulty: 3 }));
        });
      }); break;
    }
    case "count-up": {
      range(5, 19).forEach((bottom) => {
        range(1, 6).forEach((diff) => {
          const top = bottom + diff;
          if (top <= 20) list.push(makeQuestion({ strategyCode, question: `${top} - ${bottom}`, answer: diff, hint: `Think ${bottom} + ? = ${top}. Count up only if you need to.`, family: "count-up-subtract", difficulty: 2 }));
        });
      }); break;
    }
    case "count-on": {
      range(5, 16).forEach((main) => {
        range(1, 4).forEach((extra) => {
          if (main + extra <= 20) {
            list.push(makeQuestion({ strategyCode, question: `${main} + ${extra}`, answer: main + extra, hint: `Start with ${main} and count on ${extra} jumps.`, family: "count-on-add", difficulty: 2 }));
            list.push(makeQuestion({ strategyCode, question: `${extra} + ${main}`, answer: main + extra, hint: `Start with ${main} and count on ${extra} jumps.`, family: "count-on-add", difficulty: 2 }));
          }
        });
      }); break;
    }
    case "count-back": {
      range(5, 20).forEach((start) => {
        range(1, 4).forEach((sub) => {
          if (start - sub >= 0) list.push(makeQuestion({ strategyCode, question: `${start} - ${sub}`, answer: start - sub, hint: `Start at ${start} and count back ${sub} steps.`, family: "count-back-subtract", difficulty: 2 }));
        });
      }); break;
    }
    case "add-tens": {
      range(1, 9).forEach((a) => {
        range(1, 9).forEach((b) => {
          if (a + b <= 10) list.push(makeQuestion({ strategyCode, question: `${a * 10} + ${b * 10}`, answer: (a + b) * 10, hint: `Add ${a} tens and ${b} tens.`, family: "add-tens", difficulty: 3 }));
          if (a > b) list.push(makeQuestion({ strategyCode, question: `${a * 10} - ${b * 10}`, answer: (a - b) * 10, hint: `Subtract ${b} tens from ${a} tens.`, family: "subtract-tens", difficulty: 3 }));
        });
      }); break;
    }
    case "add-ones-two-digit": {
      [2, 3, 4, 5, 6].forEach((tens) => {
        [0, 2, 4, 6].forEach((ones) => {
          range(1, 4).forEach((add) => {
            if (ones + add <= 9) { const n = tens * 10 + ones; list.push(makeQuestion({ strategyCode, question: `${n} + ${add}`, answer: n + add, hint: `Keep the tens and add the ones: ${ones} + ${add}.`, family: "add-ones-two-digit", difficulty: 3 })); }
          });
        });
      }); break;
    }
    case "subtract-ones-two-digit": {
      [2, 3, 4, 5, 6, 7, 8].forEach((tens) => {
        [3, 5, 7, 9].forEach((ones) => {
          range(1, 4).forEach((sub) => {
            if (ones - sub >= 0) { const n = tens * 10 + ones; list.push(makeQuestion({ strategyCode, question: `${n} - ${sub}`, answer: n - sub, hint: `Keep the tens and subtract the ones: ${ones} - ${sub}.`, family: "subtract-ones-two-digit", difficulty: 3 })); }
          });
        });
      }); break;
    }
    case "add-subtract-10-two-digit": {
      [2, 3, 4, 5, 6, 7, 8].forEach((tens) => {
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((ones) => {
          const n = tens * 10 + ones;
          if (n + 10 < 100) list.push(makeQuestion({ strategyCode, question: `${n} + 10`, answer: n + 10, hint: "Add one ten. The ones stay the same.", family: "add-10-two-digit", difficulty: 3 }));
          if (n - 10 >= 10) list.push(makeQuestion({ strategyCode, question: `${n} - 10`, answer: n - 10, hint: "Subtract one ten. The ones stay the same.", family: "subtract-10-two-digit", difficulty: 3 }));
        });
      }); break;
    }
    case "bridge-ones-two-digit": {
      [2, 3, 4, 5, 6].forEach((tens) => {
        [7, 8, 9].forEach((ones) => {
          range(2, 5).forEach((add) => {
            if (ones + add >= 10 && ones + add <= 14) { const n = tens * 10 + ones; list.push(makeQuestion({ strategyCode, question: `${n} + ${add}`, answer: n + add, hint: `Jump from ${n} to the next ten, then add what is left.`, family: "bridge-ones-add", difficulty: 4 })); }
          });
        });
      });
      [2, 3, 4, 5, 6].forEach((tens) => {
        [1, 2, 3].forEach((ones) => {
          range(2, 5).forEach((sub) => {
            if (sub > ones) { const n = tens * 10 + ones; list.push(makeQuestion({ strategyCode, question: `${n} - ${sub}`, answer: n - sub, hint: `Jump from ${n} back to the previous ten, then subtract what is left.`, family: "bridge-ones-subtract", difficulty: 4 })); }
          });
        });
      }); break;
    }
    case "add-two-digit-place": {
      [2, 3, 4, 5, 6].forEach((t1) => {
        [1, 3, 5, 7].forEach((o1) => {
          [1, 2].forEach((t2) => {
            [1, 2, 3, 4].forEach((o2) => {
              if (o1 + o2 <= 9) { const n1 = t1 * 10 + o1; const n2 = t2 * 10 + o2; if (n1 + n2 < 100) list.push(makeQuestion({ strategyCode, question: `${n1} + ${n2}`, answer: n1 + n2, hint: "Add the tens, then add the ones.", family: "add-place-value", difficulty: 4 })); }
            });
          });
        });
      }); break;
    }
    case "subtract-two-digit-place": {
      [4, 5, 6, 7, 8].forEach((t1) => {
        [3, 5, 7, 9].forEach((o1) => {
          [1, 2, 3].forEach((t2) => {
            [1, 2, 3, 4].forEach((o2) => {
              if (t1 > t2 && o1 >= o2) { const n1 = t1 * 10 + o1; const n2 = t2 * 10 + o2; list.push(makeQuestion({ strategyCode, question: `${n1} - ${n2}`, answer: n1 - n2, hint: "Subtract the tens, then subtract the ones.", family: "subtract-place-value", difficulty: 4 })); }
            });
          });
        });
      }); break;
    }
    case "two-digit-place": {
      list.push(...buildSingleStrategyQuestionPool("add-two-digit-place"));
      list.push(...buildSingleStrategyQuestionPool("subtract-two-digit-place"));
      break;
    }
    case "compensation": {
      [1, 2, 3, 4, 5, 6, 7, 8].forEach((tens) => {
        const nearTen = tens * 10 + 9;
        range(2, 6).forEach((add) => {
          if (nearTen + add < 100) list.push(makeQuestion({ strategyCode, question: `${nearTen} + ${add}`, answer: nearTen + add, hint: `Make ${nearTen} into ${nearTen + 1}, then add the rest.`, family: "compensation-add", difficulty: 4 }));
        });
      });
      [3, 4, 5, 6, 7, 8, 9].forEach((tens) => {
        const base = tens * 10;
        range(8, 15).forEach((sub) => {
          if (base - sub > 0) list.push(makeQuestion({ strategyCode, question: `${base} - ${sub}`, answer: base - sub, hint: "Subtract a nearby ten first, then adjust.", family: "compensation-subtract", difficulty: 4 }));
        });
      }); break;
    }
    case "strategy-bridge-1": {
      list.push(...poolsForCodes(["near-double-one", "near-double-two", "make-10-add", "bridge-back"]));
      break;
    }
    case "strategy-bridge-2": {
      list.push(...poolsForCodes(["add-tens", "add-ones-two-digit", "subtract-ones-two-digit", "add-subtract-10-two-digit", "bridge-ones-two-digit", "two-digit-place", "compensation"]));
      break;
    }
    case "summit-facts-20": {
      list.push(...poolsForCodes(["doubles", "near-double-one", "near-double-two", "make-10-add", "bridge-back", "fact-family-20"]));
      break;
    }
    case "summit-missing-families": {
      list.push(...poolsForCodes(["bond-10", "subtract-from-10", "missing-part-10", "fact-family-10", "fact-family-20", "missing-addend", "count-up"]));
      break;
    }
    case "summit-two-digit": {
      list.push(...poolsForCodes(["add-tens", "add-ones-two-digit", "subtract-ones-two-digit", "add-subtract-10-two-digit", "bridge-ones-two-digit", "two-digit-place", "compensation"]));
      break;
    }
    case "speed-challenge": {
      list.push(...poolsForCodes(["same-number", "one-more-less", "two-more-less", "doubles", "bond-10", "subtract-from-10", "near-double-one", "near-double-two", "make-10-add", "bridge-back", "fact-family-20", "missing-addend", "add-tens", "add-subtract-10-two-digit", "bridge-ones-two-digit", "compensation"]));
      break;
    }
    case "backup-plan": {
      list.push(...poolsForCodes(["count-on", "count-back", "count-up"]));
      break;
    }
    default: {
      range(1, 10).forEach((a) => {
        range(1, 10).forEach((b) => {
          list.push(makeQuestion({ strategyCode, question: `${a} + ${b}`, answer: a + b, hint: "Use any strategy you know.", family: "fallback-add", difficulty: 1 }));
        });
      });
    }
  }
  return uniqueQuestions(list);
}

export function getStrategyCodesForPractice(strategyCode: string): string[] {
  return [strategyCode];
}

export function generateQuestionPoolForStrategy(strategyCode: string): MathQuestion[] {
  const codes = getStrategyCodesForPractice(strategyCode);
  const questions: MathQuestion[] = [];
  codes.forEach((code) => questions.push(...buildSingleStrategyQuestionPool(code)));
  return uniqueQuestions(questions);
}

export function generateQuestionsForStrategy(strategyCode: string, count: number = 5): MathQuestion[] {
  const pool = generateQuestionPoolForStrategy(strategyCode);
  if (pool.length === 0) return [];
  const list: MathQuestion[] = [];
  for (let i = 0; i < count; i++) list.push(pool[Math.floor(Math.random() * pool.length)]);
  return list;
}
