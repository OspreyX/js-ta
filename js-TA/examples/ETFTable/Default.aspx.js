/// <reference path="js/ETFTables.TA.js" />
/// <reference path="js/lib/yui/yahoo-dom-event/yahoo-dom-event.js" />
/// <reference path="js/lib/yui/connection/connection.js" />

/**
* @author ndavis
*/

var lib = YAHOO, Dom = lib.util.Dom, Event = lib.util.Event;
function copy(obj) {
    return lib.lang.JSON.parse(lib.lang.JSON.stringify(obj));
}

ETFTable.addArrayMethods = function() {
    Array.prototype.Sum = function(period) {
        return TA.Sum(this, period);
    };
    Array.prototype.SMAverage = function(period) {
        return TA.SMAverage(this, period);
    };
    Array.prototype.EMAverage = function(period) {
        return TA.EMAverage(this, period);
    };
    Array.prototype.LinearReg = function(period) {
        return TA.LinearReg(this, period);
    };
    Array.prototype.Roc = function(period) {
        return TA.Roc(this, period);
    };
};

ETFTable.dataConfig = {
    list: "Results",
    properties: [
        { name: "Ticker", value: "Ticker", allowRemoveCol: false, allowRemoveProp: false },
        { name: "CloseSeries", value: "Closes.split(',')", showCol: false, allowRemoveProp: false },
        { name: "Last", value: "CloseSeries[0]" },
        { name: "Previous", value: "CloseSeries[1]" }//,
        //{ name: "EMA5overEMA20Data", value: "CreateCrossoverData(CloseSeries.EMAverage(5), CloseSeries.EMAverage(20))", formatter: ETFTable.formatters.formatCrossover }
    ]
};

ETFTable.doTransform = function(initialData, config, progressFn, callbackFn) {
    ETFTable.expandedData = copy(initialData)
    var data = ETFTable.expandedData.Results;
    var length = data.length;
    var i = 0;
    var timeoutFreq = 2000;
    var timeoutLength = 0;
    var callbackCalled = false;

    (function() {
        var start;
        start = new Date().getTime();
        for (; i < length; i++) {
            var series = data[i].Closes.split(',');
            ema5 = TA.EMAverage(series.slice(0, 25), 5);
            ema20 = TA.EMAverage(series.slice(0, 40), 20);
            ema40 = TA.EMAverage(series.slice(0, 60), 40);
            data[i].diffEma1Over2 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(ema5[0], ema20[0]), 2);
            data[i].diffEma2Over3 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(ema20[0], ema40[0]), 2);
            
            ETFTable.expandedData.Results[i] = data[i];
            if (new Date().getTime() - start > timeoutFreq) {
                i++;
                setTimeout(arguments.callee, timeoutLength);
                break;
            }
        }
        progressFn(i, length);
        if (i >= length && callbackCalled == false) {
            callbackFn(ETFTable.expandedData);
            callbackCalled = true;
        }
    })();
    return true;
};

Event.onDOMReady(function() {
    waiting();
    var callback =
    {
        success: function(o) {
            ETFTable.initialData = YAHOO.lang.JSON.parse(o.responseText).ResultSet;
            var percentComplete;
            ETFTable.addArrayMethods();
            ETFTable.doTransform(
                ETFTable.initialData,
                ETFTable.dataConfig,
                function(value, total) {
                    percentComplete = (100 * value / total);
                },
                function(o) {
                    ETFTable.tempData.expandComplete = true;
                    ETFTable.expandComplete.fire(o);
                });
        },
        failure: function(o) { alert("Cannot Connect to Data Source. Please try again later."); },
        argument: ["ARG_DATA"]
    }
    var sUrl = "js_handlers/DailyHandler.ashx";
    var request = YAHOO.util.Connect.asyncRequest('GET', sUrl, callback, null);
});

// defer instantiation
ETFTable.expandComplete.subscribe(function(evt, args) {

    var myDataTableDeferred = new lib.util.Element('dataTableContainer');

    var layout = new lib.widget.Layout({
        units: [
                { position: 'top', height: 70, body: 'top1', gutter: '0px', collapse: false, resize: false },
                { position: 'center', body: 'center1', gutter: '2px', scroll: false },
				{ position: 'left', body: 'menu', header: '', width: 130, gutter: '2px', scroll: true, collapse: true, animate: false },
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
    var myDataSource = new YAHOO.util.LocalDataSource(args[0]);
    // Set the responseType as JSON
    myDataSource.responseType = lib.util.DataSource.TYPE_JSON;

    // Define the data schema
    myDataSource.responseSchema = {
        resultsList: "Results", // Dot notation to results array
        fields: ["Ticker", "Last", "Previous", "AdjustedClosePrice", "diffEma1Over2", "diffEma2Over3", "Volume"], // Field names
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

        //waitComplete();
        return oParsedResponse;
    };

    var myColumnDefs = [
	        { key: "Ticker", label: "Ticker", sortable: true }
	        , { key: "Last", label: "Last", sortable: true }
			, { key: "Previous", label: "Previous", sortable: true }
	        , { key: "diffEma1Over2", label: "EMA 5/20 %", sortable: true }
            , { key: "diffEma2Over3", label: "EMA 20/40 %", sortable: true }
	    ];

    var initDataTable = function(h) {

        myDataTableDeferred = new lib.widget.DataTable("dataTableContainer", myColumnDefs, myDataSource, {
            paginator: new lib.widget.Paginator({ rowsPerPage: 100 }),
            scrollable: true,
            height: h + "px",
            width: "99.9%",
            renderLoopSize: 25
        });
    };

    layout.render();
    waitComplete();
});

function taTransform(initialData, config, progressFn, callbackFn) {
    ETFTable.expandedData = copy(ETFTable.initialData)
    var data = ETFTable.expandedData.Results;
    var length = data.length;
    var i = 0;
    var timeoutFreq = 2000;
    var timeoutLength = 0;
    var callbackCalled = false;
    
    (function() {
        var start;
        start = new Date().getTime();
        for (; i < length; i++) {
            var series = data[i].Closes.split(',');
            //            with (data[i]) {
            //linR5 = TA.LinearReg(series.slice(0, 82), 5);
            //linR10 = TA.LinearReg(series.slice(0, 82), 10);
            //linR20 = TA.LinearReg(series.slice(0, 82), 20);
            //linR40 = TA.LinearReg(series.slice(0, 82), 40);
            //linR80 = TA.LinearReg(series.slice(0, 82), 80);

            emaOfLinR5 = TA.EMAverage(series.slice(0, 25), 5);
            //emaOfLinR10 = TA.EMAverage(linR10.slice(0, 12), 8);
            emaOfLinR20 = TA.EMAverage(series.slice(0, 40), 20);
            emaOfLinR40 = TA.EMAverage(series.slice(0, 60), 40);
            //emaOfLinR80 = TA.EMAverage(linR80.slice(0, 82), 3);

            data[i].diffEma1Over2 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(emaOfLinR5[0], emaOfLinR20[0]), 2);
            data[i].diffEma2Over3 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(emaOfLinR20[0], emaOfLinR40[0]), 2);
            //            }
            ETFTable.expandedData.Results[i] = data[i];
            if (new Date().getTime() - start > timeoutFreq) {
                i++;
                setTimeout(arguments.callee, timeoutLength);
                break;
            }
        }
        progressFn(i, length);
        if (i >= length && callbackCalled == false) {
            callbackFn(ETFTable.expandedData);
            callbackCalled = true;
        }
    })();
    return true;
}


//function returnEval(codeToEval) {
//    return
//}
