import { useEffect, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
}

function createJunkyPath(start: Node, end: Node): string {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  // const randomOffsetX = () => (Math.random() - 0.5) * 200;
  // const randomOffsetY = () => (Math.random() - 0.5) * 100;

  const controlPoint1 = {
    x: midX,
    y: start.y,
  };
  const controlPoint2 = {
    x: midX,
    y: end.y,
  };

  return `M${start.x + 50},${start.y} C${controlPoint1.x},${controlPoint1.y} ${
    controlPoint2.x
  },${controlPoint2.y} ${end.x - 25},${end.y}`;
}

export function useNodeConnections(nodes: Node[]) {
  const [connections, setConnections] = useState<
    { start: Node; end: Node; path: string }[]
  >([]);

  useEffect(() => {
    const newConnections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      newConnections.push({
        start: nodes[i],
        end: nodes[i + 1],
        path: createJunkyPath(nodes[i], nodes[i + 1]),
      });
    }
    setConnections(newConnections);
  }, [nodes]);

  return connections;
}
