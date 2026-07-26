import { useRef } from "react";
import { motion, useSpring } from "framer-motion";

import { AlertCard } from "./AlertCard";
import { DashboardCard } from "./DashboardCard";
import { SDKCard } from "./SDKCard";

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
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
      className="relative flex shrink-0 items-center justify-center [perspective:1200px]"
      aria-hidden="true"
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-[560px] w-[540px] max-lg:h-[500px] max-lg:w-[480px] max-md:h-[480px] max-md:w-[440px]"
      >
        <AlertCard />
        <SDKCard />
        <DashboardCard />
      </motion.div>
    </div>
  );
}
