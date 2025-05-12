interface Edge {
  from: number;
  to: number;
  distance: number;
}

function PrimAlgorithm(matrix: number[][]): number[][] {
  let newMatrix: number[][] = Array.from(matrix, (row) =>
    Array.from(row, () => 0)
  );
  let addedNodes: number[] = [];
  let edges: Edge[] = [];

  // aristas
  for (let i = 0; i < matrix.length - 1; i++) {
    for (let j = i + 1; j < matrix.length; j++) {
      if (matrix[i]![j] !== 0) {
        const newEdge: Edge = { from: i, to: j, distance: matrix[i]![j]! };
        edges.push(newEdge);
      }
    }
  }

  // camino corto
  edges.sort((a, b) => a.distance.valueOf() - b.distance.valueOf());
  fillMatrix(newMatrix, addedNodes, edges[0]!);
  edges.splice(0, 1);

  // encontrar aristas
  while (matrix.length !== addedNodes.length) {
    const selectedEdge = getNearest(addedNodes, edges);
    fillMatrix(newMatrix, addedNodes, edges[selectedEdge]!);
    edges.splice(selectedEdge, 1);
  }

  return newMatrix;
}

function getNearest(addedNodes: number[], edges: Edge[]): number {
  for (let i = 0; i < edges.length; i++) {
    if (
      addedNodes.includes(edges[i]!.from) !== addedNodes.includes(edges[i]!.to)
    ) {
      return i;
    }
  }
  return 0;
}

function fillMatrix(matrix: number[][], addedNodes: number[], edge: Edge) {
  matrix[edge.from.valueOf()]![edge.to.valueOf()] = edge.distance;
  matrix[edge.to.valueOf()]![edge.from.valueOf()] = edge.distance;
  if (!addedNodes.includes(edge.from)) {
    addedNodes.push(edge.from);
  }
  if (!addedNodes.includes(edge.to)) {
    addedNodes.push(edge.to);
  }
}

export default PrimAlgorithm;
