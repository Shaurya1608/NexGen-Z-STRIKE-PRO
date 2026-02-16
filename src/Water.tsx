import { RigidBody } from "@react-three/rapier";

export const Water = ({ position, size }: { position: [number, number, number]; size: [number, number] }) => {
    return (
        <RigidBody type="fixed" colliders="cuboid" position={position} sensor>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={size} />
                <meshStandardMaterial
                    color="#1a4a6a"
                    transparent
                    opacity={0.7}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>
        </RigidBody>
    );
};

export const WaterBodies = () => {
    return (
        <>
            {/* Main Lake */}
            <Water position={[100, 0.2, 100]} size={[60, 60]} />

            {/* Small Pond */}
            <Water position={[-80, 0.2, -80]} size={[25, 25]} />

            {/* Stream (multiple connected sections) */}
            <Water position={[0, 0.2, -100]} size={[10, 40]} />
            <Water position={[20, 0.2, -80]} size={[50, 10]} />
        </>
    );
};
