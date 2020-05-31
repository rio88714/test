'use struct';

// 名前空間ns1を定義
var MyFunction = MyFunction || {};
(function (global) {
    const _ = MyFunction;
    // 上記までが名前空間の先頭定義

    /**
     * UUID作成
     * 
     * @return {string} - UUID
     */
    _.generateUuid = function () {
        // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
        // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }

    /**
     * 二次元配列の一行目をキーに連想配列を返す
     * 
     * @param {Array} arrayData - 対象の配列
     * @return {Array} - 連想配列の配列
     */
    _.ArrayToDictionary = function (arrayData) {
        let dicts = [];

        for (let i = 1; i < arrayData.length; i++) {
            let tmpDict = {};
            for (let j = 0; j < arrayData[0].length; j++) {
                tmpDict[arrayData[0][j]] = arrayData[i][j];
            }
            dicts.push(tmpDict);
        }
        return dicts;
    }

    /**
     * 
     */
    _.TableCodeCreater = class {

        source = [];
        constructor(source) {
            this.source = source;
        }

        /**
         * コード出力(元がDictionary)
         * 
         * tableタグに追加するコードを作成する
         * 
         * @param {Array} targetColumns - 出力対象のキー
         * @return {string} - tableタグのコード
         */
        GetCodeFromDict(targetColumns = null) {
            let target = [];
            if (targetColumns) {
                let keys = Object.keys(this.source[0]);
                target = targetColumns.map(e1 => targetColumns.find(e2 => e1 == e2));
            } else {
                target = Object.keys(this.source[0]);
            }

            let thCode = "<thead>\r\n";
            thCode += "<tr>";
            target.forEach(e => {
                thCode += "<th>";
                thCode += e;
                thCode += "</th>";
            });
            thCode += "</tr>\r\n";
            thCode += "</thead>\r\n";

            let tbCode = "<tbody>\r\n"
            this.source.forEach(row => {
                tbCode += "<tr>"
                target.forEach(column => {
                    tbCode += "<td>"
                    tbCode += row[column];
                    tbCode += "</td>"
                });
                tbCode += "</tr>\r\n"
            });
            tbCode += "</tbody>\r\n"

            return thCode + tbCode;
        }
    }

    /**
     * 
     */
    _.MapManager = class {
        MapId = "";
        PinListId = "";

        Map = {};

        // 出力対象の列
        OutputColumnNames = [];

        // 出力するデータ
        sourceData = [];

        // privateにしたい
        _panInfo = {};
        _panFuncs = [];
        _viewArea = {};

        constructor(mapId, pinListId, sourceData) {
            this.MapId = mapId;
            this.PinListId = pinListId;
            this.sourceData = $.extend([], sourceData);
            this.OutputColumnNames = Object.keys(sourceData[0]);

            this.Map = L.map(mapId);
            // https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg
            // https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png
            // 
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://opendatacommons.org">OpenStreetMap</a> contributors, '
            }).addTo(this.Map);
        }

        /**
         * 渡されたキーにpanボタンを追加する
         * 
         * @param {String} keyName - 追加するキーの名前
         */
        AddPanButton(keyName) {
            this._panFuncs.panButtonId = [];

            this.sourceData.forEach(e => {
                let uuid = _.generateUuid();
                let tmpFunc = {};

                e[keyName] = "<input id='" + uuid + "' type='button' value='pan' />";

                tmpFunc.func = () => {this.Map.flyTo([e[this._panInfo.xColumnName],e[this._panInfo.yColumnName]],18);};
                tmpFunc.id = uuid;
                this._panFuncs.push(tmpFunc);
            });

            // 新規のキーを出力対象に追加
            this.OutputColumnNames.push(keyName);
        }

        /**
         * 渡された連想配列をもとに地図にピンを設置する
         * 
         * @param {String} xColumnName - x座標が格納されているキーを指定
         * @param {String} yColumnName - y座標が格納されているキーを指定
         * @param {String} titleColumnName - ピンのタイトルにとして表示するデータのキー
         * @param {String} noteColumnName - ピンの詳細として表示するデータのキー
         */
        AddPin(xColumnName, yColumnName, titleColumnName, noteColumnName) {
            this.sourceData.forEach(e => {
                let marker = L.marker([e[xColumnName], e[yColumnName]]).addTo(this.Map);
                marker.bindPopup("<p>" + e[titleColumnName] + "</p><p>" + e[noteColumnName] + "</p>");
            });
            this._panInfo.xColumnName = xColumnName;
            this._panInfo.yColumnName = yColumnName;
            this._panInfo.titleColumnName = titleColumnName;
            this._panInfo.noteColumnName = noteColumnName;

            let point = [];
            point.push(this.sourceData.reduce((preV,currentV) => Math.max(preV,currentV[xColumnName]) ,0));
            point.push(this.sourceData.reduce((preV,currentV) => Math.max(preV,currentV[yColumnName]) ,0));

            this._viewArea.point1 = point;

            point = [];
            point.push(this.sourceData.reduce((preV,currentV) => Math.min(preV,currentV[xColumnName]) ,999));
            point.push(this.sourceData.reduce((preV,currentV) => Math.min(preV,currentV[yColumnName]) ,999));

            this._viewArea.point2 = point;
        }

        /**
         * HTML要素に追加する
         */
        CreateList() {
            let tcc = new _.TableCodeCreater(this.sourceData);
            let code = tcc.GetCodeFromDict(this.OutputColumnNames)

            $("#" + this.PinListId).append(code);

            this._panFuncs.forEach(e => {
                document.getElementById(e.id).addEventListener("click",e.func);
            });

            let bounds = L.latLngBounds(this._viewArea.point1, this._viewArea.point2);    
            this.Map.fitBounds(bounds);

        }

    }

}(this));

if (typeof module !== 'undefined') {
    module.exports = ns1;
}
