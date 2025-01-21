import { useMemo, useRef } from "react";
import { useDimensions } from "../use-dimensions";

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

type ResponsiveCrossProps = {
  data: { id: number; title: string; amount: number; year: number }[];
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
  data: { id: number; title: string; amount: number; year: number }[];
};

export const Cross = ({ width, height, data }: CrossProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Build the shapes
  const allShapes = data.map((d, i) => {
    return (
      <circle
        key={d.id}
        cx={i * 100}
        cy={100}
        r={d.amount * 0.0001}
        opacity={0.7}
        stroke="#9d174d"
        fill="#9d174d"
        fillOpacity={0.3}
        strokeWidth={1}
      />
    );
  });
  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
        </g>
      </svg>
    </div>
  );
};
