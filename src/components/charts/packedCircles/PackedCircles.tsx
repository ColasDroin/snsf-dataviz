import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";
import { pack } from "d3-hierarchy";
import { hierarchy } from "d3-hierarchy";

//import styles from "./PackedCircles.module.css";
const MARGIN = { top: 15, right: 15, bottom: 15, left: 15 };

type ResponsivePackedCirclesProps = {
  data: { id: number; cx: number; cy: number; r: number }[];
  displayText?: boolean;
};

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

type PackedCirclesProps = {
  width: number;
  height: number;
  data: { id: number; cx: number; cy: number; r: number }[];
};

export const PackedCircles = ({ width, height, data }: PackedCirclesProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Pack all the circle with D3 circle packing
  const repack = (data) =>
    pack().size([boundsWidth, boundsHeight]).padding(3)(
      hierarchy({ children: data }).sum((d) => d.r)
    );

  // Get the packed data
  const packedData = repack(data);

  // Get the circles from the packed data
  const circles = packedData.descendants().slice(1);

  // Return the circles
  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {circles.map((circle, i) => (
            <circle
              key={i}
              cx={circle.x}
              cy={circle.y}
              r={circle.r}
              fill="white"
              //className={styles.circle}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};
