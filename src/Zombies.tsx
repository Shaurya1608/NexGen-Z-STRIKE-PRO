import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, vec3 } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const Zombie = ({ position, health: initialHealth, speedFactor, onHit, onAttack }: {
    position: [number, number, number],
    health: number,
    speedFactor: number,
    onHit: (pos: THREE.Vector3, isKill: boolean) => void,
    onAttack: () => void
}) => {
    const rigidBody = useRef<any>(null);
    const visualGroup = useRef<THREE.Group>(null);
    const [health, setHealth] = useState(initialHealth);
    const [isHit, setIsHit] = useState(false);
    const [dead, setDead] = useState(false);
    const lastAttackTime = useRef(0);

    const config = useMemo(() => ({
        speed: (1.5 + Math.random()) * speedFactor,
        bobSpeed: 8 + Math.random() * 4,
        bobHeight: 0.1
    }), [speedFactor]);

    useFrame((state) => {
        if (dead || !rigidBody.current) return;

        const zombiePos = vec3(rigidBody.current.translation());
        const playerPos = state.camera.position;
        const direction = new THREE.Vector3().subVectors(playerPos, zombiePos);
        direction.y = 0;
        const distance = direction.length();
        direction.normalize();

        if (distance > 1.2) {
            rigidBody.current.setLinvel({
                x: direction.x * config.speed,
                y: rigidBody.current.linvel().y,
                z: direction.z * config.speed
            }, true);

            const angle = Math.atan2(direction.x, direction.z);
            rigidBody.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle), true);

            if (visualGroup.current) {
                visualGroup.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * config.bobSpeed)) * config.bobHeight;
                visualGroup.current.rotation.z = Math.sin(state.clock.elapsedTime * config.bobSpeed) * 0.05;
            }
        } else {
            rigidBody.current.setLinvel({ x: 0, y: rigidBody.current.linvel().y, z: 0 }, true);
            const now = state.clock.elapsedTime;
            if (now - lastAttackTime.current > 1.2) {
                onAttack();
                lastAttackTime.current = now;
            }
            if (visualGroup.current) visualGroup.current.position.z = Math.sin(state.clock.elapsedTime * 15) * 0.2;
        }
    });

    const handleCollision = (e: any) => {
        // More robust check using userData
        if (e.other.rigidBody.userData?.type === "bullet") {
            takeDamage();
        }
    };

    const takeDamage = () => {
        setIsHit(true);
        const newHealth = health - 1;
        setHealth(newHealth);
        onHit(vec3(rigidBody.current.translation()), newHealth <= 0);
        setTimeout(() => setIsHit(false), 100);
        if (newHealth <= 0) setDead(true);
    };

    if (dead) return null;

    return (
        <RigidBody ref={rigidBody} type="dynamic" colliders="cuboid" position={position} onCollisionEnter={handleCollision} enabledRotations={[false, true, false]} canSleep={false}>
            <group ref={visualGroup}>
                <mesh position={[0, 1.6, 0]} castShadow>
                    <boxGeometry args={[0.35, 0.35, 0.35]} />
                    <meshStandardMaterial color={isHit ? "#ff0000" : "#2d5a27"} />
                </mesh>
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.9, 0.25]} />
                    <meshStandardMaterial color={isHit ? "#ff0000" : "#1e3d1a"} />
                </mesh>
                <mesh position={[0.3, 1.2, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.5, 0.12]} />
                    <meshStandardMaterial color="#2d5a27" />
                </mesh>
                <mesh position={[-0.3, 1.2, 0.3]} rotation={[Math.PI / 2.2, 0, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.5, 0.12]} />
                    <meshStandardMaterial color="#2d5a27" />
                </mesh>
                <mesh position={[0.15, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.6, 0.12]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh position={[-0.15, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.12, 0.6, 0.12]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>
            <Text position={[0, 2.2, 0]} fontSize={0.15} color="white">{health} HP</Text>
        </RigidBody>
    );
};

export const Zombies = ({ dangerLevel, onHit, onAttack }: {
    dangerLevel: number,
    onHit: (pos: THREE.Vector3, isKill: boolean) => void,
    onAttack: () => void
}) => {
    const [zombies, setZombies] = useState<{ id: number; pos: [number, number, number] }[]>([]);
    const lastSpawnTime = useRef(0);

    useFrame((state) => {
        const spawnRate = Math.max(0.5, 3 - (dangerLevel * 0.2));
        const maxZombies = 5 + (dangerLevel * 2);

        if (state.clock.elapsedTime - lastSpawnTime.current > spawnRate && zombies.length < maxZombies) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 25 + Math.random() * 5;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            setZombies(prev => [...prev, { id: Date.now(), pos: [x, 5, z] }]);
            lastSpawnTime.current = state.clock.elapsedTime;
        }
    });

    const handleZombieKill = (id: number) => {
        setZombies(prev => prev.filter(z => z.id !== id));
    };

    return (
        <>
            {zombies.map((z) => (
                <Zombie
                    key={z.id}
                    position={z.pos}
                    health={Math.floor(2 + (dangerLevel * 0.5))}
                    speedFactor={1 + (dangerLevel * 0.1)}
                    onHit={(pos, isKill) => {
                        onHit(pos, isKill);
                        if (isKill) handleZombieKill(z.id);
                    }}
                    onAttack={onAttack}
                />
            ))}
        </>
    );
};
