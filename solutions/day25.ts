export default (inputString: string) => {
  const rows = inputString.split("\r\n");

  const { edges, nodes, relations } = parseData(rows);
  const nodeList = [...nodes.keys()];
  let otherSide = 0;

  for (let i = 1; i < nodeList.length; i++) {
    // for (let j = i + 1; j < nodeList.length; j++) {
    const startNode = nodeList[0];
    const endNode = nodeList[i];
    const paths = getPaths(startNode, endNode, relations);
    if (paths.length === 3) {
      otherSide++;
      console.log("YAY!!");
    }
    // }
  }

  return (nodeList.length - otherSide) * otherSide;;
};

const getPaths = (startNode: string, endNode: string, relations: Map<string, string[]>) => {
  const paths = [];
  const removedEdges = new Set<string>();

  while (true) {
    const path = getShortestPath(startNode, endNode, relations, removedEdges);
    if (!path) break;

    paths.push(path);

    for (let i = 0; i < path.length - 1; i++) {
      const key1 = `${path[i]}|${path[i + 1]}`;
      const key2 = `${path[i + 1]}|${path[i]}`;
      removedEdges.add(key1);
      removedEdges.add(key2);
    }
  }

  return paths;
};

const getShortestPath = (
  startNode: string,
  endNode: string,
  relations: Map<string, string[]>,
  removedEdges: Set<string>
) => {
  const visitedNodes = new Set<string>();
  const backStack = [{ nodeId: startNode, path: [] }];

  while (backStack.length > 0) {
    const { nodeId, path } = backStack.shift();
    if (nodeId === endNode) {
      return [...path, nodeId];
    }

    const connections = relations.get(nodeId);
    connections
      .filter((nextNode) => !visitedNodes.has(nextNode))
      .filter((nextNode) => !removedEdges.has(`${nodeId}|${nextNode}`))
      .forEach((nextNode) => {
        visitedNodes.add(nextNode);
        backStack.push({ nodeId: nextNode, path: [...path, nodeId] });
      });
  }
};

const parseData = (rows: string[]) => {
  const relations = new Map<string, string[]>();
  const edges: [string, string][] = [];
  const nodes = new Set<string>();

  rows.forEach((row) => {
    const [main, linksString] = row.split(": ");
    const links = linksString.split(" ");
    nodes.add(main);

    const mainVector = relations.get(main) ?? [];
    mainVector.push(...links);
    relations.set(main, mainVector);

    links.forEach((link) => {
      const linkVector = relations.get(link) ?? [];
      linkVector.push(main);
      relations.set(link, linkVector);

      edges.push([main, link]);
      nodes.add(link);
    });
  });

  return { relations, edges, nodes };
};
