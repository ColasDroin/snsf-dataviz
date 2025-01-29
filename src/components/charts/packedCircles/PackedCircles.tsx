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

const dicColors = {
  Projects: "#A3BFA8",
  "Science Communication": "#33658A",
  Careers: "#F26419",
  Programmes: "#F6AE2D",
  Infrastructure: "#FF88DC",
};

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

export const packedData = (
  data: any,
  width: number,
  height: number,
  colorByType: boolean
) => {
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
    // Add text for tooltip
    circle.title = circle.data.title;
    circle.amount = circle.data.amount;
    circle.type = circle.data.type;
    // add color
    if (colorByType) circle.fill = dicColors[circle.data.type];
    else circle.fill = "#dc2626";

    delete circle.x;
    delete circle.y;
    delete circle.data;
  });

  // sort circleData by id to ensure the order of the circles
  circleData.sort((a, b) => a.id - b.id);

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
  };
};

export const multiplePackedData = (
  data: any,
  width: number,
  height: number,
  colorByType: boolean
) => {
  const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Group data by type
  const groupedData = {};
  data.forEach((d: any) => {
    if (!groupedData[d.type]) groupedData[d.type] = [];
    groupedData[d.type].push(d);
  });

  // Compute the number of clusters
  const types = Object.keys(groupedData);
  const numClusters = types.length;

  // Determine cluster layout
  const cols = Math.ceil(Math.sqrt(numClusters));
  const rows = Math.ceil(numClusters / cols);
  const clusterWidth = boundsWidth / cols;
  const clusterHeight = boundsHeight / rows;

  let circleData: any = [];
  types.forEach((type, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const xOffset = col * clusterWidth + clusterWidth / 2;
    const yOffset = row * clusterHeight + clusterHeight / 2;

    const packedCluster = pack().size([clusterWidth, clusterHeight]).padding(3)(
      hierarchy({ children: groupedData[type] }).sum((d) => d.amount)
    );

    const clusterCircles = packedCluster.descendants().slice(1);

    clusterCircles.forEach((circle) => {
      circle.cx = circle.x + xOffset - clusterWidth / 2;
      circle.cy = circle.y + yOffset - clusterHeight / 2;
      circle.id = circle.data.id;
      circle.title = circle.data.title;
      circle.amount = circle.data.amount;
      circle.type = circle.data.type;
      circle.fill = colorByType ? dicColors[circle.data.type] : "#dc2626";
      delete circle.x;
      delete circle.y;
      delete circle.data;
    });

    circleData = circleData.concat(clusterCircles);
  });

  // Get min and max for radius scale
  const [min_data, max_data] = extent(data.map((d) => d.amount));
  const [min_r, max_r] = extent(circleData.map((d) => d.r));

  const radiusScale = scaleSqrt()
    .domain([min_data, max_data])
    .range([min_r, max_r])
    .nice();

  // sort circleData by id to ensure the order of the circles
  circleData.sort((a, b) => a.id - b.id);

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
  };
};
