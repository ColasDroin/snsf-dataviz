// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo } from "react";
import { crossLayout } from "@/components/charts/cross/Cross";
import { packedLayout } from "@/components/charts/packedCircles/PackedCircles";
import { useDimensions } from "./use-dimensions";

// -------------------------------------------------------------------------------------------------
// Type definitions
// -------------------------------------------------------------------------------------------------
type CircleChartProps = {
  chartType: string;
  data: any;
  width: number;
  height: number;
};

type ResponsiveCircleChartProps = {
  chartType: string;
  data: any;
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

export const CircleChart = ({
  chartType,
  data,
  width,
  height,
}: CircleChartProps) => {
  if (width === 0) return null;

  // figure out (cx, cy, r) for each circle based on layoutType
  const layoutData: LayoutData = useMemo(() => {
    if (chartType === "cross") {
      return crossLayout(data, width, height);
    } else {
      return packedLayout(data, width, height);
    }
  }, [chartType, data, width, height]);

  return (
    <svg width={width} height={height}>
      <g
        width={layoutData.boundsWidth}
        height={layoutData.boundsHeight}
        //transform={`translate(${[15, 15].join(",")}`}
      >
        {layoutData.circles}
        {/* {layoutData.texts && layoutData.texts}
        {layoutData.image && layoutData.image} */}
      </g>
    </svg>
  );
};
