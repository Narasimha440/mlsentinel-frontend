import React from "react";
import { motion, useSpring, type MotionProps, type MotionStyle } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";

const NETWORK_NODES = [
  { id: 0, x: 8, y: 18, size: 4, delay: 0.1, duration: 18 },
  { id: 1, x: 27, y: 9, size: 3, delay: 0.4, duration: 20 },
  { id: 2, x: 50, y: 22, size: 4, delay: 0.8, duration: 17 },
  { id: 3, x: 74, y: 12, size: 3, delay: 1.2, duration: 21 },
  { id: 4, x: 91, y: 29, size: 4, delay: 1.5, duration: 19 },
  { id: 5, x: 82, y: 58, size: 3, delay: 1.9, duration: 22 },
  { id: 6, x: 20, y: 44, size: 4, delay: 0.6, duration: 16 },
  { id: 7, x: 39, y: 58, size: 3, delay: 1.1, duration: 23 },
  { id: 8, x: 19, y: 76, size: 4, delay: 1.7, duration: 18 },
  { id: 9, x: 59, y: 47, size: 3, delay: 2.1, duration: 20 },
  { id: 10, x: 69, y: 76, size: 4, delay: 2.5, duration: 17 },
  { id: 11, x: 91, y: 86, size: 3, delay: 2.8, duration: 21 },
] as const;

interface FloatingCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  style?: MotionStyle;
  "data-depth"?: number;
}

function FloatingCard({ children, className, style, "data-depth": depth = 0, ...motionProps }: FloatingCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-6px_rgba(17,24,39,0.08),0_2px_8px_-2px_rgba(17,24,39,0.04)]",
        className
      )}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      data-depth={depth}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

function PulseRing() {
  return (
    <motion.span
      animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      className="absolute inset-0 rounded-full border border-blue-600/30"
    />
  );
}

function HealthCard() {
  const y = useSpring(0, { stiffness: 120, damping: 20 });
  const x = useSpring(0, { stiffness: 120, damping: 20 });

  return (
    <FloatingCard
      style={{ y, x }}
      data-depth={1}
      animate={{
        y: [0, -8, 0],
        x: [0, 4, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-[280px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-900">
              Health Score
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-[36px] font-semibold leading-none tracking-tight text-gray-900">98</span>
            <span className="text-lg font-semibold text-gray-400">%</span>
          </div>
          <p className="mt-1 text-[12px] font-medium text-green-600">Healthy</p>
        </div>
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="relative h-20 w-20">
            <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#ECECEC"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#2563EB"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="213.6"
                initial={{ strokeDashoffset: 213.6 }}
                animate={{ strokeDashoffset: 213.6 * 0.02 }}
                transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[14px] font-semibold text-gray-900">98%</span>
            </div>
          </div>
          <PulseRing />
        </div>
      </div>
    </FloatingCard>
  );
}

function DriftCard() {
  const y = useSpring(0, { stiffness: 100, damping: 18 });
  const x = useSpring(0, { stiffness: 100, damping: 18 });

  return (
    <FloatingCard
      style={{ y, x }}
      data-depth={2}
      animate={{
        y: [0, 6, 0],
        x: [0, -3, 0],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      }}
      className="w-[280px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-900">
              Drift Detection
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <PulseRing />
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                <Check className="h-4 w-4 text-green-500" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-[14px] font-semibold text-green-600">No Drift</span>
          </div>
          <p className="mt-2 text-[12px] text-gray-500">Last Scan 2 seconds ago</p>
        </div>
      </div>
    </FloatingCard>
  );
}

function RecommendationsCard() {
  const y = useSpring(0, { stiffness: 110, damping: 19 });
  const x = useSpring(0, { stiffness: 110, damping: 19 });

  return (
    <FloatingCard
      style={{ y, x }}
      data-depth={3}
      animate={{
        y: [0, -5, 0],
        x: [0, 5, 0],
      }}
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
      className="w-[280px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-900">
              Recommendations
            </span>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-gray-600">
            Everything looks healthy.
          </p>
          <p className="mt-1 text-[13px] text-gray-500">Monitoring production traffic.</p>
        </div>
      </div>
    </FloatingCard>
  );
}

export function LoginVisual({ className }: { className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(x * 5);
    rotateX.set(-y * 5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative flex shrink-0 items-center justify-center [perspective:1200px]", className)}
      aria-hidden="true"
    >
      {/* Background AI Network */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        aria-hidden="true"
      >
        <AINetwork />
      </motion.div>

      {/* Floating Cards */}
      <motion.div
        className="relative flex flex-col items-center gap-6 z-10"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        <HealthCard />
        <DriftCard />
        <RecommendationsCard />
      </motion.div>
    </div>
  );
}

function AINetwork() {
  const nodes = NETWORK_NODES;

  const connections = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 6],
    [6, 7],
    [7, 8],
    [2, 9],
    [9, 10],
    [10, 11],
    [5, 11],
  ];

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full opacity-30" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="particleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Connections */}
      <g stroke="#2563EB" strokeWidth="0.4" strokeOpacity="0.15">
        {connections.map(([from, to], i) => {
          const fromNode = nodes[from];
          const toNode = nodes[to];
          return (
            <motion.line
              key={i}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              animate={{ strokeOpacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          );
        })}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.size}
            fill="#2563EB"
            fillOpacity={0.4}
            animate={{
              r: [node.size, node.size * 1.5, node.size],
              fillOpacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </g>

      {/* Flowing particles */}
      {connections.slice(0, 4).map(([from, to], i) => {
        const fromNode = nodes[from];
        const toNode = nodes[to];
        return (
          <motion.circle
            key={`particle-${i}`}
            cx={fromNode.x}
            cy={fromNode.y}
            r={1.5}
            fill="url(#particleGradient)"
            animate={{
              cx: [fromNode.x, toNode.x],
              cy: [fromNode.y, toNode.y],
              fillOpacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.75,
              ease: "linear",
            }}
          />
        );
      })}
    </svg>
  );
}
