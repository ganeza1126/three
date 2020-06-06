(function() {
	
	var W, H;
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({alpha: true}), camera, controls;
	renderer.setClearColor(0x000000, 0.5);

	var frame, walls, axes;
	
	$(function(){	
		setMain();
		$(window).on("orientationchange resize", setMain);
		
		document.querySelector("#main").appendChild(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera(90, W/H, 1, 3000);
		scene.add(camera);
		controls = new THREE.DeviceOrientationControls(camera, true);
		controls.connect();
		
		for (var i=0; i<20; i++) {
			var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0xffff00}));
			scene.add(sphere);
			sphere.position.set(Math.random()*10-5, Math.random()*10-5, Math.random()*10-5);
		}
		
		walls = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({wireframe: true, color: 0xaaaaaa}));
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);
		
		update();
		
	});
	
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
	
	function update() {
		controls.update();
		//更新されたシーンとカメラ情報で、3D空間を再構築する
		renderer.render(scene, camera);
		//一定の間隔で再びupdate()を実行（これにより何度も繰り返しupdate()を実行する）
		requestAnimationFrame(update);
	}
	
})();