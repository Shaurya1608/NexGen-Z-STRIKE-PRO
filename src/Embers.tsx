import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const Embers = ({ count = 100 }) => {
    const mesh = useRef<THREE.Points>(null);

    const particles = useRef(
        new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 50,
                Math.random() * 10,
                (Math.random() - 0.5) * 50
            ),
            speed: 0.01 + Math.random() * 0.02,
        }))
    );

    useFrame(() => {
        if (!mesh.current) return;
        const positions = (mesh.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

        particles.current.forEach((p, i) => {
            p.position.y += p.speed;
            if (p.position.y > 10) p.position.y = 0;
            p.position.x += Math.sin(Date.now() * 0.001 + i) * 0.01;

            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
        });

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={new Float32Array(count * 3)}
                    itemSize={3}
                    args={[new Float32Array(count * 3), 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ff6600"
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};
