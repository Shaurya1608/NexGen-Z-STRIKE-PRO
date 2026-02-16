import { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Float, Text } from "@react-three/drei";

const Target = ({ position, onHit }: { position: [number, number, number], onHit: () => void }) => {
    const [hit, setHit] = useState(false);

    if (hit) return null;

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <RigidBody
                type="fixed"
                colliders="cuboid"
                position={position}
                onCollisionEnter={() => {
                    setHit(true);
                    onHit();
                }}
            >
                <mesh castShadow>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
                </mesh>
                <Text
                    position={[0, 0.6, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    TARGET
                </Text>
            </RigidBody>
        </Float>
    );
};

export const Targets = ({ onHit }: { onHit: () => void }) => {
    const positions: [number, number, number][] = [
        [0, 2, -10],
        [5, 2, -15],
        [-5, 2, -12],
        [10, 3, -20],
        [-10, 2, -18],
    ];

    return (
        <>
            {positions.map((pos, i) => (
                <Target key={i} position={pos} onHit={onHit} />
            ))}
        </>
    );
};
