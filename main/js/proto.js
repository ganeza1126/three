(function () {

	//画面の幅と高さ
	var W, H;
	//Three.js（3D表示用のjs）のシーン、レンダラ、カメラ
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({ alpha: true }), camera, controls;
	renderer.setClearColor(0x000000, 0.5);

	//new-start
	var loader = new THREE.TextureLoader();
	var smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
	var smokeGroup = new THREE.Group();

	//回転と移動用の変数（とりあえずのものなので動きがわかったら使わなくてOKです）
	var c = 0;
	//new-end

	var frame, walls, axes;

	$(function () {

		//画面いっぱいに#mainを表示するための関数
		setMain();
		//縦位置横位置が変わっても画面いっぱいに#mainを表示するための処理
		$(window).on("orientationchange resize", setMain);

		//#mainの中に3D空間用の<camvas>を作成
		document.querySelector("#main").appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(90, W / H, 1, 3000);
		camera.position.set(0, 0, 10);
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableKeys = true;

		//newstart
		//sphereを50個生成		
		for (var i = 0; i < 50; i++) {
			//sphereの半径を1にして、色を赤に
			//			var sphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({transparent: true, map: smokeTexture, opacity: 0.8, color: 0xff0000}));
			//sphereの半径が小さいバージョン（0.1）
			var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ transparent: true, map: smokeTexture, opacity: 0.8, color: 0xff0000 }));
			smokeGroup.add(sphere);
			scene.add(smokeGroup);
			//sphereの初期の回転角度を持たせておく
			sphere.ry = Math.random() * Math.PI * 2;
			//y軸回転をその角度にする
			sphere.rotation.set(0, sphere.ry, 0);
			//座標の範囲を-0.5〜0.5に狭める
			sphere.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		}

		console.log(smokeGroup);
		//newend
		walls = new THREE.Mesh(new THREE.BoxGeometry(80, 10, 80), new THREE.MeshBasicMaterial({ wireframe: true, color: 0xaaaaaa }));
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);

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
			camera.aspect = W / H;
			camera.updateProjectionMatrix();
		}
	}

	//繰り返し実行するupdate()
	function update() {
		//newstart
		//smokeGroupの中のspohereを一つ一つy軸中心に基準の角度にc*0.03度（ラジアン）足して回転させる
		for (var i = 0; i < smokeGroup.children.length; i++) {
			var child = smokeGroup.children[i];
			child.rotation.set(0, child.ry + c * 3, 0);
		}
		//smokeGroupの座標をcの分だけ上昇させる
		smokeGroup.position.set(0, c, 0);
		//一定間隔（だいたい60fpsぐらい）でcに0.01足していく
		c = 2;
		//newend

		controls.update();
		//更新されたシーンとカメラ情報で、3D空間を再構築する
		renderer.render(scene, camera);
		//一定の間隔で再びupdate()を実行（これにより何度も繰り返しupdate()を実行する）
		requestAnimationFrame(update);
	}

	function getRot() {
		var camPos = camera.position;
		var mePos = me.position;
		return Math.atan2(mePos.x - camPos.x, mePos.z - camPos.z);
	}

	function animate() {

		// note: three.js includes requestAnimationFrame shim
		stats.begin();
		delta = clock.getDelta();
		requestAnimationFrame(animate);
		evolveSmoke();
		render();
		stats.end();
	}

	function evolveSmoke() {
		var sp = smokeParticles.length;
		while (sp--) {
			smokeParticles[sp].rotation.z += (delta * 0.2);
		}
	}

	function render() {

		mesh.rotation.x += 0.005;
		mesh.rotation.y += 0.01;
		cubeSineDriver += .01;
		mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500);
		renderer.render(scene, camera);

	}




})();