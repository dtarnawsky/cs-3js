import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapModel } from './map-model';

let camera: any, controls: any, scene: any, renderer: any;


function mapImage(width: number, height: number, image: string) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image);
    //const material1 = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture });
    const material1 = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    const aspect = width / height;
    // texture.repeat.set(200, 200);
    const geometry1 = new THREE.PlaneGeometry(width, height);
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.x = - Math.PI / 2;
    const scale = 1;
    //mesh1.scale.set(scale, scale / aspect, scale);
    return mesh1;
}
export function init3D(container: HTMLElement, map: MapModel) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x999999);
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    scene.add(mapImage(map.width, map.height, map.image));

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, map.height, 40);

    // controls

    controls = new MapControls(camera, renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;
    controls.zoomToCursor = true;
    controls.enableRotate = false;

    controls.minDistance = 100;
    controls.maxDistance = map.height;

    controls.maxPolarAngle = Math.PI / 2;

    // world

    const geometry = new THREE.BoxGeometry();
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true });

    for (let i = 0; i < 200; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * map.width - (map.width / 2);
        mesh.position.y = 0;
        mesh.position.z = Math.random() * map.height - (map.height / 2);
        mesh.scale.x = map.defaultPinSize;
        mesh.scale.y = 2;//Math.random() * 80 + 10;
        mesh.scale.z = map.defaultPinSize;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        scene.add(mesh);
    }

    // lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    dirLight2.position.set(- 1, - 1, - 1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    //
    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    render();
}

function render() {
    renderer.render(scene, camera);
}
