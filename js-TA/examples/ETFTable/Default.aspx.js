// <reference path="js/ETFTables.TA.js" />
/**
* @author ndavis
*/

function InitVars() {
    lib = YAHOO;
    Dom = lib.util.Dom,
    Event = lib.util.Event;
}
var lib, Dom, Event;
InitVars();

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
        return transform(oParsedResponse);
    };

    var myColumnDefs = [
	        { key: "Ticker", label: "Ticker", sortable: true }
	        , { key: "Last", label: "Last", sortable: true }
			, { key: "Previous", label: "Previous", sortable: true }
	        , { key: "PercentEMA5Over15", label: "EMA 5/15 %", sortable: true }
	        , { key: "PercentEMA10Over30", label: "EMA 10/30 %", sortable: true }
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

function transform(obj) {
    var lst = obj.results, strClose, arrClose;
    for (var i = 0, len = lst.length; i < len; i++) {
        arrClose = lst[i].Closes.split(',');
        lst[i].CloseSeries = arrClose;
        lst[i].Last = arrClose[0];
        lst[i].Previous = arrClose[1];

        // EMAs
        var tmpCrossObj = {};
        
        var fast = "5", slow = "15"
        var fastSeries = TA.EMAverage(arrClose, parseInt(fast));
        var slowSeries = TA.EMAverage(arrClose, parseInt(slow));
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
        var fastSeries = TA.EMAverage(arrClose, parseInt(fast));
        var slowSeries = TA.EMAverage(arrClose, parseInt(slow));
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
