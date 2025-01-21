import React, { useEffect, useState } from "react";
import {
  forceSimulation,
  forceCollide,
  SimulationNodeDatum,
  forceManyBody,
} from "d3-force";

/**
 * We define an interface that extends SimulationNodeDatum so D3 can mutate x,y,vx,vy, etc.
 */
interface CircleNode extends SimulationNodeDatum {
  x?: number; // x-coordinate
  y?: number; // y-coordinate
  vx?: number; // x-velocity
  vy?: number; // y-velocity
  r: number; // circle radius
}

/**
 * Returns true if a circle of radius r at center (x,y) is fully inside
 * the "Swiss Cross" shape, which is the union of:
 *   - horizontal bar: width=crossWidth, height=crossThickness
 *   - vertical bar: width=crossThickness, height=crossHeight
 * Both are centered at (0,0).
 */
function isInsideCross(
  x: number,
  y: number,
  r: number,
  crossWidth: number,
  crossHeight: number,
  crossThickness: number
): boolean {
  const halfW = crossWidth / 2 - r;
  const halfH = crossHeight / 2 - r;
  const halfT = crossThickness / 2 - r;

  // Inside the horizontal bar:
  //  y must be within ±(crossThickness/2 - r)
  //  x must be within ±(crossWidth/2 - r)
  const insideHorizontal = Math.abs(y) <= halfT && Math.abs(x) <= halfW;

  // Inside the vertical bar:
  //  x must be within ±(crossThickness/2 - r)
  //  y must be within ±(crossHeight/2 - r)
  const insideVertical = Math.abs(x) <= halfT && Math.abs(y) <= halfH;

  return insideHorizontal || insideVertical;
}

/**
 * Find the closest point (xClamp, yClamp) inside the cross
 * for a circle with center (x, y) and radius r.
 *
 * We do this by trying to clamp the center to each bar
 * and seeing which is valid or "closest" to the original.
 * The logic is somewhat heuristic but attempts to push the node
 * into whichever rectangle is nearest.
 */
function findClosestPointInsideCross(
  x: number,
  y: number,
  r: number,
  crossWidth: number,
  crossHeight: number,
  crossThickness: number
): { xClamp: number; yClamp: number } {
  const halfW = crossWidth / 2 - r;
  const halfH = crossHeight / 2 - r;
  const halfT = crossThickness / 2 - r;

  // We'll clamp x,y to each rectangle and measure distance.
  // 1) Horizontal bar clamp:
  //    - x in [-halfW, halfW]
  //    - y in [-halfT, halfT]
  const xClampedH = Math.max(-halfW, Math.min(halfW, x));
  const yClampedH = Math.max(-halfT, Math.min(halfT, y));
  const distH = (x - xClampedH) ** 2 + (y - yClampedH) ** 2;

  // 2) Vertical bar clamp:
  //    - x in [-halfT, halfT]
  //    - y in [-halfH, halfH]
  const xClampedV = Math.max(-halfT, Math.min(halfT, x));
  const yClampedV = Math.max(-halfH, Math.min(halfH, y));
  const distV = (x - xClampedV) ** 2 + (y - yClampedV) ** 2;

  // Choose whichever clamp is closer to original center.
  if (distH < distV) {
    return { xClamp: xClampedH, yClamp: yClampedH };
  } else {
    return { xClamp: xClampedV, yClamp: yClampedV };
  }
}

/**
 * A custom force that pushes circles back inside the Swiss Cross shape.
 * We'll apply a small "nudge" toward the allowed region each tick if they
 * lie outside. The strength is controlled by alpha.
 */
function forceCrossBoundary(
  crossWidth: number,
  crossHeight: number,
  crossThickness: number
) {
  let nodes: CircleNode[];

  function force(alpha: number) {
    if (!nodes) return;

    for (const node of nodes) {
      const r = node.r;
      if (
        !isInsideCross(
          node.x ?? 0,
          node.y ?? 0,
          r,
          crossWidth,
          crossHeight,
          crossThickness
        )
      ) {
        const { xClamp, yClamp } = findClosestPointInsideCross(
          node.x ?? 0,
          node.y ?? 0,
          r,
          crossWidth,
          crossHeight,
          crossThickness
        );
        // "Nudge" the node's velocity toward xClamp,yClamp
        node.vx = (node.vx ?? 0) + (xClamp - (node.x ?? 0)) * alpha * 0.1;
        node.vy = (node.vy ?? 0) + (yClamp - (node.y ?? 0)) * alpha * 0.1;
      }
    }
  }

  force.initialize = (initNodes: CircleNode[]) => {
    nodes = initNodes;
  };

  return force;
}

interface PackedCircle {
  x: number;
  y: number;
  r: number;
}

/**
 * A helper function that takes an array of radii,
 * runs a D3 force simulation with collision + boundary constraints,
 * and returns the final (x,y) coordinates of each circle.
 *
 * @param radii - the array of circle radii.
 * @param crossWidth - the full width of the horizontal bar.
 * @param crossHeight - the full height of the vertical bar.
 * @param crossThickness - the thickness of each bar of the cross.
 * @param padding - minimal gap between circles.
 * @param iterationCount - how many simulation iterations to run.
 */
export function packCirclesInCross(
  radii: number[],
  crossWidth: number,
  crossHeight: number,
  crossThickness: number,
  padding = 2,
  iterationCount = 200
): PackedCircle[] {
  // Build an initial array of node objects for D3.
  const nodes: CircleNode[] = radii.map((r) => ({
    r,
    x: (Math.random() - 0.5) * crossWidth * 0.2, // random initial x
    y: (Math.random() - 0.5) * crossHeight * 0.2, // random initial y
  }));

  // Create a force simulation.
  // - forceManyBody(0) -> no extra repulsion/attraction
  // - forceCollide -> ensures no two circles overlap (collision radius = r + padding)
  // - custom forceCrossBoundary -> keeps circles within cross
  const simulation = forceSimulation<CircleNode>(nodes)
    .force("charge", forceManyBody().strength(0)) // no extra repulsion
    .force(
      "collide",
      forceCollide<CircleNode>()
        .radius((d: any) => d.r + padding)
        .iterations(1) // collision iteration
    )
    .force(
      "crossBoundary",
      forceCrossBoundary(crossWidth, crossHeight, crossThickness)
    )
    .stop();

  // Manually tick the simulation a fixed number of times.
  for (let i = 0; i < iterationCount; i++) {
    simulation.tick();
  }

  // Extract final positions
  return nodes.map((node) => ({
    x: node.x ?? 0,
    y: node.y ?? 0,
    r: node.r,
  }));
}
