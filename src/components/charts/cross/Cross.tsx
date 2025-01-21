import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import styles from "./cross.module.css";

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
        r={d.r}
        fill="white"
        className={styles.circle}
      />
    );
  });

  // Define positions for the text "SNSF" in between the arms of the cross
  const textPositions = [
    { x: MARGIN.left / 2, y: MARGIN.top, anchor: "start" }, // Top left
    {
      x: boundsWidth - MARGIN.left / 2,
      y: MARGIN.top,
      anchor: "end",
    }, // Top right
    {
      x: MARGIN.left / 2,
      y: boundsHeight - MARGIN.top,
      anchor: "start",
    }, // Bottom left
    {
      x: boundsWidth - MARGIN.left / 2,
      y: boundsHeight - MARGIN.top,
      anchor: "end",
    }, // Bottom right
  ];

  const allTexts = textPositions.map((pos, i) => (
    <text
      key={i}
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="white"
      fontSize="16"
      className={styles.text}
    >
      SNSF
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
        </g>
      </svg>
    </div>
  );
};
