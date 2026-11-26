import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Activity, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react';
import {
  ActivityStateId,
  SensorNodeId,
  SUBJECT_PROFILES,
  SubjectId,
  WearableSuiteId,
} from '../data/physiologyData';

export type CameraPresetId = 'full' | 'wrist' | 'chest' | 'temple';
export type BodyFinishMode = 'translucent' | 'obsidian';

interface HumanBioViewportProps {
  subjectId: SubjectId;
  wearableSuite: WearableSuiteId;
  activityId: ActivityStateId;
  bpm: number;
  respRate: number;
  spo2: number;
  temp: number;
  irregularRhythm: boolean;
  selectedSensor: SensorNodeId | null;
  onSelectSensor: (sensor: SensorNodeId | null) => void;
}

const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _pulsePos = new THREE.Vector3();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; pos: [number, number, number]; target: [number, number, number] }
> = {
  full: { label: 'Model Penuh', pos: [0.42, 1.38, 2.52], target: [0, 1.15, 0] },
  wrist: { label: 'PPG Tangan', pos: [-0.98, 0.96, 1.12], target: [-0.46, 0.78, 0.16] },
  chest: { label: 'Patch Dada', pos: [0.18, 1.24, 1.24], target: [0, 1.13, 0.14] },
  temple: { label: 'Pod Pelipis', pos: [0.76, 1.62, 1.02], target: [0.06, 1.56, 0.04] },
};

export const HumanBioViewport: React.FC<HumanBioViewportProps> = ({
  subjectId,
  wearableSuite,
  activityId,
  bpm,
  respRate,
  spo2,
  temp,
  irregularRhythm,
  selectedSensor,
  onSelectSensor,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('full');
  const [finishMode, setFinishMode] = useState<BodyFinishMode>('translucent');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<SensorNodeId | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

  const simStateRef = useRef({
    subjectId,
    wearableSuite,
    activityId,
    bpm,
    respRate,
    spo2,
    temp,
    irregularRhythm,
    selectedSensor,
    finishMode,
    autoRotate,
  });

  simStateRef.current = {
    subjectId,
    wearableSuite,
    activityId,
    bpm,
    respRate,
    spo2,
    temp,
    irregularRhythm,
    selectedSensor,
    finishMode,
    autoRotate,
  };

  const cameraTransitionRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(...CAMERA_PRESETS.full.pos),
    target: new THREE.Vector3(...CAMERA_PRESETS.full.target),
  });

  const onSelectSensorRef = useRef(onSelectSensor);
  onSelectSensorRef.current = onSelectSensor;

  const triggerPreset = (preset: CameraPresetId) => {
    setCameraPreset(preset);
    const cfg = CAMERA_PRESETS[preset];
    cameraTransitionRef.current.pos.set(...cfg.pos);
    cameraTransitionRef.current.target.set(...cfg.target);
    cameraTransitionRef.current.active = true;
  };

  useEffect(() => {
    if (selectedSensor === 'wrist_ppg') triggerPreset('wrist');
    else if (selectedSensor === 'chest_ecg' || selectedSensor === 'heart' || selectedSensor === 'lungs')
      triggerPreset('chest');
    else if (selectedSensor === 'temple_pod') triggerPreset('temple');
  }, [selectedSensor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          setDockCollapsed((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const initW = Math.max(container.clientWidth, 320);
    const initH = Math.max(container.clientHeight, 360);

    renderer.setSize(initW, initH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const handleContextRestored = () => {
      setWebglUnavailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const bgHex = 0xe7edf3;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.08);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, initW / initH, 0.1, 40);
    camera.position.set(...CAMERA_PRESETS.full.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.full.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.85;
    controls.maxDistance = 4.2;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.54;
    controls.enablePan = true;

    controls.addEventListener('start', () => {
      cameraTransitionRef.current.active = false;
    });

    // Studio 3-Point + Spectral Rim Lighting (inspired by iridescent obsidian bust)
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xcbd5e1, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.75);
    keyLight.position.set(2.8, 4.4, 3.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.camera.left = -1.8;
    keyLight.shadow.camera.right = 1.8;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -1.2;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 2.1);
    cyanRim.position.set(-2.6, 2.3, -1.7);
    scene.add(cyanRim);

    const coralSpectralRim = new THREE.PointLight(0xf97316, 1.45, 5.5);
    coralSpectralRim.position.set(1.5, 1.95, -1.1);
    scene.add(coralSpectralRim);

    // Calibrated Pedestal with Procedural Dial Texture
    const floorGroup = new THREE.Group();
    scene.add(floorGroup);

    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 512;
    dialCanvas.height = 512;
    const dCtx = dialCanvas.getContext('2d');
    if (dCtx) {
      dCtx.fillStyle = '#DCE4EC';
      dCtx.fillRect(0, 0, 512, 512);
      dCtx.translate(256, 256);

      // Subtle concentric rings
      dCtx.strokeStyle = 'rgba(13, 148, 136, 0.35)';
      dCtx.lineWidth = 2;
      dCtx.beginPath();
      dCtx.arc(0, 0, 225, 0, Math.PI * 2);
      dCtx.stroke();

      dCtx.strokeStyle = 'rgba(15, 23, 42, 0.14)';
      dCtx.lineWidth = 1.5;
      dCtx.beginPath();
      dCtx.arc(0, 0, 175, 0, Math.PI * 2);
      dCtx.stroke();

      // 72 degree calibration ticks
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2;
        const isMajor = i % 6 === 0;
        const r1 = isMajor ? 204 : 214;
        const r2 = 224;
        dCtx.strokeStyle = isMajor ? 'rgba(13, 148, 136, 0.7)' : 'rgba(15, 23, 42, 0.2)';
        dCtx.lineWidth = isMajor ? 2.5 : 1;
        dCtx.beginPath();
        dCtx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        dCtx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        dCtx.stroke();
      }
    }
    const dialTex = new THREE.CanvasTexture(dialCanvas);
    dialTex.colorSpace = THREE.SRGBColorSpace;
    dialTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const baseGeo = new THREE.CylinderGeometry(0.74, 0.80, 0.06, 64);
    const baseSideMat = new THREE.MeshStandardMaterial({
      color: 0xd0dae4,
      roughness: 0.3,
      metalness: 0.3,
    });
    const baseTopMat = new THREE.MeshStandardMaterial({
      map: dialTex,
      roughness: 0.35,
      metalness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, [baseSideMat, baseTopMat, baseSideMat]);
    baseMesh.position.y = 0.03;
    baseMesh.receiveShadow = true;
    floorGroup.add(baseMesh);

    // Contact shadow grounding
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 64);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.36)');
      grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.12)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.004;
    floorGroup.add(contactShadow);

    // =========================================================================
    // COMPOSITE SCULPTED HUMAN ANATOMICAL MODEL
    // =========================================================================
    const humanRoot = new THREE.Group();
    humanRoot.position.y = 0.06;
    scene.add(humanRoot);

    const bodyShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.11,
      metalness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      iridescence: 1.0,
      iridescenceIOR: 1.42,
      iridescenceThicknessRange: [180, 520],
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });

    // 1. Sculpted Anatomical Torso (Pelvis -> Waist -> Ribcage -> Trapezius -> Neck)
    const torsoPoints = [
      new THREE.Vector2(0.01, 0.0),
      new THREE.Vector2(0.155, 0.04),
      new THREE.Vector2(0.175, 0.16),
      new THREE.Vector2(0.15, 0.34),
      new THREE.Vector2(0.142, 0.48),
      new THREE.Vector2(0.185, 0.68),
      new THREE.Vector2(0.212, 0.85),
      new THREE.Vector2(0.195, 0.96),
      new THREE.Vector2(0.125, 1.03),
      new THREE.Vector2(0.072, 1.08),
      new THREE.Vector2(0.064, 1.18),
    ];
    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 48);
    torsoGeo.scale(1.08, 1, 0.72);
    torsoGeo.computeVertexNormals();
    const torsoMesh = new THREE.Mesh(torsoGeo, bodyShellMat);
    torsoMesh.position.y = 0.22;
    torsoMesh.castShadow = true;
    torsoMesh.renderOrder = 3;
    humanRoot.add(torsoMesh);

    // Internal Translucent Ribcage Lattice + Sternum
    const ribMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      roughness: 0.28,
      metalness: 0.1,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const ribcageGroup = new THREE.Group();
    ribcageGroup.position.set(0, 1.06, 0.01);
    humanRoot.add(ribcageGroup);

    const sternumMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.15, 8, 12), ribMat);
    sternumMesh.position.set(0, 0.02, 0.115);
    sternumMesh.rotation.x = -0.14;
    ribcageGroup.add(sternumMesh);

    for (let r = 0; r < 5; r++) {
      const yOff = 0.09 - r * 0.042;
      const widthScale = 0.13 + Math.sin((r / 4) * Math.PI * 0.75) * 0.045;
      const depthScale = 0.095 + Math.sin((r / 4) * Math.PI * 0.75) * 0.022;
      for (const side of [-1, 1]) {
        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.018, yOff + 0.015, -depthScale * 0.78),
          new THREE.Vector3(side * widthScale, yOff, -depthScale * 0.1),
          new THREE.Vector3(side * (widthScale * 0.82), yOff - 0.018, depthScale * 0.82),
          new THREE.Vector3(side * 0.015, yOff - 0.022, depthScale * 1.05),
        ]);
        const ribMesh = new THREE.Mesh(
          new THREE.TubeGeometry(ribCurve, 20, 0.0065, 8, false),
          ribMat
        );
        ribcageGroup.add(ribMesh);
      }
    }

    // 2. Sculpted Cranium, Facial Profile & Neural Network
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.37, 0.01);
    humanRoot.add(headGroup);

    // Sculpted cranium + face silhouette
    const craniumGeo = new THREE.SphereGeometry(0.132, 40, 36);
    craniumGeo.scale(0.86, 1.15, 0.98);
    const craniumMesh = new THREE.Mesh(craniumGeo, bodyShellMat);
    craniumMesh.position.set(0, 0.155, -0.008);
    craniumMesh.castShadow = true;
    craniumMesh.renderOrder = 3;
    headGroup.add(craniumMesh);

    // Sculpted lower face / jawline contour
    const faceGeo = new THREE.SphereGeometry(0.096, 32, 24);
    faceGeo.scale(0.82, 1.08, 0.92);
    const faceMesh = new THREE.Mesh(faceGeo, bodyShellMat);
    faceMesh.position.set(0, 0.085, 0.028);
    faceMesh.renderOrder = 3;
    headGroup.add(faceMesh);

    // Subtle sculpted nose bridge silhouette
    const noseBridge = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.012, 0.042, 8, 12),
      bodyShellMat
    );
    noseBridge.position.set(0, 0.13, 0.125);
    noseBridge.rotation.x = 0.25;
    noseBridge.renderOrder = 3;
    headGroup.add(noseBridge);

    // Internal Glowing Brain Hemispheres & Neural Pathways
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0x14b8a6,
      emissive: 0x0d9488,
      emissiveIntensity: 0.95,
      roughness: 0.22,
      wireframe: true,
      transparent: true,
      opacity: 0.72,
    });
    const leftHemisphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.068, 2), brainMat);
    leftHemisphere.scale.set(0.75, 0.95, 1.15);
    leftHemisphere.position.set(-0.032, 0.17, -0.008);
    headGroup.add(leftHemisphere);

    const rightHemisphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.068, 2), brainMat);
    rightHemisphere.scale.set(0.75, 0.95, 1.15);
    rightHemisphere.position.set(0.032, 0.17, -0.008);
    headGroup.add(rightHemisphere);

    // Temple Biosensor Pod (Cranial Wearable — Interactive Node)
    const templeGroup = new THREE.Group();
    templeGroup.position.set(0.114, 0.155, 0.045);
    templeGroup.rotation.y = 0.36;
    templeGroup.rotation.z = -0.1;
    headGroup.add(templeGroup);

    const podChassisMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.78,
      roughness: 0.16,
      clearcoat: 0.9,
    });
    const podLedMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.9,
    });

    const podBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.038, 10, 18), podChassisMat);
    podBody.rotation.x = Math.PI / 2;
    podBody.scale.set(0.55, 1, 1);
    templeGroup.add(podBody);

    const podCoreStrip = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.008, 0.034), podLedMat);
    podCoreStrip.position.x = 0.0095;
    templeGroup.add(podCoreStrip);

    const templeHaloMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const templeHalo = new THREE.Mesh(new THREE.RingGeometry(0.026, 0.032, 28), templeHaloMat);
    templeHalo.rotation.y = Math.PI / 2;
    templeHalo.position.x = 0.012;
    templeGroup.add(templeHalo);

    const templeHitProxy = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    templeHitProxy.userData.sensorId = 'temple_pod' as SensorNodeId;
    templeHitProxy.layers.enable(1);
    templeGroup.add(templeHitProxy);

    // 3. Sculpted Articulated Arms & Hands
    const shoulderGeo = new THREE.SphereGeometry(0.066, 24, 24);
    const upperArmGeo = new THREE.CapsuleGeometry(0.047, 0.24, 14, 24);
    const forearmGeo = new THREE.CapsuleGeometry(0.036, 0.23, 14, 24);
    const handGeo = new THREE.SphereGeometry(0.034, 16, 16);
    handGeo.scale(0.65, 1.35, 0.92);

    // Right Arm
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.248, 1.14, 0);
    humanRoot.add(rightShoulder);
    const rShoulderMesh = new THREE.Mesh(shoulderGeo, bodyShellMat);
    rShoulderMesh.renderOrder = 3;
    rightShoulder.add(rShoulderMesh);
    const rUpper = new THREE.Mesh(upperArmGeo, bodyShellMat);
    rUpper.position.set(0.042, -0.15, 0);
    rUpper.rotation.z = 0.16;
    rUpper.renderOrder = 3;
    rightShoulder.add(rUpper);
    const rElbow = new THREE.Group();
    rElbow.position.set(0.078, -0.30, 0);
    rightShoulder.add(rElbow);
    const rForearm = new THREE.Mesh(forearmGeo, bodyShellMat);
    rForearm.position.set(-0.01, -0.14, 0.06);
    rForearm.rotation.x = -0.32;
    rForearm.renderOrder = 3;
    rElbow.add(rForearm);
    const rHand = new THREE.Mesh(handGeo, bodyShellMat);
    rHand.position.set(-0.018, -0.28, 0.12);
    rHand.rotation.x = -0.28;
    rHand.renderOrder = 3;
    rElbow.add(rHand);

    // Left Arm (carries Wristband PPG Smartwatch)
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.248, 1.14, 0);
    humanRoot.add(leftShoulder);
    const lShoulderMesh = new THREE.Mesh(shoulderGeo, bodyShellMat);
    lShoulderMesh.renderOrder = 3;
    leftShoulder.add(lShoulderMesh);
    const lUpper = new THREE.Mesh(upperArmGeo, bodyShellMat);
    lUpper.position.set(-0.055, -0.15, 0.02);
    lUpper.rotation.z = -0.24;
    lUpper.rotation.x = -0.12;
    lUpper.renderOrder = 3;
    leftShoulder.add(lUpper);

    const lElbow = new THREE.Group();
    lElbow.position.set(-0.095, -0.30, 0.05);
    leftShoulder.add(lElbow);
    const lForearm = new THREE.Mesh(forearmGeo, bodyShellMat);
    lForearm.position.set(-0.045, -0.11, 0.11);
    lForearm.rotation.x = -0.78;
    lForearm.rotation.z = -0.18;
    lForearm.renderOrder = 3;
    lElbow.add(lForearm);

    const lHand = new THREE.Mesh(handGeo, bodyShellMat);
    lHand.position.set(-0.092, -0.22, 0.255);
    lHand.rotation.x = -0.82;
    lHand.rotation.z = -0.18;
    lHand.renderOrder = 3;
    lElbow.add(lHand);

    // Wristband PPG Smartwatch + Optical Beam Cone
    const wristWatchGroup = new THREE.Group();
    wristWatchGroup.position.set(-0.078, -0.195, 0.195);
    wristWatchGroup.rotation.set(0.8, 0.1, -0.22);
    lElbow.add(wristWatchGroup);

    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.58,
      metalness: 0.12,
    });
    const strapRing = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.0085, 14, 36), strapMat);
    wristWatchGroup.add(strapRing);

    const bezelMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.16,
      anisotropy: 0.7,
    });
    const watchCase = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.017, 0.050), bezelMat);
    watchCase.position.set(0, 0.046, 0);
    wristWatchGroup.add(watchCase);

    const watchFaceMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x10b981,
      emissiveIntensity: 1.4,
      roughness: 0.12,
    });
    const watchScreen = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.004, 0.042), watchFaceMat);
    watchScreen.position.set(0, 0.055, 0);
    wristWatchGroup.add(watchScreen);

    // Optical PPG Green/Red LED Glow Cone penetrating wrist dermis!
    const ppgLedMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85,
    });
    const ppgCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.034, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    ppgCone.position.set(0, 0.022, 0);
    wristWatchGroup.add(ppgCone);

    const ppgEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.005, 16), ppgLedMat);
    ppgEmitter.position.set(0, 0.036, 0);
    wristWatchGroup.add(ppgEmitter);

    const wristHitProxy = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    wristHitProxy.userData.sensorId = 'wrist_ppg' as SensorNodeId;
    wristHitProxy.layers.enable(1);
    wristWatchGroup.add(wristHitProxy);

    // 4. Sternum Chest ECG Bio-Patch + Pulsing Telemetry Halo
    const chestPatchGroup = new THREE.Group();
    chestPatchGroup.position.set(0, 1.07, 0.156);
    chestPatchGroup.rotation.x = -0.14;
    humanRoot.add(chestPatchGroup);

    const patchBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.052, 0.01, 6),
      new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.32,
        metalness: 0.18,
        clearcoat: 0.5,
      })
    );
    patchBody.rotation.x = Math.PI / 2;
    patchBody.scale.set(1.48, 1, 0.72);
    chestPatchGroup.add(patchBody);

    const ecgBeaconMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 1.7,
    });
    const patchBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 16), ecgBeaconMat);
    patchBeacon.position.z = 0.008;
    chestPatchGroup.add(patchBeacon);

    const chestHaloMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const chestHalo = new THREE.Mesh(new THREE.RingGeometry(0.025, 0.031, 32), chestHaloMat);
    chestHalo.position.z = 0.009;
    chestPatchGroup.add(chestHalo);

    const chestHitProxy = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    chestHitProxy.userData.sensorId = 'chest_ecg' as SensorNodeId;
    chestHitProxy.layers.enable(1);
    chestPatchGroup.add(chestHitProxy);

    // 5. Internal Sculpted 3D Heart + Aortic Arch + Bilateral Lungs
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0.028, 1.055, 0.03);
    humanRoot.add(heartGroup);

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.6,
    });
    const leftVentricle = new THREE.Mesh(new THREE.SphereGeometry(0.048, 28, 28), heartMat);
    leftVentricle.scale.set(0.86, 1.28, 0.84);
    leftVentricle.rotation.z = 0.28;
    heartGroup.add(leftVentricle);

    const rightVentricle = new THREE.Mesh(new THREE.SphereGeometry(0.038, 24, 24), heartMat);
    rightVentricle.position.set(-0.028, 0.012, 0.012);
    rightVentricle.scale.set(0.9, 1.15, 0.85);
    heartGroup.add(rightVentricle);

    // Aortic arch curve atop the heart
    const aorticArchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.005, 0.035, 0.005),
      new THREE.Vector3(0.008, 0.085, 0.0),
      new THREE.Vector3(-0.02, 0.095, -0.02),
      new THREE.Vector3(-0.025, 0.02, -0.03),
    ]);
    const aorticArch = new THREE.Mesh(
      new THREE.TubeGeometry(aorticArchCurve, 20, 0.012, 10, false),
      heartMat
    );
    heartGroup.add(aorticArch);

    const heartHitProxy = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    heartHitProxy.userData.sensorId = 'heart' as SensorNodeId;
    heartHitProxy.layers.enable(1);
    heartGroup.add(heartHitProxy);

    // Bilateral Multi-Lobed Lungs + Trachea
    const lungsGroup = new THREE.Group();
    lungsGroup.position.set(0, 1.09, -0.01);
    humanRoot.add(lungsGroup);

    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });

    const lungGeo = new THREE.SphereGeometry(0.072, 26, 26);
    lungGeo.scale(0.84, 1.56, 0.78);
    const leftLung = new THREE.Mesh(lungGeo, lungMat);
    leftLung.position.set(-0.088, 0, 0);
    leftLung.rotation.z = -0.14;
    lungsGroup.add(leftLung);

    const rightLung = new THREE.Mesh(lungGeo, lungMat);
    rightLung.position.set(0.088, 0, 0);
    rightLung.rotation.z = 0.14;
    lungsGroup.add(rightLung);

    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.16, 12), lungMat);
    trachea.position.set(0, 0.13, 0);
    lungsGroup.add(trachea);

    const lungsHitProxy = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.25, 0.16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    lungsHitProxy.userData.sensorId = 'lungs' as SensorNodeId;
    lungsHitProxy.layers.enable(1);
    lungsGroup.add(lungsHitProxy);

    // 6. Arterial Vascular Pathways + Multiple Traveling Pulse Boluses
    const armArteryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 1.13, 0.02),
      new THREE.Vector3(-0.14, 1.18, 0.01),
      new THREE.Vector3(-0.26, 1.14, 0.0),
      new THREE.Vector3(-0.34, 0.85, 0.05),
      new THREE.Vector3(-0.41, 0.67, 0.23),
    ]);

    const carotidCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 1.13, 0.02),
      new THREE.Vector3(0.04, 1.32, 0.02),
      new THREE.Vector3(0.07, 1.48, 0.03),
      new THREE.Vector3(0.11, 1.53, 0.045),
    ]);

    const vesselMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.7,
    });
    humanRoot.add(
      new THREE.Mesh(new THREE.TubeGeometry(armArteryCurve, 40, 0.0065, 8, false), vesselMat)
    );
    humanRoot.add(
      new THREE.Mesh(new THREE.TubeGeometry(carotidCurve, 28, 0.006, 8, false), vesselMat)
    );

    const pulseSphereMat = new THREE.MeshBasicMaterial({ color: 0x5eead4 });
    const armPulseSpheres = [0, 1].map(() => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 12), pulseSphereMat);
      humanRoot.add(m);
      return m;
    });
    const carotidPulseSphere = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), pulseSphereMat);
    humanRoot.add(carotidPulseSphere);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting Setup (Layer 1)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    const interactiveProxies = [
      wristHitProxy,
      chestHitProxy,
      templeHitProxy,
      heartHitProxy,
      lungsHitProxy,
    ];

    let lastHoverCheck = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveProxies, false);
      if (hits.length > 0) {
        const sid = hits[0].object.userData.sensorId as SensorNodeId;
        setHoveredNode(sid);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveProxies, false);
      if (hits.length > 0) {
        const sid = hits[0].object.userData.sensorId as SensorNodeId;
        onSelectSensorRef.current(sid);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 200);
        const h = Math.max(entry.contentRect.height, 200);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let beatPhase = 0;
    let respPhase = 0;
    let irregularityMult = 1;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const st = simStateRef.current;
      const subject = SUBJECT_PROFILES[st.subjectId];

      // Smoothly damp anatomical proportions for Adult / Child / Senior
      humanRoot.scale.x = THREE.MathUtils.damp(humanRoot.scale.x, subject.scale[0], 6, dt);
      humanRoot.scale.y = THREE.MathUtils.damp(humanRoot.scale.y, subject.scale[1], 6, dt);
      humanRoot.scale.z = THREE.MathUtils.damp(humanRoot.scale.z, subject.scale[2], 6, dt);
      headGroup.scale.setScalar(
        THREE.MathUtils.damp(headGroup.scale.x, subject.headScale, 6, dt)
      );

      // Smoothly update body shell finish
      const targetOpacity = st.finishMode === 'translucent' ? 0.34 : 0.93;
      bodyShellMat.opacity = THREE.MathUtils.damp(bodyShellMat.opacity, targetOpacity, 7, dt);
      bodyShellMat.depthWrite = st.finishMode === 'obsidian';
      ribcageGroup.visible = st.finishMode === 'translucent';

      // Show/Hide Wearables based on active suite
      wristWatchGroup.visible = st.wearableSuite === 'wrist_ppg' || st.wearableSuite === 'full_suite';
      chestPatchGroup.visible = st.wearableSuite === 'chest_patch' || st.wearableSuite === 'full_suite';
      templeGroup.visible = st.wearableSuite === 'full_suite';

      // Cardiac beat phase & systolic pulse wave
      const beatsPerSec = (st.bpm / 60) * irregularityMult;
      beatPhase += dt * beatsPerSec;
      if (beatPhase >= 1) {
        beatPhase -= 1;
        irregularityMult = st.irregularRhythm ? 0.65 + Math.random() * 0.75 : 1;
      }
      const systoleSpike = Math.exp(-Math.pow((beatPhase - 0.14) / 0.08, 2));
      heartGroup.scale.setScalar(1 + systoleSpike * 0.18);
      heartMat.emissiveIntensity = 0.8 + systoleSpike * 1.5;

      // Arterial pulse wave traveling from Heart -> Wrist & Carotid
      armPulseSpheres.forEach((sphere, idx) => {
        const p = (beatPhase + idx * 0.5) % 1;
        armArteryCurve.getPointAt(p, _pulsePos);
        sphere.position.copy(_pulsePos);
      });
      carotidCurve.getPointAt(beatPhase, _pulsePos);
      carotidPulseSphere.position.copy(_pulsePos);

      // Sensor optical & telemetry halos
      ppgLedMat.opacity = 0.45 + systoleSpike * 0.55;
      watchFaceMat.emissiveIntensity = 0.8 + systoleSpike * 1.1;
      ecgBeaconMat.emissiveIntensity = 0.9 + systoleSpike * 1.3;
      const haloScale = 1 + systoleSpike * 0.45;
      chestHalo.scale.setScalar(haloScale);
      chestHaloMat.opacity = 0.65 - systoleSpike * 0.4;
      templeHalo.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.12);

      // Respiratory lung expansion & hypoxemia/fever tint
      respPhase += dt * (st.respRate / 60);
      const breathWave = 0.5 + 0.5 * Math.sin(respPhase * Math.PI * 2);
      const lungScale = 0.93 + breathWave * 0.14;
      lungsGroup.scale.set(lungScale, 1 + breathWave * 0.09, lungScale);

      if (st.spo2 < 92) {
        _colorA.setHex(0xd97706);
        _colorB.setHex(0xb45309);
      } else if (st.temp >= 38.0) {
        _colorA.setHex(0xf97316);
        _colorB.setHex(0xea580c);
      } else {
        _colorA.set(subject.vascularTint);
        _colorB.setHex(0x0891b2);
      }
      lungMat.color.lerp(_colorA, 0.08);
      lungMat.emissive.lerp(_colorB, 0.08);
      vesselMat.color.lerp(_colorA, 0.08);

      // Running / Sleep / Resting Posture Kinematics
      const isRunning = st.activityId === 'running';
      const isSleeping = st.activityId === 'sleep';
      const targetRightArmX = isRunning
        ? Math.sin(elapsed * 7.5) * 0.36
        : Math.sin(elapsed * 1.2) * 0.025;
      const targetLeftArmX = isRunning ? -Math.sin(elapsed * 7.5) * 0.18 : 0;
      const targetHeadPitch = isSleeping ? 0.18 : isRunning ? 0.06 : 0;

      rightShoulder.rotation.x = THREE.MathUtils.damp(rightShoulder.rotation.x, targetRightArmX, 8, dt);
      leftShoulder.rotation.x = THREE.MathUtils.damp(leftShoulder.rotation.x, targetLeftArmX, 8, dt);
      headGroup.rotation.x = THREE.MathUtils.damp(headGroup.rotation.x, targetHeadPitch, 5, dt);

      // Auto-orbit & smooth camera preset transitions
      controls.autoRotate = st.autoRotate && !isSoftwareGl && !cameraTransitionRef.current.active;
      controls.autoRotateSpeed = 0.8;

      if (cameraTransitionRef.current.active) {
        _targetCamPos.copy(cameraTransitionRef.current.pos);
        _targetLookAt.copy(cameraTransitionRef.current.target);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5.5, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLookAt.x, 5.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLookAt.y, 5.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLookAt.z, 5.5, dt);
        if (
          camera.position.distanceTo(_targetCamPos) < 0.015 &&
          controls.target.distanceTo(_targetLookAt) < 0.015
        ) {
          cameraTransitionRef.current.active = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      dialTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const hoveredLabels: Record<SensorNodeId, string> = {
    wrist_ppg: 'Jam Pintar PPG Optik + IMU (Klik untuk Inspeksi)',
    chest_ecg: 'Bio-Patch ECG Sternum + Termistor (Klik untuk Inspeksi)',
    temple_pod: 'Pod Biosensor Neural Pelipis (Klik untuk Inspeksi)',
    heart: `Pompa Miokardium · Berdetak ${bpm} BPM`,
    lungs: `Pertukaran Gas Paru · SpO₂ ${spo2}%`,
  };

  return (
    <div className="relative w-full h-full min-h-[520px] lg:min-h-[630px] rounded-2xl overflow-hidden border border-slate-200 bg-[#E7EDF3]">
      <div
        ref={mountRef}
        className="w-full h-full"
        aria-label="Simulator Anatomi Manusia dan Wearable 3D Interaktif"
      />

      {webglUnavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#E7EDF3]">
          <Activity className="w-10 h-10 text-teal-600 mb-3" />
          <p className="text-sm font-semibold text-slate-900">
            Viewport 3D WebGL Tidak Tersedia di Perangkat Ini
          </p>
          <p className="text-xs text-slate-600 max-w-sm mt-1">
            Grafik gelombang ECG/PPG dan data telemetri langsung tetap berjalan normal di panel
            sekitar.
          </p>
        </div>
      )}

      {/* Top Hint Banner */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between gap-4">
        <div className="bg-white/95 border border-slate-200 rounded-xl px-3.5 py-2 shadow-xs">
          <div className="text-xs font-label font-medium text-slate-500">
            Anatomi &amp; Wearable 3D Interaktif
          </div>
          <div className="text-xs font-label font-bold text-slate-950 mt-0.5">
            {hoveredNode
              ? hoveredLabels[hoveredNode]
              : 'Geser untuk putar · Scroll untuk zoom · Klik sensor atau organ 3D'}
          </div>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center max-w-[94%] z-10">
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/95 border border-slate-200 text-xs font-label font-semibold text-slate-700 hover:text-slate-950 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          {dockCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{dockCollapsed ? 'Tampilkan Kontrol (H)' : 'Sembunyikan Kontrol (H)'}</span>
        </button>

        {!dockCollapsed && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/95 border border-slate-200 rounded-xl px-2.5 py-2 shadow-sm">
            {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((presetKey) => (
              <button
                key={presetKey}
                type="button"
                onClick={() => triggerPreset(presetKey)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-label font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  cameraPreset === presetKey
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {CAMERA_PRESETS[presetKey].label}
              </button>
            ))}

            <span className="h-4 w-px bg-slate-200 mx-0.5" aria-hidden="true" />

            <button
              type="button"
              onClick={() =>
                setFinishMode((m) => (m === 'translucent' ? 'obsidian' : 'translucent'))
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-label font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{finishMode === 'translucent' ? 'Kaca Bio-Scan' : 'Obsidian Kilap'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate((r) => !r)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-label font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                autoRotate
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{autoRotate ? 'Putar Aktif' : 'Putar Mati'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
