import Image from "next/image";
import Link from "next/link";
import BloodTitle from "./components/BloodTitle";
import InitializeScript from "./components/InitializeScript";

export default function Home() {
  return (
    <div className="font-sans min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/backgrounds/corridor1.jpg"
          alt="Hospital corridor"
          fill
          style={{ objectFit: 'cover', filter: 'brightness(0.4)' }}
          priority
        />
      </div>      {/* Content */}
      <main className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 py-20 text-center max-w-4xl">
        <BloodTitle text="ECHAP-O-PITAL" />

        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <p className="text-lg md:text-xl text-white leading-relaxed mb-6">
            Vous allez vivre une expérience unique, embarquez dans un voyage au cœur d'un hôpital infiltré par les illuminatis. 
            <br/>Votre but : vous échapper (vivant et en bonne santé) de ce lieu tout en démasquant ces "faux médecins" qui souhaitent 
            terminer l'espèce humaine. Bon courage, joueurs. Que la force soit avec vous.
          </p>
        </div>

        <Link 
          href="/game" 
          className="mt-8 px-10 py-4 bg-red-600 hover:bg-red-700 transition-colors text-white text-2xl font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
        >
          START
        </Link>      </main>
      <InitializeScript />
    </div>
  );
}
