(function () {


	var width, height, clock, scene, camera, renderer;
	var light1, light2, ground, frame, object1, object2, object3, object4, object5, me;
	var world, min, max, partition, octree,
		playerRadius = 1, playerObjectHolder, playerController;
	var keyInputControl;
	var tpsCameraControl;
	var ground_color = 0xfffff0;

	var loader = new THREE.TextureLoader();
	const ground_x = 30;//赤軸方向のサイズ
	const ground_y = 20;//緑軸方向のサイズ
	const ground_z = 30;//青軸方向のサイズ
	//const stats = new Stats();//fps表示

	//bot関連
	const bot_num = 8;
	var bot = [];//bot_numの数の格納
	var bot_pos = [];//ボットの位置を格納
	const bot_speed = 0.08;
	const bot_rad = 2;//ボットの半径
	var bot_direction = [];//ボットの進行方向
	const bot_directionchange_freq = 300;//ボットの動きの周波数
	var cnt = 0;//ボットの動きのカウンタ
	const bot_distance = 8;
	const bot_prob = 0.05;//[0,1)
	var bot_random = [];//乱数を格納
	const bot_stop_prob = 0.2; //ボットが立ち止まる確率
	var bot_speed_onoff = [];

	//smoke関連
	const smoke_num = 200;//各ボットの煙の数
	const smoke_speed = 0.01;//煙のゆらぎ？の速度
	const smoke_opacity = 0.5;//煙の透明度
	const smoke_size = 0.8;//球に対する煙一個のサイズ
	var color_speed = 1;//色が変わる速さ
	var smoke_direction = [];//煙の向き
	var sd = true;
	var smoke_cnt = 0;//煙が動く頻度のカウンタ
	const smoke_freq = 2;

	//var smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');//煙の画像
	smokeTexture1 = loader.load('images/cloud1.png');
	smokeTexture2 = loader.load('images/cloud2.png');
	smokeTexture3 = loader.load('images/cloud3.png');
	smokeTexture4 = loader.load('images/smoke1.png');
	smokeTexture5 = loader.load('images/smoke2.png');
	smokeTexture6 = loader.load('images/nebula1.png')

	MW.install(THREE);

	$(function () {
		var query = parseInt(window.location.search.slice(1).split('=')[1]);
		if (!query) query = 0xff0000;
		world = new MW.World();
		min = new THREE.Vector3(-50, -50, -50);
		max = new THREE.Vector3(50, 50, 50);
		partition = 5;
		octree = new MW.Octree(min, max, partition);
		world.add(octree);
		frame = new THREE.Group();


		width = window.innerWidth;
		height = window.innerHeight;
		clock = new THREE.Clock();
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
		camera.position.set(0, 5, 30);
		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setClearColor(0x000000, 0.5);
		renderer.setSize(width, height);
		document.body.appendChild(renderer.domElement);

		light1 = new THREE.DirectionalLight(0xffffff, 0.5);
		light1.position.set(0, 1, 0);
		light2 = new THREE.HemisphereLight(ground_color, ground_color, 1.0);
		scene.add(light1);
		scene.add(light2);


		ground = new THREE.Mesh(
			//new THREE.PlaneBufferGeometry( 100, 100, 10, 10 ),
			new THREE.BoxGeometry(ground_x, 0, ground_z),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		//ground.rotation.x = - 90 * THREE.Math.DEG2RAD;
		//ground.position.set( 0, 0, 0 );
		scene.add(ground);
		octree.importThreeMesh(ground);

		const groundHelper = new THREE.WireframeHelper(ground);
		//groundHelper.position.copy( ground.position );
		groundHelper.rotation.copy(ground.rotation);
		scene.add(groundHelper);

		//stats.showPanel(0);//fps表示
		//document.body.appendChild(stats.dom);//fps表示
		//MakeBot(query);
		MakeBot(randcolor());
		//bot作成
		for (var i = 0; i < bot_num - 1; i++) {
			var basecolor;
			switch (i) {
				case 0: basecolor = 0xff0000; break;
				case 1: basecolor = 0x00ff00; break;
				case 2: basecolor = 0x0000ff; break;
				default: basecolor = randcolor();
			}
			MakeBot(basecolor);
		}


		object1 = new THREE.Mesh(
			new THREE.CylinderGeometry(ground_x / 10, ground_x / 10, ground_y / 10, 32),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		object1.position.set(0, -ground_y, 0);
		scene.add(object1);
		octree.importThreeMesh(object1);

		const object1Helper = new THREE.WireframeHelper(object1);
		object1Helper.position.copy(object1.position);
		object1Helper.rotation.copy(object1.rotation);
		scene.add(object1Helper);


		object2 = new THREE.Mesh(
			new THREE.BoxGeometry(0, ground_y, ground_z),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		object2.position.set(-ground_x / 2.0, 0, 0);
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add(object2);
		octree.importThreeMesh(object2);

		const object2Helper = new THREE.WireframeHelper(object2);
		object2Helper.position.copy(object2.position);
		object2Helper.rotation.copy(object2.rotation);
		scene.add(object2Helper);

		object3 = new THREE.Mesh(
			new THREE.BoxGeometry(0, ground_y, ground_z),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		object3.position.set(ground_x / 2.0, 0, 0);
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add(object3);
		octree.importThreeMesh(object3);

		const object3Helper = new THREE.WireframeHelper(object3);
		object3Helper.position.copy(object3.position);
		object3Helper.rotation.copy(object3.rotation);
		scene.add(object3Helper);

		object4 = new THREE.Mesh(
			new THREE.BoxGeometry(ground_x, ground_y, 0),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		object4.position.set(0, 0, ground_z / 2.0);
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add(object4);
		octree.importThreeMesh(object4);

		const object4Helper = new THREE.WireframeHelper(object4);
		object4Helper.position.copy(object4.position);
		object4Helper.rotation.copy(object4.rotation);
		scene.add(object4Helper);

		object5 = new THREE.Mesh(
			new THREE.BoxGeometry(ground_x, ground_y, 0),
			new THREE.MeshStandardMaterial({ color: ground_color })
		);
		object5.position.set(0, 0, -ground_z / 2.0);
		//object5.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add(object5);
		octree.importThreeMesh(object5);

		const object5Helper = new THREE.WireframeHelper(object5);
		object5Helper.position.copy(object5.position);
		object5Helper.rotation.copy(object5.rotation);
		scene.add(object5Helper);




		playerObjectHolder = new THREE.Object3D();
		playerObjectHolder.position.set(0, 10, 0);
		scene.add(playerObjectHolder);

		//me = new THREE.Mesh(
		//new THREE.SphereGeometry( playerRadius, 16, 16 ),
		//new THREE.MeshBasicMaterial( { color: 0xff0000,  wireframe: true} )
		//);

		bot[0].position.set(0, 0, 0);
		playerObjectHolder.add(bot[0]);

		playerController = new MW.CharacterController(playerObjectHolder, bot_rad);
		world.add(playerController);

		//playerController.maxSlopeGradient = Math.cos( THREE.Math.degToRad( 50 * 1 ) );


		keyInputControl = new MW.KeyInputControl();

		tpsCameraControl = new MW.TPSCameraControl(
			camera, // three.js camera
			playerObjectHolder, // tracking object
			{
				el: renderer.domElement,
				offset: new THREE.Vector3(0, 1.8, 0), // eye height
				// radius: 1, // default distance of the character to the camera
				// minRadius: 1,
				// maxRadius: 80,
				rigidObjects: [ground, object1, object2, object3, object4, object5]
			}
		);


		// bind events
		keyInputControl.addEventListener('movekeyon', function () { playerController.isRunning = true; });
		keyInputControl.addEventListener('movekeyoff', function () { playerController.isRunning = false; });
		keyInputControl.addEventListener('jumpkeypress', function () { playerController.jump(); });

		// synk with keybord input and camera control input
		keyInputControl.addEventListener('movekeychange', function () {

			var cameraFrontAngle = tpsCameraControl.getFrontAngle();
			var characterFrontAngle = keyInputControl.frontAngle;
			playerController.direction = THREE.Math.degToRad(360) - cameraFrontAngle + characterFrontAngle;

		});

		// the 'updated' event is fired by `tpsCameraControl.update()`
		tpsCameraControl.addEventListener('updated', function () {

			var cameraFrontAngle = tpsCameraControl.getFrontAngle();
			var characterFrontAngle = keyInputControl.frontAngle;
			playerController.direction = THREE.Math.degToRad(360) - cameraFrontAngle + characterFrontAngle;

		});

		update();
	});

	function update() {

		//stats.begin();//fps表示

		var botid = bot_num;
		while (botid--) {
			if (smoke_cnt == 0) {
				SmokeMov(bot[botid]);
			}
			BotMov(botid, cnt);
			bot_pos[botid] = [bot[botid].position.x, bot[botid].position.z];//ボットの平面の位置を代入
		}
		bot_pos[0] = [playerController.center.x, playerController.center.z];
		//SmokeMov(me);

		//1
		// color_speed = 1; SwapSmoke2();
		//2
		// color_speed = 0.01; SwapSmoke2();
		//3
		//color_speed = 1; SwapSmoke3();
		//4
		color_speed = 0.5; SwapSmoke4();
		// botmov用カウンター更新
		if (cnt == bot_directionchange_freq) {
			cnt = 0;
		} else {
			cnt += 1;
		}
		if (smoke_cnt == smoke_freq) {
			smoke_cnt = 0;
		} else {
			smoke_cnt++;
		}

		//stats.end();//fps表示

		var delta = clock.getDelta();

		requestAnimationFrame(update);
		world.step(Math.min(delta, 0.02));

		tpsCameraControl.update();
		renderer.render(scene, camera);


	}


	//煙の色交換
	function SwapSmoke1() {
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
	//煙の色交換ver2
	function SwapSmoke2() {
		var i = bot_num;
		while (i--) {
			var j = i;
			while (j--) {
				var x = bot_pos[i];
				var y = bot_pos[j];
				if (Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) <= bot_rad * bot_rad) {
					var ci = bot[i].children[0].material.color.clone();
					var cj = bot[j].children[0].material.color.clone();
					var ci2 = bot[i].children[0].material.color.clone();
					var cj2 = bot[j].children[0].material.color.clone();
					var tmpi = ci2.add(cj.multiplyScalar(color_speed));
					var tmpj = cj2.add(ci.multiplyScalar(color_speed));
					var colorid = smoke_num;
					tmpi.r = Math.min(tmpi.r, 1);
					tmpi.g = Math.min(tmpi.g, 1);
					tmpi.b = Math.min(tmpi.b, 1);
					tmpj.r = Math.min(tmpj.r, 1);
					tmpj.g = Math.min(tmpj.g, 1);
					tmpj.b = Math.min(tmpj.b, 1);
					//console.log(tmpj, tmpi);
					while (colorid--) {
						bot[i].children[colorid].material.color = tmpi;
						bot[j].children[colorid].material.color = tmpj;
					}
				}
			}
		}
	}
	//煙の色交換ver3（必ず白に向かう）
	function SwapSmoke3() {
		var i = bot_num;
		while (i--) {
			var j = i;
			while (j--) {
				var x = bot_pos[i];
				var y = bot_pos[j];
				if (Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) <= bot_rad * bot_rad) {
					var ci = bot[i].children[0].material.color.clone();
					var cj = bot[j].children[0].material.color.clone();
					var ci2 = bot[i].children[0].material.color.clone();
					var cj2 = bot[j].children[0].material.color.clone();
					var tmpi = ci2.add(cj.multiplyScalar(color_speed));
					var tmpj = cj2.add(ci.multiplyScalar(color_speed));
					var colorid = smoke_num;
					tmpi.r = Math.min(tmpi.r, 1);
					tmpi.g = Math.min(tmpi.g, 1);
					tmpi.b = Math.min(tmpi.b, 1);
					tmpj.r = Math.min(tmpj.r, 1);
					tmpj.g = Math.min(tmpj.g, 1);
					tmpj.b = Math.min(tmpj.b, 1);
					//console.log(tmpj, tmpi);
					var colorid = Math.floor(Math.random() * smoke_num);
					bot[i].children[colorid].material.color = tmpi;
					bot[j].children[colorid].material.color = tmpj;
				}
			}
		}
	}

	//煙の色交換ver3（必ず白に向かう）
	function SwapSmoke4() {
		var i = bot_num;
		while (i--) {
			var j = i;
			while (j--) {
				var x = bot_pos[i];
				var y = bot_pos[j];
				if (Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) <= bot_rad * bot_rad) {
					var ci = bot[i].children[0].material.color.clone();
					var cj = bot[j].children[0].material.color.clone();
					var ci2 = bot[i].children[0].material.color.clone();
					var cj2 = bot[j].children[0].material.color.clone();
					var pm = Math.floor(Math.random() * 5) - 1;
					var tmpi = ci2.add(cj.multiplyScalar(pm * color_speed));
					var tmpj = cj2.add(ci.multiplyScalar(pm * color_speed));
					var colorid = smoke_num;
					tmpi.r = Math.max(0, Math.min(tmpi.r, 1));
					tmpi.g = Math.max(0, Math.min(tmpi.g, 1));
					tmpi.b = Math.max(0, Math.min(tmpi.b, 1));
					tmpj.r = Math.max(0, Math.min(tmpj.r, 1));
					tmpj.g = Math.max(0, Math.min(tmpj.g, 1));
					tmpj.b = Math.max(0, Math.min(tmpj.b, 1));
					//console.log(tmpj, tmpi);
					var colorid = Math.floor(Math.random() * smoke_num);
					bot[i].children[colorid].material.color = tmpi;
					bot[j].children[colorid].material.color = tmpj;
				}
			}
		}
	}

	//煙を動かすver1
	function SmokeMov1(smokeParticles) {
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

	//煙を動かすver2
	function SmokeMov(smokeParticles) {
		var sp = smokeParticles.children.length;
		while (sp--) {
			smoke_direction[sp][0] += smoke_speed * (Math.random() - 0.5) * Math.PI;
			smoke_direction[sp][1] += smoke_speed * Math.random() * 2 * Math.PI;
			var dz = smoke_direction[sp][0];
			var dth = smoke_direction[sp][1];
			var dr = smoke_speed * Math.random() * bot_rad;
			//sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
			rdx = dr * Math.sin(dz) * Math.cos(dth);
			rdy = dr * Math.sin(dz) * Math.sin(dth);
			rdz = dr * Math.cos(dz);
			var pos = smokeParticles.children[sp].position;
			pos.x += rdx;
			pos.y += rdy;
			pos.z += rdz;
			var aaa = Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2);
			if (aaa > bot_rad * bot_rad) {
				pos.x -= rdx;
				pos.y -= rdy;
				pos.z -= rdz;
			}
		}
	}


	//森田さんの関数
	var botid = bot_num;
	while (botid--) {
		if (Math.random() < bot_stop_prob) {
			bot_speed_onoff[botid] = 0;
		} else {
			bot_speed_onoff[botid] = 1;
		}
		bot_random[botid] = Math.random();
	}

	//乱数配列の更新
	function BotRandom() {
		var botid = bot_num;
		while (botid--) {
			if (Math.random() < bot_stop_prob) {
				bot_speed_onoff[botid] = 0;
			} else {
				bot_speed_onoff[botid] = 1;
			}
			bot_random[botid] = Math.random();
		}
	}
	function BotMov(i, cnt) {
		if (i == 0) return 0;//自分のときスルー

		// botとの距離が近いとbotが近づいてくる
		var dist_x = playerController.center.x - bot[i].position.x;
		var dist_z = playerController.center.z - bot[i].position.z;
		// botを動かす
		if (cnt == i * Math.round(bot_directionchange_freq / bot_num) + Math.round((bot_random[i] - 0.5) * bot_directionchange_freq / bot_num)) { //適当なタイミングで
			if (Math.random() < 0.6) { //向きを変える確率
				BotRandom();
				//アバター(me)との距離が近ければ近づく方向に向きを変える
				if ((Math.sqrt(dist_x * dist_x + dist_z * dist_z) < bot_distance) && (Math.random() < bot_prob)) {
					var me_rad = Math.atan2(dist_z, dist_x);
					bot_direction[i][1] = me_rad;
				} else { //近くないときはランダムな方向に向きを変える
					bot_direction[i][1] = 2 * (Math.PI) * (bot_random[i]);
				}
			}
		}
		bot[i].position.x += bot_speed_onoff[i] * bot_speed * Math.cos(bot_direction[i][1]);
		bot[i].position.z += bot_speed_onoff[i] * bot_speed * Math.sin(bot_direction[i][1]);

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
			smoketexture(Math.floor(Math.random() * 100))
			var smokeMaterial = new THREE.SpriteMaterial({ color: basecolor, map: smokeTexture, transparent: true, opacity: smoke_opacity });
			////混色
			//var smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
			var sphere = new THREE.Sprite(smokeMaterial);
			sphere.scale.set(bot_rad * smoke_size, bot_rad * smoke_size, bot_rad * smoke_size);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * bot_rad;
			//add
			if (sd) {
				smoke_direction[i] = [z, th, r];
			}
			//add
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
			smokeParticles.add(sphere);
		}
		var x = (Math.random() - 0.5) * ground_x;
		z = (Math.random() - 0.5) * ground_z;
		smokeParticles.position.set(x, bot_rad, z);

		scene.add(smokeParticles);
		bot.push(smokeParticles);
		bot_direction.push([Math.random(), Math.random(), Math.PI2 * Math.random()]);
		sd = false;//smoke_directionに一回しか入れないために
	}

	function smoketexture(num) {
		num %= 6;
		switch (num) {
			case 0: smokeTexture = smokeTexture1; break;
			case 1: smokeTexture = smokeTexture2; break;
			case 2: smokeTexture = smokeTexture3; break;
			case 3: smokeTexture = smokeTexture4; break;
			case 4: smokeTexture = smokeTexture5; break;
			case 5: smokeTexture = smokeTexture6; break;
		}
	}


})();