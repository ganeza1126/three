(function () {

	//画面の幅と高さ
	var W, H;
	//Three.js（3D表示用のjs）のシーン、レンダラ、カメラ
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({ alpha: true }), camera, controls;
	renderer.setClearColor(0x000000, 0.5);

	//new-start
	var loader = new THREE.TextureLoader();
	var smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');



	var frame, walls, axes;


	var bot = [];
	var bot_direction = [];
	const bot_directionchange_freq = 150;
	const bot_speed = 0.01;
	const ground_x = 8;
	const ground_y = 1;
	const ground_z = 8;
	const bot_rad = 1;//半径
	const smoke_num = 200;
	const bot_num = 3;
	const smoke_speed = 0.01;// 微小変化量（煙の）
	var cnt = 0;

	$(function () {
		//-------------------------------------------------------
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
		//-------------------------------------------------------


		for (var i = 0; i < bot_num; i++) {
			MakeBot();
		}

		//newend
		walls = new THREE.Mesh(new THREE.BoxGeometry(ground_x, ground_y, ground_z), new THREE.MeshBasicMaterial({ wireframe: true, color: 0xaaaaaa }));
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);

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

		var botid = bot.length;
		while (botid--) {
			SmokeMov(bot[botid]);
			BotMov(botid);
		}

		// botmov用カウンター更新
		if (cnt == bot_directionchange_freq) {
			cnt = 0;
		} else {
			cnt += 1;
		};

		controls.update();
		//更新されたシーンとカメラ情報で、3D空間を再構築する
		renderer.render(scene, camera);
		//一定の間隔で再びupdate()を実行（これにより何度も繰り返しupdate()を実行する）
		requestAnimationFrame(update);
	}

	function MakeBot() {
		var smokeParticles = new THREE.Group();
		for (var i = 0; i < smoke_num; i++) {
			var smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
			var sphere = new THREE.Sprite(smokeMaterial);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * bot_rad;
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
			//よくわからん
			smokeParticles.add(sphere);
		}
		scene.add(smokeParticles);
		bot.push(smokeParticles);
		bot_direction.push([0, 0, Math.PI / 2]);
	}

	//煙を動かす
	function SmokeMov(smokeParticles) {
		var sp = smokeParticles.children.length;
		while (sp--) {
			var rdx = (Math.random() - 0.5) * smoke_speed * bot_rad;
			var rdy = (Math.random() - 0.5) * smoke_speed * bot_rad;
			var rdz = (Math.random() - 0.5) * smoke_speed * bot_rad;
			var pos = smokeParticles.children[sp].position;
			pos.x += rdx;
			pos.y += rdy;
			pos.z += rdz;
			var aaa = Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2);
			if (aaa > bot_rad * bot_rad) {
				pos.x -= rdx * 2;
				pos.y -= rdy * 2;
				pos.z -= rdz * 2;
			}
		}
	}



	function BotMov(i) { //毎フレーム実行する動作
		// botを動かす
		bot_direction[i][1] += (bot_direction[i][2] - bot_direction[i][0]) / bot_directionchange_freq;
		if (cnt == 0) {
			bot_direction[i][0] = bot_direction[i][1];
			bot_direction[i][2] = 2 * (Math.PI) * (Math.random());
		};
		bot[i].position.x += bot_speed * Math.cos(bot_direction[i][1]);
		bot[i].position.z += bot_speed * Math.sin(bot_direction[i][1]);

		// 壁に当たった時
		if (Math.abs(bot[i].position.x) >= ground_x / 2) {
			bot_direction[i][1] = Math.PI - bot_direction[i][1];
			bot_direction[i][0] = Math.PI - bot_direction[i][0];
		};
		if (Math.abs(bot[i].position.z) >= ground_z / 2) {
			bot_direction[i][1] = -bot_direction[i][1];
			bot_direction[i][0] = -bot_direction[i][0];
		};

	}

	//ランダムな色の作成
	function randcolor() {
		return '#' + Math.floor(Math.random() * 1677215).toString(16);
	}


})();