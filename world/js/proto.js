//import { Sky } from 'images/Sky.js';
(function() {
	
	
	var width, height, clock, scene, camera, renderer;
	var light1, light2, ground, outside_ground, frame, object1, object2, object3, object4, object5, me;
	var world, min, max, partition, octree,
		playerRadius = 1, playerObjectHolder, playerController;
	var keyInputControl;
	var tpsCameraControl;
	var ground_color = 0xfffff0;
	var spLR = 0.8;//左右キーで回る角度の大きさ
	var DEG2RAD = Math.PI / 180;//rad/dig
	var add_helper = Boolean(false);//wireを表示するか
	var my_color;//自分の色

	var loader = new THREE.TextureLoader();	
	const ground_x = 60;//赤軸方向のサイズ
	const ground_y = 60;//緑軸方向のサイズ
	const ground_z = 60;//青軸方向のサイズ
	//const stats = new Stats();//fps表示

	out_side_ground_size = 10;//部屋の大きさと比べた時の外の大きさ

	var sunSphere;//太陽
	var phi;//太陽のむき
	var theta;//太陽の高さ
	var first_theta = 0.0058;
	var last_theta = -0.06;

	var first_sun_y;
	var last_sun_y = 15500;
	var distance;//太陽の遠さ
	var sun_uniforms;
	var set_sun = false;
	

	var wall_speed = 0.005;//降りるスピード
	var wall_life = 10;//何回の交流で完全に降りるか
	var move_wall_storage = 0;
	reset_octree = false;
	last_page = false;


	//bot関連
	const bot_num = 10;
	var bot = [];//bot_numの数の格納
	var bot_pos = [];//ボットの位置を格納
	const bot_speed = 0.1;
	const bot_rad = 2;//ボットの半径
	var bot_direction = [];//ボットの進行方向
	const bot_directionchange_freq = 150;//botの動きの周波数
	var cnt = 0;//botの動きのカウンタ
	const bot_distance = 8;
	const bot_prob = 0.05;//[0,1)
	var bot_random = [];//乱数を格納
	const bot_stop_prob = 0.2; //ボットが立ち止まる確率
	var bot_speed_onoff = [];
	var goal = false; //壁の高さがゼロ（＝ゴール）になったらgoal=true

	var eyes_open = Boolean(true);
	var black_eyes_distance = Math.PI/5;
	var white_eyes_distance = Math.PI/6;
	var black_jumpout = 0.9;
	var white_jumpout = 1.005;
	var white_eyes_size = bot_rad*0.1;
	var black_eyes_size = bot_rad*0.05;

	var pre_bot_jump = Array(bot_num);//ジャンプするか
	pre_bot_jump.fill(Boolean(false));
	var bot_jump = Array(bot_num);//ジャンプするか
	bot_jump.fill(Boolean(false));
	var jump_count = Array(bot_num);
	jump_count.fill(0);
	var jump_height = bot_rad*1.5;
	var jump_time = 20;

	//smoke関連
	var smoke_num = 300;//各ボットの煙の数
	const smoke_speed = 0.05;//煙のゆらぎ？の速度
	const smoke_opacity = 0.1;//煙の透明度
	const smoke_size = 0.9;//球に対する煙一個のサイズ
	var color_speed = 1;//色が変わる速さ
	var smoke_direction = [];//煙の向き
	var sd = true;
	var smoke_cnt = 0;//煙が動く頻度のカウンタ
	const smoke_freq = 2;
	var last_color = [];

	//最後にポップを表示する判定の際に利用する変数
	
	var endPop_time = 500;
	const endPop_time_const = endPop_time;

	smokeTexture1 = loader.load('images/cloud1.png');
	smokeTexture2 = loader.load('images/cloud2.png');
	smokeTexture3 = loader.load('images/cloud3.png');
	smokeTexture4 = loader.load('images/smoke1.png');
	smokeTexture5 = loader.load('images/smoke2.png');
	smokeTexture6 = loader.load('images/smoke4.png');

	starTexture1 = loader.load('images/starcloud1.png');
	starTexture2 = loader.load('images/starcloud2.png');
	starTexture3 = loader.load('images/starcloud3.png');

	wallTexture1 = loader.load('images/wall1.png');
	wallTexture2 = loader.load('images/wall2.png');
	wallTexture3 = loader.load('images/wall3.png');
	wallTexture4 = loader.load('images/wall4.png');
	wallTexture5 = loader.load('images/grid3.png');
	groundTexture1 = loader.load('images/grid3.png');
	groundTexture2 = loader.load('images/grid5.png');

	wallTexture = wallTexture5;
	groundTexture = groundTexture1;
	outside_groundTexture = groundTexture2;

	wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set( 4, 4 );

	groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
	groundTexture.repeat.set( 8, 8 );

	outside_groundTexture.wrapS = outside_groundTexture.wrapT = THREE.RepeatWrapping;
	outside_groundTexture.repeat.set( 8*out_side_ground_size, 8*out_side_ground_size );

	wall_material = new THREE.MeshBasicMaterial({map:wallTexture})
	//wall_material = new THREE.MeshStandardMaterial({color: 0x000000})
	//wall_material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});

	//ground_material = new THREE.MeshStandardMaterial({ map: groundTexture })

	ground_material = new THREE.MeshBasicMaterial({map:groundTexture});

	//ground_material = new THREE.MeshStandardMaterial({ color: 0xffffff })
	outside_ground_material = new THREE.MeshBasicMaterial({map:outside_groundTexture});


	MW.install( THREE );

	$(function(){
		
		var query = window.location.search.slice(1);
		
		//開発用分岐：worldのindex.htmlから始めても大丈夫
		if(query){
			var query_h = query.split('=')[1].split('&')[0];
			var query_s = parseInt(query.split('=')[2]);
			my_color = "hsl("+ query_h + ", " + query_s + "%, " + "50%)";
		}else{
			my_color = 0x00ffff;
		}

		world = new MW.World();
		min = new THREE.Vector3( -1.5*ground_x, -1.5*ground_y, -1.5*ground_z );
		max = new THREE.Vector3(  1.5*ground_x,  1.5*ground_y,  1.5*ground_z );
		partition = 5;
		octree = new MW.Octree( min, max, partition );
		world.add( octree );
		frame = new THREE.Group();

		
		width = window.innerWidth;
		height = window.innerHeight;
		clock = new THREE.Clock();
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 40, width / height, 1, 1000 );
		camera.position.set( 0, 5, 30 );
		renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setClearColor(0xe0ffff, 1);
		renderer.setSize( width, height );
		document.body.appendChild( renderer.domElement );
		setMain();
		window.addEventListener("resize", setMain);
		window.addEventListener("orientationchange", setMain);


		var light_color = 0xffffff;

		light1 = new THREE.DirectionalLight(light_color, 0.5);
		light1.position.set(0, 1, 0);
		light2 = new THREE.HemisphereLight(light_color, light_color, 1.0);
		light3 = new THREE.DirectionalLight(light_color, 1);
		light3.position.set(ground_x, 0, 0);
		light4 = new THREE.DirectionalLight(light_color, 1);
		light4.position.set(-ground_x, 0, 0);
		light5 = new THREE.DirectionalLight(light_color, 1);
		light5.position.set(0, 0, ground_z);
		light6 = new THREE.DirectionalLight(light_color, 1);
		light6.position.set(0, 0, -ground_z);


		//light設定しないとエモい感じになる
		scene.add(light1);
		scene.add(light2);
		scene.add(light3);
		scene.add(light4);
		scene.add(light5);
		scene.add(light6);

		
		//Sky
		const sky = new THREE.Sky();
		sky.scale.setScalar(450000);
		scene.add(sky);

		//Skyの設定
		const sky_uniforms = sky.material.uniforms;
		sky_uniforms['turbidity'].value = 20;
		sky_uniforms['rayleigh'].value = 500;
		//sky_uniforms['luminance'].value = 1;
		sky_uniforms['mieCoefficient'].value = 0.005;
		sky_uniforms['mieDirectionalG'].value = 8;
		//sky_uniforms['sunPosition'].value = new THREE.Vector3( 0, 1, 0 );
		sky_uniforms['up'].value = new THREE.Vector3( 0, 1, 0 );

		//Sun
		sunSphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry(200,16,8),
			new THREE.MeshBasicMaterial({color:0xFFFFFF})
		);
		scene.add(sunSphere);
		
		//Sunの設定
		sun_uniforms = sky.material.uniforms;
		sun_uniforms['turbidity'].value = 0.8;
		sun_uniforms['rayleigh'].value = 2;
		sun_uniforms['mieCoefficient'].value = 0.005;
		sun_uniforms['mieDirectionalG'].value = 0.8;
		//sun_uniforms['luminance'].value = 1;
		
		theta = Math.PI * ( first_theta );
		phi = 2 * Math.PI * ( -0.25 );
		distance = 400000;
		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
		sunSphere.visible = true;
		sun_uniforms['sunPosition'].value.copy(sunSphere.position);

		first_sun_y = sunSphere.position.y;

		ground = new THREE.Mesh(
		//new THREE.PlaneBufferGeometry( 100, 100, 10, 10 ),
		new THREE.BoxGeometry( ground_x, 0, ground_z ),
		ground_material
		);
		scene.add( ground );
		octree.importThreeMesh( ground );

		const groundHelper = new THREE.WireframeHelper( ground );
		//groundHelper.position.copy( ground.position );
		groundHelper.rotation.copy( ground.rotation );
		if(add_helper)scene.add( groundHelper );

		outside_ground = new THREE.Mesh(
			//new THREE.PlaneBufferGeometry( 100, 100, 10, 10 ),
			new THREE.BoxGeometry( ground_x*out_side_ground_size, 0, ground_z*out_side_ground_size ),
			outside_ground_material
		);
		outside_ground.position.set(0,-0.01,0);
		scene.add( outside_ground );
		octree.importThreeMesh( outside_ground );

		//stats.showPanel(0);//fps表示
		//document.body.appendChild(stats.dom);//fps表示
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
		
		var thinness = 1.0;
		var verticesOfCube = [
			0,0,1, 0,0,-1, 
			thinness*Math.cos( THREE.Math.degToRad(0)),thinness*Math.sin( THREE.Math.degToRad(0)),0,
			thinness*Math.cos( THREE.Math.degToRad(60)),thinness*Math.sin( THREE.Math.degToRad(60)),0,
			thinness*Math.cos( THREE.Math.degToRad(120)),thinness*Math.sin( THREE.Math.degToRad(120)),0,
			thinness*Math.cos( THREE.Math.degToRad(180)),thinness*Math.sin( THREE.Math.degToRad(180)),0,
			thinness*Math.cos( THREE.Math.degToRad(240)),thinness*Math.sin( THREE.Math.degToRad(240)),0,
			thinness*Math.cos( THREE.Math.degToRad(300)),thinness*Math.sin( THREE.Math.degToRad(300)),0,
		];
		
		var indicesOfFaces = [
			0,2,3, 0,3,4, 0,4,5, 0,5,6, 0,6,7, 0,7,2,
			1,3,2, 1,4,3, 1,5,4, 1,6,5, 1,7,6, 1,2,7
		];


		object1 = new THREE.Mesh(
			new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 0.2, 0 ),
			new THREE.MeshStandardMaterial({ color: 0xff0000 })
		);
		object1.position.set(0, bot_rad, 0);
		object1.rotation.set( THREE.Math.degToRad( -90 ), 0, 0 );
		scene.add(object1);
		//octree.importThreeMesh(object1);

		// const object1Helper = new THREE.WireframeHelper(object1);
		// object1Helper.position.copy(object1.position);
		// object1Helper.rotation.copy(object1.rotation);
		// scene.add(object1Helper);



		object2 = new THREE.Mesh(
			new THREE.BoxGeometry( 0, ground_y, ground_z ),
			wall_material
		);
		object2.position.set( -ground_x/2.0, ground_y/2.0, 0 );
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add( object2 );
		octree.importThreeMesh( object2 );

		const object2Helper = new THREE.WireframeHelper( object2 );
		object2Helper.position.copy( object2.position );
		object2Helper.rotation.copy( object2.rotation );
		if(add_helper)scene.add( object2Helper );

		object3 = new THREE.Mesh(
			new THREE.BoxGeometry( 0, ground_y, ground_z ),
			wall_material
		);
		object3.position.set( ground_x/2.0, ground_y/2.0, 0 );
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add( object3 );
		octree.importThreeMesh( object3 );

		const object3Helper = new THREE.WireframeHelper( object3 );
		object3Helper.position.copy( object3.position );
		object3Helper.rotation.copy( object3.rotation );
		if(add_helper)scene.add( object3Helper );

		object4 = new THREE.Mesh(
			new THREE.BoxGeometry( ground_x, ground_y, 0 ),
			wall_material
		);
		object4.position.set( 0, ground_y/2.0, ground_z/2.0 );
		//object2.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add( object4 );
		octree.importThreeMesh( object4 );

		const object4Helper = new THREE.WireframeHelper( object4 );
		object4Helper.position.copy( object4.position );
		object4Helper.rotation.copy( object4.rotation );
		if(add_helper)scene.add( object4Helper );

		object5 = new THREE.Mesh(
			new THREE.BoxGeometry( ground_x, ground_y, 0 ),
			wall_material
		);
		object5.position.set( 0, ground_y/2.0, -ground_z/2.0 );
		//object5.rotation.set( THREE.Math.degToRad( 20 ), 0, 0 );
		scene.add( object5 );
		octree.importThreeMesh( object5 );

		const object5Helper = new THREE.WireframeHelper( object5 );
		object5Helper.position.copy( object5.position );
		object5Helper.rotation.copy( object5.rotation );
		if(add_helper)scene.add( object5Helper );

		playerObjectHolder = new THREE.Object3D();
		playerObjectHolder.position.set( 0, 10, 0 );
		scene.add( playerObjectHolder );

		// me = new THREE.Mesh(
		// new THREE.SphereGeometry( playerRadius, 16, 16 ),
		// new THREE.MeshToonMaterial( { color: 0xff0000,  wireframe: true} )
		// );


		// var me= new THREE.Group();
		// for (var i = 0; i < smoke_num; i++) {
		// 	//単色
		// 	smoketexture(Math.floor(Math.random() * 4))
		// 	var smokeMaterial = new THREE.SpriteMaterial({ color: basecolor, map: smokeTexture, transparent: true, opacity: smoke_opacity });
		// 	////混色
		// 	//var smokeMaterial = new THREE.SpriteMaterial({ color: randcolor(), map: smokeTexture, transparent: true, opacity: 0.2 });
		// 	var sphere = new THREE.Sprite(smokeMaterial);
		// 	sphere.scale.set(bot_rad * smoke_size, bot_rad * smoke_size, bot_rad * smoke_size);
		// 	var z = (Math.random() - 0.5) * Math.PI;
		// 	var th = Math.random() * 2 * Math.PI;
		// 	var r = Math.random() * bot_rad;
		// 	sphere.position.set(r * Math.sin(z) * Math.cos(th), r * Math.sin(z) * Math.sin(th), r * Math.cos(z))
		// 	me.add(sphere);
		// }
		
		// me.position.set(0,0,0);

		// scene.add(me);
		// playerObjectHolder.add(me);
	
		bot[0].position.set(0, 0, 0);
		playerObjectHolder.add(bot[0]);
		playerObjectHolder.add(object1);

		playerController = new MW.CharacterController( playerObjectHolder, bot_rad );
		world.add( playerController );

		//playerController.maxSlopeGradient = Math.cos( THREE.Math.degToRad( 50 * 1 ) );


		keyInputControl = new MW.KeyInputControl();

		tpsCameraControl = new MW.TPSCameraControl(
		camera, // three.js camera
		playerObjectHolder, // tracking object
		{
			el: renderer.domElement,
			offset: new THREE.Vector3( 0, 1.8, 0 ), // eye height
			// radius: 1, // default distance of the character to the camera
			// minRadius: 1,
			// maxRadius: 80,
			rigidObjects: [ ground, object2, object3, object4, object5 ]
		}
		);


		//bind events
		keyInputControl.addEventListener( 'movekeyon',	function () {
			if(keyInputControl.isUp || keyInputControl.isDown){//don't move when rightkey or leftkey is on alone
			playerController.isRunning = true;
			}
		} );
		keyInputControl.addEventListener( 'movekeychange',	function () {
			if(keyInputControl.isUp || keyInputControl.isDown){//don't move when rightkey or leftkey is on alone
				playerController.isRunning = true;
			}else{
				playerController.isRunning = false;
			}
		} );
		keyInputControl.addEventListener( 'movekeyoff',   function () { playerController.isRunning = false; } );
		keyInputControl.addEventListener( 'jumpkeypress', function () { playerController.jump();} );
		
		// synk with keybord input and camera control input
		keyInputControl.addEventListener( 'movekeychange',  function () {
		
			//routate by left key or right key
			if(keyInputControl.isLeft == true && keyInputControl.isRight == false){
				tpsCameraControl.theta -= THREE.Math.degToRad( spLR);
			}else if(keyInputControl.isLeft == false && keyInputControl.isRight == true){
				tpsCameraControl.theta += THREE.Math.degToRad( spLR );
			}
			
			//don't move obliquely when leftkey or rightkey is on
			if(DEG2RAD*90<=keyInputControl.frontAngle && DEG2RAD*270 > keyInputControl.frontAngle){
				keyInputControl.frontAngle = DEG2RAD*180;
			}else{
				keyInputControl.frontAngle = DEG2RAD*0;
			}

			var cameraFrontAngle = tpsCameraControl.getFrontAngle();
			var characterFrontAngle = keyInputControl.frontAngle;
			playerController.direction = THREE.Math.degToRad( 360 ) - cameraFrontAngle + characterFrontAngle;
		} );

		// the 'updated' event is fired by `tpsCameraControl.update()`
		tpsCameraControl.addEventListener( 'updated', function () {
			//console.log(keyInputControl.isLeft);
			// routate by left key or right key
			if(keyInputControl.isLeft == true && keyInputControl.isRight == false){
				tpsCameraControl.theta -= THREE.Math.degToRad( spLR );
			}else if(keyInputControl.isLeft == false && keyInputControl.isRight == true){
				tpsCameraControl.theta += THREE.Math.degToRad( spLR );
			}

			//don't move obliquely when leftkey or rightkey is on
			if(DEG2RAD*90<=keyInputControl.frontAngle && DEG2RAD*270 > keyInputControl.frontAngle){
				keyInputControl.frontAngle = DEG2RAD*180;
			}else{
				keyInputControl.frontAngle = DEG2RAD*0;
			}
			
			var cameraFrontAngle = tpsCameraControl.getFrontAngle();
			var characterFrontAngle = keyInputControl.frontAngle;
			playerController.direction = THREE.Math.degToRad( 360 ) - cameraFrontAngle + characterFrontAngle;

		} );

//--------------------------------
//↓↓↓フルスクリーンここから↓↓↓
//--------------------------------
		//フルスクリーンにするオブジェクト
		const album = document.querySelector("body");
  		//開始ボタンをクリック
  		$("#full").on("click", ()=>{
  			if(!enabledFullScreen()){
  				alert("フルスクリーンに対応していません");
  				return(false);
			}
			// フルスクリーンを開始
			goFullScreen(album);
		});
		
		//閉じるボタンをクリック
  		$("#cancel").on("click", ()=>{
  			// フルスクリーンを解除
  			cancelFullScreen(album);
		});
		
  		//フルスクリーンイベント
  		eventFullScreen( ()=>{
	  		console.log(1)
  			// ボタンを入れ替える
  			if (getFullScreenObject()) {
  				$("#full").hide();
  				$("#cancel").show();
			} else {
				$("#cancel").hide();
				$("#full").show();
			}
		});

		//フルスクリーン開始/終了時のイベント設定
 		function eventFullScreen(callback) {
 			document.addEventListener("fullscreenchange", callback, false);
 			document.addEventListener("webkitfullscreenchange", callback, false);
 			document.addEventListener("mozfullscreenchange", callback, false);
 			document.addEventListener("MSFullscreenChange", callback, false);
		}

		//フルスクリーンが利用できるか
 		function enabledFullScreen(){
 			return(document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen || document.msFullscreenEnabled);
		}
		//フルスクリーンにする
 		function goFullScreen(element=null){
 			const doc = window.document;
 			const docEl = (element === null)?  doc.documentElement:element;
 			let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
 			requestFullScreen.call(docEl);
		}
		//フルスクリーンをやめる
 		function cancelFullScreen(){
 			const doc = window.document;
 			const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
 			cancelFullScreen.call(doc);
		}
		//フルスクリーン中のオブジェクトを返却
 		function getFullScreenObject(){
 			const doc = window.document;
 			const objFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
 			return(objFullScreen);
		}
//--------------------------------
//↑↑↑フルスクリーンここまで↑↑↑
//--------------------------------

		// show popupボタンクリック時の処理
		$('#show').click(function(e) {
			$('#popup, #container').show();
		});	 
		// ポップアップのcloseボタンクリック時の処理
		$('#close, #container').click(function(e) {
			$('#popup, #container').hide();
		});
		//endPopを出現させる処理(今は仮なのでcontrolボタンを押すことで変数を変更し、変数の値判定でポップが登場するようにしている)
		// window.addEventListener('keydown', function(event) {
		// 	if (event.ctrlKey) {
		// 	  console.log(`keydown:Ctrl`);
		// 	  endPop = true
		// 	}
		// });
		update();
		
	});

	function update () {
		//stats.begin();//fps表示
		requestAnimationFrame( update );
		var delta = clock.getDelta();
		if(!last_page){
			if ($('#popup, #container').css('display') == 'none') {
				var botid = bot_num;
				while (botid--) {
					if (smoke_cnt == 0) {
						SmokeMov1(botid);
					}
					if(botid!=0)BotMov(botid,cnt,goal);
					bot_pos[botid] = [bot[botid].position.x, bot[botid].position.z];//ボットの平面の位置を代入
					//if(botid!=0)
					BotJump(botid);
				}
				bot_pos[0] = [playerController.center.x, playerController.center.z];
				//SmokeMov(me);
		
				//1
				color_speed = 1; SwapSmoke1();
				//2
				//color_speed = 0.01; SwapSmoke2();
				//3
				//color_speed = 1; SwapSmoke3();
				//4
				//color_speed = 1; SwapSmoke4();
		
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
		
				WallMove();
				
				//stats.end();//fps表示
			}
		}
		world.step( Math.min( delta, 0.02 ) );
	
		tpsCameraControl.update();
		renderer.render( scene, camera );
		var my_direction = tpsCameraControl.getFrontAngle()-Math.PI/2;
		if(object2.position.y<-ground_y/2+5 && !set_sun){
			phi = my_direction;
			sunSphere.position.x = distance * Math.cos(phi);
			//sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
			sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
			set_sun = true;
		}
		if(goal){

			
			//if(theta<last_theta)
			//theta += (last_theta-first_theta)/endPop_time_const;
			//sunSphere.position.x = distance * Math.cos(phi);
			//sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
			//sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
			sunSphere.position.y += (last_sun_y - first_sun_y)/ endPop_time_const;
			sun_uniforms['sunPosition'].value.copy(sunSphere.position);

			endPop_time--;

			if(!reset_octree){
				
				octree = new MW.Octree( min, max, partition );
				world.add( octree )
				octree.importThreeMesh( ground );
				octree.importThreeMesh( outside_ground );
				reset_octree = true;
			}
		}

		if(endPop_time==0){
			
			fadeInOut();


			// $('#endPopup, #endContainer').show();
			// $('#popup, #container').hide();
		}

	}
	
	function setMain() {
		width = window.innerWidth;
		height = window.innerHeight;
		$("canvas").width(width);
		$("canvas").height(height);
		renderer.setSize(width, height);
		if (camera) {
			camera.aspect = width/height;
			camera.updateProjectionMatrix();
		}
	}

	//煙の色交換
	//煙の色交換
	function SwapSmoke1() {
		var i = bot_num;
		bot_jump.fill(Boolean(false));
		
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
					//console.log(j);
					
					if(!pre_bot_jump[i] && jump_count[i]==0 ){
						
						jump_count[i]=jump_time;
						if(i == 0){
							move_wall_storage += 1/wall_speed/wall_life;
						}
					}
					if(!pre_bot_jump[j] && jump_count[j]==0 ){
						
						jump_count[j]=jump_time;
						if(j == 0){
							move_wall_storage += 1/wall_speed/wall_life;
						}
					}
					
					bot_jump[i]=Boolean(true);
					bot_jump[j]=Boolean(true);
				}
			}
		}
		
		
		pre_bot_jump = bot_jump.slice();//sliceがなかったら接触中ジャンプし続ける
		

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
	function SmokeMov1(botid) {
		var smokeParticles = bot[botid]
		var sp = smokeParticles.children.length;
		if(eyes_open){
			if(botid==0){
				var my_direction = tpsCameraControl.getFrontAngle()-Math.PI/2;
				smokeParticles.children[sp-4].position.set(black_jumpout*Math.cos(my_direction-black_eyes_distance), 0.8, black_jumpout*Math.sin(my_direction-black_eyes_distance));
				smokeParticles.children[sp-3].position.set(black_jumpout*Math.cos(my_direction+black_eyes_distance), 0.8, black_jumpout*Math.sin(my_direction+black_eyes_distance));
				smokeParticles.children[sp-2].position.set(white_jumpout*Math.cos(my_direction-white_eyes_distance), 0.8, white_jumpout*Math.sin(my_direction-white_eyes_distance));
				smokeParticles.children[sp-1].position.set(white_jumpout*Math.cos(my_direction+white_eyes_distance), 0.8, white_jumpout*Math.sin(my_direction+white_eyes_distance));
			}else{
				smokeParticles.children[sp-4].position.set(black_jumpout*Math.cos(bot_direction[botid][1]-black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[botid][1]-black_eyes_distance));
				smokeParticles.children[sp-3].position.set(black_jumpout*Math.cos(bot_direction[botid][1]+black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[botid][1]+black_eyes_distance));
				smokeParticles.children[sp-2].position.set(white_jumpout*Math.cos(bot_direction[botid][1]-white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[botid][1]-white_eyes_distance));
				smokeParticles.children[sp-1].position.set(white_jumpout*Math.cos(bot_direction[botid][1]+white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[botid][1]+white_eyes_distance));
			}
			sp-=4;
		}
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
	function SmokeMov2(botid) {
		var smokeParticles = bot[botid]
		var sp = smokeParticles.children.length;
		if(eyes_open){
			if(botid==0){
				var my_direction = tpsCameraControl.getFrontAngle()-Math.PI/2;
				smokeParticles.children[sp-4].position.set(black_jumpout*Math.cos(my_direction-black_eyes_distance), 0.8, black_jumpout*Math.sin(my_direction-black_eyes_distance));
				smokeParticles.children[sp-3].position.set(black_jumpout*Math.cos(my_direction+black_eyes_distance), 0.8, black_jumpout*Math.sin(my_direction+black_eyes_distance));
				smokeParticles.children[sp-2].position.set(white_jumpout*Math.cos(my_direction-white_eyes_distance), 0.8, white_jumpout*Math.sin(my_direction-white_eyes_distance));
				smokeParticles.children[sp-1].position.set(white_jumpout*Math.cos(my_direction+white_eyes_distance), 0.8, white_jumpout*Math.sin(my_direction+white_eyes_distance));
			}else{
				smokeParticles.children[sp-4].position.set(black_jumpout*Math.cos(bot_direction[botid][1]-black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[botid][1]-black_eyes_distance));
				smokeParticles.children[sp-3].position.set(black_jumpout*Math.cos(bot_direction[botid][1]+black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[botid][1]+black_eyes_distance));
				smokeParticles.children[sp-2].position.set(white_jumpout*Math.cos(bot_direction[botid][1]-white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[botid][1]-white_eyes_distance));
				smokeParticles.children[sp-1].position.set(white_jumpout*Math.cos(bot_direction[botid][1]+white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[botid][1]+white_eyes_distance));
			}
			sp-=4;
		}
		while (sp--) {
			if (botid == 0) {
				smoke_direction[sp][0] += smoke_speed * (Math.random() - 0.5) * Math.PI;
				smoke_direction[sp][1] += smoke_speed * (Math.random() - 0.5) * 2 * Math.PI;
				//				smoke_direction[sp][0] = Math.min(Math.max(smoke_direction[sp][0], 0), Math.PI);
				//				smoke_direction[sp][1] = Math.min(Math.max(smoke_direction[sp][1], 0), 2 * Math.PI);
			}
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
				pos.x -= 1 * rdx;
				pos.y -= 1 * rdy;
				pos.z -= 1 * rdz;
			}
		}
	}

	function BotJump(botid){
		if(jump_count[botid] > 0){
			
			if(jump_count[botid]>jump_time/2){
				bot[botid].position.y += jump_height/(jump_time/2);
			}else{
				bot[botid].position.y -= jump_height/(jump_time/2);
			}
			jump_count[botid]--;
		}
	}

	var botid = bot_num;
	while (botid--) {
		if(Math.random()<bot_stop_prob){
			bot_speed_onoff[botid] = 0;
		}else{
			bot_speed_onoff[botid] = 1;
		}
		bot_random[botid] = Math.random();
	}
	
	//乱数配列の更新
	function BotRandom(){
		var botid = bot_num;
		while (botid--) {
			if(Math.random()<bot_stop_prob){
				bot_speed_onoff[botid] = 0;
			}else{
				bot_speed_onoff[botid] = 1;
			}
			bot_random[botid] = Math.random();
		}
	}

	//botを動かす
	function BotMov(i, cnt, goal) {
		
		if(goal == false){
		// botとの距離が近いとbotが近づいてくる

		if (cnt == i*Math.round(bot_directionchange_freq/bot_num)+Math.round((bot_random[i]-0.5)*bot_directionchange_freq/bot_num)) { //適当なタイミングで
			if(Math.random()<0.6){ //向きを変える確率
				BotRandom();
				//アバター(me)との距離が近ければ近づく方向に向きを変える
				var dist_x = playerController.center.x - bot[i].position.x;
				var dist_z = playerController.center.z - bot[i].position.z;

				if ((Math.sqrt(dist_x*dist_x + dist_z*dist_z) < bot_distance)&&(Math.random()<bot_prob)){
					var me_rad = Math.atan2(dist_z, dist_x);
					bot_direction[i][1] = me_rad;
				} else { //近くないときはランダムな方向に向きを変える
					var botid = bot_num;
					while (botid--) {
						var dist_x = bot[botid].position.x - bot[i].position.x;
						var dist_z = bot[botid].position.z - bot[i].position.z;
						if((botid != i)&&(Math.sqrt(dist_x*dist_x + dist_z*dist_z) < bot_distance)&&(Math.random()<bot_prob)){
							var me_rad = Math.atan2(dist_z, dist_x);
							bot_direction[i][1] = me_rad;
							break;
						} else {
							bot_direction[i][1] = 2 * (Math.PI) * (bot_random[i]);
						}
					}
				}
			}
		}
		bot[i].position.x += bot_speed_onoff[i] * bot_speed * Math.cos(bot_direction[i][1]);
		bot[i].position.z += bot_speed_onoff[i] * bot_speed * Math.sin(bot_direction[i][1]);

		// 壁に当たった時
		if (Math.abs(bot[i].position.x) >= ground_x / 2.0 - bot_rad) {
			bot_direction[i][1] = Math.PI - bot_direction[i][1];
			bot_direction[i][0] = Math.PI - bot_direction[i][0];
			if(bot[i].position.x<0){
				bot[i].position.x = -(ground_x / 2.0 - bot_rad)+1;
			}else{
				bot[i].position.x = (ground_x / 2.0 - bot_rad)-1;
			}
		}
		if (Math.abs(bot[i].position.z) >= ground_z / 2.0 - bot_rad) {
			bot_direction[i][1] = -bot_direction[i][1];
			bot_direction[i][0] = -bot_direction[i][0];
			if(bot[i].position.z<0){
				bot[i].position.z = -(ground_z / 2.0 - bot_rad)+1;
			}else{
				bot[i].position.z = (ground_z / 2.0 - bot_rad)-1;
			}
		}

		} else {
			if(i!=0)BotGoodbye(i);
		}


	}

	var speed_accel = [];
	var stop_cnt = [];
	var botid = bot_num;
	while (botid--) {
		speed_accel[botid] = 0.005;
		stop_cnt[botid] = 0;
	}

	function BotGoodbye(i) {
		stop_cnt[i]++;

		if(stop_cnt[i] > 100){
			bot_direction[i][1] = Math.atan2(bot[i].position.z, bot[i].position.x);
		
			bot[i].position.x += speed_accel[i] * 2*bot_speed * Math.cos(bot_direction[i][1]);
			bot[i].position.z += speed_accel[i] * 2*bot_speed * Math.sin(bot_direction[i][1]);
			speed_accel[i]+=0.005;
		}
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
			if(bot.length == 0){
				var smokeMaterial = new THREE.SpriteMaterial({ color: my_color, map: smokeTexture, transparent: true, opacity: smoke_opacity });	
			}else{
				var smokeMaterial = new THREE.SpriteMaterial({ color: basecolor, map: smokeTexture, transparent: true, opacity: smoke_opacity });
			}
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
		bot_direction.push([Math.random(), Math.random(), Math.PI2 * Math.random()]);
		if(eyes_open){
			// var smokeMaterial = new THREE.MeshBasicMaterial({ map: eyesTexture1, transparent: true, opacity: 1});
			// var sphere = new THREE.Sprite(smokeMaterial);
			// //var sphere= smokeMaterial;
			// sphere.position.set(Math.cos(bot_direction[bot_direction.length-1][1]), 0.7, Math.cos(bot_direction[bot_direction.length-1][1]))
			// sphere.rotation.set(0,bot_direction[bot_direction.length-1][1],0);
			// smokeParticles.add(sphere);
			var eyes = new THREE.Group();
			
			var sphere1 = new THREE.Mesh(
				new THREE.SphereGeometry( white_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0xffffff} )	
			);
			sphere1.position.set(black_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]-black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]-black_eyes_distance))
			

			var sphere2 = new THREE.Mesh(
				new THREE.SphereGeometry( white_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0xffffff} )	
			);
			sphere2.position.set(black_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]+black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]+black_eyes_distance))

			
			var sphere3 = new THREE.Mesh(
				new THREE.SphereGeometry( black_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0x000000} )	
			);
			sphere3.position.set(white_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]-white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]-white_eyes_distance))
			

			var sphere4 = new THREE.Mesh(
				new THREE.SphereGeometry( black_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0x000000} )	
			);
			sphere4.position.set(white_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]+white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]+white_eyes_distance))

			
			
			smokeParticles.add(sphere1);
			smokeParticles.add(sphere2);
			smokeParticles.add(sphere3);
			smokeParticles.add(sphere4);


		}
		scene.add(smokeParticles);
		bot.push(smokeParticles);
		
		sd = false;//smoke_directionに一回しか入れないために
	}

	function smoketexture(num) {
		num %= 9;
		switch (num) {
			case 0: smokeTexture = smokeTexture1; break;
			case 1: smokeTexture = smokeTexture2; break;
			case 2: smokeTexture = smokeTexture3; break;
			case 3: smokeTexture = smokeTexture4; break;
			case 4: smokeTexture = smokeTexture5; break;
			case 5: smokeTexture = smokeTexture6; break;
			case 6: smokeTexture = smokeTexture1; break;
			case 7: smokeTexture = smokeTexture2; break;
			case 8: smokeTexture = smokeTexture3; break;
		}
	}

	function WallMove(){
		if(move_wall_storage>0){
			object2.position.y -= ground_y*wall_speed;
			object3.position.y -= ground_y*wall_speed;
			object4.position.y -= ground_y*wall_speed;
			object5.position.y -= ground_y*wall_speed;
			move_wall_storage--;
		}



		if(object2.position.y<=-ground_y/2)goal=true;
	}
	
	//実行したいところにfadeInOut()を入れる
	function fadeInOut() {
		//inTimeはフェイドインの時の時間、outTimeはフェイドアウトの時の時間
		var inTime = 4000;
		var outTime = 4000;
		
		$("#fade").fadeIn(inTime, function() {
			//ここに3D空間をリセットしてエモだけ描く処理を書く
			for(var i = 0;i<smoke_num;i++){
				last_color.push(bot[0].children[i].material.color);
				//console.log(bot[0].children[i].material.color);
			}
			while(scene.children.length > 0){ 
				scene.remove(scene.children[0]); 
			}
			smoke_num*=2;
			MakeLastBot();
			
			MakeLastBot();
			
 
			camera = new THREE.PerspectiveCamera(90, width/height, 1, 3000);
			camera.position.set(0, 0, 100);
			last_page=true;
			
			$("#fade").fadeOut(outTime, function() {
				$("#endPopup").delay(3000).fadeIn(1000);
			});
		});
	}

	function MakeLastBot() {
		var smokeParticles = new THREE.Group();
		for (var i = 0; i < smoke_num; i++) {
			//単色
			smoketexture(Math.floor(Math.random() * 100))
		
			if(bot.length == bot_num){
				var smokeMaterial = new THREE.SpriteMaterial({ color: my_color, map: smokeTexture, transparent: true, opacity: smoke_opacity });	
			}else{
				var smokeMaterial = new THREE.SpriteMaterial({ color: last_color[i], map: smokeTexture, transparent: true, opacity: smoke_opacity });
			}
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
		if(bot.length==bot_num){
			smokeParticles.position.set(-3, 0, 93);
			
		}
		else{
			smokeParticles.position.set(3, 0, 93);
		}
		bot_direction.push([Math.PI-Math.acos(smokeParticles.position.x/(100-smokeParticles.position.z)), Math.PI-Math.acos(smokeParticles.position.x/(100-smokeParticles.position.z))]);
		if(eyes_open){
			// var smokeMaterial = new THREE.MeshBasicMaterial({ map: eyesTexture1, transparent: true, opacity: 1});
			// var sphere = new THREE.Sprite(smokeMaterial);
			// //var sphere= smokeMaterial;
			// sphere.position.set(Math.cos(bot_direction[bot_direction.length-1][1]), 0.7, Math.cos(bot_direction[bot_direction.length-1][1]))
			// sphere.rotation.set(0,bot_direction[bot_direction.length-1][1],0);
			// smokeParticles.add(sphere);
			var eyes = new THREE.Group();
			
			var sphere1 = new THREE.Mesh(
				new THREE.SphereGeometry( white_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0xffffff} )	
			);
			sphere1.position.set(black_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]-black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]-black_eyes_distance))
			

			var sphere2 = new THREE.Mesh(
				new THREE.SphereGeometry( white_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0xffffff} )	
			);
			sphere2.position.set(black_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]+black_eyes_distance), 0.8, black_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]+black_eyes_distance))

			
			var sphere3 = new THREE.Mesh(
				new THREE.SphereGeometry( black_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0x000000} )	
			);
			sphere3.position.set(white_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]-white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]-white_eyes_distance))
			

			var sphere4 = new THREE.Mesh(
				new THREE.SphereGeometry( black_eyes_size, 32, 32 ),
				new THREE.MeshBasicMaterial( {color: 0x000000} )	
			);
			sphere4.position.set(white_jumpout*Math.cos(bot_direction[bot_direction.length-1][1]+white_eyes_distance), 0.8, white_jumpout*Math.sin(bot_direction[bot_direction.length-1][1]+white_eyes_distance))

			
			
			smokeParticles.add(sphere1);
			smokeParticles.add(sphere2);
			smokeParticles.add(sphere3);
			smokeParticles.add(sphere4);


		}
		scene.add(smokeParticles);
		bot.push(smokeParticles);
		
		sd = false;//smoke_directionに一回しか入れないために
	}

})();

