"use client";
import { ScrollContainer } from "@/components/ScrollContainer";
export default function Home() {
  return (
    <main>
      <ScrollContainer />
      <div className="container mx-auto px-4 py-6 " style={{ maxWidth: 900 }}>
        {/* <h3 className="text-red-800 text-center mb-[100vh]">
          How is Swiss research funded?
        </h3> */}
      </div>
    </main>
  );
}
