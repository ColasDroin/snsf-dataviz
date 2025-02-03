"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "../MainChart";

export const buildRectangles = (rectangleData) => {
  return rectangleData.map((data, i) => ({
    x: data.x,
    y: data.y,
    amount: data.amount,
    width: data.width,
    height: data.height,
    fill: data.fill ? data.fill : "white",
    alpha: 1,
    field: data.title ? data.title : "",
  }));
};

export const drawRectangles = (ctx, canvas, rects, yScale) => {
  rects.forEach(({ x, y, width, height, amount, fill, alpha }) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.rect(x, y, width, -height);
    ctx.fill();
  });

  if (yScale != null) {
    drawLeftAxis(ctx, canvas, yScale);
  }
};

export const animateRectangles = (tl, rects, rectangleData, draw) => {
  tl.add(
    gsap.to(rects, {
      x: (index) => rectangleData[index].x,
      y: (index) => rectangleData[index].y,
      width: (index) => rectangleData[index].width,
      height: (index) => rectangleData[index].height,
      fill: (index) => rectangleData[index].fill,
      duration: 1,
      stagger: { amount: 1 },
      onUpdate: draw,
    }),
    "<"
  );
  return tl;
};

export const tooltipHandlerRectangles = (canvas, tooltip, rects) => {
  const handleMouseMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    let hovered = false;

    rects.forEach(({ x, y, r, id, title, amount, type, field }) => {
      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (true) {
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

  return handleMouseMove;
};

export const drawLeftAxis = (ctx, canvas, yScale) => {
  const tickLength = 6;
  const pixelsPerTick = 80;
  const range = yScale.range();
  const height = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(height / pixelsPerTick);
  const ticks = yScale.ticks(numberOfTicksTarget);

  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  console.log(range);

  // Draw the main vertical axis line
  ctx.beginPath();
  ctx.moveTo(40, range[1]);
  ctx.lineTo(40, range[0]);
  ctx.stroke();

  // Draw ticks and labels
  ticks.forEach((value) => {
    const y = yScale(value);
    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(40, range[1] - y);
    ctx.lineTo(40 - tickLength, range[1] - y);
    ctx.stroke();

    // Draw label
    console.log(value);
    ctx.fillText(value.toString(), 40 - tickLength - 5, range[1] - y);
  });
};
