"use client";
import React, { useRef, useEffect, useState } from "react";
import { LayoutDataProps } from "../MainChart";
import { gsap } from "gsap";
import {
  buildCircles,
  drawCircles,
  animateCircles,
  tooltipHandlerCircles,
} from "./utilsCircles";
import {
  buildRectangles,
  drawRectangles,
  animateRectangles,
  tooltipHandlerRectangles,
} from "./utilsRectanlges";
export const ChartGSAP = ({
  boundsWidth,
  boundsHeight,
  circleData,
  textData = null,
  imageData = null,
  doHover = false,
  titles = [],
  rectangleData = null,
}: LayoutDataProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [prevCircleData, setPrevCircleData] = useState(circleData);
  const [prevRectangleData, setPrevRectangleData] = useState(rectangleData);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const tooltip = tooltipRef.current!;
    let circles = buildCircles(prevCircleData);

    const drawC = () => {
      drawCircles(ctx, canvas, circles, textData, titles, imageData);
    };

    let tl = gsap.timeline();
    tl = animateCircles(tl, circles, circleData, drawC);

    const handleMouseMoveCircles = tooltipHandlerCircles(
      canvas,
      tooltip,
      circles
    );

    if (doHover) {
      canvas.addEventListener("mousemove", handleMouseMoveCircles);
      canvas.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    }

    if (rectangleData != null) {
      if (prevRectangleData === null) {
        setPrevRectangleData(rectangleData);
      }
      // This is a hack to prevent prevRectangleData from being null initially... might be problematic
      let rectangles = buildRectangles(prevRectangleData || rectangleData);
      const drawR = () => {
        drawRectangles(ctx, canvas, rectangles);
      };
      tl = animateRectangles(tl, rectangles, rectangleData, drawR);
      const handleMouseMoveRectangles = tooltipHandlerRectangles(
        canvas,
        tooltip,
        rectangles
      );
      if (rectangleData != null) {
        canvas.addEventListener("mousemove", handleMouseMoveRectangles);
      }
    }

    setPrevCircleData(circleData);
    setPrevRectangleData(rectangleData);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMoveCircles);
      // canvas.removeEventListener("mousemove", handleMouseMoveRectangles);
    };
  }, [circleData, rectangleData]);

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
