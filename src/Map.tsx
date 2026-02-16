import { RigidBody } from "@react-three/rapier";
import { Grid, Box } from "@react-three/drei";
import { useMemo } from "react";

const Tree = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Optimized Primitive Collider */}
        <RigidBody type="fixed" colliders="hull">
            <mesh castShadow receiveShadow position={[0, 1, 0]}>
                <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
                <meshStandardMaterial color="#2d1b0d" roughness={0.9} />
            </mesh>
        </RigidBody>
        {/* Removed Float for performance */}
        <mesh castShadow position={[0, 2.5, 0]}>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#1a2d1a" roughness={1} />
        </mesh>
    </group>
);

const Wall = ({ position, rotation, args }: { position: [number, number, number], rotation?: [number, number, number], args: [number, number, number] }) => (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
        <mesh receiveShadow castShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.2} />
        </mesh>
    </RigidBody>
);

const Pillar = ({ position }: { position: [number, number, number] }) => (
    <RigidBody type="fixed" colliders="hull" position={position}>
        <mesh receiveShadow castShadow>
            <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
        </mesh>
    </RigidBody>
);

export const Map = () => {
    const trees = useMemo(() => {
        const t = [];
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            if (Math.abs(x) > 10 || Math.abs(z) > 10) {
                t.push([x, 0, z] as [number, number, number]);
            }
        }
        return t;
    }, []);

    return (
        <>
            <RigidBody type="fixed" colliders="cuboid">
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#050505" />
                </mesh>
            </RigidBody>

            <Grid
                infiniteGrid
                fadeDistance={30}
                fadeStrength={10}
                cellSize={0.5}
                sectionSize={2.5}
                sectionColor="#1a1a1a"
                cellColor="#0a0a0a"
            />

            <pointLight position={[0, 5, 0]} intensity={0.5} color="#00ffcc" />

            <Wall position={[0, 2, -25]} args={[50, 4, 1]} />
            <Wall position={[0, 2, 25]} args={[50, 4, 1]} />
            <Wall position={[-25, 2, 0]} rotation={[0, Math.PI / 2, 0]} args={[50, 4, 1]} />
            <Wall position={[25, 2, 0]} rotation={[0, Math.PI / 2, 0]} args={[50, 4, 1]} />

            {trees.map((pos, i) => <Tree key={i} position={pos} />)}

            <Pillar position={[8, 2, 8]} />
            <Pillar position={[-8, 2, -8]} />
            <Pillar position={[8, 2, -8]} />
            <Pillar position={[-8, 2, 8]} />

            <Wall position={[0, 1, 15]} args={[6, 2, 0.5]} />
            <Wall position={[15, 1, 0]} rotation={[0, Math.PI / 2, 0]} args={[6, 2, 0.5]} />
            <Wall position={[-15, 1, 0]} rotation={[0, Math.PI / 2, 0]} args={[6, 2, 0.5]} />
            <Wall position={[0, 1, -15]} args={[6, 2, 0.5]} />

            <RigidBody type="fixed" colliders="cuboid" position={[0, 0.5, 0]}>
                <Box args={[2, 1, 2]} castShadow receiveShadow>
                    <meshStandardMaterial color="#111" />
                </Box>
            </RigidBody>
        </>
    );
};
