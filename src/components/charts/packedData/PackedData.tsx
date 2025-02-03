"use client";
// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { pack } from "d3-hierarchy";
import { hierarchy } from "d3-hierarchy";
import { Circle } from "@/components/charts/animation/Circle";
import { scaleBand, scaleLinear, scaleSqrt } from "d3-scale";
import { interpolateSpectral } from "d3-scale-chromatic";
import { max, min } from "d3-array";
import { extent } from "d3-array";
import { AxisLeft } from "../axis/AxisLeft";
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

  // Group data by field
  const groupedData = {};
  data.circleData.forEach((d: any) => {
    if (!groupedData[d.field]) groupedData[d.field] = [];
    groupedData[d.field].push(d);
  });

  // Compute total amount for each cluster and sort clusters by totalAmount
  let sortedFields = Object.entries(groupedData)
    .map(([field, nodes]: [string, any[]]) => ({
      field,
      nodes,
      totalAmount: nodes.reduce((sum, d) => sum + d.amount, 0),
      nGrants: nodes.length,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount); // Sort descending by totalAmount

  // Compute the number of clusters
  const numClusters = sortedFields.length;
  const cols = 6; // Define number of columns
  const rows = Math.ceil(numClusters / cols);
  const clusterWidth = boundsWidth / cols;
  const clusterHeight = boundsHeight / rows;

  let circleData: any = [];
  let titleData: any = [];
  let clusterData: any = [];

  sortedFields.forEach(({ field, nodes, totalAmount, nGrants }, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    let xOffset = col * clusterWidth + clusterWidth / 2;
    const yOffset = row * clusterHeight + clusterHeight / 3;

    // Adjust xOffset for the last row
    if (row === rows - 1) {
      const numClustersInLastRow = numClusters % cols;
      xOffset =
        (col * clusterWidth * cols) / numClustersInLastRow + clusterWidth / 1.5;
    }

    // Pack clusters
    const packedCluster = pack().size([clusterWidth, clusterHeight]).padding(3)(
      hierarchy({ children: nodes }).sum((d) => d.amount)
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
      );
      delete circle.x;
      delete circle.y;
      delete circle.data;
    });

    circleData = circleData.concat(clusterCircles);
    titleData.push({
      field: field,
      fill: interpolateSpectral((2 + index) / (numClusters - 1 + 2 + 3)),
      x: xOffset,
      y: yOffset + clusterHeight / 2,
    });
    clusterData.push({
      x: xOffset,
      y: yOffset - clusterHeight / 8,
      amount: totalAmount,
      nGrants: nGrants,
      width: 0,
      height: 0,
      title: field,
      fill: interpolateSpectral((2 + index) / (numClusters - 1 + 2 + 3)),
    });
  });

  // Get min and max for radius scale
  const [min_data, max_data] = extent(circleData.map((d) => d.amount));
  const [min_r, max_r] = extent(circleData.map((d) => d.r));

  const radiusScale = scaleSqrt()
    .domain([min_data, max_data])
    .range([min_r, max_r])
    .nice();

  // Sort circleData by id to ensure consistent order
  circleData.sort((a, b) => a.id - b.id);

  // Rename clusterData to rectangleData
  const rectangleData = clusterData.map((d) => ({ ...d }));

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titleData,
    rectangleData,
  };
};

export const multiplePackedDataByRowToSquare = (
  layoutDataMultiplePackedByRow: any
) => {
  let {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titleData,
    rectangleData,
  } = layoutDataMultiplePackedByRow;

  // Make a copy of the circleData
  circleData = circleData.map((d) => ({ ...d }));

  // Set all circles to radius 0
  circleData.forEach((circle: any) => {
    circle.r = 0;
  });

  // Make a copy of the titles
  titleData = titleData.map((d) => ({ ...d }));

  // lower title
  // titleData = titleData.map((d) => {
  //   d.y = d.y - 40;
  //   return d;
  // });

  // Make a copy of the clusterData
  rectangleData = rectangleData.map((d) => ({ ...d }));

  // Replace amount with amountFuture
  rectangleData.forEach((cluster: any) => {
    let scaledAmount = Math.sqrt(cluster.amount / 100000);
    cluster.x = cluster.x - scaledAmount / 2;
    cluster.y = cluster.y + scaledAmount;
    cluster.width = scaledAmount;
    cluster.height = scaledAmount;
  });

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titleData,
    rectangleData,
  };
};

export const barplotData = (layoutDataMultiplePackedByRowToSquare: any) => {
  let {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titles,
    rectangleData,
  } = layoutDataMultiplePackedByRowToSquare;

  // Create a new scale for the barplot, which will contain as many bars as there are clusters
  let axisMargin = 70;
  const xScale = scaleBand()
    .domain(rectangleData.map((d) => d.title))
    .range([axisMargin, boundsWidth])
    .padding(0.3);

  // Get the max amount
  const maxAmount: number = max(rectangleData.map((d) => d.amount));

  // Same with the yScale
  const maxYHeight = (boundsHeight * 2) / 3;
  const yScale = scaleLinear().domain([0, maxAmount]).range([0, maxYHeight]);

  // Get the bar data
  rectangleData = rectangleData.map((d, i) => {
    return {
      x: xScale(d.title),
      y: maxYHeight,
      width: xScale.bandwidth(),
      height: yScale(d.amount),
      fill: d.fill,
      alpha: 1,
      field: d.title,
    };
  });

  // Get the titles data
  const titleData = rectangleData.map((d) => ({
    field: d.field,
    fill: d.fill,
    x: d.x + d.width / 2,
    y: (boundsHeight * 2) / 3 + 10,
    ylabel: "Total Amount (M CHF)",
  }));

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titleData,
    rectangleData,
    yScale,
    xScale,
  };
};

export const barplotDataGrantCounts = (
  layoutDataMultiplePackedByRowToSquare: any
) => {
  let {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titles,
    rectangleData,
  } = layoutDataMultiplePackedByRowToSquare;

  // Create a new scale for the barplot, which will contain as many bars as there are clusters
  let axisMargin = 70;
  const xScale = scaleBand()
    .domain(rectangleData.map((d) => d.title))
    .range([axisMargin, boundsWidth])
    .padding(0.3);

  // Get the max amount
  const maxAmount: number = max(rectangleData.map((d) => d.nGrants));

  // Same with the yScale
  const maxYHeight = (boundsHeight * 2) / 3;
  const yScale = scaleLinear().domain([0, maxAmount]).range([0, maxYHeight]);

  // Get the bar data
  rectangleData = rectangleData.map((d, i) => {
    return {
      x: xScale(d.title),
      y: maxYHeight,
      width: xScale.bandwidth(),
      height: yScale(d.nGrants),
      fill: d.fill,
      alpha: 1,
      field: d.title,
    };
  });

  // Get the titles data
  const titleData = rectangleData.map((d) => ({
    field: d.field,
    fill: d.fill,
    ylabel: "Number of grants",
    x: d.x + d.width / 2,
    y: (boundsHeight * 2) / 3 + 10,
  }));

  return {
    circleData,
    boundsWidth,
    boundsHeight,
    radiusScale,
    titleData,
    rectangleData,
    yScale,
    xScale,
  };
};
