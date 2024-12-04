enum OPERATION {
  LS = "lesser",
  GT = "greater",
}

interface Range {
  min: number;
  max: number;
}

interface PartRange {
  x: Range;
  m: Range;
  a: Range;
  s: Range;
  nextCondition: {
    i: number;
    workFlow: string;
  };
}

type Part = Record<string, number>;

interface WorkflowStep {
  condition?: {
    property: string;
    operation: OPERATION;
    value: number;
  };
  target: string;
}

export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const workFlows = new Map<string, WorkflowStep[]>();
  const parts: PartRange[] = [];

  let isWorkflow = true;
  rows.forEach((row) => {
    if (row === "") {
      isWorkflow = false;
      return;
    }
    if (isWorkflow) parseWorkflow(workFlows, row);
    else parsePart(parts, row);
  });

  const validRanges = findValidRanges(workFlows);
  return calculateValueofRanges(validRanges);
  // return parts.filter((part) => checkPart(part, workFlows)).reduce((sum, part) =>  sum+part.sum, 0);
};

const parseWorkflow = (workFlows: Map<string, WorkflowStep[]>, row: string) => {
  const separatorIdx = row.indexOf("{");
  const name = row.slice(0, separatorIdx);
  const steps = row
    .slice(separatorIdx + 1, -1)
    .split(",")
    .map((description): WorkflowStep => {
      const parts = description.split(":");
      if (parts.length === 1) return { target: description };

      return {
        target: parts[1],
        condition: {
          property: parts[0][0],
          operation: parts[0][1] === "<" ? OPERATION.LS : OPERATION.GT,
          value: parseInt(parts[0].slice(2)),
        },
      };
    });

  workFlows.set(name, steps);
};

const parsePart = (parts: PartRange[], row: string) => {
  const part: any = {};
  row
    .slice(1, -1)
    .split(",")
    .forEach((property) => {
      const [name, value] = property.split("=");
      part[name] = { min: parseInt(value), max: parseInt(value) };
    });

  part.nextCondition = { i: 0, workFlow: "in" };

  parts.push(part);
};

const findValidRanges = (workFlows: Map<string, WorkflowStep[]>, defaultParts?: PartRange[]): PartRange[] => {
  const rangeBackStack: PartRange[] = defaultParts ?? [
    {
      x: { min: 1, max: 4000 },
      m: { min: 1, max: 4000 },
      a: { min: 1, max: 4000 },
      s: { min: 1, max: 4000 },
      nextCondition: {
        i: 0,
        workFlow: "in",
      },
    },
  ];

  const validRanges = [];

  while (rangeBackStack.length > 0) {
    const range = rangeBackStack.pop();
    if (range.nextCondition.workFlow === "A") {
      validRanges.push(range);
      continue;
    }
    if (range.nextCondition.workFlow === "R") {
      continue;
    }

    const { condition, target } = workFlows.get(range.nextCondition.workFlow)[range.nextCondition.i];

    const stringRange = JSON.stringify(range);

    // end reached
    if (!condition) {
      if (target === "A") {
        validRanges.push(range);
        continue;
      }
      if (target === "R") continue;

      const newRange: PartRange = JSON.parse(stringRange);
      newRange.nextCondition = {
        i: 0,
        workFlow: target,
      };
      rangeBackStack.push(newRange);
      continue;
    }

    const { operation, property, value } = condition;
    const minValue = range[property].min;
    const maxValue = range[property].max;

    const newRangeFail: PartRange = JSON.parse(stringRange);
    newRangeFail.nextCondition.i++;
    const newRangeSuccess: PartRange = JSON.parse(stringRange);
    newRangeSuccess.nextCondition = {
      i: 0,
      workFlow: target,
    };

    if (operation === OPERATION.GT) {
      newRangeSuccess[property].min = getInRange(value + 1, maxValue, minValue);
      newRangeFail[property].max = getInRange(value, maxValue, minValue);
      if (minValue <= value) rangeBackStack.push(newRangeFail);
      if (maxValue > value) rangeBackStack.push(newRangeSuccess);
    } else {
      newRangeSuccess[property].max = getInRange(value - 1, maxValue, minValue);
      newRangeFail[property].min = getInRange(value, maxValue, minValue);
      if (minValue < value) rangeBackStack.push(newRangeSuccess);
      if (maxValue >= value) rangeBackStack.push(newRangeFail);
    }
  }

  return validRanges;
};

const getInRange = (value: number, max: number, min: number) => {
  return Math.min(Math.max(value, min), max);
};

const calculateValueofRanges = (ranges: PartRange[]) => {
  return ranges.reduce((sum, range) => {
    const sizeX = getRangeSize(range.x);
    const sizeM = getRangeSize(range.m);
    const sizeA = getRangeSize(range.a);
    const sizeS = getRangeSize(range.s);
    const sumX = getRangeSum(range.x);
    const sumM = getRangeSum(range.m);
    const sumA = getRangeSum(range.a);
    const sumS = getRangeSum(range.s);

    return sum + sizeX * sizeM * sizeA * sizeS;
  }, 0);
};

const getRangeSize = ({ max, min }) => max - min + 1;

const getRangeSum = ({ max, min }) => ((max - min + 1) * (max + min)) / 2;
