import { Scene, PerspectiveCamera, WebGLRenderer, TextureLoader, MeshBasicMaterial, PlaneGeometry, Color, Mesh, AnimationMixer, Clock, Raycaster, Vector2, AmbientLight, DirectionalLight, NumberKeyframeTrack, AnimationClip, LoopRepeat, Material, Object3D, CircleGeometry, Group, DoubleSide, ShapeGeometry, ColorKeyframeTrack, InterpolateDiscrete, InterpolateLinear, VectorKeyframeTrack } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { MapModel, MapPin, MapResult, PinColor } from './map-model';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

/*
TODO:
- Create a compass pin
- Pins can be animated
*/

let camera: PerspectiveCamera,
    controls: any,
    scene: Scene,
    renderer: WebGLRenderer,
    clock: Clock,
    mixers: AnimationMixer[] = [];


function mapImage(width: number, height: number, image: string) {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(image);
    const material1 = new MeshBasicMaterial({ color: 0xffffff, map: texture });
    const geometry1 = new PlaneGeometry(width, height);
    const mesh1 = new Mesh(geometry1, material1);
    mesh1.rotation.x = - Math.PI / 2;
    return mesh1;
}

export async function init3D(container: HTMLElement, map: MapModel): Promise<MapResult> {
    const result: MapResult = {
        rotateCompass: (rotation: number) => { }
    };
    scene = new Scene();
    scene.background = new Color(0x999999);
    scene.add(mapImage(map.width, map.height, map.image));

    const w = container.clientWidth;
    const h = container.clientHeight;

    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    camera = new PerspectiveCamera(70, w / h, 1, 10000);
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

    clock = new Clock();

    const font = await loadFont('assets/helvetiker_regular.typeface.json');

    const raycaster = new Raycaster()
    const mouse = new Vector2()

    for (const [i, pin] of map.pins.entries()) {
        const material = getMaterial(pin.color);
        await addPin(pin, material, font);
    }

    if (map.compass) {
        const compass = await addPin(map.compass, getMaterial('compass'), font, 0);

        result.rotateCompass = (rotation: number) => {
            compass.rotation.z = rotation;
            render();
        }
    }

    // lights
    const dirLight1 = new DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new DirectionalLight(0x002288, 3);
    dirLight2.position.set(- 1, - 1, - 1);
    scene.add(dirLight2);

    const ambientLight = new AmbientLight(0x555555);
    scene.add(ambientLight);

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
    return result;
}

function getMaterial(pinColor: PinColor): MeshBasicMaterial {
    switch (pinColor) {
        case 'primary':
            return new MeshBasicMaterial({ color: 0xff0000, transparent: true });
        case 'secondary':
            return new MeshBasicMaterial({ color: 0x00ff00, transparent: true });
        case 'tertiary':
            return new MeshBasicMaterial({ color: 0x0000ff, transparent: true });
        case 'compass':
            return new MeshBasicMaterial({ color: 0x0000ff });
        default:
            return new MeshBasicMaterial({ color: 0x000000 });
    }
}

function animateMesh(mesh: Mesh) {
    const duration = 2;
    const track = new NumberKeyframeTrack('.material.opacity', [0, 1, 2], [1, 0, 1]);
    const clip = new AnimationClip('scaleAnimation', duration, [track]);
    const mixer = new AnimationMixer(mesh);
    const action = mixer.clipAction(clip);
    action.setLoop(LoopRepeat, 9999);
    action.play();
    mixers.push(mixer);
}

async function addPin(pin: MapPin, material: Material, font: any, rotation: number = 0): Promise<Object3D> {
    const geometry = new CircleGeometry(pin.size, 24);
    geometry.translate(0, 0.5, 0);
    const mesh = new Mesh(geometry, material);
    mesh.position.x = pin.x;
    mesh.position.y = 3;
    mesh.position.z = pin.z;
    mesh.rotation.x = - Math.PI / 2;

    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    mesh.uuid = pin.uuid;
    if (pin.animated) {
        animateMesh(mesh);
    }
    scene.add(mesh);

    if (pin.label === '') {
        const p = await addSVG('assets/compass.svg', 0.2, rotation);
        p.position.x = mesh.position.x;
        p.position.z = mesh.position.z;
        scene.add(p);
        return p;
    } else {
        const txt = addText(pin.label, font, pin.size);
        txt.position.x = mesh.position.x;
        txt.position.z = mesh.position.z;
        scene.add(txt);

        return txt;
    }
}

function loadFont(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(name, function (font) {
            resolve(font);
        });
    });
}


async function loadSVG(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const loader = new SVGLoader();
        loader.load(name, function (svg) {
            resolve(svg);
        });
    });
}

async function addSVG(name: string, scale: number, rotation: number): Promise<Group> {
    const svg = await loadSVG(name);
    const group = new Group();

    for (const path of svg.paths) {
        const material = new MeshBasicMaterial({
            color: path.color,
            side: DoubleSide,
            depthWrite: false
        });

        const shapes = SVGLoader.createShapes(path);
        const geometry = new ShapeGeometry(shapes);
        geometry.scale(scale, scale, scale);
        const d = 512 * scale * 0.5; // SVG size is 512 x 512
        geometry.translate(-d, -d, 0);
        const mesh = new Mesh(geometry, material);
        group.add(mesh);
    }
    group.position.y = 5;
    group.rotation.x = - Math.PI / 2;
    group.rotation.z = rotation;
    return group;
}

function addText(message: string, font: any, size: number): Mesh {
    const shapes = font.generateShapes(message, size * 0.8);
    const geometry = new ShapeGeometry(shapes);
    geometry.computeBoundingBox();
    const xMid = - 0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
    const yMid = - 0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y);
    geometry.translate(xMid, yMid, 0);
    const matLite = new MeshBasicMaterial({
        color: 0xFFFFFF,
        side: DoubleSide
    });

    const text = new Mesh(geometry, matLite);
    text.position.y = 5;
    text.rotation.x = - Math.PI / 2;
    return text;
}

function animate() {
    render();
}

function render() {
    const delta = clock.getDelta();
    for (const mixer of mixers) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}
