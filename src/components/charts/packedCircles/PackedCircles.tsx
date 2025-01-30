// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { pack } from "d3-hierarchy";
import { hierarchy } from "d3-hierarchy";
import { Circle } from "@/components/charts/animation/Circle";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { interpolateSpectral } from "d3-scale-chromatic";
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
    circle.field = circle.data.field;
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

function buildHierarchy(packedData, field = "type") {
  // Group data by type
  const groupedData = {};

  // Group data according to the field value
  packedData.circleData.forEach((d: any) => {
    if (!groupedData[d[field]]) groupedData[d[field]] = [];
    groupedData[d[field]].push(d);
  });

  // Transform into a children array for the root
  const clusterNodes = Object.entries(groupedData).map(([type, nodes]) => {
    return {
      name: type, // or any property you want
      type, // keep the cluster type
      children: nodes, // the data points in this cluster
    };
  });

  // Return a single root object
  return {
    name: "root",
    children: clusterNodes,
  };
}

export const multiplePackedData = (
  packedData: any,
  width: number,
  height: number
) => {
  const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Build the hierarchical object
  const rootData = buildHierarchy(packedData);

  // Create the d3-hierarchy root
  const root = hierarchy(rootData)
    .sum((d) => d.amount || 0)
    .sort((a, b) => b.value - a.value);

  // Create the d3 pack layout
  const packLayout = pack().size([boundsWidth, boundsHeight]).padding(3);

  // Compute the layout, which assigns x, y, r to all nodes
  const packedRoot = packLayout(root);

  // Now `packedRoot` is a hierarchy node with coordinates.
  // We can get a flat array of all descendants:
  const descendants = packedRoot.descendants();

  let circleData = descendants.slice(1);

  circleData = circleData.filter((circle) => circle.depth === 2);

  circleData.forEach((circle) => {
    circle.cx = circle.x;
    circle.cy = circle.y;
    circle.id = circle.data.id;
    circle.title = circle.data.title;
    circle.amount = circle.data.amount;
    circle.type = circle.data.type;
    circle.field = circle.data.field;
    circle.fill = circle.data.fill;
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
  };
};

export const multiplePackedDataByRow = (
  data: any,
  width: number,
  height: number
) => {
  const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Group data by type
  const groupedData = {};
  data.circleData.forEach((d: any) => {
    if (!groupedData[d.field]) groupedData[d.field] = [];
    groupedData[d.field].push(d);
  });

  // Compute the number of clusters
  const fields = Object.keys(groupedData);
  const numClusters = fields.length;

  // Determine cluster layout
  const cols = 6; //Math.ceil(Math.sqrt(numClusters));
  const rows = Math.ceil(numClusters / cols);
  const clusterWidth = boundsWidth / cols;
  const clusterHeight = boundsHeight / rows;

  let circleData: any = [];
  let titles: any = [];
  fields.forEach((type, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    let xOffset = col * clusterWidth + clusterWidth / 2;
    const yOffset = row * clusterHeight + clusterHeight / 2;

    // If it's the last row, adjust the xOffset
    if (row === rows - 1) {
      const numClustersInLastRow = numClusters % cols;
      console.log("numClustersInLastRow", numClustersInLastRow);
      xOffset =
        (col * clusterWidth * cols) / numClustersInLastRow + clusterWidth / 1.5;
    }

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
      circle.field = circle.data.field;
      circle.fill = interpolateSpectral(
        (2 + index) / (numClusters - 1 + 2 + 3)
      ); ///dicColors[circle.data.type];
      delete circle.x;
      delete circle.y;
      delete circle.data;
    });

    circleData = circleData.concat(clusterCircles);
    titles.push({
      field: type,
      fill: interpolateSpectral((2 + index) / (numClusters - 1 + 2 + 3)),
      x: xOffset,
      y: yOffset + clusterHeight / 2,
    });
  });

  // Get min and max for radius scale
  const [min_data, max_data] = extent(circleData.map((d) => d.amount));
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
    titles,
  };
};
