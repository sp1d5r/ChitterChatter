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
        <div className="hidden md:flex relative w-[290px] h-[580px] bg-black rounded-[50px] border-4 border-gray-800 shadow-xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-7 bg-black rounded-b-3xl z-20" />
          
          {/* Screen */}
          <div className="absolute top-0 left-0 right-0 bottom-0 m-[4px] bg-white rounded-[46px] overflow-hidden">
            {/* Chat Interface */}
            <div className="w-full h-full bg-gray-50 flex flex-col">
                <div className="w-full h-7 flex justify-between items-center">
                    <div className="w-1/2 flex justify-start items-center h-full px-6 py-3">
                        <p className="text-[10px] font-bold"> 
                            Lebara 4G
                        </p>
                    </div>
                    <div className="w-1/2 flex justify-end items-center h-full px-6 py-3">
                        <p className="text-[10px] font-bold"> 
                            100%
                        </p>
                    </div>
                </div>
              {/* Chat Header */}
              <div className="bg-white p-4 border-b">
                <h3 className="text-lg font-semibold text-center text-gray-800">ChitterChatter</h3>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4">
                <div className="ml-auto max-w-[70%] bg-purple-100 p-3 rounded-2xl rounded-tr-sm">
                  omg spill the tea sis ☕️
                </div>
                <div className="mr-auto max-w-[70%] bg-gray-100 p-3 rounded-2xl rounded-tl-sm">
                  your sass level is off the charts 💅
                </div>
                <div className="ml-auto max-w-[70%] bg-purple-100 p-3 rounded-2xl rounded-tr-sm">
                  periodt! 💁‍♀️
                </div>
              </div>

              {/* Chat Input */}
              <div className="w-full h-16 bg-gray-50 flex justify-center items-center pb-4 px-4 gap-2">
                <input type="text" className="w-full h-full bg-white rounded-full px-4 py-2" placeholder="Type a message..." />
                <button className="bg-purple-500 text-white px-4 py-2 rounded-full text-xs"><ArrowRightIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
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
        return 'bg-purple-100/90 px-4 py-2 rounded-lg font-medium shadow-lg text-sm';
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