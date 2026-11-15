# HELIX Architectural & Clinical Decisions Registry

> **Purpose**: Formal record of medical, physiological, UX, and architectural decisions made for the HELIX Astronaut Digital Twin.  
> **Standard**: Every physiological parameter, hazard connection, autonomy rule, and countermeasure is cited against NASA Human Research Program (HRP) Roadmap, NASA-STD-3001 (NASA Spaceflight Human-System Standard), or peer-reviewed aerospace medicine literature.

---

## 1. Clinical & Aerospace Medicine Decisions

### DEC-001: Separation of Personal Baseline from Population Envelopes
- **Decision**: Reject binary "normal vs abnormal" population ranges as primary indicators. Display dual-envelope curves: (1) Astronaut's individual pre-flight & early-flight personal baseline ($\mu \pm 1.5\sigma$) and (2) NASA-STD-3001 safety envelope.
- **Rationale**: In microgravity, cephalad fluid shift (~2 liters from lower limbs to head/thorax) causes autonomic resetting, lowered baseline resting heart rate, altered baroreceptor sensitivity, and hemoconcentration. An astronaut resting HR of 52 bpm may be standard for an endurance-trained astronaut in flight, but a rise to 68 bpm (still inside the 60–100 population "normal") represents a substantial +3.1σ sympathetic stress response.
- **Source**: *NASA-STD-3001, Vol 1, Rev B: Crew Health*, and *Charles, J.B. et al., Human Cardiovascular Adjustments to Space Flight, Exp Physiol 1994*.
- **Confidence**: Definitive Standard.

### DEC-002: Algorithmic Definition of the "Drift Engine"
- **Decision**: Avoid black-box machine learning for flight-critical alerting. Use explainable statistical drift metrics: Rolling Exponentially Weighted Moving Average (EWMA), 7-day z-score divergence, and multi-signal concordance.
- **Rationale**: Astronauts and flight surgeons must trust why an alert triggers during high-stress operations. A black box cannot be interrogated under comms blackout. The explainability format ("Why this fired") presents exact mathematical contributions (e.g. "+6 bpm resting HR over 8 days + 34% drop in deep sleep = Early Fatigue Syndrome").
- **Source**: *NASA HRP Risk of Adverse Cognitive or Behavioral Conditions and Psychiatric Disorders (BMed Risk)*.
- **Confidence**: High Consensus.

### DEC-003: Autonomy Tiers & Store-and-Forward Comms Delay Engine
- **Decision**: Implement a 3-tier autonomy model (GREEN, AMBER, RED) whose actionable guidance dynamically reconfigures based on the spacecraft's Earth-distance latency slider (LEO 0s, Moon 2.6s round-trip, Mars 4 to 44 min round-trip).
- **Rationale**: In Low Earth Orbit (ISS), RED status means "Immediately call Flight Surgeon on S-Band". In Mars Transit, immediate voice contact is physically impossible. At Mars distances, a RED alert must trigger an immediate *Autonomous Self-Stabilization Checklist* to execute while simultaneously drafting an asynchronous telemetry packet for the ground station.
- **Source**: *NASA HRP Human Exploration Research Analog (HERA) Campaign Reports on Autonomous Medical Operations*.
- **Confidence**: Definitive Standard.

### DEC-004: 60-Second PVT (Psychomotor Vigilance Task) Micro-Test
- **Decision**: Integrate a calibrated 60-second visual reaction-time test measuring millisecond response latency and counting attentional lapses ($>500\text{ ms}$).
- **Rationale**: PVT is NASA's gold-standard operational tool (e.g., PVT-B aboard ISS) to objectively quantify neurobehavioral fatigue, sleep loss, and circadian misalignment without subjective reporting bias.
- **Source**: *Basner, M. et al., Mars 520-D Mission PVT Validation, PLoS ONE 2014; Dinges, D.F. NASA HRP Behavioral Health and Performance*.
- **Confidence**: Definitive Standard.

### DEC-005: 5 NASA Spaceflight Hazards (RIDGE Model)
- **Decision**: Map all health telemetry and organ impacts to the 5 official NASA spaceflight hazards:
  1. **R**adiation (Galactic Cosmic Rays [GCR], Solar Particle Events [SPE])
  2. **I**solation & Confinement (Behavioral health, circadian desynchrony)
  3. **D**istance from Earth (Medical autonomy, comms blackout, supply constraints)
  4. **G**ravity Alterations (Microgravity fluid shifts, SANS, osteopenia, neurovestibular ataxia)
  5. **E**nvironments (Hostile closed loops: ECLSS, acoustic noise, high CO2, particulate matter)
- **Source**: *NASA Human Research Program: The 5 Hazards of Spaceflight (NP-2019-09-012-JSC)*.
- **Confidence**: Definitive Standard.

### DEC-006: Non-Diagnostic Educational Notice
- **Decision**: Embed an unmistakable, persistent disclaimer stating HELIX is an operational decision-support prototype and educational simulator, not a certified Class II/III medical diagnostic device.
- **Rationale**: Patient safety and ethical AI adherence. Guidance must always default to flight surgeon escalation whenever telemetry enters critical thresholds.

---

## 2. Software Architecture & UX Decisions

### DEC-007: Offline-First IndexedDB Architecture
- **Decision**: Use Dexie.js (IndexedDB) as primary storage with local Zustand reactivity.
- **Rationale**: Deep space vehicles cannot rely on cloud servers, external CDNs, or persistent ground connections. Every asset, schema, algorithm, and dataset must be locally resident and function without an active network connection.

### DEC-008: 3D Holographic Twin with Layered SVG Anatomy Fallback
- **Decision**: Render the primary body twin using Three.js / React Three Fiber with shader glows, backed by a fully reactive SVG anatomical vector fallback.
- **Rationale**: Allows smooth hardware-accelerated 3D exploration on capable devices while guaranteeing 100% operational availability on low-power tablets, radiation-hardened spacecraft computers, or when WebGL contexts are constrained.

### DEC-009: Color-Blind Redundant Status Shapes & Dim Cabin Night Mode
- **Decision**: Pair GREEN with Circles, AMBER with Triangles, and RED with Hexagons/Diamonds. Provide a one-touch "Dim Cabin Night Mode" that red-shifts the UI ($630\text{ nm}$ wavelength dominant) and lowers screen luminance.
- **Rationale**: Astronauts experience variable lighting conditions, and night operations require melatonin preservation per NASA-STD-3001 crew sleep environment guidelines. Redundant shapes protect against protanopia, deuteranopia, and glare.
