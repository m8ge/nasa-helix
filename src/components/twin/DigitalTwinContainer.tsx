import React, { useState, lazy, Suspense } from 'react';
import { AnatomyBlueprintSVG } from './AnatomyBlueprintSVG';
import { useTwinStore } from '../../stores/useTwinStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { SpaceflightHazardId } from '../../types/medical';
import { RotateCw, Box, Layers, Heart, Wind, Shield, Loader2 } from 'lucide-react';

const HoloTwin3D = lazy(() =>
  import('./HoloTwin3D').then((m) => ({ default: m.HoloTwin3D }))
);

interface Props {
  pulseBpm: number;
  breathingRate: number;
}

export const DigitalTwinContainer: React.FC<Props> = ({ pulseBpm, breathingRate }) => {
  const { activeHazard, selectedOrganId, setSelectedOrganId, isHoloRotating, toggleHoloRotation } =
    useTwinStore();
  const { viewMode, setViewMode } = useConfigStore();
  const [webGlError, setWebGlError] = useState(false);

  return (
    <div className="relative w-full h-[560px] rounded-2xl glass-panel border border-space-700/60 overflow-hidden flex flex-col items-center justify-center p-2">
      {/* Top Twin Controls HUD */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        {/* Left: Bio-sync pulse indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-900/90 border border-slate-700/60 text-xs font-mono">
            <Heart className="w-3.5 h-3.5 text-bio-red animate-pulse" />
            <span className="text-white font-bold">{pulseBpm}</span>
            <span className="text-[10px] text-slate-400">BPM</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-space-900/90 border border-slate-700/60 text-xs font-mono">
            <Wind className="w-3.5 h-3.5 text-bio-green animate-breathe" />
            <span className="text-white font-bold">{breathingRate}</span>
            <span className="text-[10px] text-slate-400">RPM</span>
          </div>
        </div>

        {/* Right: View toggle (3D Holo vs 2D Blueprint) & Orbit Rotation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode(viewMode === '3d_holo' ? '2d_blueprint' : '3d_holo')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-space-900/90 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white hover:border-bio-cyan transition-colors"
            title="Toggle between 3D holographic projection and 2D anatomical blueprint"
          >
            {viewMode === '3d_holo' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-bio-cyan" /> 2D Blueprint
              </>
            ) : (
              <>
                <Box className="w-3.5 h-3.5 text-bio-cyan" /> 3D Holo
              </>
            )}
          </button>

          {viewMode === '3d_holo' && (
            <button
              onClick={toggleHoloRotation}
              className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                isHoloRotating
                  ? 'bg-bio-cyan/10 border-bio-cyan/40 text-bio-cyan'
                  : 'bg-space-900/90 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle orbital auto-rotation"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isHoloRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>
          )}
        </div>
      </div>

      {/* Primary Visual Canvas */}
      <div className="w-full h-full flex items-center justify-center">
        {viewMode === '3d_holo' && !webGlError ? (
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center gap-2 text-bio-cyan font-mono text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-bio-cyan" />
                <span>Initializing 3D Holographic Matrix...</span>
              </div>
            }
          >
            <HoloTwin3D
              pulseBpm={pulseBpm}
              activeHazard={activeHazard}
              selectedOrganId={selectedOrganId}
              onSelectOrgan={setSelectedOrganId}
            />
          </Suspense>
        ) : (
          <AnatomyBlueprintSVG
            pulseBpm={pulseBpm}
            activeHazard={activeHazard}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={setSelectedOrganId}
          />
        )}
      </div>
    </div>
  );
};
