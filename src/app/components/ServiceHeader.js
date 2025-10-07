"use client";

export default function ServiceHeader({ serviceName }) {
  if (!serviceName) return null;
  
  return (
    <div className="absolute top-16 left-0 right-0 z-20 flex justify-center">
      <div className="bg-black/70 text-white px-6 py-2 rounded-lg border border-white/20 backdrop-blur-sm">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider">{serviceName}</h2>
      </div>
    </div>
  );
}
