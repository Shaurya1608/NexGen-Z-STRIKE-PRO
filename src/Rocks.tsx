import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

const Rock = ({ position, scale }: { position: [number, number, number]; scale: number }) => (
    <RigidBody type="fixed" colliders="hull" position={position}>
        <mesh castShadow receiveShadow scale={scale}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#4a4a4a" roughness={1} />
        </mesh>
    </RigidBody>
);

export const Rocks = ({ count = 50, spread = 250 }: { count?: number; spread?: number }) => {
    const rocks = useMemo(() => {
        const r = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread;
            const z = (Math.random() - 0.5) * spread;
            const scale = 0.5 + Math.random() * 2;
            r.push({ position: [x, scale * 0.5, z] as [number, number, number], scale });
        }
        return r;
    }, [count, spread]);

    return (
        <>
            {rocks.map((rock, i) => (
                <Rock key={i} position={rock.position} scale={rock.scale} />
            ))}
        </>
    );
};
