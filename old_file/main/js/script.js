

$(function() {
	var video = document.getElementById('video');
	
	//idがsecond, second-2, thirdの要素は最初非表示にしておく
	$("#second, #second-2, #third").hide();
	
	//「スタート！」（#firstの中の.start）をクリックした時の処理
	$("#first .start").on("click", function(e) {
		e.preventDefault();
		//#firstを非表示にして、＃secondを表示、そしてstep2()を実行
		$("#first").hide();
		$("#second").show();
		step2();
	});
});

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
				video.srcObject = stream;
				video.onloadedmetadata = function(e) {
				video.play();
			}
		});
	}
	
	//「撮影」（#second .record）をクリックした時の処理
	$("#second .record").on("click", function(e) {
		e.preventDefault();
		//#second-1を非表示にして、＃second-2を表示
		$("#second-1").hide();
		$("#second-2").show();
		//ビデオを一時停止
		video.pause();
		//step3()を実行
		step3();
	});
}

//3段階目の処理（感情分析）
function step3() {
	setTimeout(async () => {
		const detections = await faceapi.detectAllFaces(video,
		new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
		//取得された感情のJSONを文字列にして、#second-2 .parameterに表示
		//detections[0].expressionsは、JSONの解析の仕方で必要なデータを取得して、表示する必要があります
		const jsonExpressions = JSON.stringify(detections[0].expressions);
		const objectExpressions = JSON.parse(jsonExpressions);
		//黄色
		const neutral = objectExpressions.neutral;
		//ピンク
		const happy = objectExpressions.happy;
		//青
		const sad = objectExpressions.sad;
		//赤
		const angry = objectExpressions.angry;
		//緑
		const fearful = objectExpressions.fearful;
		//紫
		const disgusted = objectExpressions.disgusted;
		//オレンジ
		const surprised = objectExpressions.surprised;
		var emotionalArray = {neutral,happy,sad,angry,fearful,disgusted,surprised};
		var Max = emotionalArray[0];
		var MaxIndex = 0
		for(var i = 1 ; i < emotionalArray.length; i++){
			if(Max < data[i]){
				Max = data[i];
				MaxIndex = i;
			}
		}
		var resultColor = 0;
		switch(MaxIndex){
			case 0:
				resultColor = "黄色";
				break;
			case 1:
				resultColor = "ピンク";
				break;
			case 2:
				resultColor = "青";
			case 3:
				resultColor = "赤";
				break;
			case 4:
				resultColor = "緑";
				break;
			case 5:
				resultColor = "紫";
			case 6:
				resultColor = "オレンジ";
		}
		$("#second-2 .parameter").append(JSON.stringify(detections[0].expressions)　+  "→"　+ resultColor);
		// console.log(typeof(detections[0].expressions));
		// console.log(typeof(JSON.stringify(detections[0].expressions)));

	}, 10);
	
	//「使用」（#second-2 .use）をクリックした時の処理
	$("#second-2 .use").on("click", function(e) {
		e.preventDefault();
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
		$("#second-2 .parameter").empty();
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