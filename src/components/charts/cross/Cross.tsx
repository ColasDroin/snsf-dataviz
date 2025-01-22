import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";

import styles from "./Cross.module.css";
const MARGIN = { top: 15, right: 15, bottom: 15, left: 15 };

type ResponsiveCrossProps = {
  data: { id: number; cx: number; cy: number; r: number }[];
};

export const ResponsiveCross = (props: ResponsiveCrossProps) => {
  const chartRef = useRef(null);

  const chartSize = useDimensions(chartRef);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100%" }}>
      <Cross height={chartSize.height} width={chartSize.width} {...props} />
    </div>
  );
};

type CrossProps = {
  width: number;
  height: number;
  data: { id: number; cx: number; cy: number; r: number }[];
};

export const Cross = ({ width, height, data }: CrossProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Rescale the data to fit the bounds
  const Scale = useMemo(() => {
    const xValues = data.map((d) => d.cx);
    return scaleLinear().domain(extent(xValues)).range([0, boundsHeight]);
  }, [data, boundsHeight]);

  // Update the data with the scaled values
  const data_rescaled = data.map((d) => {
    return {
      ...d,
      cx: Scale(d.cx),
      cy: Scale(d.cy),
      r: Scale(d.r),
    };
  });

  // Build the shapes
  const allShapes = data_rescaled.map((d, i) => {
    return (
      <circle
        key={d.id}
        cx={d.cx}
        cy={d.cy}
        r={d.r > 0 ? d.r : 0}
        fill="white"
        className={styles.circle}
      />
    );
  });

  // Get coordinates cross extremities (8 cx and cy values)
  const topMost = data_rescaled.reduce((a, b) => (a.cy < b.cy ? a : b)); // Smallest cy
  const bottomMost = data_rescaled.reduce((a, b) => (a.cy > b.cy ? a : b)); // Largest cy
  const leftMost = data_rescaled.reduce((a, b) => (a.cx < b.cx ? a : b)); // Smallest cx
  const rightMost = data_rescaled.reduce((a, b) => (a.cx > b.cx ? a : b)); // Largest cx

  // Intermediate positions
  const middleTop = { cx: (leftMost.cx + rightMost.cx) / 2, cy: topMost.cy };
  const middleBottom = {
    cx: (leftMost.cx + rightMost.cx) / 2,
    cy: bottomMost.cy,
  };
  const middleLeft = { cx: leftMost.cx, cy: (topMost.cy + bottomMost.cy) / 2 };
  const middleRight = {
    cx: rightMost.cx,
    cy: (topMost.cy + bottomMost.cy) / 2,
  };

  // Cross extremities
  const crossExtremities = [
    { cx: leftMost.cx, cy: topMost.cy }, // Top-left
    { cx: rightMost.cx, cy: topMost.cy }, // Top-right
    { cx: leftMost.cx, cy: bottomMost.cy }, // Bottom-left
    { cx: rightMost.cx, cy: bottomMost.cy }, // Bottom-right
    middleTop, // Middle-top
    middleBottom, // Middle-bottom
    middleLeft, // Middle-left
    middleRight, // Middle-right
  ];

  // Define positions for the text "SNSF" in between the arms of the cross
  const text = [
    {
      x: (middleLeft.cx + middleTop.cx) / 2,
      y: (middleLeft.cy + middleTop.cy) / 2,
      anchor: "end",
      text: "SNSF",
    }, // Top left
    {
      x: (middleRight.cx + middleTop.cx) / 2,
      y: (middleRight.cy + middleTop.cy) / 2,
      anchor: "start",
      text: "SNF",
    }, // Top right
    {
      x: (middleLeft.cx + middleBottom.cx) / 2,
      y: (middleLeft.cy + middleBottom.cy) / 2,
      anchor: "end",
      text: "FNS",
    }, // Bottom left
    // {
    //   x: (middleRight.cx + middleBottom.cx) / 2,
    //   y: (middleRight.cy + middleBottom.cy) / 2,
    //   anchor: "start",
    //   text: "",
    // }, // Bottom right
  ];

  const allTexts = text.map((pos, i) => (
    <text
      key={i}
      x={pos.x}
      y={pos.y}
      textAnchor={pos.anchor}
      dominantBaseline="middle"
      fill="white"
      fontSize="16"
      className={styles.text}
    >
      {pos.text}
    </text>
  ));

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
          {allTexts}
          <image
            href={"/images/logo.svg"}
            x={(middleRight.cx + middleBottom.cx) / 2}
            y={(middleRight.cy + middleBottom.cy) / 2.15}
            width={boundsWidth * 0.15} // Scale the width to 10% of the bounds width
          />
        </g>
      </svg>
    </div>
  );
};
