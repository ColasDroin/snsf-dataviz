"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import React, { useState, useRef, useMemo, useEffect } from "react";
import { geoPath, geoMercator } from "d3-geo";
import { FeatureCollection } from "geojson";
import { useDimensions } from "../charts/use-dimensions";
import { interpolateSpectral } from "d3-scale-chromatic";
import { scaleLinear } from "d3-scale";
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

export const SwissChart = ({ width, height, geoData }) => {
  if (width === 0) return null;

  const projection = geoMercator().fitSize([width, height], geoData);
  const geoPathGenerator = geoPath().projection(projection);

  // Compute centroids of all features to determine x range
  const centroids = geoData.features.map((shape) =>
    geoPathGenerator.centroid(shape)
  );

  const xPositions = centroids.map((c) => c[0]);
  const xScale = scaleLinear()
    .domain([Math.min(...xPositions), Math.max(...xPositions)])
    .range([0, 1]);

  const allSvgPaths = geoData.features.map((shape, index) => {
    const color = interpolateSpectral(xScale(centroids[index][0]));

    return (
      <path
        key={shape.id}
        d={geoPathGenerator(shape)}
        stroke={color}
        strokeWidth={1}
        fill="grey"
        fillOpacity={0.6}
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
