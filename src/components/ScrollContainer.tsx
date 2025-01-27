import React, { useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import { ResponsiveCircleChart } from "@/components/charts/CircleChart";

export const ScrollContainer = () => {
  const [currentChart, setCurrentChart] = useState("cross");

  const onStepEnter = ({ stepIndex }) => {
    setCurrentChart("packedCircles");
    console.log("onStepEnter", stepIndex);
  };

  const onStepExit = ({ stepIndex }) => {
    setCurrentChart("cross");
    console.log("onStepExit", stepIndex);
  };

  return (
    // <div style={{ margin: "0vh 0", border: "2px dashed skyblue" }}>
    <div className="w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-800 to-red-600 flex items-center justify-center text-white mb-8 flex flex-col items-center justify-center ">
      <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center">
        How is Swiss research funded?
      </p>
      <div
        className="h-[50vh] max-w-full aspect-square"
        style={{ position: "sticky", top: "15vh", border: "1px solid orchid" }}
      >
        <ResponsiveCircleChart chartType={currentChart} />
      </div>
      <p className="text-sm md:text-4xl font-bold text-center h-[15vh] flex items-center justify-center">
        A visual story about the Swiss National Science Foundation{" "}
      </p>
      {/* </div> */}
      <Scrollama
        offset={0.8}
        onStepEnter={onStepEnter}
        onStepExit={onStepExit}
        debug
      >
        {[1, 2, 3, 4].map((_, stepIndex) => (
          <Step data={stepIndex} key={stepIndex}>
            <div
              style={{
                margin: "0vh 0",
                border: "1px solid gray",
                // opacity: currentStepIndex === stepIndex ? 1 : 0.2,
                height: 200,
              }}
            >
              I'm a Scrollama Step of index {stepIndex}
            </div>
          </Step>
        ))}
      </Scrollama>
    </div>
  );
};
