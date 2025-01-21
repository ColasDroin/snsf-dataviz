import { data } from "@/../public/data/data";
import { Barplot } from "@/components/charts/barplot/Barplot";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function Home() {
  return (
    <main>
      <div className="w-full h-[clamp(200px,15vw,500px)] bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white mb-8">
        <h1 className="text-3xl md:text-5xl font-bold">
          Welcome to the Banner
        </h1>
      </div>
      <div className="container mx-auto px-4 py-6 " style={{ maxWidth: 900 }}>
        <h1>Dataviz project Boilerplate</h1>

        <p>
          Once upon a time, in a far-off land, there was a very lazy king who
          spent all day lounging on his throne. One day, his advisors came to
          him with a problem: the kingdom was running out of money.
        </p>

        <h2>The King's Plan</h2>
        <p>
          The king thought long and hard, and finally came up with{" "}
          <a
            href="#"
            className="font-medium text-primary underline underline-offset-4"
          >
            a brilliant plan
          </a>
          : he would tax the jokes in the kingdom.
        </p>
        <blockquote>
          "After all," he said, "everyone enjoys a good joke, so it's only fair
          that they should pay for the privilege."
        </blockquote>

        <Barplot width={500} height={400} data={data} />
      </div>
    </main>
  );
}
