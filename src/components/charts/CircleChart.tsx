"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo, useEffect } from "react";
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
    <div ref={chartRef} className="w-full h-full">
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
    return crossData(circles2024, width, height);
  }, [width, height]);

  const layoutDataPacked: LayoutDataProps = useMemo(() => {
    return packedData(data2024, width, height);
  }, [width, height]);

  const layoutData = chartType === "cross" ? layoutDataCross : layoutDataPacked;

  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    if (chartType === "packed") {
      setTimeout(() => setShowLegend(true), 300);
    } else {
      setShowLegend(false);
    }
  }, [chartType]);

  // Get the legend for the circles
  const legend =
    chartType === "packed" ? (
      <BubbleLegend scale={layoutData.radiusScale} tickNumber={3} />
    ) : null;

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <CircleChartGSAP
        boundsWidth={layoutData.boundsWidth}
        boundsHeight={layoutData.boundsHeight}
        circleData={layoutData.circleData}
        textData={layoutData.textData}
        imageData={layoutData.imageData}
      />
      {legend && (
        <div
          className={`absolute -bottom-12 w-full flex justify-center transition-opacity duration-500 ${
            showLegend ? "opacity-100" : "opacity-0"
          }`}
        >
          {legend}
        </div>
      )}
    </div>
  );
};
