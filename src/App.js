import React, { useState, useRef, useMemo, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useLoader, useFrame, extend, useThree } from 'react-three-fiber';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./styles.css";

extend({OrbitControls});

function Loading(){
    return (
        <mesh visible position={[0,0,0]} rotation={[0,0,0]}>
            <sphereGeometry attach="geometry" args={[1, 16, 16]} />
            <meshStandardMaterial
                attach="material"
                color="white"
                transparent
                opacity={0.6}
                roughness={1}
                metalness={0}
            />
        </mesh>
    )
}

function ArWing(props){
    const { nodes } = useLoader(GLTFLoader, "models/arwing.glb");
    // const group = useRef();

    // useFrame(()=>{
    //     group.current.rotation.y += 0.004;
    // })


    return (
        // <group ref={group}>
        <group {...props}>
            <mesh visible geometry={nodes.Default.geometry} scale={[0.5,0.5,0.5]}>
                <meshStandardMaterial
                    attach="material"
                    color="white"
                    roughness={0.3}
                    metalness={0.3}
                />
            </mesh>
        </group>
    )
}

function MeteorBox(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()
  const position = props.position;

  let delta = (Math.random()-0.5)/100;  // randomly select a speed
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    mesh.current.position.x += delta; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
    mesh.current.position.y += delta; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
    mesh.current.position.z += 0.01; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
  
    if (mesh.current.position.z >= 10){
      mesh.current.position.x = position[0];
      mesh.current.position.y = position[1];
      mesh.current.position.z = position[2];
      delta = (Math.random()-0.5)/100;
    }
  })
  
  return (
    <mesh
      position={position}
      ref={mesh}>
      <boxBufferGeometry attach="geometry" args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial attach="material" color={"red"} />
    </mesh>
  )
}

function Stars({ count = 8000 }) {
  const positions = useMemo(() => {
    let positions = []
    for (let i = 0; i < count; i++) {
      const r = 4000
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.cos(theta) * Math.sin(phi) + (-2000 + Math.random() * 4000)
      const y = r * Math.sin(theta) * Math.sin(phi) + (-2000 + Math.random() * 4000)
      const z = r * Math.cos(phi) + (-1000 + Math.random() * 2000)
      positions.push(x)
      positions.push(y)
      positions.push(z)
    }
    return new Float32Array(positions)
  }, [count])

  let group = useRef();

  useFrame(() => (group.current.rotation.y -= 0.0001))

  return (
    <group ref={group}>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute attachObject={['attributes', 'position']} count={positions.length / 3} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial attach="material" size={12.5} sizeAttenuation color="white" fog={false} />
      </points>
    </group>
  )
}

function MeteorSphere(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()
  const position = props.position;

  let delta = (Math.random()-0.5)/100;  // randomly select a speed
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    mesh.current.rotation.x = mesh.current.rotation.y += 0.01;
    mesh.current.position.x += delta; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
    mesh.current.position.y += delta; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
    mesh.current.position.z += 0.01; //= [mesh.current.position[0] += 0.1, mesh.current.position[1] += 0.1, mesh.current.position[2] -= 0.1]
  
    if (mesh.current.position.z >= 10){
      mesh.current.position.x = position[0];
      mesh.current.position.y = position[1];
      mesh.current.position.z = position[2];
      delta = (Math.random()-0.5)/100;
    }
  })
  
  return (
    <mesh
      position={position}
      ref={mesh}>
      <sphereBufferGeometry attach="geometry" args={[0.25, 32, 32]} />
      <meshStandardMaterial attach="material" color={"yellow"} />
    </mesh>
  )
}

function Meteors(props){
  let meteors = [];
  const NUM_METEORS = 100;

  for (let i=0; i<NUM_METEORS; i++){
    let coordinate = [
      Math.random()*10-5,
      Math.random()*10-5,
      Math.random()*-50
    ]
    if (i%2===0){
      meteors.push(<MeteorBox position={coordinate} />);
    }else{
      meteors.push(<MeteorSphere position={coordinate} />)
    }
  }

  // random starting pos past a certain distance

  return (
    <group>
      {meteors}
    </group>
  )

}

const CameraControls = () =>{
    // https://threejs.org/docs/#examples/en/controls/OrbitControls
    const {
        camera,
        gl: { domElement},
    } = useThree();

    // Ref to ctrls, so can update on every frame using useFrame
    const controls = useRef();
    useFrame((state)=> controls.current.update());
    // In order for our orbit controls to be updated on every animation frame, we need to call controls.current.update() 
    // in the render loop. Any time you need some code to run in the render loop in react-three-fiber we use the useFrame 
    // hook. > In this case, since we want to call a method on OrbitControls, we also need to add a ref, and then we can call the update method.
    return <orbitControls 
                ref={controls} 
                args={[camera, domElement]} 
                enableZoom={false}
                maxAzimuthAngle={Math.PI/4}
                maxPolarAngle={Math.PI}
                minAzimuthAngle={-Math.PI/4}
                minPolarAngle={0}            
            />;
}

function Starfox(){
  // const [pos, setPos] = useState([1,0,0]);
  const group = useRef();
  const pos = [1,0,0];

  const handleMove = useCallback(
    ({clientX, clientY}) => {
      let canvas = document.getElementsByTagName("canvas")[0];
      if (canvas){
        let resolution = [canvas.width, canvas.height];
        let newPos = [(clientX/resolution[0])*4-2, (clientY/resolution[1])*4-2, 0]
        group.current.position.x = newPos[0];
        group.current.position.y = newPos[1];
        group.current.position.z = newPos[2];
      }
    },[]
  );

  useEventListener('mousemove', handleMove);

  return(
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 40, far: 10000 }}>
          {/* <CameraControls /> */}
          <directionalLight intensity={0.5} position={[-1,1,-1]} />
          <directionalLight intensity={0.5} position={[1,1,1]} />
          <Stars /> 
          <Suspense fallback={<Loading />}>
            <group ref={group} position={pos}>
              <ArWing/>
            </group>
          </Suspense>
          <Meteors />
      </Canvas>
  )
}

function useEventListener(eventName, handler, element = window){
  // https://usehooks.com/useEventListener/

  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On 
      const isSupported = element && element.addEventListener;

      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};



export default function App() {
  return (
    <Starfox />
  );
}
