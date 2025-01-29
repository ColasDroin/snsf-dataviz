// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { pack } from "d3-hierarchy";
import { hierarchy } from "d3-hierarchy";
import { Circle } from "@/components/charts/animation/Circle";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { max, min } from "d3-array";
import { extent } from "d3-array";

//import styles from "./PackedCircles.module.css";

// -------------------------------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------------------------------

const MARGIN = { top: 15, right: 15, bottom: 15, left: 15 };

// -------------------------------------------------------------------------------------------------
// Type definitions
// -------------------------------------------------------------------------------------------------
type ResponsivePackedCirclesProps = {
  data: { id: number; cx: number; cy: number; r: number }[];
};

type PackedCirclesProps = {
  width: number;
  height: number;
  data: { id: number; cx: number; cy: number; r: number }[];
};

// -------------------------------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------------------------------

export const ResponsivePackedCircles = (
  props: ResponsivePackedCirclesProps
) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100%" }}>
      <PackedCircles
        height={chartSize.height}
        width={chartSize.width}
        {...props}
      />
    </div>
  );
};

export const PackedCircles = ({ width, height, data }: PackedCirclesProps) => {
  if (width === 0) return null;

  // Get the layout data
  const { circleData, boundsWidth, boundsHeight } = packedData(
    data,
    width,
    height
  );

  const circles = circleData.map((circle, i) => (
    <Circle
      key={circle.id}
      cx={circle.cx}
      cy={circle.cy}
      r={circle.r > 0 ? circle.r : 0}
      fill="white"
      delay={i}
      //className={styles.circle}
    />
  ));

  // Return the circles
  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {circles}
        </g>
      </svg>
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------------------

export const packedData = (data: any, width: number, height: number) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Pack all the circle with D3 circle packing
  const repack = (dataToPack: any) =>
    pack().size([boundsWidth, boundsHeight]).padding(3)(
      hierarchy({ children: dataToPack }).sum((d: any) => d.amount)
    );
  // Get the packed data
  const packedData = repack(data);

  // Get the circles from the packed data
  const circleData = packedData.descendants().slice(1);

  // Get min and max of the data using extent
  const [min_data, max_data] = extent(data.map((d: any) => d.amount));
  const [min_r, max_r] = extent(circleData.map((d: any) => d.r));

  const radiusScale = scaleSqrt()
    .domain([min_data, max_data])
    .range([min_r, max_r])
    .nice();

  // Rename the properties to match the Circle component
  circleData.forEach((circle) => {
    circle.cx = circle.x;
    circle.cy = circle.y;
    circle.id = circle.data.id;
    // add color
    circle.fill = "#dc2626";
    // Add text for tooltip
    circle.title = circle.data.title;
    circle.amount = circle.data.amount;
    circle.type = circle.data.type;

    delete circle.x;
    delete circle.y;
    delete circle.data;
  });

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
  };
};
