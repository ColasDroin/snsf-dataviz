"use client";
import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Scrollama, Step } from "react-scrollama";
import { ResponsiveCircleChart } from "@/components/charts/CircleChart";

export const ScrollContainer = () => {
  const [currentChart, setCurrentChart] = useState("cross");
  const [isStepOne, setIsStepOne] = useState(false); // Tracks if we are at Step 1

  // React Spring: Define springs for the opacity of each gradient layer
  const redGradientSpring = useSpring({
    opacity: isStepOne ? 0 : 1, // Fade out red gradient when isStepOne is true
    config: { duration: 1000 }, // Animation duration: 1 second
  });

  const grayGradientSpring = useSpring({
    opacity: isStepOne ? 1 : 0, // Fade in gray gradient when isStepOne is true
    config: { duration: 1000 }, // Animation duration: 1 second
  });

  // Step callbacks to handle scroll events
  const onStepEnter = ({ data }) => {
    if (data === 1) {
      setIsStepOne(true); // Trigger gradient transition to gray
    }
    setCurrentChart("packedCircles");
    console.log("onStepEnter", data);
  };

  const onStepExit = ({ data }) => {
    if (data === 1) {
      setIsStepOne(false); // Revert gradient transition to red
    }
    setCurrentChart("cross");
    console.log("onStepExit", data);
  };

  return (
    <div className="w-full flex items-center justify-center text-white mb-8 flex-col relative">
      {/* Gradient Layers */}
      {/* Red Gradient Layer */}
      <animated.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(to bottom, #7f1d1d, #dc2626)", // Red gradient
          ...redGradientSpring,
          pointerEvents: "none", // Allows clicks to pass through
        }}
      />

      {/* Gray Gradient Layer */}
      <animated.div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(to bottom, #2D2D2D, #4B5563)", // Gray gradient
          ...grayGradientSpring,
          pointerEvents: "none", // Allows clicks to pass through
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center">
          How is Swiss research funded?
        </p>

        <div
          className="h-[50vh] max-w-full aspect-square"
          style={{
            position: "sticky",
            top: "15vh",
            border: "1px solid orchid",
          }}
        >
          <ResponsiveCircleChart chartType={currentChart} />
        </div>

        <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center">
          A visual story about the Swiss National Science Foundation
        </p>

        {/* Scrollama Steps */}
        <Scrollama
          offset={0.8}
          onStepEnter={onStepEnter}
          onStepExit={onStepExit}
          debug
        >
          {[1, 2, 3, 4].map((stepIndex) => (
            <Step data={stepIndex} key={stepIndex}>
              <div
                style={{
                  margin: "0vh 0",
                  border: "1px solid gray",
                  height: 200,
                }}
              >
                I'm a Scrollama Step of index {stepIndex}
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>
    </div>
  );
};
