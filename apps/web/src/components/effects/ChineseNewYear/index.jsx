"use client";

import { Lantern } from "./Lantern";
import { Atmosphere } from "./Atmosphere";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useWindowSize } from "@uidotdev/usehooks";

export const ChineseNewYear = () => {
  const [mounted, setMounted] = useState(false);
  const { themeStyle } = useTheme();
  const { width } = useWindowSize();
  
  const isMobile = width < 768;
  const mainLanternSize = isMobile ? 60 : 120;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || themeStyle !== 'cny') return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* Left Lanterns */}
      <Lantern 
        className="absolute left-4 top-14 md:top-16" 
        size={mainLanternSize} 
        swing={10} 
        duration={5}
      />
       <Lantern 
        className="absolute left-16 top-10 md:left-24 md:top-12" 
        size={isMobile ? 50 : 80} 
        swing={8} 
        duration={6}
        delay={1}
      />

      {/* Right Lanterns */}
      <Lantern 
        className="absolute right-4 top-14 md:top-16" 
        size={mainLanternSize} 
        swing={-10} 
        duration={5}
        delay={0.5}
      />
      <Lantern 
        className="absolute right-16 top-10 md:right-24 md:top-12" 
        size={isMobile ? 50 : 80} 
        swing={-8} 
        duration={6}
        delay={1.5}
      />

      {/* Atmosphere / Particles */}
      <Atmosphere />
    </div>
  );
};
