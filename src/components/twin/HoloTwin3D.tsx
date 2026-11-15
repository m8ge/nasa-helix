import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../stores/useTwinStore';
import { SpaceflightHazardId } from '../../types/medical';

interface Props {
  pulseBpm: number;
  activeHazard: SpaceflightHazardId | 'all' | null;
  selectedOrganId: string | null;
  onSelectOrgan: (organId: string) => void;
}

// Organ Node component with interactive hover & click
const OrganNode: React.FC<{
  id: string;
  name: string;
  position: [number, number, number];
  baseColor: string;
  hazardColor?: string;
  size?: number;
  pulseSpeed?: number;
  isBreathing?: boolean;
  selected: boolean;
  onClick: (id: string) => void;
}> = ({
  id,
  position,
  baseColor,
  hazardColor,
  size = 0.15,
  pulseSpeed,
  isBreathing,
  selected,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const displayColor = hazardColor || (hovered ? '#FFFFFF' : selected ? '#00F0FF' : baseColor);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    if (pulseSpeed) {
      // Cardiac pulse
      const pulse = 1.0 + Math.sin(t * pulseSpeed * Math.PI * 2) * 0.18;
      meshRef.current.scale.set(pulse, pulse, pulse);
    } else if (isBreathing) {
      // Respiratory expansion
      const breath = 1.0 + Math.sin(t * 1.5) * 0.12;
      meshRef.current.scale.set(breath, breath, breath);
    } else if (hovered || selected) {
      const hoverGlow = 1.0 + Math.sin(t * 4) * 0.08;
      meshRef.current.scale.set(hoverGlow, hoverGlow, hoverGlow);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={hovered || selected ? 1.5 : 0.6}
          roughness={0.2}
          wireframe={!selected && !hovered}
        />
      </mesh>

      {/* Target indicator ring when selected */}
      {selected && (
        <Torus args={[size * 1.6, 0.015, 16, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#00F0FF" wireframe />
        </Torus>
      )}
    </group>
  );
};

// Holographic Particle Aura & Skeleton
const HumanoidHologram: React.FC<{
  pulseBpm: number;
  activeHazard: SpaceflightHazardId | 'all' | null;
  selectedOrganId: string | null;
  onSelectOrgan: (id: string) => void;
}> = ({ pulseBpm, activeHazard, selectedOrganId, onSelectOrgan }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pulseSpeed = pulseBpm / 60; // beats per second

  // Determine system hazard highlights
  const getHazardOverride = (systemKey: string): string | undefined => {
    if (!activeHazard) return undefined;
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
    return undefined;
  };

  // Particle cloud generation
  const particles = useMemo(() => {
    const points: [number, number, number][] = [];
    // Generate particles around humanoid torso
    for (let i = 0; i < 220; i++) {
      const y = (Math.random() - 0.5) * 3.2;
      const radius = 0.45 * (1.6 - Math.abs(y * 0.4));
      const angle = Math.random() * Math.PI * 2;
      points.push([
        Math.cos(angle) * radius * Math.random(),
        y,
        Math.sin(angle) * radius * Math.random(),
      ]);
    }
    return points;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Head wireframe mesh */}
      <Sphere args={[0.32, 16, 16]} position={[0, 1.45, 0]}>
        <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.25} />
      </Sphere>

      {/* Torso wireframe cylinder */}
      <Cylinder args={[0.42, 0.32, 1.1, 16, 4]} position={[0, 0.6, 0]}>
        <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.2} />
      </Cylinder>

      {/* Spine / Vertebral Cord */}
      <Cylinder args={[0.025, 0.025, 1.3, 8]} position={[0, 0.6, -0.05]}>
        <meshStandardMaterial
          color={getHazardOverride('bones') || '#F59E0B'}
          emissive={getHazardOverride('bones') || '#F59E0B'}
          emissiveIntensity={0.5}
        />
      </Cylinder>

      {/* Pelvis ring */}
      <Torus args={[0.32, 0.02, 16, 32]} position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.3} />
      </Torus>

      {/* Floating particles around aura */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(particles.flat()), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={activeHazard ? '#EF4444' : '#00F0FF'}
          transparent
          opacity={0.4}
        />
      </points>

      {/* INTERACTIVE ORGAN NODES */}

      {/* 1. CNS / Brain */}
      <OrganNode
        id="central_nervous"
        name="Central Nervous System"
        position={[0, 1.48, 0]}
        baseColor="#00F0FF"
        hazardColor={getHazardOverride('head')}
        size={0.2}
        selected={selectedOrganId === 'central_nervous'}
        onClick={onSelectOrgan}
      />

      {/* 2. Ocular / Optic Nerve (SANS) */}
      <OrganNode
        id="ocular_retina"
        name="Ocular / SANS"
        position={[0, 1.45, 0.28]}
        baseColor="#38BDF8"
        hazardColor={getHazardOverride('eyes')}
        size={0.07}
        selected={selectedOrganId === 'ocular_retina'}
        onClick={onSelectOrgan}
      />

      {/* 3. Heart (Cardiovascular) with Bio-Synced Pulse */}
      <OrganNode
        id="cardiovascular"
        name="Cardiovascular (Heart)"
        position={[0.08, 0.76, 0.12]}
        baseColor="#EF4444"
        hazardColor={getHazardOverride('heart')}
        size={0.14}
        pulseSpeed={pulseSpeed}
        selected={selectedOrganId === 'cardiovascular'}
        onClick={onSelectOrgan}
      />

      {/* 4. Lungs (Respiratory) with Breathing Motion */}
      <OrganNode
        id="respiratory"
        name="Respiratory (Lungs)"
        position={[-0.1, 0.78, 0.06]}
        baseColor="#10B981"
        hazardColor={getHazardOverride('lungs')}
        size={0.15}
        isBreathing={true}
        selected={selectedOrganId === 'respiratory'}
        onClick={onSelectOrgan}
      />

      {/* 5. Gut / Metabolic */}
      <OrganNode
        id="metabolic_gastro"
        name="Metabolic / Gut"
        position={[0, 0.35, 0.1]}
        baseColor="#F59E0B"
        hazardColor={getHazardOverride('gut')}
        size={0.16}
        selected={selectedOrganId === 'metabolic_gastro'}
        onClick={onSelectOrgan}
      />

      {/* 6. Musculoskeletal / Bones */}
      <OrganNode
        id="musculoskeletal"
        name="Musculoskeletal & ARED"
        position={[0, -0.15, 0]}
        baseColor="#E2E8F0"
        hazardColor={getHazardOverride('bones')}
        size={0.14}
        selected={selectedOrganId === 'musculoskeletal'}
        onClick={onSelectOrgan}
      />

      {/* 7. Blood / Immune / Radiation */}
      <OrganNode
        id="immune_hematopoietic"
        name="Hematopoietic & Immune"
        position={[0.22, 0.25, 0.08]}
        baseColor="#8B5CF6"
        hazardColor={getHazardOverride('blood')}
        size={0.11}
        selected={selectedOrganId === 'immune_hematopoietic'}
        onClick={onSelectOrgan}
      />
    </group>
  );
};

export const HoloTwin3D: React.FC<Props> = ({
  pulseBpm,
  activeHazard,
  selectedOrganId,
  onSelectOrgan,
}) => {
  const { isHoloRotating } = useTwinStore();

  return (
    <div className="w-full h-[520px] relative select-none">
      <Canvas
        camera={{ position: [0, 0.8, 3.8], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00F0FF" />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#8B5CF6" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <HumanoidHologram
            pulseBpm={pulseBpm}
            activeHazard={activeHazard}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={onSelectOrgan}
          />
        </Float>

        <OrbitControls
          enableZoom={true}
          minDistance={2.0}
          maxDistance={5.5}
          maxPolarAngle={Math.PI / 2 + 0.3}
          minPolarAngle={Math.PI / 4}
          autoRotate={isHoloRotating}
          autoRotateSpeed={0.8}
          enablePan={false}
        />
      </Canvas>

      {/* Floating Instructions Pill */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-space-900/80 border border-slate-700/60 backdrop-blur-md text-[11px] font-mono text-slate-300 pointer-events-none flex items-center gap-2">
        <span>Click nodes to inspect subsystems</span>
        <span className="text-slate-500">•</span>
        <span>Drag to rotate 3D twin</span>
      </div>
    </div>
  );
};
