import * as THREE from 'three';
  import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
  import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
  import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
  //import HdrFile from "texutes/royal_esplanade_1k.hdr";
  
  let cameraOrthographicHelper, cameraOrthographic, cameraPerspectiveHelper, cameraOrthographicHelper2 ;
  let group, model, player1, renderer, composer1, composer2, fxaaPass, renderPass, cameraOrthographic2;
  const rtWidth = 3840;
  const rtHeight = 2160;
  const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
  // 渲染器
  const canvas = document.querySelector('#c2d')
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas
  })
  renderer.setScissorTest( true );
  //renderer.autoClear = true;
  const rtFov = 100
  const rtAspect = rtWidth / rtHeight
  const rtNear = 0.1
  const rtFar = 5
  const rtCamera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar)
  rtCamera.position.z = 2.5
  //const rtScene = new THREE.Scene()
  //rtScene.background = new THREE.Color('white')
  const rtScene = new THREE.Scene()
  {
    // 光源
    const color = 0xffffff
    const intensity = 10
    const light = new THREE.HemisphereLight( 0xffffff, 0x444444, 1 );
    //const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(0, 0, 0);
    rtScene.add(light);
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -.001;
    spotLight.shadow.mapSize
    rtScene.add(spotLight);
  }
  /*
        // 几何体
  const rtBox = 1
  const rtGeometry = new THREE.BoxGeometry(rtBox, rtBox, rtBox)
  const rtMaterial = new THREE.MeshBasicMaterial({ color: 0x44aa88 })
  const rtCube = new THREE.Mesh(rtGeometry, rtMaterial)
  rtScene.add(rtCube)
  */
  const gltfloader = new GLTFLoader();
  gltfloader.load(
    './public/models/gltf/Logo.glb', (gltf)=>{
      player1=gltf;
      gltf.scene.scale.set(50, 50, 50);
      console.log(gltf);
      rtScene.add(gltf.scene);
    }
  )
  let rgbeLoader = new RGBELoader();
  rgbeLoader.load('./public/texture/hdr/studio_small_09_4k.hdr', (envMap)=>{
    //設置環境貼圖
    scene.environment = envMap;
  })
  // 场景
  const scene = new THREE.Scene()
  {
    // 光源
    const color = 0xffffff
    const intensity = 10
    const light = new THREE.HemisphereLight( 0xffffff, 0x444444, 10 );
    //const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(0, 0, 0);
    scene.add(light)
  }
  scene.add(new THREE.AxesHelper(300));
  group = new THREE.Group();
  scene.add(group);
  const fov = 40 // 视野范围
  const aspect = 2 // 相机默认值 画布的宽高比
  const near = 0.1 // 近平面
  const far = 1000 // 远平面
  // 透视投影相机
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(10, 20, 20)
  camera.lookAt(0, 0, 0)
  cameraPerspectiveHelper = new THREE.CameraHelper( camera );
  // camera2 => group => scene
  cameraOrthographic = new THREE.OrthographicCamera(34 / -2, 34 / 2, 17.017585349 / 2, 17.017585349 / -2, 1, 1000);
  cameraOrthographic.rotation.y = Math.PI;
  cameraOrthographic.position.x = 0;
  cameraOrthographic.position.z = -35;
  group.add(cameraOrthographic);
  cameraOrthographicHelper = new THREE.CameraHelper(cameraOrthographic);
  scene.add(cameraOrthographicHelper);
  // camera3 => group => scene
  cameraOrthographic2 = new THREE.OrthographicCamera(34 / -2, 34 / 2, 17.017585349 / 2, 17.017585349 / -2, 1, 1000);
  cameraOrthographic2.rotation.y = Math.PI;
  cameraOrthographic2.position.x = 0;
  cameraOrthographic2.position.z = -35;
  group.add(cameraOrthographic2);
  cameraOrthographicHelper2 = new THREE.CameraHelper(cameraOrthographic2);
  scene.add(cameraOrthographicHelper2);
  // 控制相机
  const controls = new OrbitControls(rtCamera, canvas)
  controls.update()
  // 立体
  const radiusTop = 17.017585349
  const radiusBottom = 17.017585349
  const height = 17.017585349 * 2
  const radialSegments = 4
  const boxGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
  // 材质
  const material = new THREE.MeshPhongMaterial({
    // color: 0x00ff00
    map: renderTarget.texture
  })
  const mesh = new THREE.Mesh(boxGeometry, material)
  scene.add(mesh)
  // 渲染
  function render(time) {
    time *= 0.001
    if(player1){
      //player1.scene.rotation.x = 3*Math.PI/4;
      player1.scene.rotation.y += 0.05;
      player1.scene.position.y = -0.25;
      player1.scene.position.x = 0.125;
    }
    //
    renderPass = new RenderPass( rtScene, rtCamera );
    renderPass.clearAlpha = 0;
    fxaaPass = new ShaderPass( FXAAShader );
    const outputPass = new OutputPass();
    composer1 = new EffectComposer( renderer );
    composer1.addPass( renderPass );
    composer1.addPass( outputPass );
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.CineonToneMapping;
    //mesh.rotation.y = time
    //mesh.rotation.x = time
    //renderer.setSize(3840,1080)
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = 0.5*window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    cameraOrthographic.aspect = 0.5*window.innerWidth / window.innerHeight;
    //cameraOrthographic.updateProjectionMatrix();
    cameraOrthographic2.aspect = 0.5*window.innerWidth / window.innerHeight;
    
    renderer.setClearColor( 0x000000, 1 );
    renderer.setScissor( 0, 0, window.innerWidth, window.innerHeight / 2 );
    renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight / 2 );
    renderer.render( scene, cameraOrthographic2 );
    
    renderer.setClearColor( 0x111111, 1 );
    renderer.setScissor(0, window.innerHeight / 2, window.innerWidth, window.innerHeight / 2);
    renderer.setViewport( 0, window.innerHeight / 2, window.innerWidth, window.innerHeight / 2);
    renderer.render( scene, cameraOrthographic );

    
    
    
   
    cameraOrthographic2.updateProjectionMatrix();
    requestAnimationFrame(render)
    //rtCube.rotation.y = time
    //rtCube.rotation.x = time
    renderer.setRenderTarget(renderTarget)
    renderer.render(rtScene, rtCamera)
    renderer.setRenderTarget(null)
  }
  requestAnimationFrame(render)