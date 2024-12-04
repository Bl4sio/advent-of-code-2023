
interface NodeLink {
  R: string,
  L: string,
}

interface Period {
  length: number,
  endPosition: number[],
}

export default (inputString: string) => {
  const rows = inputString.split('\r\n');
  const directions = rows[0];
  const mapping = new Map<string, NodeLink>()

  let currentNodes = [];

  // create map
  rows.splice(2).forEach(row => {
    if (row === '') return;
    const strings = [...row.matchAll(/[a-zA-Z0-9]{3}/g)];
    const node = strings[0][0];
    const left = strings[1][0];
    const right = strings[2][0];
    mapping.set(node, { L: left, R: right });
    if (node[2] === 'A') currentNodes.push(node);
  })

  const periods = currentNodes.map(node => {
    return calculatePeriod(mapping, node, directions);
  })

  console.log(periods);

  return 0;
};

function calculatePeriod(mapping: Map<string, NodeLink>, startNode: string, directions: string) {
  const period: Period = {
    length: 0,
    endPosition: []
  }

  const startNodes = []
  let endNode = undefined;
  let currentNode = startNode;

  while (!startNodes.includes(endNode)) {
    startNodes.push(currentNode);
    let i = 0;

    for (const dir of directions) {
      currentNode = mapping.get(currentNode)[dir];
      if (currentNode[2] === 'Z') period.endPosition.push(period.length + i);
      i++;
    }

    endNode = currentNode;
    period.length += directions.length;
  }

  return period;
}