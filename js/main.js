import * as THREE from 'threejs/three.js'
import BasicRubik from 'object/Rubik.js'
import TouchLine from 'object/TouchLine.js'

const Context = canvas.getContext('webgl');

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    this.context = Context;//绘图上下文
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    this.viewCenter = new THREE.Vector3(0, 0, 0);//原点
    this.frontViewName = 'front-rubik';//正视角魔方名称
    this.endViewName = 'end-rubik';//反视角魔方名称
    this.minPercent = 0.25;
    

    this.initRender();
    this.initCamera();
    this.initScene();
    this.initLight();
    this.initObject();
    this.initEvent();
    this.render();
  }
  // 初始渲染
  initRender() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      context: this.context
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xFFFFFF, 1.0);
    canvas.width = this.width * this.devicePixelRatio;
    canvas.height = this.height * this.devicePixelRatio;
    this.renderer.setPixelRatio(this.devicePixelRatio);
  }
  // 初始化相机
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1500);
    this.camera.position.set(0, 0, 300 / this.camera.aspect);
    this.camera.up.set(0, 1, 0);//正方向
    this.camera.lookAt(this.viewCenter);
    this.originHeight = Math.tan(22.5 / 180 * Math.PI) * this.camera.position.z * 2;
    this.originWidth = this.originHeight * this.camera.aspect;
  }
  // 初始化场景
  initScene() {
    this.scene = new THREE.Scene();
  }

  // 初始化光线
  initLight() {
    this.light = new THREE.AmbientLight(0xfefefe);
    this.scene.add(this.light);
  }

  // 创建对象
  initObject() {
    //正视角魔方
    this.frontRubik = new BasicRubik(this);
    this.frontRubik.model(this.frontViewName);

    //反视角魔方
    this.endRubik = new BasicRubik(this);
    this.endRubik.model(this.endViewName);

    this.frontRubik.resizeHeight(0.5, 1);
    this.endRubik.resizeHeight(0.5, -1);

    // 控制条
    this.touchLine = new TouchLine(this);
  }
  // 事件
  initEvent() {
    wx.onTouchStart(this.touchStart.bind(this));
    wx.onTouchMove(this.touchMove.bind(this));
    wx.onTouchEnd(this.touchEnd.bind(this));
  }
  // 触碰事件
  touchStart(event) {
    var touch = event.touches[0];
    this.startPoint = touch;
    if (this.touchLine.isHover(touch)) {
      this.touchLine.enable();
    }
  }
  // 触碰移动事件
  touchMove(event) {
    var touch = event.touches[0];
    if (this.touchLine.isActive) {//滑动touchline
      this.touchLine.move(touch.clientY);
      var frontPercent = touch.clientY / window.innerHeight;
      var endPercent = 1 - frontPercent;
      this.rubikResize(frontPercent, endPercent);
    }
  }
  // 更新魔方显示尺寸
  rubikResize(frontPercent, endPercent) {
    this.frontRubik.resizeHeight(frontPercent, 1);
    this.endRubik.resizeHeight(endPercent, -1);
  }
  // 触摸结束回调函数
  touchEnd() {
    this.touchLine.disable();
  }
  // 渲染
  render() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this), canvas);
  }
}