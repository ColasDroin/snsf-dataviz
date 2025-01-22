"use client";
import { data } from "@/../public/data/data";
import circles2024 from "@/../public/data/grant_2024_circles.json";
import { Barplot } from "@/components/charts/barplot/Barplot";
import { ResponsiveCross } from "@/components/charts/cross/Cross";
import { ScrollamaDemo } from "@/components/Test";
export default function Home() {
  return (
    <main>
      <div className="w-full h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-800 to-red-600 flex items-center justify-center text-white mb-8 flex flex-col items-center justify-center ">
        <p className="mt-9 mb-8 text-sm md:text-4xl font-bold text-center">
          How is Swiss research funded?
        </p>
        <div className="h-full max-h-[50vh] max-w-full aspect-square">
          <ResponsiveCross data={circles2024} />
        </div>
        <p className="mb-9 mt-8 text-sm md:text-4xl font-bold text-center">
          A visual story about the Swiss National Science Foundation
        </p>
      </div>

      <div
        className="container mx-auto px-4 py-6 "
        style={{ maxWidth: 900 }}
      ></div>
      <ScrollamaDemo />
      <div className="container mx-auto px-4 py-6 " style={{ maxWidth: 900 }}>
        <h3 className="text-red-800 text-center mb-[100vh]">
          How is Swiss research funded?
        </h3>
      </div>
    </main>
  );
}
