(function () {
	//-------------------------------------------------------
	var W, H;
	var scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({ alpha: true }), camera, controls;
	renderer.setClearColor(0x000000, 0.5);
	var frame, walls, axes;
	var loader = new THREE.TextureLoader();
	const ground_x = 8;//赤軸方向のサイズ
	const ground_y = 1;//緑軸方向のサイズ
	const ground_z = 8;//青軸方向のサイズ
	//-------------------------------------------------------

	//bot関連
	const bot_num = 3;
	var bot = [];//bot_numの数の格納
	var bot_pos = [];//ボットの位置を格納
	const bot_speed = 0.01;
	const bot_rad = 0.5;//ボットの半径
	var bot_direction = [];//ボットの進行方向？森田さんのBotMov関数
	const bot_directionchange_freq = 150;//なんかの周波数森田さんのBotMov関数
	var cnt = 0;//なんかのカウンタ，森田さんのBotMov関数
	//smoke関連
	const smoke_num = 200;//各ボットの煙の数
	const smoke_speed = 0.05;//煙のゆらぎ？の速度
	const smoke_opacity = 0.05;//煙の透明度
	const smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');//煙の画像

	$(function () {
		//-------------------------------------------------------
		setMain();
		$(window).on("orientationchange resize", setMain);
		document.querySelector("#main").appendChild(renderer.domElement);
		camera = new THREE.PerspectiveCamera(90, W / H, 1, 3000);
		camera.position.set(0, 0, 10);
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableKeys = true;
		walls = new THREE.Mesh(new THREE.BoxGeometry(ground_x, ground_y, ground_z), new THREE.MeshBasicMaterial({ wireframe: true, color: 0xaaaaaa }));
		axes = new THREE.AxesHelper(1000);
		frame = new THREE.Group();
		frame.add(walls);
		frame.add(axes);
		scene.add(frame);
		//-------------------------------------------------------

		//bot作成(switchとMakebotの中身は検証用に変更中)
		for (var i = 0; i < bot_num; i++) {
			var basecolor;
			switch (i) {
				case 0: basecolor = 0xFF0000; break;
				case 1: basecolor = 0x00FF00; break;
				case 2: basecolor = 0x0000FF; break;
				default: basecolor = randcolor();
			}
			MakeBot(basecolor);
		}

		update();
	});


	//繰り返し実行する
	function update() {
		var botid = bot_num;
		while (botid--) {
			SmokeMov(bot[botid]);
			BotMov(botid);
			bot_pos[botid] = [bot[botid].position.x, bot[botid].position.z];//ボットの平面の位置を代入
		}
		SwapSmoke();

		// botmov用カウンター更新
		if (cnt == bot_directionchange_freq) {
			cnt = 0;
		} else {
			cnt += 1;
		}

		//-------------------------------------------------------
		controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(update);
		//-------------------------------------------------------
	}

	//煙の色交換
	function SwapSmoke() {
		var i = bot_num;
		while (i--) {
			var j = i;
			while (j--) {
				var x = bot_pos[i];
				var y = bot_pos[j];
				if (Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) <= bot_rad * bot_rad) {
					var colorid = Math.floor(Math.random() * smoke_num);
					var tmp = bot[i].children[colorid].material.color;
					bot[i].children[colorid].material.color = bot[j].children[colorid].material.color;
					bot[j].children[colorid].material.color = tmp;
				}
			}
		}
	}


	//煙を動かすver1
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


	//森田さんの関数
	function BotMov(i) {
		// botを動かす
		bot_direction[i][1] += (bot_direction[i][2] - bot_direction[i][0]) / bot_directionchange_freq;
		if (cnt == 0) {
			bot_direction[i][0] = bot_direction[i][1];
			bot_direction[i][2] = 2 * (Math.PI) * (Math.random());
		};
		bot[i].position.x += bot_speed * Math.cos(bot_direction[i][1]);
		bot[i].position.z += bot_speed * Math.sin(bot_direction[i][1]);

		// 壁に当たった時
		if (Math.abs(bot[i].position.x) >= ground_x / 2.0) {
			bot_direction[i][1] = Math.PI - bot_direction[i][1];
			bot_direction[i][0] = Math.PI - bot_direction[i][0];
		};
		if (Math.abs(bot[i].position.z) >= ground_z / 2.0) {
			bot_direction[i][1] = -bot_direction[i][1];
			bot_direction[i][0] = -bot_direction[i][0];
		};
	}

	//ランダムな色の作成
	function randcolor() {
		var color = (Math.random() * 0xFFFFFF | 0).toString(16);
		return "#" + ("000000" + color).slice(-6);
	}

	//ボット作成（smokeParticlesに煙１つ１つを突っ込んでいる）
	function MakeBot(basecolor = randcolor()) {
		var smokeParticles = new THREE.Group();
		for (var i = 0; i < smoke_num; i++) {
			//単色
			var smokeMaterial = new THREE.SpriteMaterial({ color: basecolor, map: smokeTexture, transparent: true, opacity: smoke_opacity });
			////混色
			//var smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
			var sphere = new THREE.Sprite(smokeMaterial);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * bot_rad;
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
			smokeParticles.add(sphere);
		}
		var x = (Math.random() - 0.5) * ground_x;
		z = (Math.random() - 0.5) * ground_z;
		smokeParticles.position.set(x, 0, z);

		scene.add(smokeParticles);
		bot.push(smokeParticles);
		bot_direction.push([0, 0, Math.PI / 2]);
	}

	//画面いっぱいに#mainを表示するための関数
	function setMain() {
		//画面の幅と高さを取得
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


})();