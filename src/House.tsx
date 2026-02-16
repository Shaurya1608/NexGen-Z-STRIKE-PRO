import { RigidBody } from "@react-three/rapier";

export const House = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
            {/* Foundation */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
                    <boxGeometry args={[6, 3, 6]} />
                    <meshStandardMaterial color="#8b7355" />
                </mesh>
            </RigidBody>

            {/* Roof */}
            <mesh castShadow position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[4.5, 2, 4]} />
                <meshStandardMaterial color="#4a2511" />
            </mesh>

            {/* Door */}
            <mesh position={[0, 0.8, 3.01]}>
                <boxGeometry args={[1, 1.8, 0.1]} />
                <meshStandardMaterial color="#3a1a0a" />
            </mesh>

            {/* Windows */}
            <mesh position={[-2, 1.5, 3.01]}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color="#6ab3d8" transparent opacity={0.5} />
            </mesh>
            <mesh position={[2, 1.5, 3.01]}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color="#6ab3d8" transparent opacity={0.5} />
            </mesh>
        </group>
    );
};

export const Houses = () => {
    const positions: [number, number, number][] = [
        [-50, 0, -50],
        [-30, 0, -55],
        [-70, 0, -45],
        [40, 0, 40],
        [60, 0, 35],
        [50, 0, 60],
        [0, 0, 80],
        [-100, 0, 50],
    ];

    return (
        <>
            {positions.map((pos, i) => (
                <House key={i} position={pos} />
            ))}
        </>
    );
};
