"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo } from "react";
import { crossData } from "@/components/charts/cross/Cross";
import { packedData } from "@/components/charts/packedCircles/PackedCircles";
import { useDimensions } from "./use-dimensions";
import { CircleChartGSAP } from "./CircleChartGSAP";
import { BubbleLegend } from "./packedCircles/BubbleLegend";
import circles2024 from "@/../public/data/grant_2024_circles.json";
import data2024 from "@/../public/data/grant_2024.json";

// -------------------------------------------------------------------------------------------------
// Type definitions
// -------------------------------------------------------------------------------------------------
type CircleChartProps = {
  chartType: string;
  width: number;
  height: number;
};

type ResponsiveCircleChartProps = {
  chartType: string;
};

export type LayoutDataProps = {
  boundsWidth: number;
  boundsHeight: number;
  circleData: any;
  textData?: any;
  imageData?: any;
  radiusScale?: any;
};

// -------------------------------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------------------------------

export const ResponsiveCircleChart = (props: ResponsiveCircleChartProps) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100%" }}>
      <CircleChart
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};

export const CircleChart = ({ chartType, width, height }: CircleChartProps) => {
  if (width === 0) return null;

  // figure out (cx, cy, r) for each circle based on layoutType
  const layoutDataCross: LayoutDataProps = useMemo(() => {
    // Get the layout data
    return crossData(circles2024, width, height);
  }, [width, height]);

  const layoutDataPacked: LayoutDataProps = useMemo(() => {
    return packedData(data2024, width, height);
  }, [width, height]);

  const layoutData = chartType === "cross" ? layoutDataCross : layoutDataPacked;

  // Get the legend for the circles
  const legend =
    chartType === "packed" ? (
      <BubbleLegend scale={layoutData.radiusScale} tickNumber={3} />
    ) : null;

  // Return the circles + text if available
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircleChartGSAP
        boundsWidth={layoutData.boundsWidth}
        boundsHeight={layoutData.boundsHeight}
        circleData={layoutData.circleData}
        textData={layoutData.textData}
        imageData={layoutData.imageData}
      />
      {legend && (
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {legend}
        </div>
      )}
    </div>
  );
};
