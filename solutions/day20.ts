const BUTTON_PRESS_COUNT = 100000;

interface Signal {
  sourceName: string;
  target: string;
  level: boolean;
}

abstract class Module {
  private targets: string[] = [];
  name: string;

  constructor(name: string, targets: string[]) {
    this.name = name;
    this.targets = targets;
  }

  abstract signal(sourceName: string, level: boolean): Signal[];

  abstract get value(): string;

  protected generateSignals(outLevel: boolean): Signal[] {
    return this.targets.map((target) => ({
      sourceName: this.name,
      target: target,
      level: outLevel,
    }));
  }
}

class FlipFlop extends Module {
  private memory = false;

  signal(sourceName: string, level: boolean) {
    if (!level) {
      this.memory = !this.memory;
      return this.generateSignals(this.memory);
    }
    return [];
  }

  get value() {
    return this.memory ? "1" : "0";
  }
}

class Conjunction extends Module {
  private sources = new Map<string, boolean>();

  signal(sourceName: string, level: boolean) {
    this.sources.set(sourceName, level);
    return this.generateSignals(this.getOutputSignal());
  }

  setSources(sourceNames: string[]) {
    sourceNames.forEach((sourceName) => {
      this.sources.set(sourceName, false);
    });
  }

  private getOutputSignal() {
    if ([...this.sources.values()].every((memory) => memory)) {
      return false;
    } else {
      return true;
    }
  }

  get value() {
    return [...this.sources.values()].map((value) => (value ? 1 : 0)).join(",");
  }
}

const bigNANDs = ["vr", "pf", "ts", "xd"];
const bigNANDOuts = ["ks", "pm", "dl", "vk"];
const nanFalse = new Map<string, number[]>();

bigNANDOuts.forEach((nan) => {
  nanFalse.set(nan, []);
});

export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const modules = new Map<string, Module>();
  const broadcasterTargets: string[] = [];
  const sourceMap = new Map<string, string[]>();

  rows.forEach((row) => {
    const [moduleDesc, targetsDesc] = row.split(" -> ");
    const targets = targetsDesc.split(", ");

    if (moduleDesc === "broadcaster") {
      broadcasterTargets.push(...targets);
      return;
    }

    const type = moduleDesc.slice(0, 1);
    const name = moduleDesc.slice(1);

    if (type === "%") {
      const flipFlip = new FlipFlop(name, targets);
      modules.set(name, flipFlip);
    }
    if (type === "&") {
      const conjunction = new Conjunction(name, targets);
      modules.set(name, conjunction);
    }

    targets.forEach((target) => {
      const sources = sourceMap.get(target) ?? [];
      sources.push(name);
      sourceMap.set(target, sources);
    });
  });

  sourceMap.forEach((sources, name) => {
    const module = modules.get(name);
    if (module instanceof Conjunction) module.setSources(sources);
  });

  let lowCount = 0;
  let highCount = 0;

  for (let i = 0; i < BUTTON_PRESS_COUNT; i++) {
    const result = pushTheButton(modules, broadcasterTargets, i);
    lowCount += result.lowCount;
    highCount += result.highCount;

    if ([...nanFalse.values()].every(periods => periods.length > 1)) {
      const periods = [...nanFalse.values()].map(p => p[1] + 1);
      return lcmFunction(lcmFunction(lcmFunction(periods[0], periods[1]), periods[2]), periods[3])
    }

    if (result.found) break;
  }
  return lowCount + highCount;
};

const pushTheButton = (modules: Map<string, Module>, startModules: string[], i: number) => {
  const signalQueue: Signal[] = [];

  let lowCount = startModules.length + 1;
  let highCount = 0;

  startModules.forEach((startModule) => {
    signalQueue.push({ target: startModule, level: false, sourceName: "boardcaster" });
  });

  while (signalQueue.length > 0) {
    const { sourceName, target, level } = signalQueue.shift();

    if (target === "rx" && level === false) {
      // continue;
      // return { lowCount, highCount, found: true };
    }

    const module = modules.get(target);
    if (!module) continue; // output

    if (bigNANDOuts.includes(target)) {
      if (module.value === "0") {
        const falses = nanFalse.get(target);
        falses.push(i);
      }
    }

    const outSignals = module.signal(sourceName, level);
    if (outSignals[0]?.level) {
      highCount += outSignals.length;
    } else {
      lowCount += outSignals.length;
    }

    signalQueue.push(...outSignals);
  }

  // console.log(lowCount, highCount);
  return { lowCount, highCount, found: false };
};


function gcd(a, b) { 
  for (let temp = b; b !== 0;) { 
      b = a % b; 
      a = temp; 
      temp = b; 
  } 
  return a; 
} 

function lcmFunction(a, b) { 
  const gcdValue = gcd(a, b); 
  return (a * b) / gcdValue; 
} 