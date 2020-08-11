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
	const bot_num = 2;//bot+meの数
	var bot = [];//bot_numの数の格納
	var bot_pos = [];//ボットの位置を格納
	const bot_speed = 0;//0.01;
	const bot_rad = 5;//ボットの半径
	var bot_direction = [];//ボットの進行方向？森田さんのBotMov関数
	const bot_directionchange_freq = 150;//なんかの周波数森田さんのBotMov関数
	var cnt = 0;//なんかのカウンタ，森田さんのBotMov関数
	//smoke関連
	const smoke_num = 200;//各ボットの煙の数
	const smoke_speed = 0;//0.05;//煙のゆらぎ？の速度
	const smoke_opacity = 0.05;//煙の透明度
	const smoke_size = 0.8;//球に対する煙一個のサイズ
	const smokeTexture = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');//煙の画像
	const color_speed = 0.01;//色が変わる速さ


	MW.install(THREE);

	$(function () {
		var query = parseInt(window.location.search.slice(1).split('=')[1]);
		if (!query) query = 0x0000ff;
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
		//bot作成(switchとMakebotの中身は検証用に変更中)
		for (var i = 0; i < bot_num; i++) {
			var basecolor;
			switch (i) {
				case 0: basecolor = query; break;
				//default: basecolor = randcolor();
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


		/*
				me = new THREE.Group();
				for (var i = 0; i < smoke_num; i++) {
					//単色
					var smokeMaterial = new THREE.SpriteMaterial({ color: query, map: smokeTexture, transparent: true, opacity: smoke_opacity });
					////混色
					//var smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
					var sphere = new THREE.Sprite(smokeMaterial);
					sphere.scale.set(bot_rad * smoke_size, bot_rad * smoke_size, bot_rad * smoke_size);
					var z = (Math.random() - 0.5) * Math.PI;
					var th = Math.random() * 2 * Math.PI;
					var r = Math.random() * bot_rad;
					sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
					me.add(sphere);
				}
				playerObjectHolder.add(me);
		*/
		//上の囲ったところを2行に,bot[0]がme
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

		//add
		//		camera.lookAt(new THREE.Vector3(0, -10000000, 0))
		//		camera.position.set(0, 50, 0);
		//add
		update();

	});

	function update() {
		//stats.begin();//fps表示
		var botid = bot_num;
		while (botid--) {
			SmokeMov(bot[botid]);
			BotMov(botid);
			bot_pos[botid] = [bot[botid].position.x, bot[botid].position.z];//ボットの平面の位置を代入
		}
		bot_pos[0] = [playerController.center.x, playerController.center.z];
		SwapSmoke3();

		// botmov用カウンター更新
		if (cnt == bot_directionchange_freq) {
			cnt = 0;
		} else {
			cnt += 1;
		}

		//stats.end();//fps表示
		var delta = clock.getDelta();
		requestAnimationFrame(update);
		world.step(Math.min(delta, 0.02));
		//		tpsCameraControl.update();
		renderer.render(scene, camera);
	}


	//煙の色交換ver1
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
					var colorid = Math.floor(Math.random() * smoke_num);
					var tmp = bot[i].children[colorid].material.color + bot[j].children[colorid].material.color;;
					bot[i].children[colorid].material.color = tmp;
					bot[j].children[colorid].material.color = tmp;
				}
			}
		}
	}
	//煙の色交換ver3
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
					console.log(tmpi, tmpj);
					while (colorid--) {
						bot[i].children[colorid].material.color = tmpi;
						bot[j].children[colorid].material.color = tmpj;
					}
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
		if (i == 0) return 0;
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
	//指定した色の作成
	function mixcolor(lst1, lst2) {
		var r = Math.max(lst1[0] + lst2[0], 1)
		var g = Math.max(lst1[1] + lst2[1], 1)
		var b = Math.max(lst1[2] + lst2[2], 1)
		var color = (r * 0xFF0000 + g * 0x00FF00 + b * 0x0000FF | 0).toString(16);
		return "0x" + ("000000" + color).slice(-6);
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
			sphere.scale.set(bot_rad * smoke_size, bot_rad * smoke_size, bot_rad * smoke_size);
			var z = (Math.random() - 0.5) * Math.PI;
			var th = Math.random() * 2 * Math.PI;
			var r = Math.random() * bot_rad;
			sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
			smokeParticles.add(sphere);
		}
		var x = (Math.random() - 0.5) * ground_x;
		z = (Math.random() - 0.5) * ground_z;
		smokeParticles.position.set(x, bot_rad, z);
		//smokeParticles.position.set(0, bot_rad, z);

		scene.add(smokeParticles);
		bot.push(smokeParticles);
		bot_direction.push([0, 0, Math.PI / 2]);
	}

})();