import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">


      



      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">Willkommen zu meiner Kunstgalerie</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Entdecke einzigartige Kunstwerke und erfahre mehr über die Inspiration hinter jedem Stück.
        </p>
        <Button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600">
          Galerie besuchen
        </Button>
      </div>
      <div className="mt-12 flex justify-center">
        <Image
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
          className="dark:invert"
        />
      </div>
    </main>
  );
}