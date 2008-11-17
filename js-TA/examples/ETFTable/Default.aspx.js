/// <reference path="js/ETFTables.TA.js" />
/// <reference path="js/lib/yui/yahoo-dom-event/yahoo-dom-event.js" />

/**
* @author ndavis
*/
var lib = YAHOO, Dom = lib.util.Dom, Event = lib.util.Event, ETFTable = {};
ETFTable.expandedData = {}; ETFTable.tempData = {}; ETFTable.initialData = {};

(function() {
    Event.onDOMReady(function() {

    });
})();

// defer instantiation
Event.addListener(window, "load", function() {

    var myDataTableDeferred = new lib.util.Element('dataTableContainer');

    var layout = new lib.widget.Layout({
        units: [
                { position: 'top', height: 70, body: 'top1', gutter: '0px', collapse: false, resize: false },
                { position: 'center', body: 'center1', gutter: '2px', scroll: false },
				{ position: 'left', body: 'menu', header: '', width: 130, gutter: '2px', scroll: true, collapse: true, animate: true },
				{ position: 'bottom', body: 'footer', height: 36, gutter: '2px', scroll: false, collapse: false }
            ]
    });
    layout.on("resize", function() {
        myDataTableDeferred.set('height', (this.getSizes().center.h - 33) + 'px');
    });
    layout.on("render", function() {
        initDataTable(layout.getSizes().center.h - 33);
    });


    // Point to a URL
    var myDataSource = new lib.util.XHRDataSource("js_handlers/DailyHandler.ashx");
    // Set the responseType as JSON
    myDataSource.responseType = lib.util.DataSource.TYPE_JSON;

    // Define the data schema
    myDataSource.responseSchema = {
        resultsList: "ResultSet.Results", // Dot notation to results array
        fields: ["Ticker", "Closes", "AdjustedClosePrice", "EMA20", "Volume"], // Field names
        metaFields: {                       // optional or "magic" meta
            totalRecords: "ResultSet.TotalRecords",
            sortDirection: "ResultSet.SortDirection",
            sortKey: "ResultSet.SortKey"
        }
    };
    myDataSource.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse, oCallback) {
        // do whatever you want with oParsedResponse.
        // The other arguments are there for reference, in case you need some extra information
        // Whatever you return will be what the DataTable gets
        //return transform(oParsedResponse);

        //return transformRawETFData(oParsedResponse);
        ETFTable.initialData = copy(oParsedResponse);
        ETFTable.expandedData = copy(oParsedResponse);
        var percentComplete;
        ETFTable.expandedData.results = taTransform(function(value, total) {
            percentComplete = (100 * value / total);
        });
        return ETFTable.expandedData;
        //        transform2(0);
        //        var waitIterCounter = 1;
        //        while (!ETFTable.tempData.expandComplete) {
        //            //setTimeout('stillWaiting()', 100);
        //            waitIterCounter = waitIterCounter + 1;
        //        }
        //        waitComplete();
        //        return ETFTable.expandedData;
    };

    var myColumnDefs = [
	        { key: "Ticker", label: "Ticker", sortable: true }
	        , { key: "Last", label: "Last", sortable: true }
			, { key: "Previous", label: "Previous", sortable: true }
	        , { key: "diffEma1Over2", label: "EMA 5/20 %", sortable: true }
            , { key: "diffEma2Over3", label: "EMA 20/80 %", sortable: true }
//            , { key: "PercentEMA15Over45", label: "EMA 15/45 %", sortable: true }
//            , { key: "PercentEMA20Over60", label: "EMA 20/60 %", sortable: true }
//            , { key: "PercentEMA25Over75", label: "EMA 25/75 %", sortable: true }
//            , { key: "PercentEMA30Over90", label: "EMA 30/90 %", sortable: true }
//            , { key: "PercentEMA35Over105", label: "EMA 35/105 %", sortable: true }
//            , { key: "PercentEMA40Over120", label: "EMA 40/120 %", sortable: true }
    //,{key:"Close", label:"Close"}
	    ];

    var initDataTable = function(h) {

        myDataTableDeferred = new lib.widget.DataTable("dataTableContainer", myColumnDefs, myDataSource, {
            scrollable: true,
            height: h + "px",
            width: "99.9%",
            renderLoopSize: 125
        });
    };

    layout.render();

});

function taTransform(progressFn) {
    var data = copy(ETFTable.initialData).results;
    var length = data.length;
    var i = 0;
    var timeoutFreq = 2000;
    var timeoutLength = 0;
    
    (function() {
        var start;
        start = new Date().getTime();
        for (; i < length; i++) {
            var series = data[i].Closes.split(',');
//            with (data[i]) {
                linR5 = TA.LinearReg(series.slice(0, 82), 5);
                //linR10 = TA.LinearReg(series.slice(0, 82), 10);
                linR20 = TA.LinearReg(series.slice(0, 82), 20);
                //linR40 = TA.LinearReg(series.slice(0, 82), 40);
                linR80 = TA.LinearReg(series.slice(0, 82), 80);

                emaOfLinR5 = TA.EMAverage(linR5.slice(0, 25), 3);
                //emaOfLinR10 = TA.EMAverage(linR10.slice(0, 12), 8);
                emaOfLinR20 = TA.EMAverage(linR20.slice(0, 40), 3);
                //emaOfLinR40 = TA.EMAverage(linR40.slice(0, 42), 8);
                emaOfLinR80 = TA.EMAverage(linR80.slice(0, 82), 3);

                data[i].diffEma1Over2 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(emaOfLinR5[0], emaOfLinR20[0]), 3);
                data[i].diffEma2Over3 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(emaOfLinR20[0], emaOfLinR80[0]), 3);
//            }
            if (new Date().getTime() - start > timeoutFreq) {
                i++;
                setTimeout(arguments.callee, timeoutLength);
                break;
            }
        }
        progressFn(i, length);
    })();
    return data;
}

function transformRawETFData(initialData) {

    if (typeof (ETFTable.tempData.initialData) == 'undefined') {
        ETFTable.tempData.initialData = {};
        ETFTable.tempData.expandComplete = false;
        ETFTable.tempData.fastSeries = [];
        ETFTable.tempData.slowSeries = [];
    }

    if (typeof (initialData) == 'object') {
        ETFTable.expandedData = copy(initialData);
        ETFTable.expandedData.results = [];
        ETFTable.initialData = copy(initialData);
        ETFTable.tempData.initialData = copy(initialData);
    }
    else if (typeof (initialData) == 'undefined'
            && typeof (ETFTable.initialData) == 'object') {
        //initialData = ETFTable.tempData.initialData;
    }
    else {
        return;
    }
    
    (function() {

        var start = new Date().getTime();
        var tmpCrossObj = {}, arrClose, fast, slow;
        //for (var i = 0, len = initialData.results.length; i < len; i++) {
        if (ETFTable.tempData.initialData && ETFTable.tempData.initialData.results && ETFTable.tempData.initialData.results.length > 0) {
            var len = ETFTable.tempData.initialData.results.length;
            for (var i = 0; i < len; i++) {
                var row = ETFTable.tempData.initialData.results.shift();

                if (typeof (row) == 'object') {
                    arrClose = row.Closes.split(',');

                    row.Last = arrClose[0];
                    row.Previous = arrClose[1];
                    
                    //EMA 5/15
                    fast = "5"; slow = "15";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast)+3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));
                    
                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);
                    
                    //EMA 10/30
                    fast = "10"; slow = "30";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 15/45
                    fast = "15"; slow = "45";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 20/60
                    fast = "20"; slow = "60";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 25/75
                    fast = "25"; slow = "75";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 30/90
                    fast = "30"; slow = "90";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 35/105
                    fast = "35"; slow = "105";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);

                    //EMA 40/120
                    fast = "40"; slow = "120";
                    ETFTable.tempData.fastSeries = TA.EMAverage(arrClose.slice(0, parseInt(fast) + 3), parseInt(fast));
                    ETFTable.tempData.slowSeries = TA.EMAverage(arrClose.slice(0, parseInt(slow) + 3), parseInt(slow));

                    tmpCrossObj["EMAverageFast"] = ETFTable.tempData.fastSeries[0];
                    tmpCrossObj["EMAverageFast_Prev"] = ETFTable.tempData.fastSeries[1];
                    tmpCrossObj["EMAverageSlow"] = ETFTable.tempData.slowSeries[0];
                    tmpCrossObj["EMAverageSlow_Prev"] = ETFTable.tempData.slowSeries[1];
                    row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
                    row["PercentEMA" + fast + "Over" + slow] = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverageFast - tmpCrossObj.EMAverageSlow) / tmpCrossObj.EMAverageSlow) * 100);
                    
                    ETFTable.expandedData.results.push(row);
                    //if (new Date().getTime() - start > 200) {
                    if (ETFTable.tempData.initialData.results.length > 0) {
                        setTimeout(arguments.callee, 0);
                        //return;
                    }
                }
            }
        }
    })();
    delete (ETFTable.tempData.initialData);
    delete (ETFTable.tempData.expandComplete);
    delete (ETFTable.tempData.fastSeries);
    delete (ETFTable.tempData.slowSeries);
    return ETFTable.expandedData;
}

function transform2(startIdx) {
    var data = ETFTable.initialData, arrClose;
    var row = data.results[startIdx];
    var tmpCrossObj = {};
    var fast, slow;
    if (typeof(ETFTable.tempData.expandedResults) == 'undefined') {
        ETFTable.tempData.expandedResults = [];
        ETFTable.tempData.expandComplete = false;
    }
    if (typeof (row) != 'undefined') {
        arrClose = row.Closes.split(',');

        //EMA 5/15
        fast = "5"; slow = "15";
        ETFTable.tempData.fastSeries = TA.EMAverage(arrClose, parseInt(fast));
        ETFTable.tempData.slowSeries = TA.EMAverage(arrClose, parseInt(slow));

        tmpCrossObj["EMAverage" + fast] = ETFTable.tempData.fastSeries[0];
        tmpCrossObj["EMAverage" + fast + "_Prev"] = ETFTable.tempData.fastSeries[1];
        tmpCrossObj["EMAverage" + slow] = ETFTable.tempData.slowSeries[0];
        tmpCrossObj["EMAverage" + slow + "_Prev"] = ETFTable.tempData.slowSeries[1];
        row["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
        row.PercentEMA5Over15 = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverage5 - tmpCrossObj.EMAverage15) / tmpCrossObj.EMAverage15) * 100);
        ETFTable.tempData.expandedResults.push(row);
        setTimeout(function() { transform2(startIdx + 1) }, 1);
        return;
    }
    ETFTable.expandedData = ETFTable.initialData;
    ETFTable.expandedData.results = ETFTable.tempData.expandedResults;
    delete (ETFTable.tempData.expandedResults);
    ETFTable.tempData.expandComplete = true;
}

function transform(obj) {
    var lst = obj.results, strClose, arrClose;
    for (var i = 0, len = lst.length; i < len; i++) {
        var data = ETFTable.expandedData;
        
        arrClose = lst[i].Closes.split(',');
        lst[i].CloseSeries = arrClose;
        lst[i].Last = arrClose[0];
        lst[i].Previous = arrClose[1];
        
        // EMAs
        var tmpCrossObj = {};
        
        var fast = "5", slow = "15"
        var fastSeries, slowSeries;
        setTimeout(function() { ETFTable.tempData.fastSeries = TA.EMAverage(arrClose, parseInt(fast)) }, 0);
        setTimeout(function() { ETFTable.tempData.slowSeries = TA.EMAverage(arrClose, parseInt(slow)) }, 0);
        fastSeries = ETFTable.tempData.fastSeries;
        slowSeries = ETFTable.tempData.slowSeries;
        tmpCrossObj["EMAverage" + fast] = fastSeries[0];
        tmpCrossObj["EMAverage" + fast + "_Prev"] = fastSeries[1];
        tmpCrossObj["EMAverage" + slow] = slowSeries[0];
        tmpCrossObj["EMAverage" + slow + "_Prev"] = slowSeries[1];
        lst[i]["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
        lst[i].PercentEMA5Over15 = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverage5 - tmpCrossObj.EMAverage15) / tmpCrossObj.EMAverage15) * 100);
//        var percentEMA5Over25_Prev = ((tmpCrossObj.EMAverage5_Prev - tmpCrossObj.EMAverage25_Prev) / tmpCrossObj.EMAverage25_Prev) * 100;
//        if (percentEMA5Over25_Prev <= 0 && lst[i].PercentEMA5Over25 > 0) {
//            lst[i].PercentEMA5Over25 = '<span class="up">' + lst[i].PercentEMA5Over25 + '</span>';
//        }
//        else if (percentEMA5Over25_Prev > 0 && lst[i].PercentEMA5Over25 <= 0) {
//            lst[i].PercentEMA5Over25 = '<span class="down">' + lst[i].PercentEMA5Over25 + '</span>';
//        }
        lst[i].EMA15 = tmpCrossObj.EMAverage15
        lst[i].EMA5 = tmpCrossObj.EMAverage5
        
        var fast = "10", slow = "30"
        var fastSeries, slowSeries;
        setTimeout('fastSeries = TA.EMAverage(arrClose, parseInt(fast))', 0);
        setTimeout('slowSeries = TA.EMAverage(arrClose, parseInt(slow))', 0);
        tmpCrossObj["EMAverage" + fast] = fastSeries[0];
        tmpCrossObj["EMAverage" + fast + "_Prev"] = fastSeries[1];
        tmpCrossObj["EMAverage" + slow] = slowSeries[0];
        tmpCrossObj["EMAverage" + slow + "_Prev"] = slowSeries[1];
        lst[i]["EMAverage" + fast + "CrossoverEMAverage" + slow + "Data"] = tmpCrossObj;
        lst[i].PercentEMA10Over30 = TA.Helpers.roundDecimal(((tmpCrossObj.EMAverage10 - tmpCrossObj.EMAverage30) / tmpCrossObj.EMAverage30) * 100);
        //        var percentEMA5Over25_Prev = ((tmpCrossObj.EMAverage5_Prev - tmpCrossObj.EMAverage25_Prev) / tmpCrossObj.EMAverage25_Prev) * 100;
        //        if (percentEMA5Over25_Prev <= 0 && lst[i].PercentEMA5Over25 > 0) {
        //            lst[i].PercentEMA5Over25 = '<span class="up">' + lst[i].PercentEMA5Over25 + '</span>';
        //        }
        //        else if (percentEMA5Over25_Prev > 0 && lst[i].PercentEMA5Over25 <= 0) {
        //            lst[i].PercentEMA5Over25 = '<span class="down">' + lst[i].PercentEMA5Over25 + '</span>';
        //        }
        lst[i].EMA30 = tmpCrossObj.EMAverage30
        lst[i].EMA10 = tmpCrossObj.EMAverage10

    }
    obj.results = lst;
    return obj;
}

//function returnEval(codeToEval) {
//    return
//}

function stillWaiting() {
    document.getElementById('menu-list').style.display = 'hidden';
}
function waitComplete() {
    document.getElementById('menu-list').style.display = 'block';
}

function copy(obj) {
    return lib.lang.JSON.parse( lib.lang.JSON.stringify( obj ) );
}