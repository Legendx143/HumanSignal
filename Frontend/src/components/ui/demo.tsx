"use client";

import FluidCanvas from "@/components/ui/fluid-canvas";

export default function FluidCanvasDemo() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <FluidCanvas className="absolute inset-0 h-full w-full">
        <div className="flex h-full flex-col items-start justify-center gap-3 p-6 sm:p-10">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            Klyv 4.0
          </span>
          <h1 className="max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-3xl">
            Interfaces with a current running through them
          </h1>
          <p className="max-w-md text-xs text-white/80 sm:text-sm">
            Move the pointer, or drag with a few fingers. Leave it alone and it
            keeps drifting on its own.
          </p>
          <div className="mt-1 flex gap-3">
            <button className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black sm:text-sm">
              Start building
            </button>
            <button className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-medium text-white sm:text-sm">
              Stir it
            </button>
          </div>
        </div>
      </FluidCanvas>
    </div>
  );
}
