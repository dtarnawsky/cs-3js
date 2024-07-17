import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapModel } from './map-model';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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

export async function init3D(container: HTMLElement, map: MapModel) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x999999);
    scene.add(mapImage(map.width, map.height, map.image));

    const w = container.clientWidth;
    const h = container.clientHeight;
    console.log('init3D', w, h);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, w / h, 1, 10000);
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

    //const geometry = new THREE.BoxGeometry();

    const geometry = new THREE.CircleGeometry(map.defaultPinSize, 16);
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true });

    const font = await loadFont('assets/helvetiker_regular.typeface.json');

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    for (let i = 0; i < 200; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * map.width - (map.width / 2);
        mesh.position.y = 3;
        mesh.position.z = Math.random() * map.height - (map.height / 2);
        mesh.rotation.x = - Math.PI / 2;
        // mesh.scale.x = map.defaultPinSize;
        // mesh.scale.y = 1;
        // mesh.scale.z = map.defaultPinSize;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        mesh.uuid = `pin-${i % 99}`;
        scene.add(mesh);
        const txt = addText(`${i % 99}`, font, map.defaultPinSize);
        txt.position.x = mesh.position.x;
        txt.position.z = mesh.position.z;
        scene.add(txt);
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
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    container.addEventListener('click', (e: any) => {
        const width = container.clientWidth
        const height = container.clientHeight;
        const box = container.getBoundingClientRect();
        mouse.set(((e.clientX - box.left) / width) * 2 - 1, -((e.clientY - box.top) / height) * 2 + 1)
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(scene.children, true);
        intersects.forEach((hit) => {
            if (hit.object.uuid.startsWith('pin')) {
                map.click.set(hit.object.uuid);
                console.log(hit.object.uuid);
            }
        });
    });

}

function loadFont(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(name, function (font) {
            resolve(font);
        });
    });
}

function addText(message: string, font: any, size: number): THREE.Mesh {
    const shapes = font.generateShapes(message, size * 0.8);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = - 0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yMid = - 0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y);
    geometry.translate(xMid, yMid, 0);
    //geometry.translate(-size / 2, 0, 0)
    const matLite = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });

    const text = new THREE.Mesh(geometry, matLite);
    text.position.y = 5;
    text.rotation.x = - Math.PI / 2;
    return text;
}

function animate() {
    render();
}

function render() {
    renderer.render(scene, camera);
}
