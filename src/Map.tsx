import { RigidBody } from "@react-three/rapier";
import { Grid } from "@react-three/drei";
import { useMemo } from "react";
import { Terrain } from "./Terrain";
import { Rocks } from "./Rocks";
import { WaterBodies } from "./Water";
import { Houses } from "./House";
import { Animals } from "./Animals";

const Tree = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        <RigidBody type="fixed" colliders="hull">
            <mesh castShadow receiveShadow position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshStandardMaterial color="#2d1b0d" roughness={0.9} />
            </mesh>
        </RigidBody>
        <mesh castShadow position={[0, 2.5, 0]}>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#1a2d1a" roughness={1} />
        </mesh>
    </group>
);

const SandPatch = ({ position, size }: { position: [number, number, number]; size: number }) => (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position}>
        <circleGeometry args={[size, 32]} />
        <meshStandardMaterial color="#c2b280" roughness={1} />
    </mesh>
);

export const Map = () => {
    // Generate 200 trees in clusters
    const trees = useMemo(() => {
        const t = [];
        // Forest cluster 1
        for (let i = 0; i < 80; i++) {
            const x = -150 + (Math.random() - 0.5) * 80;
            const z = -150 + (Math.random() - 0.5) * 80;
            t.push([x, 0, z] as [number, number, number]);
        }
        // Forest cluster 2
        for (let i = 0; i < 80; i++) {
            const x = 150 + (Math.random() - 0.5) * 80;
            const z = 150 + (Math.random() - 0.5) * 80;
            t.push([x, 0, z] as [number, number, number]);
        }
        // Scattered trees
        for (let i = 0; i < 40; i++) {
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            if (Math.abs(x) > 20 || Math.abs(z) > 20) {
                t.push([x, 0, z] as [number, number, number]);
            }
        }
        return t;
    }, []);

    // Sand patches for desert areas
    const sandPatches = useMemo(() => {
        const patches = [];
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            const size = 10 + Math.random() * 20;
            patches.push({ position: [x, 0.1, z] as [number, number, number], size });
        }
        return patches;
    }, []);

    return (
        <>
            {/* Terrain System */}
            <Terrain size={500} />

            {/* Grid Overlay */}
            <Grid
                infiniteGrid
                fadeDistance={100}
                fadeStrength={10}
                cellSize={0.5}
                sectionSize={2.5}
                sectionColor="#1a1a1a"
                cellColor="#0a0a0a"
            />

            {/* Natural Elements */}
            <Rocks count={50} spread={400} />
            <WaterBodies />

            {/* Sand Patches */}
            {sandPatches.map((patch, i) => (
                <SandPatch key={i} position={patch.position} size={patch.size} />
            ))}

            {/* Trees */}
            {trees.map((pos, i) => <Tree key={i} position={pos} />)}

            {/* Structures */}
            <Houses />

            {/* Wildlife */}
            <Animals count={20} />

            {/* Boundary Walls (far perimeter) */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, 5, -250]}>
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[500, 10, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid" position={[0, 5, 250]}>
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[500, 10, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid" position={[-250, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[500, 10, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </RigidBody>
            <RigidBody type="fixed" colliders="cuboid" position={[250, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[500, 10, 1]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </RigidBody>
        </>
    );
};
