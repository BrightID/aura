import { useEffect, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  connected: boolean;
}

const AnimatedNodeCircles = () => {
  const [nodes] = useState<Node[]>(() => {
    const centerX = 100;
    const centerY = 75;
    const nodes: Node[] = [];
    const minDistanceFromCenter = 30; // Minimum distance from central node
    const minDistanceBetweenNodes = 20; // Minimum distance between nodes

    const isTooCloseToOthers = (x: number, y: number) => {
      return nodes.some(
        (node) =>
          Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2)) <
          minDistanceBetweenNodes,
      );
    };

    // Create 15 nodes with random positions
    for (let i = 0; i < 15; i++) {
      let isValidPosition = false;
      let x: number, y: number;

      // Generate positions until valid
      while (!isValidPosition) {
        x = Math.random() * 180 + 10;
        y = Math.random() * 130 + 10;

        // Check distance from center
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
        );

        // Check distance from other nodes
        const tooCloseToOthers = isTooCloseToOthers(x, y);

        isValidPosition =
          distanceFromCenter > minDistanceFromCenter && !tooCloseToOthers;
      }

      nodes.push({
        id: i,
        x: x!,
        y: y!,
        connected: Math.random() < 0.6,
      });
    }

    // Set central node
    nodes.unshift({ id: 0, x: centerX, y: centerY, connected: true });
    return nodes;
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 500);
  }, []);

  const getCurvedPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const cx = startX + dx * 0.5 + dy * (Math.random() - 0.5) * 0.3;
    const cy = startY + dy * 0.5 + dx * (Math.random() - 0.5) * 0.3;

    return `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`;
  };

  return (
    <div
      className="relative mx-auto rounded-lg shadow-sm"
      style={{ width: 220, height: 150 }}
    >
      <svg className="absolute w-full h-full">
        {nodes.map((node, index) => {
          if (!node.connected || node.id === 0) return null;

          const center = nodes[0];
          return (
            <path
              key={index}
              d={getCurvedPath(node.x, node.y, center.x, center.y)}
              fill="none"
              stroke="rgb(239 68 68)"
              strokeWidth="1.5"
              className={`transition-[stroke-dashoffset] duration-1000 ${
                animate ? 'stroke-dashoffset-0' : ''
              }`}
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: animate ? 0 : 1000,
              }}
            />
          );
        })}
      </svg>

      {nodes.map((node, key) => (
        <div
          key={key}
          className={`absolute rounded-full transition-transform duration-300
            ${node.connected ? 'bg-red-500' : 'bg-red-200'} 
            transform -translate-x-1/2 -translate-y-1/2 shadow-sm
            ${node.id === 0 ? 'w-8 h-8' : 'w-4 h-4'}
            ${animate ? 'scale-100' : 'scale-0'}`}
          style={{
            top: node.y,
            left: node.x,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedNodeCircles;
