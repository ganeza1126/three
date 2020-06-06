(function() {
	
	//画面の幅と高さ
	var W, H;
	//Three.js（3D表示用のjs）のシーン、レンダラ、カメラ
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({alpha: true}), camera, controls;
	renderer.setClearColor(0x000000, 0.5);

	var frame, walls, axes, me;
	
	$(function(){	
		
		//画面いっぱいに#mainを表示するための関数
		setMain();
		//縦位置横位置が変わっても画面いっぱいに#mainを表示するための処理
		$(window).on("orientationchange resize", setMain);
		
		//#mainの中に3D空間用の<camvas>を作成
		document.querySelector("#main").appendChild(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera(90, W/H, 1, 3000);
		camera.position.set(0, 0, 100);
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableKeys = true;
		
		for (var i=0; i<20; i++) {
			var sphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({color: 0xffff00}));
			scene.add(sphere);
			sphere.position.set(Math.random()*80-40, Math.random()*10-5, Math.random()*80-40);
		}
		
		walls = new THREE.Mesh(new THREE.BoxGeometry(80, 10, 80), new THREE.MeshBasicMaterial({wireframe: true, color: 0xaaaaaa}));
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);
		
		me = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xffff00}));
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