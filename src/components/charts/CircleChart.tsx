"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo } from "react";
import { crossLayout } from "@/components/charts/cross/Cross";
import { packedLayout } from "@/components/charts/packedCircles/PackedCircles";
import { useDimensions } from "./use-dimensions";
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

type LayoutData = {
  boundsWidth: number;
  boundsHeight: number;
  circles: React.ReactNode;
  texts?: React.ReactNode; // Optional
  image?: React.ReactNode; // Optional
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
  const layoutDataCross: LayoutData = useMemo(() => {
    return crossLayout(circles2024, width, height);
  }, [width, height]);

  const layoutDataPacked: LayoutData = useMemo(() => {
    return packedLayout(data2024, width, height);
  }, [width, height]);

  const layoutData = chartType === "cross" ? layoutDataCross : layoutDataPacked;

  return (
    <svg width={width} height={height}>
      <g
        width={layoutData.boundsWidth}
        height={layoutData.boundsHeight}
        //transform={`translate(${[15, 15].join(",")}`}
      >
        {layoutData.circles}
        {layoutData.texts && layoutData.texts}
        {layoutData.image && layoutData.image}
      </g>
    </svg>
  );
};
