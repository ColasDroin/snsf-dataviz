"use client";
import { data } from "@/../public/data/data";
import circles2024 from "@/../public/data/grant_2024_circles.json";
import { Barplot } from "@/components/charts/barplot/Barplot";
import { ResponsiveCross } from "@/components/charts/cross/Cross";
import { ScrollContainer } from "@/components/scrollContainer";
export default function Home() {
  return (
    <main>
      <ScrollContainer />
      <div className="container mx-auto px-4 py-6 " style={{ maxWidth: 900 }}>
        <h3 className="text-red-800 text-center mb-[100vh]">
          How is Swiss research funded?
        </h3>
      </div>
    </main>
  );
}
