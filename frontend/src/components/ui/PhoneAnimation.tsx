import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

type FloatingElementProps = {
  type: 'emoji' | 'stat' | 'chat';
  content: string;
  initialX: number;
  duration: number;
  delay: number;
  size?: string;
}

export const BackgroundPhoneAnimation = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const [floatingElements, setFloatingElements] = useState<FloatingElementProps[]>([
    {
      type: 'emoji',
      content: '💅',
      initialX: 350,
      duration: 7,
      delay: 0,
      size: 'text-4xl'
    },
    {
      type: 'chat',
      content: 'bestie is serving 🔥',
      initialX: 300,
      duration: 5,
      delay: 2
    },
    {
      type: 'stat',
      content: '99% tea spilled',
      initialX: 350,
      duration: 6,
      delay: 1
    },
    {
      type: 'emoji',
      content: '☕️',
      initialX: 400,
      duration: 4,
      delay: 3,
      size: 'text-3xl'
    },
  ]);


  return (
    <div
      ref={parentRef}
      className={cn(
        "h-96 md:h-[40rem] relative flex items-center w-full justify-center overflow-hidden",
        className
      )}
    >
      {/* iPhone - updated positioning */}
      <motion.div 
        className="absolute right-[2%] md:right-[10%] transform -translate-x-1/2 z-10"
        initial={{ y: 50, rotateX: 0, rotateY: 0 }}
        animate={{ 
          y: [50, -20, 50],
          rotateX: [0, 5, 0],
          rotateY: [-5, 5, -5]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* iPhone frame with more accurate dimensions and notch */}
        <div className="hidden md:flex relative w-[290px] h-[580px] justify-center  bg-gradient-to-br from-accent via-primary to-secondary rounded-[50px] border-4 border-gray-800 shadow-xl">
           <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-20 text-white"
            >
              <div className="text-6xl font-bold font-chivo">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-lg mt-2 font-jakarta">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-20 left-4 right-4 bg-white/10 backdrop-blur-lg rounded-xl p-2 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold font-jakarta">Chitter Chatter</h3>
                <p className="text-white/80 text-xs">Your chat has been analyzed!</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Elements - updated positioning */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element, idx) => (
          <FloatingElement
            key={idx}
            elementOptions={element}
            containerRef={containerRef}
            parentRef={parentRef}
          />
        ))}
      </div>

      {children}
    </div>
  );
};

// FloatingElement component remains the same but with updated styles
const FloatingElement = ({
  elementOptions,
  containerRef,
  parentRef,
}: {
  elementOptions: FloatingElementProps;
  containerRef: React.RefObject<HTMLDivElement>;
  parentRef: React.RefObject<HTMLDivElement>;
}) => {
  const getElementStyles = () => {
    switch(elementOptions.type) {
      case 'emoji':
        return elementOptions.size || 'text-2xl';
      case 'chat':
        return 'bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium';
      case 'stat':
        return 'bg-destructive/90 px-4 py-2 rounded-lg font-medium shadow-lg text-sm';
      default:
        return '';
    }
  };
  const [initialX, setInitialX] = useState( Math.round(Math.random() * 200))

  useEffect(() => {
    if (parentRef.current && parentRef.current.clientWidth) {
        setInitialX(parentRef.current.clientWidth - Math.round(Math.random() * 200) - 100);
    }
  }, [parentRef])

  return (
    <motion.div
      initial={{ 
        y: '120vh',
        x: initialX,
        opacity: 0,
        scale: 0.8
      }}
      animate={{ 
        y: '-120vh',
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.8],
        x: [
            initialX,
            initialX + Math.sin(initialX) * 30,
            initialX
        ]
      }}
      transition={{
        duration: elementOptions.duration,
        delay: elementOptions.delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "linear"
      }}
      className={cn(
        "absolute z-50",
        getElementStyles()
      )}
    >
      {elementOptions.content}
    </motion.div>
  );
};