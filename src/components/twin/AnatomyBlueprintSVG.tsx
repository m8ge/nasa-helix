import React from 'react';
import { useTwinStore } from '../../stores/useTwinStore';
import { SpaceflightHazardId } from '../../types/medical';

interface Props {
  pulseBpm: number;
  activeHazard: SpaceflightHazardId | 'all' | null;
  onSelectOrgan: (organId: string) => void;
  selectedOrganId: string | null;
}

export const AnatomyBlueprintSVG: React.FC<Props> = ({
  pulseBpm,
  activeHazard,
  onSelectOrgan,
  selectedOrganId,
}) => {
  const pulseDurationSec = 60 / Math.max(40, Math.min(180, pulseBpm));

  // Determine accent color based on active hazard
  const getHazardGlow = (systemKey: string) => {
    if (!activeHazard) return '#00F0FF';
    if (activeHazard === 'radiation') {
      if (['blood', 'head', 'heart'].includes(systemKey)) return '#EF4444';
    }
    if (activeHazard === 'isolation') {
      if (['head', 'heart'].includes(systemKey)) return '#8B5CF6';
    }
    if (activeHazard === 'altered_gravity') {
      if (['bones', 'heart', 'eyes'].includes(systemKey)) return '#F59E0B';
    }
    if (activeHazard === 'hostile_environment') {
      if (['lungs', 'gut', 'head'].includes(systemKey)) return '#10B981';
    }
    return '#00F0FF';
  };

  return (
    <div className="relative w-full h-[520px] flex items-center justify-center select-none">
      <svg
        viewBox="0 0 400 700"
        className="w-full h-full max-h-[520px] drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.15))' }}
      >
        <defs>
          {/* Radial glow filter */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-hazard" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Holographic grid and circular scanner rings */}
        <circle cx="200" cy="350" r="180" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="200" cy="350" r="230" fill="none" stroke="rgba(0, 240, 255, 0.04)" strokeWidth="1" />
        <line x1="200" y1="50" x2="200" y2="650" stroke="rgba(0, 240, 255, 0.08)" strokeDasharray="2 4" />
        <line x1="50" y1="350" x2="350" y2="350" stroke="rgba(0, 240, 255, 0.08)" strokeDasharray="2 4" />

        {/* Humanoid Holographic Outline */}
        <g stroke="rgba(0, 240, 255, 0.35)" strokeWidth="1.5" fill="rgba(14, 20, 38, 0.4)">
          {/* Head & Neck */}
          <path d="M 175 90 C 175 55, 225 55, 225 90 C 225 125, 215 135, 208 145 L 208 160 L 192 160 L 192 145 C 185 135, 175 125, 175 90 Z" />

          {/* Torso & Pelvis */}
          <path d="M 160 170 L 240 170 L 228 320 L 215 360 L 185 360 L 172 320 Z" />

          {/* Shoulders & Left Arm */}
          <path d="M 160 170 L 125 210 L 115 310 L 105 390 L 120 395 L 130 315 L 145 225 L 160 185 Z" />

          {/* Right Arm */}
          <path d="M 240 170 L 275 210 L 285 310 L 295 390 L 280 395 L 270 315 L 255 225 L 240 185 Z" />

          {/* Left Leg */}
          <path d="M 185 360 L 175 480 L 170 600 L 155 640 L 180 640 L 192 600 L 195 480 L 200 370 Z" />

          {/* Right Leg */}
          <path d="M 215 360 L 225 480 L 230 600 L 245 640 L 220 640 L 208 600 L 205 480 L 200 370 Z" />
        </g>

        {/* CLICKABLE ANATOMICAL TARGET REGIONS */}

        {/* 1. HEAD / BRAIN (Central Nervous) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('central_nervous')}
        >
          <circle
            cx="200"
            cy="95"
            r="32"
            fill={selectedOrganId === 'central_nervous' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 240, 255, 0.08)'}
            stroke={getHazardGlow('head')}
            strokeWidth={selectedOrganId === 'central_nervous' ? 3 : 1.5}
            filter="url(#glow-cyan)"
            className="transition-all duration-300 group-hover:fill-bio-cyan/20"
          />
          {/* Neural pathways */}
          <path d="M 188 90 Q 200 80 212 90 Q 200 105 188 90" fill="none" stroke={getHazardGlow('head')} strokeWidth="1.5" />
          <path d="M 194 95 Q 200 110 206 95" fill="none" stroke={getHazardGlow('head')} strokeWidth="1" />
          <text x="250" y="85" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            [01] CNS & BRAIN
          </text>
          <line x1="225" y1="90" x2="245" y2="85" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1" />
        </g>

        {/* 2. EYES / OPTIC NERVE (SANS) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('ocular_retina')}
        >
          <circle cx="192" cy="85" r="4" fill={getHazardGlow('eyes')} />
          <circle cx="208" cy="85" r="4" fill={getHazardGlow('eyes')} />
          <text x="75" y="85" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            SANS / OCULAR [02]
          </text>
          <line x1="155" y1="85" x2="185" y2="85" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1" />
        </g>

        {/* 3. LUNGS (Respiratory) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('respiratory')}
        >
          {/* Left Lung */}
          <path
            d="M 175 190 C 165 210 165 240 180 250 C 190 250 190 200 185 190 Z"
            fill={selectedOrganId === 'respiratory' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.12)'}
            stroke={getHazardGlow('lungs')}
            strokeWidth="1.5"
            className="animate-breathe"
          />
          {/* Right Lung */}
          <path
            d="M 225 190 C 235 210 235 240 220 250 C 210 250 210 200 215 190 Z"
            fill={selectedOrganId === 'respiratory' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.12)'}
            stroke={getHazardGlow('lungs')}
            strokeWidth="1.5"
            className="animate-breathe"
          />
          <text x="65" y="215" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            PULMONARY [03]
          </text>
          <line x1="140" y1="215" x2="170" y2="215" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" />
        </g>

        {/* 4. HEART (Cardiovascular) - Bio-Synced Pulse! */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('cardiovascular')}
        >
          <circle
            cx="208"
            cy="215"
            r="16"
            fill={selectedOrganId === 'cardiovascular' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.15)'}
            stroke={getHazardGlow('heart')}
            strokeWidth="2"
            filter="url(#glow-hazard)"
            style={{
              animation: `heartbeat ${pulseDurationSec}s ease-in-out infinite`,
              transformOrigin: '208px 215px',
            }}
          />
          {/* Aorta arch */}
          <path
            d="M 205 205 C 205 195 215 195 215 208"
            fill="none"
            stroke={getHazardGlow('heart')}
            strokeWidth="2"
          />
          <text x="260" y="215" fill="#EF4444" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" className="group-hover:fill-white">
            HEART // {pulseBpm} BPM [04]
          </text>
          <line x1="225" y1="215" x2="255" y2="215" stroke="#EF4444" strokeWidth="1" />
        </g>

        {/* 5. GUT / METABOLIC */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('metabolic_gastro')}
        >
          <path
            d="M 185 270 Q 200 260 215 270 Q 215 310 200 320 Q 185 310 185 270"
            fill={selectedOrganId === 'metabolic_gastro' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.12)'}
            stroke={getHazardGlow('gut')}
            strokeWidth="1.5"
            className="transition-all duration-300 group-hover:fill-bio-amber/25"
          />
          <text x="70" y="295" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            METABOLIC / GUT [05]
          </text>
          <line x1="145" y1="295" x2="185" y2="295" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
        </g>

        {/* 6. SKELETAL / BONE ARCHITECTURE (Musculoskeletal) */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('musculoskeletal')}
        >
          {/* Spine cord */}
          <line x1="200" y1="160" x2="200" y2="350" stroke={getHazardGlow('bones')} strokeWidth="2.5" strokeDasharray="4 3" />
          {/* Pelvis bar */}
          <line x1="180" y1="355" x2="220" y2="355" stroke={getHazardGlow('bones')} strokeWidth="3" />
          {/* Femur / Tibia vectors */}
          <line x1="185" y1="370" x2="180" y2="520" stroke={getHazardGlow('bones')} strokeWidth="2" strokeDasharray="3 4" />
          <line x1="215" y1="370" x2="220" y2="520" stroke={getHazardGlow('bones')} strokeWidth="2" strokeDasharray="3 4" />
          <text x="250" y="450" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            ARED BONE/MUSCLE [06]
          </text>
          <line x1="225" y1="450" x2="245" y2="450" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
        </g>

        {/* 7. BLOOD / IMMUNE / DOSIMETER */}
        <g
          className="cursor-pointer group"
          onClick={() => onSelectOrgan('immune_hematopoietic')}
        >
          {/* Circulating lymph / blood pulse points */}
          <circle cx="130" cy="220" r="4" fill="#3B82F6" className="animate-ping" />
          <circle cx="270" cy="220" r="4" fill="#3B82F6" className="animate-ping" />
          <circle cx="185" cy="510" r="4" fill="#3B82F6" />
          <circle cx="215" cy="510" r="4" fill="#3B82F6" />
          <text x="60" y="515" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono" className="group-hover:fill-white">
            HEMATOPOIETIC / IMMUNE [07]
          </text>
          <line x1="145" y1="515" x2="180" y2="515" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1" />
        </g>

        {/* Concentric telemetry reticle overlay */}
        <g stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" fill="none">
          <circle cx="200" cy="350" r="100" strokeDasharray="5 15" />
          <circle cx="200" cy="350" r="140" strokeDasharray="2 10" />
        </g>
      </svg>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-space-900/80 border border-slate-700/60 backdrop-blur-md text-[11px] font-mono text-slate-300 pointer-events-none">
        Click any anatomical system node for clinical telemetry & countermeasures
      </div>
    </div>
  );
};
