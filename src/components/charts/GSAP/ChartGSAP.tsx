"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "../CircleChart";
import {
  buildCircles,
  drawCircles,
  animateCircles,
  tooltipHandler,
} from "./utilsCircles";
export const ChartGSAP = ({
  boundsWidth,
  boundsHeight,
  circleData,
  textData = null,
  imageData = null,
  doHover = false,
  titles = [],
}: LayoutDataProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [prevCircleData, setPrevCircleData] = useState(circleData);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const tooltip = tooltipRef.current!;
    let circles = buildCircles(prevCircleData);
    const draw = () => {
      drawCircles(ctx, canvas, circles, textData, titles, imageData);
    };
    let tl = animateCircles(circles, circleData, draw);
    const handleMouseMove = tooltipHandler(canvas, tooltip, circles);
    if (doHover) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    }

    setPrevCircleData(circleData);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [circleData]);

  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} width={boundsWidth} height={boundsHeight} />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "#4B5563",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          pointerEvents: "none",
          display: "none",
          fontSize: "14px",
          whiteSpace: "nowrap",
        }}
      ></div>
    </div>
  );
};
