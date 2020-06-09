(function () {

	//画面の幅と高さ
	var W, H;
	//Three.js（3D表示用のjs）のシーン、レンダラ、カメラ
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({ alpha: true }), camera, controls;
	renderer.setClearColor(0x000000, 0.5);

	//new-start
	var loader = new THREE.TextureLoader();
	var smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
	//	var smokeTexture = loader.load('Smoke-Element.png');
	var smokeGroup = new THREE.Group();

	//回転と移動用の変数（とりあえずのものなので動きがわかったら使わなくてOKです）
	var clst = [];
	//new-end

	var frame, walls, axes;

	var rad = 0.5;//半径
	var c = 0;// 微小変化量

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
		//smokeGeo = new THREE.PlaneGeometry(1, 1);
		smokeGeo = new THREE.SphereGeometry(1);
		/*
		smokeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, map: smokeTexture, transparent: true, opacity: 0.8 });
		smokeMaterial2 = new THREE.MeshLambertMaterial({ color: 0xff0000, map: smokeTexture, transparent: true, opacity: 0.8 });
		smokeMaterial3 = new THREE.MeshBasicMaterial({ color: 0x00ff00, map: smokeTexture, transparent: true, opacity: 0.8 });
		smokeMaterial4 = new THREE.MeshBasicMaterial({ color: 0xffff00, map: smokeTexture, transparent: true, opacity: 0.8 });
		smokeMaterial5 = new THREE.MeshBasicMaterial({ color: 0x0000ff, map: smokeTexture, transparent: true, opacity: 0.8 });
		*/

		smokeParticles = [];


		//sphereを50個生成
		for (var i = 0; i < 100; i++) {
			//	var sphere = new THREE.Mesh(smokeGeo, smokeMaterial);

			//smokeMaterial = new THREE.SpriteMaterial({ color: 0x0000ff, map: smokeTexture, transparent: true, opacity: 0.4 });
			smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
			var sphere = new THREE.Sprite(smokeMaterial);
			/*
			switch (i % 5) {
				case 0:
					var sphere = new THREE.Mesh(smokeGeo, smokeMaterial);
					break;
				case 1:
					var sphere = new THREE.Mesh(smokeGeo, smokeMaterial5);
					break;
				case 2:
					var sphere = new THREE.Mesh(smokeGeo, smokeMaterial2);
					break;
				case 3:
					var sphere = new THREE.Mesh(smokeGeo, smokeMaterial3);
					break;
				case 4:
					var sphere = new THREE.Mesh(smokeGeo, smokeMaterial4);
					break;
			*/

			//sphereの初期の回転角度を持たせておく
			//sphere.ry = Math.random() * Math.PI * 2;
			//y軸回転をその角度にする
			//sphere.rotation.set(0, sphere.ry, 0);
			//座標の範囲を-0.5〜0.5に狭める
			//			sphere.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * rad;
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))




			smokeGroup.add(sphere);
			scene.add(smokeGroup);
			smokeParticles.push(sphere);
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
		var cnt = smokeParticles.length;
		while (cnt--) {
			a = Math.random() - 0.5;
			clst.push(a);
		}
		console.log(clst);

		update();

	});

	function randcolor() {
		return '#' + Math.floor(Math.random() * 1677215).toString(16);
	}
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
		//		for (var i = 0; i < smokeGroup.children.length; i++) {
		//			var child = smokeGroup.children[i];
		//			child.rotation.set(0, child.ry + c * 3, 0);
		//		}
		//		//rei1
		//		c = 0.001;
		//		while (sp--) {
		//			smokeParticles[sp].rotation.x += c;
		//			smokeParticles[sp].rotation.y += c;
		//			smokeParticles[sp].rotation.z += c;
		//			//	smokeParticles[sp].position.x += (Math.random() - 0.5) * c;
		//		}
		//rei2
		var sp = smokeParticles.length;
		c = rad * 0.01;
		while (sp--) {
			var rdx = (Math.random() - 0.5) * c;
			var rdy = (Math.random() - 0.5) * c;
			var rdz = (Math.random() - 0.5) * c;
			var pos = smokeParticles[sp].position;
			pos.x += rdx;
			pos.y += rdy;
			pos.z += rdz;
			var aaa = Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2);
			if (aaa > rad * rad) {
				pos.x -= rdx * 2;
				pos.y -= rdy * 2;
				pos.z -= rdz * 2;
			}

			//			smokeParticles[sp].rotation.x += 0.0051 * clst[sp];
			//			smokeParticles[sp].rotation.y += 0.0051 * clst[sp];
			//			smokeParticles[sp].rotation.z += 0.0051 * clst[sp];
			//			smokeParticles[sp].position.x = smokeParticles[sp].position.x + ((Math.random() - 0.5) * c);
			//		smokeParticles[sp].position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

		}

		//smokeGroupの座標をcの分だけ上昇させる
		//		smokeGroup.position.set(0, c, 0);
		//一定間隔（だいたい60fpsぐらい）でcに0.01足していく
		//newend

		controls.update();
		//更新されたシーンとカメラ情報で、3D空間を再構築する
		renderer.render(scene, camera);
		//一定の間隔で再びupdate()を実行（これにより何度も繰り返しupdate()を実行する）
		requestAnimationFrame(update);
	}

	function MakeBot() {

		for (var i = 0; i < 100; i++) {
			smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
			var sphere = new THREE.Sprite(smokeMaterial);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * rad;
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))

			smokeGroup.add(sphere);
			scene.add(smokeGroup);
			smokeParticles.push(sphere);
		}

	}

	/*
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

	*/

	/*
	function tick() { //毎フレーム実行する動作
		requestAnimationFrame(tick);

		for (i = 0; i < bot_cnt; i++) {
			// botを動かす
			bot_direction[i][1] += (bot_direction[i][2] - bot_direction[i][0]) / bot_directionchange_freq;
			if (cnt == 0) {
				bot_direction[i][0] = bot_direction[i][1];
				bot_direction[i][2] = 2 * (Math.PI) * (Math.random());
			};
			bot[i].position.x += bot_speed * Math.cos(bot_direction[i][1]);
			bot[i].position.z += bot_speed * Math.sin(bot_direction[i][1]);

			// 壁に当たった時
			if (Math.abs(bot[i].position.x) >= ground_width / 2) {
				bot_direction[i][1] = Math.PI - bot_direction[i][1];
				bot_direction[i][0] = Math.PI - bot_direction[i][0];
			};
			if (Math.abs(bot[i].position.z) >= ground_depth / 2) {
				bot_direction[i][1] = -bot_direction[i][1];
				bot_direction[i][0] = -bot_direction[i][0];
			};
		};

		// レンダリング
		renderer.render(scene, camera);

		// カウンター更新
		if (cnt == bot_directionchange_freq) {
			cnt = 0;
		} else {
			cnt += 1;
		};
	};
	*/


})();