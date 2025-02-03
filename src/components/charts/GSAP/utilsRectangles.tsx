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

export const drawRectangles = (ctx, canvas, rects, yScale, xScale) => {
  rects.forEach(({ x, y, width, height, amount, fill, alpha }) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.rect(x, y, width, -height);
    ctx.fill();
  });

  if (yScale != null) {
    drawLeftAxis(ctx, canvas, yScale, xScale);
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

export const drawLeftAxis = (ctx, canvas, yScale, xScale) => {
  const tickLength = 6;
  const pixelsPerTick = 70;
  const range = yScale.range();
  range[1] += 0;
  const rangeX = xScale.range();
  const height = range[1] - range[0];
  const numberOfTicksTarget = Math.floor(height / pixelsPerTick);
  const ticks = yScale.ticks(numberOfTicksTarget);

  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  // Draw the main vertical axis line
  ctx.beginPath();
  ctx.moveTo(rangeX[0], range[1]);
  ctx.lineTo(rangeX[0], range[0]);
  ctx.stroke();

  // Draw ticks and labels
  ticks.forEach((value) => {
    const y = yScale(value);
    // Draw tick mark
    ctx.beginPath();
    ctx.moveTo(rangeX[0], range[1] - y);
    ctx.lineTo(rangeX[0] - tickLength, range[1] - y);
    ctx.stroke();

    // Draw label
    ctx.fillText(
      (value / 1000000).toString() + "M",
      rangeX[0] - tickLength - 5,
      range[1] - y
    );
  });

  // Draw the yaxis label
  ctx.save();
  ctx.translate(rangeX[0] - 60, range[0] + height / 2); // Move label to center
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Amount in CHF", 0, 0);
  ctx.restore();

  // Draw line for x-axis
  ctx.beginPath();
  ctx.moveTo(rangeX[0], range[1]);
  ctx.lineTo(rangeX[1], range[1]);
  ctx.stroke();

  // Draw ticks for x-axis (which is a scaleBand)
  xScale.domain().forEach((value, i) => {
    const x = xScale(value) + xScale.bandwidth() / 2;
    ctx.beginPath();
    ctx.moveTo(x, range[1]);
    ctx.lineTo(x, range[1] + tickLength);
    ctx.stroke();
  });
};
