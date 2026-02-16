import { Suspense } from "react";
import { Environment, Stars, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export const Engine = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <color attach="background" args={["#020205"]} />
            <fog attach="fog" args={["#020205", 5, 30]} />

            {/* Optimized Lighting - Reduced Shadow Map Size */}
            <ambientLight intensity={0.2} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={0.8}
                castShadow
                shadow-mapSize={[512, 512]}
                color="#0066ff"
            />
            <Environment preset="night" />

            {/* Optimized Stars - Reduced Count */}
            <Stars
                radius={100}
                depth={50}
                count={1000}
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
