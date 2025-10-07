"use client";

export default function ServiceHeader({ serviceName, serviceDescription, isCorridor }) {
  if (isCorridor) {
    return null;
  }

  const displayName = serviceName || "Service inconnu";
  const displayDesc = serviceDescription || "";  return (
    <div className="absolute top-16 left-0 right-0 z-50 flex justify-center">
      <div 
        className="bg-red-800/95 text-white px-8 py-5 rounded-lg border-2 border-red-400 backdrop-blur-md shadow-xl animate-fadeIn"
        style={{
          boxShadow: '0 0 15px rgba(255, 100, 100, 0.6)',
          animation: 'fadeIn 0.6s ease-in-out'
        }}
      >
        <h2 className="text-2xl md:text-4xl font-bold tracking-wider text-center flex items-center justify-center">
          <span className="mr-3 text-3xl">🏥</span> 
          <span className="border-b-2 border-white uppercase">{displayName}</span>
          <span className="ml-3 text-3xl">🏥</span>
        </h2>
        {displayDesc && (
          <p className="text-sm md:text-base text-gray-200 mt-3 text-center max-w-xl font-medium">{displayDesc}</p>
        )}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
