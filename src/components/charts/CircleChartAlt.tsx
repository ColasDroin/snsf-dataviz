"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const CanvasCirclesWithGSAP = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const circles = [];

    for (let i = 0; i < 40000; i++) {
      circles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1,
        targetR: Math.random(),
        //color: `hsl(${(i * 36) % 360}, 80%, 60%)`,
        color: "white",
        alpha: 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circles.forEach(({ x, y, r, color, alpha }) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    let tl = gsap.timeline();
    tl.to(circles, {
      x: (index, target, targets) => Math.random() * canvas.width,
      y: (index, target, targets) => Math.random() * canvas.width,
      r: (index, target, targets) => circles[index].targetR,
      //fill: (index, target, targets) => movedCircles[index].fill,
      duration: 1,
      //ease: "power.3.out",
      stagger: { amount: 2 },
      onUpdate: draw,
    });

    tl.to(circles, {
      x: (index, target, targets) => Math.random() * canvas.width,
      y: (index, target, targets) => Math.random() * canvas.width,
      r: (index, target, targets) => circles[index].targetR,
      color: "blue",
      //fill: (index, target, targets) => movedCircles[index].fill,
      duration: 1,
      //ease: "power.3.out",
      stagger: { amount: 2 },
      onUpdate: draw,
    });
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default CanvasCirclesWithGSAP;
