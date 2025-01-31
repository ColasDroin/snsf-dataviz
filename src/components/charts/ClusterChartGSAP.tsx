"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataClusterProps } from "./CircleChart";

export const ClusterChartGSAP = ({
  boundsWidth,
  boundsHeight,
  clusterData,
}: LayoutDataClusterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [prevClusterData, setPrevClusterData] = useState(clusterData);

  console.log("clusterData", clusterData);
  //console.log("prevClusterData", prevClusterData);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const tooltip = tooltipRef.current!;
    let rects = [];
    console.log("BEING CALLED IN USEEFFECT");
    console.log("prevClusterData", prevClusterData);
    rects = prevClusterData.map((data, i) => ({
      x: data.x,
      y: data.y,
      amount: data.amount,
      width: 10,
      height: data.amount / 10000000,
      fill: data.fill ? data.fill : "white",
      alpha: 1,
      field: data.title ? data.title : "",
    }));
    console.log("RECTS", rects);
    console.log("prevClusterData AFTER", prevClusterData);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rects.forEach(({ x, y, width, height, amount, fill, alpha }) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fill();
      });
    };

    let tl = gsap.timeline();
    tl.to(rects, {
      x: (index) => clusterData[index].x,
      y: (index) => clusterData[index].y,
      height: (index) => clusterData[index].amount / 10000000,
      fill: (index) => clusterData[index].fill,
      duration: 1,
      stagger: { amount: 1 },
      onUpdate: draw,
    });

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;
      let hovered = false;

      rects.forEach(({ x, y, width, height, amount, field }) => {
        if (true) {
          tooltip.style.display = "block";
          tooltip.style.left = `${mouseX + 10}px`;
          tooltip.style.top = `${mouseY + 10}px`;
          tooltip.innerHTML = `Total amount: CHF ${amount} <br>Field: ${field}`;
          hovered = true;
        }
      });

      if (!hovered) {
        tooltip.style.display = "none";
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    setPrevClusterData(clusterData);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [clusterData]);

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
