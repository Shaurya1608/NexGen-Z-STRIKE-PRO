import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

const SPEED = 5;
const JUMP_FORCE = 4;

export const Player = ({
    mobileJoystick,
    mobileLookDelta
}: {
    mobileJoystick?: { x: number, y: number },
    mobileLookDelta?: React.MutableRefObject<{ x: number, y: number }>
}) => {
    const [, getKeys] = useKeyboardControls();
    const rigidBody = useRef<any>(null);
    const [isOnGround, setIsOnGround] = useState(true);

    // Unified rotation state
    const rotation = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
    const sensitivity = 0.002; // Standard FPS sensitivity
    const touchSensitivity = 0.005;

    // Desktop Mouse Delta Buffer
    const mouseDelta = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement) {
                mouseDelta.current.x += e.movementX;
                mouseDelta.current.y += e.movementY;
            }
        };

        const handleJump = () => {
            if (isOnGround && rigidBody.current) {
                rigidBody.current.setLinvel({ x: 0, y: JUMP_FORCE, z: 0 }, true);
                setIsOnGround(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener('jump' as any, handleJump);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener('jump' as any, handleJump);
        };
    }, [isOnGround]);

    useFrame((state) => {
        if (!rigidBody.current) return;

        // 1. Process Rotation (Unified Desktop Mouse + Mobile Touch)
        let dx = 0;
        let dy = 0;

        // Desktop Mouse Input
        if (mouseDelta.current.x !== 0 || mouseDelta.current.y !== 0) {
            dx = mouseDelta.current.x * sensitivity;
            dy = mouseDelta.current.y * sensitivity;
            mouseDelta.current = { x: 0, y: 0 }; // Consume buffer
        }
        // Mobile Touch Input
        else if (mobileLookDelta && (mobileLookDelta.current.x !== 0 || mobileLookDelta.current.y !== 0)) {
            dx = mobileLookDelta.current.x * touchSensitivity;
            dy = mobileLookDelta.current.y * touchSensitivity;
            mobileLookDelta.current = { x: 0, y: 0 }; // Consume buffer
        }

        if (dx !== 0 || dy !== 0) {
            rotation.current.y -= dx;
            rotation.current.x -= dy;
            rotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.current.x));
        }

        // Apply rotation to camera directly
        state.camera.quaternion.setFromEuler(rotation.current);

        // 2. Process Movement (WASD / Joystick)
        const { forward, backward, left, right, jump } = getKeys();

        const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
        const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);

        // Override if mobile joystick active
        if (mobileJoystick && (mobileJoystick.x !== 0 || mobileJoystick.y !== 0)) {
            frontVector.z = -mobileJoystick.y;
            sideVector.x = -mobileJoystick.x;
        }

        const direction = new THREE.Vector3()
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyQuaternion(state.camera.quaternion);

        const velocity = rigidBody.current.linvel();
        rigidBody.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

        // Jump Logic
        if (jump && isOnGround) {
            rigidBody.current.setLinvel({ x: 0, y: JUMP_FORCE, z: 0 }, true);
            setIsOnGround(false);
        }

        // 3. Stick camera to physical capsule
        const pos = rigidBody.current.translation();
        state.camera.position.set(pos.x, pos.y + 0.8, pos.z);
    });

    return (
        <RigidBody
            ref={rigidBody}
            name="player"
            colliders={false}
            mass={1}
            type="dynamic"
            position={[0, 5, 0]}
            enabledRotations={[false, false, false]}
            onCollisionEnter={() => setIsOnGround(true)}
        >
            <CapsuleCollider args={[0.75, 0.4]} />
        </RigidBody>
    );
};
