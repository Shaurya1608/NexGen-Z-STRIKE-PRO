import { Suspense } from "react";
import { Environment, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Embers } from "./Embers";

export const Engine = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <color attach="background" args={["#020205"]} />
            <fog attach="fog" args={["#020205", 50, 200]} />

            {/* Optimized Lighting - Reduced Shadow Map Size */}
            <ambientLight intensity={0.1} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[512, 512]}
                color="#00ffcc"
            />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ff6600" />
            <Environment preset="night" />
            <Embers count={200} />

            {/* Optimized Stars - Reduced Count */}
            <Stars
                radius={100}
                depth={50}
                count={500}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            <Suspense fallback={null}>
                {children}
            </Suspense>

            {/* Optimized Post-Processing - Removed Noise, Simplified Effects */}
            <EffectComposer>
                <Bloom
                    intensity={0.5}
                    luminanceThreshold={0.5}
                    luminanceSmoothing={0.9}
                />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={45} />
        </>
    );
};
