// -------------------------------------------------------------------------------------------------
// Imports
// -------------------------------------------------------------------------------------------------
"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "./CircleChart";
import { text } from "stream/consumers";
// -------------------------------------------------------------------------------------------------
// Components
// -------------------------------------------------------------------------------------------------

export const CircleChartGSAP = ({
  boundsWidth,
  boundsHeight,
  circleData,
  textData = null,
  imageData = null,
}: LayoutDataProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prevCircleData, setPrevCircleData] = useState(circleData); // Store the previous circleData
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    // Translate the origin to the center of the canvas
    let circles = [];

    // Animate circles from prevCircleData to the new circleData
    circles = prevCircleData.map((data, i) => ({
      x: data.cx,
      y: data.cy,
      r: data.r,
      fill: data.fill ? data.fill : "white",
      alpha: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circles.forEach(({ x, y, r, fill, alpha }) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      // Add text and image rendering here
      textData?.forEach((pos) => {
        ctx.fillStyle = "white";
        ctx.textAlign = pos.anchor;
        ctx.font = "calc( 2vh + 0.5vmin) sans-serif";
        ctx.fillText(pos.text, pos.x, pos.y);
      });
      // Ad image rendering here
      if (imageData) {
        const img = new Image();
        img.src = imageData.src;
        const imgHeight = imageData.width * (img.height / img.width); // Preserve aspect ratio
        ctx.drawImage(
          img,
          imageData.x,
          imageData.y,
          imageData.width,
          imgHeight
        );
      }
    };

    let tl = gsap.timeline();
    tl.to(circles, {
      x: (index) => circleData[index].cx,
      y: (index) => circleData[index].cy,
      r: (index) => circleData[index].r,
      fill: (index) =>
        circleData[index].fill ? circleData[index].fill : "white",
      duration: 1,
      stagger: { amount: 1 },
      onUpdate: draw,
    });

    // Update previous circleData to the current one
    setPrevCircleData(circleData);
  }, [circleData]); // Trigger the effect whenever circleData changes

  return <canvas ref={canvasRef} width={boundsWidth} height={boundsHeight} />;
};
