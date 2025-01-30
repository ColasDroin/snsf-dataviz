"use client";
import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Scrollama, Step } from "react-scrollama";
import { ResponsiveCircleChart } from "@/components/charts/CircleChart";

export const ScrollContainer = () => {
  const [currentChart, setCurrentChart] = useState("cross");
  const [aboveStepOne, setAboveStepOne] = useState(false);

  // React Spring: Define springs for the opacity of each gradient layer
  const redGradientSpring = useSpring({
    opacity: aboveStepOne ? 0 : 1, // Fade out red gradient when isStepOne is true
    config: { duration: 1000 }, // Animation duration: 1 second
  });

  const grayGradientSpring = useSpring({
    opacity: aboveStepOne ? 1 : 0, // Fade in gray gradient when isStepOne is true
    config: { duration: 1000 }, // Animation duration: 1 second
  });

  // Step callbacks to handle scroll events
  const onStepEnter = ({ data, direction }) => {
    if (data === 1 && direction === "down") {
      setAboveStepOne(true); // Trigger gradient transition to gray
      setCurrentChart("packed");
    }

    if (data === 3) {
      setCurrentChart("packedColored");
    }

    if (data === 4 && direction === "down") {
      setCurrentChart("multiplePackedByRow");
    }

    if (data === 5 && direction === "down") {
      setCurrentChart("multiplePackedByRowSquared");
    }
  };

  const onStepExit = ({ data, direction }) => {
    if (data === 1 && direction === "up") {
      setAboveStepOne(false); // Revert gradient transition to red
      setCurrentChart("cross");
    }

    if (data === 3 && direction === "up") {
      setCurrentChart("packed");
    }

    if (data === 3 && direction === "down") {
      setCurrentChart("multiplePacked");
    }

    if (data === 4 && direction === "up") {
      setCurrentChart("multiplePacked");
    }

    if (data === 5 && direction === "up") {
      setCurrentChart("multiplePackedByRow");
    }
  };

  return (
    <div className="w-full flex items-center justify-center text-white mb-8 flex-col relative bg-gray-900">
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

      {/* <animated.div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(to bottom,rgb(96, 108, 127),rgb(137, 148, 165))", // Light gray gradient
          ...lightGrayGradientSpring,
          pointerEvents: "none", // Allows clicks to pass through
        }}
      /> */}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[900px]">
        <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center">
          How is Swiss research funded?
        </p>

        <div
          style={{
            position: "sticky",
            top: "15vh",
            border: "1px solid orchid",
          }}
        >
          <div className="flex h-[50vh] max-w-full z-1">
            <div className="flex-1 aspect-square">
              <ResponsiveCircleChart chartType={currentChart} />
            </div>
          </div>
        </div>

        <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center z-40">
          A visual story about the Swiss National Science Foundation
        </p>

        <p className="text-xs md:text-xl text-center h-[2vh] flex items-center justify-center z-40">
          04.02.2024
        </p>

        {/* Scrollama Steps */}
        <Scrollama
          offset={0.8}
          onStepEnter={onStepEnter}
          onStepExit={onStepExit}
          debug
        >
          <Step data={1}>
            <div className="w-full mt-[0vh] border-2 border-white h-[200px]"></div>
          </Step>

          <Step data={2}>
            <div className="w-full mt-[50vh] mb-[30vh] border-2 border-white h-[200px] z-40">
              <p className="text-xs md:text-xl">
                Each of these circles represent one of the 2906 grants
                attributed by the SNSF in 2024. Bigger circles represent larger
                grants.
              </p>
            </div>
          </Step>

          <Step data={3}>
            <div className="w-full mt-[50vh] mb-[1vh] border-2 border-white h-[200px] z-40">
              <p className="text-xs md:text-xl">
                Grants can be subdivided into 5 categories: fundings for
                projects, careers, science communication, programmes and
                infrastuctures.
              </p>
            </div>
          </Step>

          <Step data={4}>
            <div className="w-full mt-[50vh] mb-[1vh] border-2 border-white h-[200px] z-40">
              <p className="text-xs md:text-xl">
                Inside of these categories, grants can be further subdivided
                into the scientific disciplines they fund.
              </p>
            </div>
          </Step>

          <Step data={5}>
            <div className="w-full mt-[50vh] mb-[90vh] border-2 border-white h-[200px] z-40">
              <p className="text-xs md:text-xl">
                But size can be a bit misleading as clusters were normalized to
                all take up the same space, otherwise some disciplines would
                barely be visible... Let's add all the grants together, for each
                field, to see the big picture.
              </p>
            </div>
          </Step>
        </Scrollama>
      </div>
    </div>
  );
};
