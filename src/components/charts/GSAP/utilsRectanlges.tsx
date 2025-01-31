"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "../MainChart";

export const buildRectangles = (rectangleData) => {
  return rectangleData.map((data, i) => ({
    x: data.x - Math.sqrt(data.amount / 100000) / 2,
    y: data.y,
    amount: data.amount,
    width: Math.sqrt(data.amount / 100000),
    height: Math.sqrt(data.amount / 100000),
    fill: data.fill ? data.fill : "white",
    alpha: 1,
    field: data.title ? data.title : "",
  }));
};

export const drawRectangles = (ctx, canvas, rects, clear = false) => {
  if (clear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  rects.forEach(({ x, y, width, height, amount, fill, alpha }) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
  });
};

export const animateRectangles = (tl, rects, rectangleData, draw) => {
  tl.to(rects, {
    x: (index) =>
      rectangleData[index].x -
      Math.sqrt(rectangleData[index].amount / 100000) / 2,
    y: (index) => rectangleData[index].y,
    width: (index) => Math.sqrt(rectangleData[index].amount / 100000),
    height: (index) => Math.sqrt(rectangleData[index].amount / 100000),
    fill: (index) => rectangleData[index].fill,
    duration: 1,
    stagger: { amount: 1 },
    onUpdate: draw,
  });
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
