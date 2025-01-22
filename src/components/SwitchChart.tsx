import React, { useState } from "react";
import { ResponsiveCross } from "@/components/charts/cross/Cross";
import { ResponsivePackedCircles } from "@/components/charts/packedCircles/PackedCircles";
import circles2024 from "@/../public/data/grant_2024_circles.json";

type SwitchChartProps = {
  chartType: string;
};

export const SwitchChart = ({ chartType }: SwitchChartProps) => {
  switch (chartType) {
    case "cross":
      return <ResponsiveCross data={circles2024} />;
    case "packedCircles":
      return <ResponsivePackedCircles data={circles2024} />;
    default:
      return <ResponsiveCross data={circles2024} />;
  }
};
