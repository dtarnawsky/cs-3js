# ThreeJS

## Installation

In an Ionic project, run:

```bash
npm install three
npm install @types/three --save-dev
```

## Usage

In your app use a container element to hold the 3D scene:

```html
<div #container style="width:100%; height: 100%;"></div>
```

Then pass this into the function that creates your scene:

```typescript
@ViewChild('container', { static: true }) container!: ElementRef;
...
init3D(this.container.nativeElement);
```

You can then use code from the [ThreeJS examples](https://threejs.org/examples/) by pasting into a typescript file. For example, this code has been adapted from [this sample](https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_drag.html) :

```typescript
import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

let container;
let camera: any, scene: any, renderer: any;
let controls: any, group: any;
let enableSelection = false;

const objects: any[] = [];
const mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster();

export function init3D(container: HTMLElement) {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 25;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  scene.add(new THREE.AmbientLight(0xaaaaaa));

  const light = new THREE.SpotLight(0xffffff, 10000);
  light.position.set(0, 25, 50);
  light.angle = Math.PI / 9;

  light.castShadow = true;
  light.shadow.camera.near = 10;
  light.shadow.camera.far = 100;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light);

  group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BoxGeometry();

  for (let i = 0; i < 200; i++) {
    const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

    object.position.x = Math.random() * 30 - 15;
    object.position.y = Math.random() * 15 - 7.5;
    object.position.z = Math.random() * 20 - 10;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;
    object.scale.x = Math.random() * 2 + 1;
    object.scale.y = Math.random() * 2 + 1;
    object.scale.z = Math.random() * 2 + 1;
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    objects.push(object);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);
  controls = new DragControls([...objects], camera, renderer.domElement);
  controls.rotateSpeed = 2;
  controls.addEventListener("drag", render);

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("click", onClick);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function onKeyDown(event: any) {
  enableSelection = event.keyCode === 16 ? true : false;
  if (event.keyCode === 77) {
    controls.mode = controls.mode === "translate" ? "rotate" : "translate";
  }
}

function onKeyUp() {
  enableSelection = false;
}

function onClick(event: any) {
  event.preventDefault();

  if (enableSelection === true) {
    const draggableObjects = controls.getObjects();
    draggableObjects.length = 0;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersections = raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {
      const object: any = intersections[0].object;

      if (group.children.includes(object) === true) {
        object.material.emissive.set(0x000000);
        scene.attach(object);
      } else {
        object.material.emissive.set(0xaaaaaa);
        group.attach(object);
      }

      controls.transformGroup = true;
      draggableObjects.push(group);
    }

    if (group.children.length === 0) {
      controls.transformGroup = false;
      draggableObjects.push(...objects);
    }
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}
```

## About imports

Many examples in threeJS will show addons. Addons are an alias pointing to the examples (the examples use ImportMaps which will add complexity to your app). So instead of say:
`import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';`

You would write:
`import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';`

This avoids the need to use import maps.
