"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "./CircleChart";

export const CircleChartGSAP = ({
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
    let circles = [];

    circles = prevCircleData.map((data, i) => ({
      x: data.cx,
      y: data.cy,
      r: data.r,
      fill: data.fill ? data.fill : "white",
      alpha: 1,
      id: data.id,
      title: data.title ? data.title : "",
      amount: data.amount ? data.amount : "",
      type: data.type ? data.type : "",
      field: data.field ? data.field : "",
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

      textData?.forEach((pos) => {
        ctx.fillStyle = "white";
        ctx.textAlign = pos.anchor;
        ctx.font = "calc(2vh + 0.5vmin) sans-serif";
        ctx.fillText(pos.text, pos.x, pos.y);
      });

      titles?.forEach((t) => {
        ctx.fillStyle = t.fill ? t.fill : "white";
        ctx.textAlign = "center";
        ctx.font = "calc(0.7vh + 0.15vmin) sans-serif";
        const maxWidth = 100; // Adjust this width limit as needed
        const words = t.field.split(" ");
        let line = "";
        let lines = [];
        let testLine = "";

        words.forEach((word) => {
          testLine = line + (line ? " " : "") + word;
          if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        });
        lines.push(line); // Add the last line

        // Draw each line with proper vertical spacing
        const lineHeight = parseFloat(ctx.font) * 1.2; // Adjust line spacing as needed
        const startY = t.y - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((l, index) => {
          ctx.fillText(l, t.x, startY + index * lineHeight);
        });
      });

      if (imageData) {
        const img = new Image();
        img.src = imageData.src;
        const imgHeight = imageData.width * (img.height / img.width);
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

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;
      let hovered = false;

      circles.forEach(({ x, y, r, id, title, amount, type, field }) => {
        const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        if (distance < r && doHover) {
          tooltip.style.display = "block";
          tooltip.style.left = `${mouseX + 10}px`;
          tooltip.style.top = `${mouseY + 10}px`;
          tooltip.innerHTML = `<strong>${title}</strong><br>Grant N°: ${id}<br>Amount: CHF ${amount}<br>Type: ${type} <br>Field: ${field}`;
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
