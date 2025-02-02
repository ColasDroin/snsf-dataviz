"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo, useEffect } from "react";
import { crossData } from "@/components/charts/cross/Cross";
import {
  packedData,
  multiplePackedData,
  multiplePackedDataByRow,
  multiplePackedDataByRowToSquare,
  barplotData,
  barplotDataGrantCounts,
} from "@/components/charts/packedData/PackedData";
import { useDimensions } from "./use-dimensions";
import { ChartGSAP } from "./GSAP/ChartGSAP";
import { BubbleLegend } from "./packedData/BubbleLegend";
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
  doHover?: boolean;
  titleData?: any[] | null;
  rectangleData?: any[] | null;
  fullTitles?: boolean;
  firstBarplot?: boolean;
  yScale?: any;
  xScale?: any;
};

export type LayoutDataClusterProps = {
  boundsWidth: number;
  boundsHeight: number;
  clusterData: any;
};

// -------------------------------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------------------------------

export const ResponsiveMainChart = (props: ResponsiveCircleChartProps) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full">
      <MainChart height={chartSize.height} width={chartSize.width} {...props} />
    </div>
  );
};

export const MainChart = ({ chartType, width, height }: CircleChartProps) => {
  if (width === 0) return null;

  // figure out (cx, cy, r) for each circle based on layoutType
  const layoutDataCross: LayoutDataProps = useMemo(() => {
    return crossData(data2024, width, height);
  }, [width, height]);

  const layoutDataPacked: LayoutDataProps = useMemo(() => {
    return packedData(data2024, width, height, false);
  }, [width, height]);

  const layoutDataPackedColored: LayoutDataProps = useMemo(() => {
    return packedData(data2024, width, height, true);
  }, [width, height]);

  const layoutDataMultiplePacked: LayoutDataProps = useMemo(() => {
    return multiplePackedData(layoutDataPackedColored, width, height);
  }, [width, height]);

  const layoutDataMultiplePackedByRow: LayoutDataProps = useMemo(() => {
    return multiplePackedDataByRow(layoutDataMultiplePacked, width, height);
  }, [width, height]);

  const layoutDataMultiplePackedByRowToSquare: LayoutDataProps = useMemo(() => {
    return multiplePackedDataByRowToSquare(layoutDataMultiplePackedByRow);
  }, [width, height]);

  const layoutDataBarplot: LayoutDataProps = useMemo(() => {
    return barplotData(layoutDataMultiplePackedByRowToSquare);
  }, [width, height]);

  const layoutDataBarplotGrantCounts: LayoutDataProps = useMemo(() => {
    return barplotDataGrantCounts(layoutDataMultiplePackedByRowToSquare);
  }, [width, height]);

  const layoutData =
    chartType === "cross"
      ? layoutDataCross
      : chartType === "packedColored"
      ? layoutDataPackedColored
      : chartType === "packed"
      ? layoutDataPacked
      : chartType === "multiplePacked"
      ? layoutDataMultiplePacked
      : chartType === "multiplePackedByRow"
      ? layoutDataMultiplePackedByRow
      : chartType === "multiplePackedByRowSquared"
      ? layoutDataMultiplePackedByRowToSquare
      : chartType === "barplot"
      ? layoutDataBarplot
      : chartType === "barplotGrantCounts"
      ? layoutDataBarplotGrantCounts
      : layoutDataCross;

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
      <ChartGSAP
        boundsWidth={layoutData.boundsWidth}
        boundsHeight={layoutData.boundsHeight}
        circleData={layoutData.circleData}
        textData={layoutData.textData}
        imageData={layoutData.imageData}
        doHover={
          chartType === "packed" ||
          chartType === "packedColored" ||
          chartType === "multiplePacked" ||
          chartType === "multiplePackedByRow" ||
          chartType === "multiplePackedByRowSquared"
        }
        titleData={
          chartType === "multiplePackedByRow" ||
          chartType === "multiplePackedByRowSquared" ||
          chartType === "barplot" ||
          chartType === "barplotGrantCounts"
            ? layoutData.titleData
            : null
        }
        rectangleData={
          chartType === "multiplePackedByRow" ||
          chartType === "multiplePackedByRowSquared" ||
          chartType === "barplot" ||
          chartType === "barplotGrantCounts"
            ? layoutData.rectangleData
            : null
        }
        fullTitles={
          chartType === "barplot" || chartType === "barplotGrantCounts"
        }
        firstBarplot={chartType === "barplot"}
        yScale={layoutData.yScale}
        xScale={layoutData.xScale}
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
