(function() {
	
	MW.install(THREE);
	//画面の幅と高さ
	var W, H;
	//Three.js（3D表示用のjs）のシーン、レンダラ、カメラ
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({alpha: true}), camera, controls;
	renderer.setClearColor(0xeeeeee, 0.5);

	var frame, walls, axes, me, light;
	
	$(function(){	
		
		//画面いっぱいに#mainを表示するための関数
		setMain();
		//縦位置横位置が変わっても画面いっぱいに#mainを表示するための処理
		$(window).on("orientationchange resize", setMain);
		
		//#mainの中に3D空間用の<camvas>を作成
		document.querySelector("#main").appendChild(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera(90, W/H, 1, 3000);
		camera.position.set(0, 0, 20);
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableKeys = true;
		
		for (var i=0; i<20; i++) {
			var sphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({color: 0x8dc3ff}));
			scene.add(sphere);
			sphere.position.set(Math.random()*80-40, (Math.random()*10-5)*0, Math.random()*80-40);
		}
		
		walls = new THREE.Mesh(new THREE.BoxGeometry(200, 100, 200), new THREE.MeshStandardMaterial({wireframe: false, color: 0xfffaf0, side: THREE.DoubleSide}));
		walls.position.set(0,48,0);
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		light = new THREE.PointLight(0xffffff, 2, 500, 1.0);
		//light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set( 0, 150, 0 );
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);
		scene.add(light);
		
		me = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshStandardMaterial({color: 0x8dc3ff}));
		scene.add(me);
		
		//update()を実行して、アニメーションさせる
		update();
		
	});
	
	//画面いっぱいに#mainを表示するための関数
	function setMain() {
		//画面の幅と高さを取得して
		W = $("#main").width();
		H = $(window).height();
		//#mainに設定
		$("#main").height(H);
		//3D空間の大きさを画面の幅と高さに設定
		renderer.setSize(W, H);
		if (camera) {
			//カメラの画角も画面サイズにあったものに
			camera.aspect = W/H;
			camera.updateProjectionMatrix();
		}
	}
	
	//繰り返し実行するupdate()
	function update() {
		controls.update();
		me.rotation.y = getRot();
		// meがカメラの注視点に追従して動く
		me.position.set(controls.target.x,controls.target.y,controls.target.z);

		if(controls.target.x>100 || controls.target.x < -100){
			
			//視点を壁の手前で止める
			controls.target.x = 100*controls.target.x/Math.abs(controls.target.x);
			//camera.position.x =80*controls.target.x/Math.abs(controls.target.x);
			
		}else if(controls.target.z>100 || controls.target.z < -100){
			
			//視点を壁の手前で止める
			controls.target.z = 100*controls.target.z/Math.abs(controls.target.z);
			//camera.position.z = 800*controls.target.z/Math.abs(controls.target.z);
		}
		
		
		

		//更新されたシーンとカメラ情報で、3D空間を再構築する
		renderer.render(scene, camera);
		//一定の間隔で再びupdate()を実行（これにより何度も繰り返しupdate()を実行する）
		requestAnimationFrame(update);
	}
		
	function getRot() {
		var camPos = camera.position;
		var mePos = me.position;
		return Math.atan2(mePos.x-camPos.x, mePos.z-camPos.z);
	}
	
})();