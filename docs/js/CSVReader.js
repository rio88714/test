'use struct';


class CSVReader{

	csvPath;

	constructor(csvPath){
		this.csvPath = csvPath;
	}

	/**
	 * XHRのパターン
	 * 
	 * 指定のURLのデータをテキストで取得する
	 */
	Read(){
		this.csvPath;

		var request = new XMLHttpRequest();
		
		// request.onloadの発火タイミングがwindows.onloadよりも遅いのでレスポンスを使った処理はここに書かざるを得ない？
		request.onload = function(){
			var csv = $.csv.toArrays(request.responseText);
			let csvDicts = MyFunction.ArrayToDictionary(csv);

			let MM = new MyFunction.MapManager("mapid","map-data",csvDicts);
			MM.AddPin("x","y","name","note");
			MM.AddPanButton("botan");
			MM.CreateList();
		};

		request.onerror = function(){
			console.log('error');
		};
		
		// openの第三引数をfalseにすると非同期処理になりsendで直ちに実行され、responseTextに値が格納されるが非推奨らしく警告が出る。
		request.open("GET", this.csvPath, true);

		request.send();

	}

	/**
	 * csv読み込み1
	 * 
	 * jqueryのgetを使って指定したurlのをテキストで取得する。
	 * getの第二引数がfunctionでその引数にtextが入るので、抽出した結果を外に出すのが手間
	 */
	Read1(){
		$.get(
			this.csvPath
			,function(data){
				var csv = $.csv.toArrays(data);
				testtest = csv;
				console.log(data);
				$(csv).each(function(){
				   console.log(this);
				});
				// csv.forEach(element => {
				//     console.log(element);
				// });
			}
			,'text'
		);
	}

}

var aaa = new CSVReader('./data/cole.csv');
// var aaa = new CSVReader('https://drive.google.com/open?id=1Huz2SDJUmB9RQgFQP1C3sHLt1BOAK0z5');

aaa.Read();

