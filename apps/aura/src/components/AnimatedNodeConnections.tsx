import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { useNodeConnections } from '@/hooks/useNodeConnection';

interface Node {
  id: string;
  image: string;
  title: string;
  position: { x: number; y: number };
}

const nodes: Node[] = [
  {
    id: '1',
    image: '/placeholder.svg?height=100&width=100',
    title: 'Node 1',
    position: {
      x: 10,
      y: 20,
    },
  },
  {
    id: '2',
    image: '/placeholder.svg?height=100&width=100',
    title: 'Node 2',
    position: {
      x: 30,
      y: 80,
    },
  },
  {
    id: '3',
    image: '/placeholder.svg?height=100&width=100',
    title: 'Node 3',
    position: {
      x: 50,
      y: 30,
    },
  },
  {
    id: '4',
    image: '/placeholder.svg?height=100&width=100',
    title: 'Node 4',
    position: {
      x: 70,
      y: 70,
    },
  },
];

export function AnimatedNodeConnections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<
    { id: string; x: number; y: number }[]
  >([]);
  const connections = useNodeConnections(nodePositions);

  useEffect(() => {
    const updateNodePositions = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPositions = nodes.map((node) => {
          return {
            id: node.id,
            x: containerRect.width * (node.position.x / 100),
            y: containerRect.height * (node.position.y / 100),
          };
        });
        setNodePositions(newPositions);
      }
    };

    updateNodePositions();
    window.addEventListener('resize', updateNodePositions);
    return () => window.removeEventListener('resize', updateNodePositions);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mt-5">
      <div className="flex flex-wrap justify-around items-center gap-8">
        {nodes.map((node) => (
          <div
            key={node.id}
            id={`node-${node.id}`}
            className="flex flex-col items-center w-32"
          >
            <div
              className="w-14 h-14 rounded-full mb-4 bg-gradient-to-tr from-red-700 to-red-500"
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
              }}
            ></div>
            {/* <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2 * Number.parseInt(node.id),
              }}
              className="rounded-lg text-center"
            >
              {node.title}
            </motion.div> */}
          </div>
        ))}
      </div>
      <svg className="absolute inset-0 pointer-events-none">
        {connections.map((connection, index) => (
          <motion.path
            key={`connection-${index}`}
            d={connection.path}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 + 0.2 * index }}
          />
        ))}
      </svg>
    </div>
  );
}
