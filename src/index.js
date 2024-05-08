import * as THREE from 'three'
import { WEBGL } from './webgl'
import './modal'

if (WEBGL.isWebGLAvailable()) {
  var camera, scene, renderer
  var plane
  var mouse,
    raycaster,
    isShiftDown = false

  var rollOverMesh, rollOverMaterial
  var cubeGeo, cubeMaterial

  var objects = []

  init()
  render()

  function init() {
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    )
    camera.position.set(500, 800, 1300)
    camera.lookAt(0, 0, 0)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    var rollOverGeo = new THREE.BoxBufferGeometry(50, 50, 50)
    rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    })
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial)
    scene.add(rollOverMesh)

    cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50)
    cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xfeb74c,
      map: new THREE.TextureLoader().load('static/textures/square.png'),
    })

    var gridHelper = new THREE.GridHelper(1000, 20)
    scene.add(gridHelper)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000)
    geometry.rotateX(-Math.PI / 2)

    plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ visible: false })
    )
    scene.add(plane)

    objects.push(plane)

    var ambientLight = new THREE.AmbientLight(0x606060)
    scene.add(ambientLight)

    var directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(1, 0.75, 0.5).normalize()
    scene.add(directionalLight)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    document.addEventListener('mousemove', onDocumentMouseMove, false)
    document.addEventListener('mousedown', onDocumentMouseDown, false)
    document.addEventListener('keydown', onDocumentKeyDown, false)
    document.addEventListener('keyup', onDocumentKeyUp, false)
    window.addEventListener('resize', onWindowResize, false)
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function onDocumentMouseMove(event) {
    event.preventDefault()

    mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )

    raycaster.setFromCamera(mouse, camera)

    var intersects = raycaster.intersectObjects(objects)

    if (intersects.length > 0) {
      var intersect = intersects[0]

      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal)
      rollOverMesh.position
        .divideScalar(50)
        .floor()
        .multiplyScalar(50)
        .addScalar(25)
    }

    render()
  }
  let points = []; // 전역에 포인트 배열을 저장할 변수 선언
  let lines = []; // 생성된 모든 선을 관리할 배열

  function onDocumentMouseDown(event) {
    event.preventDefault();

    console.log('x, y', event.clientX, event.clientY);

    // 레이캐스터로 화면 좌표를 3D 공간 좌표로 변환
    mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      var intersect = intersects[0];
      var point = intersect.point; // 실제 3D 공간에서의 점

      points.push(point.clone()); // 점을 배열에 추가

      if (points.length >= 2) { // 최소 두 개의 포인트가 필요
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material); // 새로운 선 생성
        scene.add(line); // 씬에 선 추가
        lines.push(line); // 선 배열에 추가

        // 마지막 점을 새로운 선의 시작점으로 재사용
        points = [points[points.length - 1]];
      }

      render(); // 씬 렌더링 업데이트
    }
  }



  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 16:
        isShiftDown = true
        break
    }
  }

  function onDocumentKeyUp(event) {
    switch (event.keyCode) {
      case 16:
        isShiftDown = false
        break
    }
  }

  function render() {
    renderer.render(scene, camera)
  }
} else {
  var warning = WEBGL.getWebGLErrorMessage()
  document.body.appendChild(warning)
}
