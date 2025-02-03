"use client";
import { ScrollContainer } from "@/components/ScrollContainer";
import switzerland from "@/../public/data/switzerland.geojson";
import { SwissChart } from "@/components/map/Swiss";
export default function Home() {
  return (
    <main>
      <ScrollContainer />
      <div className="container mx-auto px-4 py-6 " style={{ maxWidth: 900 }}>
        <SwissChart geoData={switzerland} width={900} height={900} />
      </div>
    </main>
  );
}
