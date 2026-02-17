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
        <RigidBody
            ref={rigidBody}
            type="dynamic"
            colliders="cuboid"
            position={position}
            onCollisionEnter={handleCollision}
            enabledRotations={[false, true, false]}
            canSleep={false}
            linearDamping={0.5}
            angularDamping={0.5}
            ccd={true}
            mass={1}
            gravityScale={1}
        >
            <group ref={visualGroup}>
                {/* HEAD - Sphere with zombie features */}
                <mesh position={[0, 1.7, 0]} castShadow>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial
                        color={isHit ? "#ff0000" : "#6b8e6b"}
                        roughness={0.8}
                    />
                </mesh>

                {/* Eyes - Glowing red */}
                <mesh position={[0.08, 1.72, 0.18]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
                </mesh>
                <mesh position={[-0.08, 1.72, 0.18]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
                </mesh>

                {/* TORSO - Capsule shape */}
                <mesh position={[0, 1.1, 0]} castShadow>
                    <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
                    <meshStandardMaterial
                        color={isHit ? "#ff0000" : "#4a5a4a"}
                        roughness={0.9}
                    />
                </mesh>

                {/* Tattered shirt detail */}
                <mesh position={[0, 1.1, 0.21]} castShadow>
                    <boxGeometry args={[0.42, 0.65, 0.02]} />
                    <meshStandardMaterial
                        color="#2a3a2a"
                        roughness={1}
                    />
                </mesh>

                {/* ARMS - Cylinders with joints */}
                {/* Right Upper Arm */}
                <group position={[0.25, 1.3, 0]}>
                    <mesh position={[0.15, -0.15, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
                        <cylinderGeometry args={[0.06, 0.05, 0.35, 8]} />
                        <meshStandardMaterial color="#6b8e6b" roughness={0.8} />
                    </mesh>
                    {/* Right Forearm */}
                    <mesh position={[0.25, -0.45, 0.1]} rotation={[Math.PI / 4, 0, Math.PI / 6]} castShadow>
                        <cylinderGeometry args={[0.05, 0.04, 0.35, 8]} />
                        <meshStandardMaterial color="#5a7a5a" roughness={0.8} />
                    </mesh>
                    {/* Right Hand */}
                    <mesh position={[0.3, -0.7, 0.25]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#5a7a5a" roughness={0.9} />
                    </mesh>
                </group>

                {/* Left Upper Arm */}
                <group position={[-0.25, 1.3, 0]}>
                    <mesh position={[-0.15, -0.15, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
                        <cylinderGeometry args={[0.06, 0.05, 0.35, 8]} />
                        <meshStandardMaterial color="#6b8e6b" roughness={0.8} />
                    </mesh>
                    {/* Left Forearm */}
                    <mesh position={[-0.25, -0.45, 0.1]} rotation={[Math.PI / 4, 0, -Math.PI / 6]} castShadow>
                        <cylinderGeometry args={[0.05, 0.04, 0.35, 8]} />
                        <meshStandardMaterial color="#5a7a5a" roughness={0.8} />
                    </mesh>
                    {/* Left Hand */}
                    <mesh position={[-0.3, -0.7, 0.25]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial color="#5a7a5a" roughness={0.9} />
                    </mesh>
                </group>

                {/* LEGS - Cylinders with joints */}
                {/* Right Thigh */}
                <mesh position={[0.1, 0.5, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
                    <meshStandardMaterial color="#3a4a3a" roughness={0.9} />
                </mesh>
                {/* Right Shin */}
                <mesh position={[0.1, 0.15, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.05, 0.3, 8]} />
                    <meshStandardMaterial color="#6b8e6b" roughness={0.8} />
                </mesh>
                {/* Right Foot */}
                <mesh position={[0.1, 0, 0.08]} castShadow>
                    <boxGeometry args={[0.1, 0.05, 0.18]} />
                    <meshStandardMaterial color="#2a2a2a" roughness={1} />
                </mesh>

                {/* Left Thigh */}
                <mesh position={[-0.1, 0.5, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
                    <meshStandardMaterial color="#3a4a3a" roughness={0.9} />
                </mesh>
                {/* Left Shin */}
                <mesh position={[-0.1, 0.15, 0]} castShadow>
                    <cylinderGeometry args={[0.06, 0.05, 0.3, 8]} />
                    <meshStandardMaterial color="#6b8e6b" roughness={0.8} />
                </mesh>
                {/* Left Foot */}
                <mesh position={[-0.1, 0, 0.08]} castShadow>
                    <boxGeometry args={[0.1, 0.05, 0.18]} />
                    <meshStandardMaterial color="#2a2a2a" roughness={1} />
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
            const radius = 20 + Math.random() * 10; // Closer spawn for visibility
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
