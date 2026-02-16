import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Animal = ({
    position,
    color,
    size
}: {
    position: [number, number, number];
    color: string;
    size: number;
}) => {
    const ref = useRef<THREE.Group>(null);
    const direction = useRef(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        0,
        (Math.random() - 0.5) * 0.5
    ));
    const timer = useRef(Math.random() * 100);

    useFrame((_, delta) => {
        if (!ref.current) return;

        timer.current += delta;

        // Change direction every few seconds
        if (timer.current > 3) {
            direction.current.set(
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
            );
            timer.current = 0;
        }

        // Move animal
        ref.current.position.add(direction.current.clone().multiplyScalar(delta));

        // Keep in bounds
        if (Math.abs(ref.current.position.x) > 200) {
            ref.current.position.x = Math.sign(ref.current.position.x) * 200;
            direction.current.x *= -1;
        }
        if (Math.abs(ref.current.position.z) > 200) {
            ref.current.position.z = Math.sign(ref.current.position.z) * 200;
            direction.current.z *= -1;
        }

        // Face movement direction
        if (direction.current.length() > 0.01) {
            const angle = Math.atan2(direction.current.x, direction.current.z);
            ref.current.rotation.y = angle;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Body */}
            <mesh castShadow position={[0, size * 0.5, 0]}>
                <boxGeometry args={[size, size, size * 1.5]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Head */}
            <mesh castShadow position={[0, size * 0.7, size]}>
                <sphereGeometry args={[size * 0.4, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
};

export const Animals = ({ count = 20 }: { count?: number }) => {
    const animals = Array.from({ length: count }, (_, i) => ({
        position: [
            (Math.random() - 0.5) * 400,
            0.5,
            (Math.random() - 0.5) * 400
        ] as [number, number, number],
        color: i % 2 === 0 ? "#8b6f47" : "#a0a0a0", // Brown deer or gray rabbits
        size: i % 2 === 0 ? 0.8 : 0.4,
    }));

    return (
        <>
            {animals.map((animal, i) => (
                <Animal
                    key={i}
                    position={animal.position}
                    color={animal.color}
                    size={animal.size}
                />
            ))}
        </>
    );
};
