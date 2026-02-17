import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";

export const Terrain = ({ size = 500 }: { size?: number }) => {
    // Generate height map using simple noise
    const geometry = useMemo(() => {
        const segments = 50; // Reduced from 100 for better performance
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        const positions = geo.attributes.position.array as Float32Array;

        // Apply height variation
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 1];

            // Simple multi-octave noise simulation
            const noise1 = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 3;
            const noise2 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 1;
            const noise3 = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5;

            positions[i + 2] = noise1 + noise2 + noise3;
        }

        geo.computeVertexNormals();
        return geo;
    }, [size]);

    return (
        <>
            {/* Visual Terrain */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
                <meshStandardMaterial
                    color="#2a4a2a"
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Simplified Physics Collider */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[size, size]} />
                    <meshStandardMaterial visible={false} />
                </mesh>
            </RigidBody>
        </>
    );
};
