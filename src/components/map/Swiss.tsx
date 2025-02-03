"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo, useEffect } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { FeatureCollection } from "geojson";
import { useDimensions } from "../charts/use-dimensions";

// -------------------------------------------------------------------------------------------------
// Type definitions
// -------------------------------------------------------------------------------------------------
type SwissChartProps = {
  geoData: FeatureCollection;
  width: number;
  height: number;
};

type ResponsiveSwissChartProps = {
    geoData: FeatureCollection;
};

// -------------------------------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------------------------------

export const ResponsiveSwissChart = (props: ResponsiveSwissChartProps) => {
  const chartRef = useRef(null);
  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} className="w-full h-full">
      <SwissChart
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};

export const SwissChart = ({ width, height, geoData }: SwissChartProps) => {
  if (width === 0) return null;

  const projection = geoMercator().fitSize([width, height], geoData);
  const geoPathGenerator = geoPath().projection(projection);

  const allSvgPaths = geoData.features.map((shape) => {
    return (
      <path
        key={shape.id}
        d={geoPathGenerator(shape)}
        stroke="lightGrey"
        strokeWidth={0.5}
        fill="grey"
        fillOpacity={0.7}
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        {allSvgPaths}
      </svg>
    </div>
  );
};
