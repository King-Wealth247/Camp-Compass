/**
 * CampusMap3DScreen — Workstream 2: Interactive 3D Mapping
 *
 * Architecture:
 *  - React Native WebView hosting an embedded Three.js scene
 *  - The HTML/JS is injected inline (no server needed)
 *  - Two-way bridge: RN → WebView (navigate to room) via injectJavaScript
 *                    WebView → RN (room selected) via window.ReactNativeWebView.postMessage
 *  - Falls back gracefully if WebView fails
 *
 * Deep-link params:
 *   - buildingId: string — building to render
 *   - floor: number     — floor to isolate
 *   - hallCode: string  — room to highlight
 */
import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import WebView, { WebView as WebViewType } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import {
  Layers, ZoomIn, ZoomOut, RotateCcw, MapPin, ChevronUp, ChevronDown,
} from 'lucide-react-native';
import { Colors, Shadow, Radius } from '@/constants/theme';
import { dataService } from '@/lib/dataService';

// ── Three.js HTML Scene ───────────────────────────────────────────────────
function buildThreeJsHTML(buildingName: string, floors: number, targetFloor: number, targetRoom: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0F172A; overflow: hidden; font-family: system-ui, sans-serif; }
  canvas { display: block; }
  #overlay {
    position: fixed; top: 12px; left: 12px;
    background: rgba(15,23,42,0.85); backdrop-filter: blur(8px);
    border: 1px solid rgba(79,70,229,0.4); border-radius: 12px;
    padding: 10px 14px; color: white; font-size: 13px; font-weight: 600;
    pointer-events: none;
  }
  #room-info {
    position: fixed; bottom: 20px; left: 12px; right: 12px;
    background: rgba(79,70,229,0.9); backdrop-filter: blur(8px);
    border-radius: 14px; padding: 14px; color: white;
    font-size: 14px; display: none;
    border: 1px solid rgba(255,255,255,0.2);
  }
  #room-info .room-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
  #room-info .room-sub { font-size: 12px; opacity: 0.75; }
  #loading {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; justify-content: center;
    background: #0F172A; color: rgba(255,255,255,0.7); font-size: 14px;
    flex-direction: column; gap: 12px;
  }
  .spinner {
    width: 40px; height: 40px; border: 3px solid rgba(79,70,229,0.3);
    border-top-color: #4F46E5; border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div id="loading">
  <div class="spinner"></div>
  <span>Loading 3D Campus Model…</span>
</div>
<div id="overlay">${buildingName} · Floor ${targetFloor}</div>
<div id="room-info">
  <div class="room-name" id="rn-name">–</div>
  <div class="room-sub" id="rn-sub">Click a room to view details</div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script>
// Wait for Three.js to load
window.addEventListener('load', function() {
  const loading = document.getElementById('loading');

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0F172A);
  scene.fog = new THREE.FogExp2(0x0F172A, 0.015);

  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.set(20, 18, 20);
  camera.lookAt(0, 0, 0);

  // Lights
  const ambient = new THREE.AmbientLight(0x818CF8, 0.4);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(15, 20, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  scene.add(sun);
  const pointLight = new THREE.PointLight(0x4F46E5, 2, 30);
  pointLight.position.set(0, 8, 0);
  scene.add(pointLight);

  // Materials
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x1E293B });
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x334155, transparent: true, opacity: 0.7 });
  const roomMat = new THREE.MeshLambertMaterial({ color: 0x2563EB, transparent: true, opacity: 0.85 });
  const roomHoverMat = new THREE.MeshLambertMaterial({ color: 0x4F46E5, transparent: true, opacity: 0.95 });
  const targetMat = new THREE.MeshLambertMaterial({ color: 0x06B6D4, transparent: true, opacity: 1, emissive: 0x06B6D4, emissiveIntensity: 0.3 });
  const gridMat = new THREE.LineBasicMaterial({ color: 0x4F46E5, transparent: true, opacity: 0.15 });

  const rooms = [];
  const targetRoom = "${targetRoom}";
  const targetFloor = ${targetFloor};

  // Build floors
  const floorCount = ${Math.min(floors, 5)};
  const FLOOR_H = 3.5;
  const FLOOR_W = 14;
  const FLOOR_D = 10;

  for (let f = 0; f < floorCount; f++) {
    const y = f * (FLOOR_H + 0.3);
    const isTargetFloor = (f + 1) === targetFloor;

    // Floor slab
    const slabGeo = new THREE.BoxGeometry(FLOOR_W, 0.3, FLOOR_D);
    const slabMat = new THREE.MeshLambertMaterial({ color: isTargetFloor ? 0x1E3A5F : 0x1E293B });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.set(0, y - 0.15, 0);
    slab.receiveShadow = true;
    scene.add(slab);

    // Grid lines on target floor
    if (isTargetFloor) {
      const gridHelper = new THREE.GridHelper(FLOOR_W, 7, 0x4F46E5, 0x4F46E5);
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.2;
      gridHelper.position.set(0, y, 0);
      scene.add(gridHelper);
    }

    // Ghost walls for upper floors
    if (!isTargetFloor) {
      const wallGeo = new THREE.BoxGeometry(FLOOR_W, FLOOR_H, 0.15);
      [-FLOOR_D/2, FLOOR_D/2].forEach(zPos => {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(0, y + FLOOR_H / 2, zPos);
        scene.add(wall);
      });
    }

    // Rooms on this floor
    const roomDefs = [
      { name: 'Hall A', code: 'A', x: -4.5, z: -2.5, w: 3, d: 3 },
      { name: 'Hall B', code: 'B', x: 0, z: -2.5, w: 3.5, d: 3 },
      { name: 'Hall C', code: 'C', x: 4.5, z: -2.5, w: 3, d: 3 },
      { name: 'Hall D', code: 'D', x: -4.5, z: 2.5, w: 3, d: 3 },
      { name: 'Hall E', code: 'E', x: 0, z: 2.5, w: 3.5, d: 3 },
      { name: 'Hall F', code: 'F', x: 4.5, z: 2.5, w: 3, d: 3 },
    ];

    roomDefs.forEach(rd => {
      if (!isTargetFloor) return; // Only render rooms on target floor
      const isTarget = targetRoom && (targetRoom.toUpperCase().includes(rd.code) || rd.name.toLowerCase().includes(targetRoom.toLowerCase()));
      const geo = new THREE.BoxGeometry(rd.w, FLOOR_H * 0.8, rd.d);
      const mat = isTarget ? targetMat : roomMat.clone();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(rd.x, y + (FLOOR_H * 0.8) / 2, rd.z);
      mesh.castShadow = true;
      mesh.userData = { name: rd.name, floor: f + 1, isRoom: true, isTarget };
      scene.add(mesh);
      rooms.push(mesh);

      // Room label glow for target
      if (isTarget) {
        const glow = new THREE.PointLight(0x06B6D4, 3, 6);
        glow.position.set(rd.x, y + FLOOR_H, rd.z);
        scene.add(glow);
      }
    });
  }

  // Stars background
  const starGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for (let i = 0; i < 800; i++) {
    starVerts.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x4F46E5, size: 0.3, transparent: true, opacity: 0.4 }));
  scene.add(stars);

  loading.style.display = 'none';

  // Raycaster for touch interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredRoom = null;

  renderer.domElement.addEventListener('click', function(e) {
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(rooms);
    if (hits.length > 0) {
      const hit = hits[0].object;
      const info = document.getElementById('room-info');
      document.getElementById('rn-name').textContent = hit.userData.name;
      document.getElementById('rn-sub').textContent = 'Floor ' + hit.userData.floor;
      info.style.display = 'block';
      // Send to React Native
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ROOM_SELECTED', room: hit.userData.name, floor: hit.userData.floor }));
      }
    }
  });

  // Auto-rotate
  let angle = 0;
  let autoRotate = true;

  // Expose controls to RN
  window.navigateToRoom = function(roomCode) {
    autoRotate = false;
    // Highlight the room
    rooms.forEach(r => {
      if (r.userData.name.toUpperCase().includes(roomCode.toUpperCase())) {
        r.material = targetMat;
      }
    });
  };
  window.setFloor = function(f) {
    document.getElementById('overlay').textContent = '${buildingName} · Floor ' + f;
  };
  window.zoomIn = function() { camera.position.multiplyScalar(0.85); };
  window.zoomOut = function() { camera.position.multiplyScalar(1.15); };
  window.resetView = function() { camera.position.set(20, 18, 20); camera.lookAt(0, 0, 0); autoRotate = true; };

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate) {
      angle += 0.003;
      camera.position.x = Math.sin(angle) * 25;
      camera.position.z = Math.cos(angle) * 25;
      camera.lookAt(0, (targetFloor - 1) * (FLOOR_H + 0.3) + 2, 0);
    }
    stars.rotation.y += 0.0002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
</script>
</body>
</html>
  `.trim();
}

// ── Screen ────────────────────────────────────────────────────────────────
export default function CampusMap3DScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ buildingId?: string; floor?: string; hallCode?: string }>();
  const webRef = useRef<WebViewType>(null);

  const [buildingInfo, setBuildingInfo] = useState<{ name: string; floors: number } | null>(null);
  const [currentFloor, setCurrentFloor] = useState(parseInt(params.floor ?? '1') || 1);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(params.hallCode ?? null);
  const [loading3D, setLoading3D] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | 'flat'>('3d');

  useEffect(() => {
    if (params.buildingId) {
      dataService.getBuilding?.(params.buildingId)
        .then((res: any) => {
          if (res?.data) {
            setBuildingInfo({ name: res.data.name, floors: res.data.floors ?? 3 });
          }
        })
        .catch(() => setBuildingInfo({ name: 'Main Building', floors: 3 }));
    } else {
      setBuildingInfo({ name: 'Campus Building', floors: 3 });
    }
  }, [params.buildingId]);

  const inject = (code: string) => webRef.current?.injectJavaScript(code);

  const handleFloorChange = (delta: number) => {
    const next = Math.max(1, Math.min(currentFloor + delta, buildingInfo?.floors ?? 3));
    setCurrentFloor(next);
    inject(`window.setFloor && window.setFloor(${next}); true;`);
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ROOM_SELECTED') {
        setSelectedRoom(msg.room);
      }
    } catch {}
  };

  if (!user) return null;

  const html = buildingInfo
    ? buildThreeJsHTML(buildingInfo.name, buildingInfo.floors, currentFloor, selectedRoom ?? '')
    : '';

  return (
    <AppShell title="Campus 3D Map" showBack scrollable={false}>
      <View style={styles.container}>

        {/* Header controls */}
        <View style={styles.controlBar}>
          <View style={styles.buildingChip}>
            <MapPin color={Colors.primary} size={14} strokeWidth={2} />
            <Text style={styles.buildingName} numberOfLines={1}>
              {buildingInfo?.name ?? 'Loading...'}
            </Text>
          </View>
          <View style={styles.viewToggle}>
            {(['3d', 'flat'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.viewToggleBtn, viewMode === m && styles.viewToggleBtnActive]}
                onPress={() => setViewMode(m)}
              >
                <Text style={[styles.viewToggleTxt, viewMode === m && styles.viewToggleTxtActive]}>
                  {m === '3d' ? '3D' : '2D'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3D WebView */}
        {viewMode === '3d' && html ? (
          <View style={styles.webviewContainer}>
            <WebView
              ref={webRef as any}
              source={{ html }}
              style={styles.webview}
              onLoadEnd={() => setLoading3D(false)}
              onMessage={handleMessage}
              scrollEnabled={false}
              allowsInlineMediaPlayback
              javaScriptEnabled
              originWhitelist={['*']}
            />
            {loading3D && (
              <View style={styles.webviewLoading}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>Initialising 3D Scene…</Text>
              </View>
            )}

            {/* Floor controls */}
            <View style={styles.floorControls}>
              <TouchableOpacity style={styles.floorBtn} onPress={() => handleFloorChange(1)}>
                <ChevronUp color="#fff" size={18} strokeWidth={2.5} />
              </TouchableOpacity>
              <View style={styles.floorDisplay}>
                <Layers color={Colors.primaryLight} size={14} strokeWidth={2} />
                <Text style={styles.floorText}>F{currentFloor}</Text>
              </View>
              <TouchableOpacity style={styles.floorBtn} onPress={() => handleFloorChange(-1)}>
                <ChevronDown color="#fff" size={18} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Camera controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.camBtn} onPress={() => inject('window.zoomIn && window.zoomIn(); true;')}>
                <ZoomIn color="#fff" size={16} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.camBtn} onPress={() => inject('window.zoomOut && window.zoomOut(); true;')}>
                <ZoomOut color="#fff" size={16} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.camBtn} onPress={() => inject('window.resetView && window.resetView(); true;')}>
                <RotateCcw color="#fff" size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Selected room banner */}
            {selectedRoom && (
              <View style={styles.roomBanner}>
                <MapPin color={Colors.accent} size={14} strokeWidth={2} />
                <Text style={styles.roomBannerText}>
                  Navigated to: <Text style={{ fontWeight: '800', color: Colors.accent }}>{selectedRoom}</Text>
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Flat 2D fallback
          <View style={styles.flatView}>
            <Text style={styles.flatTitle}>{buildingInfo?.name ?? 'Building'} — Floor {currentFloor}</Text>
            <View style={styles.flatGrid}>
              {['Hall A', 'Hall B', 'Hall C', 'Hall D', 'Hall E', 'Hall F'].map((room) => {
                const isHighlighted = selectedRoom &&
                  (room.toUpperCase().includes(selectedRoom.toUpperCase()) ||
                    selectedRoom.toUpperCase().includes(room.split(' ')[1]));
                return (
                  <TouchableOpacity
                    key={room}
                    style={[styles.flatRoom, isHighlighted && styles.flatRoomHighlighted]}
                    onPress={() => setSelectedRoom(room)}
                  >
                    <Text style={[styles.flatRoomText, isHighlighted && styles.flatRoomTextHighlighted]}>
                      {room}
                    </Text>
                    {isHighlighted && (
                      <View style={styles.flatRoomDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  controlBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(79,70,229,0.2)',
  },
  buildingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(79,70,229,0.15)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)',
    maxWidth: '60%',
  },
  buildingName: { color: Colors.primaryLight, fontSize: 13, fontWeight: '700' },
  viewToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 2,
  },
  viewToggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 18 },
  viewToggleBtnActive: { backgroundColor: Colors.primary },
  viewToggleTxt: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  viewToggleTxtActive: { color: '#fff' },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#0F172A' },
  webviewLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  floorControls: {
    position: 'absolute', right: 16, top: '30%',
    backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: Radius.lg,
    padding: 6, gap: 4, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)',
    ...Shadow.lg,
  },
  floorBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(79,70,229,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  floorDisplay: {
    alignItems: 'center', gap: 2, paddingVertical: 6,
  },
  floorText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  cameraControls: {
    position: 'absolute', left: 16, top: '30%',
    backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: Radius.lg,
    padding: 6, gap: 6, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)',
    ...Shadow.lg,
  },
  camBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  roomBanner: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.accent + '40',
    ...Shadow.lg,
  },
  roomBannerText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  flatView: {
    flex: 1, backgroundColor: '#0F172A', padding: 16,
  },
  flatTitle: { color: Colors.primaryLight, fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  flatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flatRoom: {
    width: '30%', aspectRatio: 1, backgroundColor: 'rgba(79,70,229,0.15)',
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(79,70,229,0.3)',
    position: 'relative',
  },
  flatRoomHighlighted: {
    backgroundColor: 'rgba(6,182,212,0.2)', borderColor: Colors.accent,
  },
  flatRoomText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700' },
  flatRoomTextHighlighted: { color: Colors.accent },
  flatRoomDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent,
  },
});
