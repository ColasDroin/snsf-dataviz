"use client";
import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { LayoutDataProps } from "../MainChart";

export const buildTitles = (titleData) => {
  return titleData.map((data, i) => ({
    x: data.x,
    y: data.y,
    textAlign: "center",
    font: "calc(0.7vh + 0.15vmin) sans-serif",
    field: data.field,
    fillStyle: data.fill ? data.fill : "white",
  }));
};

export const drawTitles = (ctx, canvas, titles, split = true) => {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  titles.forEach((t) => {
    ctx.fillStyle = t.fillStyle;
    ctx.textAlign = t.textAlign;
    ctx.font = t.font;

    if (split) {
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
    } else {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(-Math.PI / 2.1);

      ctx.textAlign = "right";
      ctx.fillText(t.field, 0, 0);

      ctx.restore();
    }
  });
};

export const animateTitles = (tl, titles, titleData, draw) => {
  tl.add(
    gsap.to(titles, {
      x: (index) => titleData[index].x,
      y: (index) => titleData[index].y,
      field: (index) => titleData[index].field,
      duration: 1,
      stagger: { amount: 1 },
      onUpdate: draw,
    }),
    "<" // This means the titles animation will start at the same time as the circles animation
  );

  return tl;
};
