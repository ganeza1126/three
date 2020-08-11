

$(function() {
	var video = document.getElementById('video');
	
	//idがfirst, second, second-2, thirdの要素は最初非表示にしておく
	$("#first, #second, #second-2, #third, #fourth").hide();
	
	//「スタート！」（#firstの中の.start）をクリックした時の処理
	$("#zero .start").on("click", function(e) {
		e.preventDefault();
		//#firstを非表示にして、＃secondを表示、そしてstep2()を実行
		$("#zero").hide();
		$("#first").show();
		step1();
	});
});

function step1() {
	//「スタート！」（#firstの中の.start）をクリックした時の処理
	$("#first .next").on("click", function(e) {
		e.preventDefault();
		//#firstを非表示にしてそしてstep2()を実行
		$("#first").hide();
		step2();
	});
	$("#first .not").on("click", function(e) {
		e.preventDefault();
		//#firstを非表示にしてそしてstep2()を実行
		$("#first").hide();
		step4();
	});
}

//2段階目の処理（撮影画面）
function step2() {
	Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
		faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
		faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
		faceapi.nets.faceExpressionNet.loadFromUri('./models')
	]).then(startVideo)
	
	//ビデオ表示の部分多少変えました
	function startVideo(){
		navigator.mediaDevices.getUserMedia(
			{video: {}},
			stream => video.srcObject = stream,
			err => console.error(err)
			).then((stream) => {
				//＃secondを表示
				$("#second").show();
				video.srcObject = stream;
				video.onloadedmetadata = function(e) {
					video.play();
				}
			}) .catch((err) => {
				//#firstを非表示にして
				$("#first").hide();
				//step4()を実行
				step4();
			});
	}
	
	//「撮影」（#second .record）をクリックした時の処理
	$("#second .record").on("click", function(e) {
		e.preventDefault();
		//#second-1を非表示にして
		$("#second-1").hide();
		//ビデオを一時停止
		video.pause();
		//step3()を実行
		step3();
	});
}

var resultColorH = 0;
var resultColorS = 0;
var resultPercentage = 0;
var resultColor = 0;
var resultExpression = 0;

//3段階目の処理（感情分析）
function step3() {
	setTimeout(async () => {
		const detections = await faceapi.detectAllFaces(video,
		new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
		//＃second-2を表示
		$("#second-2").show();
		$("#second-2 .use").show();
		//取得された感情のJSONを文字列にして、#second-2 .parameterに表示
		//detections[0].expressionsは、JSONの解析の仕方で必要なデータを取得して、表示する必要があります
		console.log(detections.length)
		if (detections.length > 0) {
			const jsonExpressions = JSON.stringify(detections[0].expressions);
			const objectExpressions = JSON.parse(jsonExpressions);
			//緑//h=90
			const neutral = objectExpressions.neutral;
			//ピンク//h=320
			const happy = objectExpressions.happy;
			//水色//h=180
			const sad = objectExpressions.sad;
			//赤系//h=0
			const angry = objectExpressions.angry;
			//紫//h=280
			const fearful = objectExpressions.fearful;
			//青//h=240
			const disgusted = objectExpressions.disgusted;
			//オレンジ、黄色//h=20
			const surprised = objectExpressions.surprised;
			let emotionalArray = [neutral,happy,sad,angry,fearful,disgusted,surprised];
			//neutralは使用せず、それ以外で最大の割合の感情を使用するため、indexは1から！！
			let Max = emotionalArray[1];
			let MaxIndex = 1;
			for(let i = 2 ; i < emotionalArray.length; i++){
				if(Max < emotionalArray[i]){
					Max = emotionalArray[i];
					MaxIndex = i;
				}
			}
			console.log(Max);
			console.log(MaxIndex);
			//hsvのsの値はパーセンテージが少なくても色が出るように、最低値50に設定
			resultColorS = 50 + 50*Max;
			resultPercentage = String(Math.round(Max*100)) + "%";
			console.log(resultPercentage);
			switch(MaxIndex){
				case 0:
					resultColorH = 90
					resultColor = "緑"
					resultExpression = "中立"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("greenText");
					$("#second-2 .yourEmo").attr({src: "images/emo_green.png"});
					break;
				case 1:
					resultColorH = 320
					resultColor = "ピンク"
					resultExpression = "喜び"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("pinkText");
					$("#second-2 .yourEmo").attr({src: "images/emo_pink.png"});
					break;
				case 2:
					resultColorH = 180
					resultColor = "水色"
					resultExpression = "悲しみ"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("skyBlueText");
					$("#second-2 .yourEmo").attr({src: "images/emo_skyblue.png"});
					break;
				case 3:
					resultColorH = 0
					resultColor = "赤"
					resultExpression = "怒り"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("redText");
					$("#second-2 .yourEmo").attr({src: "images/emo_red.png"});
					break;
				case 4:
					resultColorH = 280
					resultColor = "紫"
					resultExpression = "恐れ"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("purpleText");
					$("#second-2 .yourEmo").attr({src: "images/emo_purple.png"});
					break;
				case 5:
					resultColorH = 240
					resultColor = "青"
					resultExpression = "嫌悪"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("blueText");
					$("#second-2 .yourEmo").attr({src: "images/emo_blue.png"});
					break;
				case 6:
					resultColorH = 20
					resultColor = "オレンジ"
					resultExpression = "驚き"
					$("#second-2 .resultPercentage, #second-2 .resultColor, #second-2 .resultExpression").addClass("orangeText");
					$("#second-2 .yourEmo").attr({src: "images/emo_orange.png"});
					break;
			}
			$("#second-2 .resultExpression").html(resultExpression);
			$("#second-2 .resultColor").html(resultColor);
			$("#second-2 .resultPercentage").html(resultPercentage);
	
			// console.log(typeof(detections[0].expressions));
			// console.log(typeof(JSON.stringify(detections[0].expressions)));
		//顔のデータが取得されなかったらこっち
		} else {
			$("#second-2 .resultPercentage").html("読み取れなかったので、明るいところで試してもらうか、<br>オーバーに感情を表現してみてください");
			$("#second-2 .use").hide();
		}

	}, 10);
	
	//「使用」（#second-2 .use）をクリックした時の処理
	$("#second-2 .use").on("click", function(e) {
		e.preventDefault();
		$("#second").hide();
		step5();
		//空間移動の処理
	});
	
	//「取り直し」（#second-2 .retry）をクリックした時の処理
	$("#second-2 .retry").on("click", function(e) {
		e.preventDefault();
		//#second-1を表示して、＃second-2を非表示
		$("#second-1").show();
		$("#second-2").hide();
		//ビデオを再生
		video.play();
		//JSONを表示していた#second-2 .parameterを空っぽに
		$("#second-2 .resultExpression").empty();
		$("#second-2 .resultColor").empty();
		$("#second-2 .resultPercentage").empty();
	});

//多くは顔の描画に関する処理だったので省きました。
//必要でしたら追加してください
/*	canvas = faceapi.createCanvasFromMedia(video);
	console.log(document.querySelector("#third"));
	document.querySelector("#third").append(canvas)
	const displaySize = {width: video.width, height: video.height}
	faceapi.matchDimensions(canvas, displaySize)
	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(video,
		new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
		console.log(detections)
		const resizedDetections = faceapi.resizeResults(detections,displaySize)
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
		faceapi.draw.drawDetections(canvas, resizedDetections)
		faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
		faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
	}, 100);*/
}

//カメラ使用を拒否された時の処理
function step4() {
	$("#third").show();
	$("#third .useTwo").hide();
	//ラジオボタンが押されたら、決定ボタンが出る
	$("#third input[name='color']").on("change", function() {
		$("#third .useTwo").show();
	});
	//決定を押したら、ラジオボタンに対応した色の名前が取得される
	$("#third .useTwo").on("click", function(e) {
		e.preventDefault();
		let color = $("#third input[name='color']:checked").val();
		console.log(color);
		// let resultColorH = 0;
		// let resultColorS = 0;
		// let resultPercentage = 0;
		//色別のそれぞれの値を設定
		switch(color){
			case "green":
				resultColorH = 90;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "緑"
				resultExpression = "中立"
				break;
			case "pink":
				resultColorH = 320;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "ピンク"
				resultExpression = "喜び"
				break;
			case "skyblue":
				resultColorH = 180;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "水色"
				resultExpression = "悲しみ"
				break;
			case "red":
				resultColorH = 0;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "赤"
				resultExpression = "怒り"
				break;
			case "purple":
				resultColorH = 280;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "紫"
				resultExpression = "恐れ"
				break;
			case "blue":
				resultColorH = 240;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "青"
				resultExpression = "嫌悪"
				break;
			case "orange":
				resultColorH = 20;
				resultColorS = 100;
				resultPercentage = 100;
				resultColor = "オレンジ"
				resultExpression = "驚き"
				break;
		}
		$("#third").hide();
		step5();
		//空間移動の処理
	});
}

function step5() {
	$("#fourth").show();
	$("#fourth .link").on("click", function(e) {
		e.preventDefault();
		location.href = "world/index.html?colorH=" + resultColorH + "&colorS=" + resultColorS + "&percentage=" + resultPercentage + "$color=" + resultColor + "$expression=" + resultExpression ;
	});
}













