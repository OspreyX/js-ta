/// <reference path="js/ETFTables.TA.js" />
/// <reference path="js/lib/yui/yahoo-dom-event/yahoo-dom-event.js" />
/// <reference path="js/lib/yui/connection/connection.js" />
/// <reference path="js/js-TA.js" />

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
        //{ name: "DiffEma1Over2", value: "CreateCrossoverData(CloseSeries.EMAverage(5), CloseSeries.EMAverage(20))", formatter: ETFTable.formatters.formatCrossover }
    ]
};

ETFTable.doTransform = function(initialData, config, progressFn, callbackFn) {
    ETFTable.expandedData = copy(initialData)
    var data = ETFTable.expandedData.Results;
    var length = data.length;
    var propsLength = ETFTable.dataConfig.properties.length, prop;
    var i = 0;
    var timeoutFreq = 2000;
    var timeoutLength = 0;
    var callbackCalled = false;

    (function() {
        var start = new Date().getTime();
        var props
        for (; i < length; i++) {

            for (var iCfg = 0; iCfg < propsLength; iCfg++) {
                prop = ETFTable.dataConfig.properties[iCfg];
                data[i][prop.name] = eval("data[i]." + prop.value);
            }

//            var series = data[i].Closes.split(',');
//            data[i].Last = series[0];
//            data[i].Perf1 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(series[0], series[1]), 2);
//            data[i].Perf2 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(series[0], series[4]), 2);
//            data[i].Perf3 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(series[0], series[19]), 2);
//            data[i].Perf4 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(series[0], series[59]), 2);
//            data[i].Perf5 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(series[0], series[119]), 2);

//            ema5 = TA.EMAverage(series.slice(0, 25), 5);
//            ema20 = TA.EMAverage(series.slice(0, 40), 20);
//            ema50 = TA.EMAverage(series.slice(0, 70), 50);
//            ema120 = TA.EMAverage(series.slice(0, 140), 120);
//            data[i].DiffEma1Over2 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(ema5[0], ema20[0]), 2);
//            data[i].DiffEma2Over3 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(ema20[0], ema50[0]), 2);
//            data[i].DiffEma3Over4 = TA.Helpers.roundDecimal(TA.Helpers.percentDiff(ema50[0], ema120[0]), 2);

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
                { position: 'top', height: 71, body: 'top1', gutter: '0px', collapse: false, resize: false },
                { position: 'center', body: 'center1', gutter: '2px', scroll: false },
				{ position: 'left', body: 'menu', header: '', width: 130, gutter: '2px', scroll: true, collapse: true, animate: false, resize: true },
				{ position: 'bottom', body: 'footer', height: 36, gutter: '2px', scroll: false, collapse: false }
            ]
    });
    layout.on("resize", function() {
        myDataTableDeferred.set('height', (this.getSizes().center.h - 57) + 'px');
    });
    layout.on("render", function() {
        initDataTable(layout.getSizes().center.h - 57);
    });


    // Point to a URL
    var myDataSource = new YAHOO.util.LocalDataSource(args[0]);
    // Set the responseType as JSON
    myDataSource.responseType = lib.util.DataSource.TYPE_JSON;

    // Define the data schema
    myDataSource.responseSchema = {
        resultsList: "Results", // Dot notation to results array
        fields: [], // Field names
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

    //    var myColumnDefs = [
    //	        { key: "Ticker", label: "Ticker", sortable: true }
    //	        , { key: "Last", label: "Last", sortable: true }
    //			, { key: "Perf1", label: "1 Day % Perf", sortable: true }
    //			, { key: "Perf2", label: "1 Week % Perf", sortable: true }
    //			, { key: "Perf3", label: "4 Week % Perf", sortable: true }
    //			, { key: "Perf4", label: "12 Week % Perf", sortable: true }
    //			, { key: "Perf5", label: "24 Week % Perf", sortable: true }
    //	        , { key: "DiffEma1Over2", label: "EMA 5/20 %", sortable: true }
    //            , { key: "DiffEma2Over3", label: "EMA 20/50 %", sortable: true }
    //            , { key: "DiffEma3Over4", label: "EMA 50/120 %", sortable: true }
    //            , { key: "Volume", label: "Volume", sortable: true }
    //	    ];

    var myColumnDefs = [];
    var propsLength = ETFTable.dataConfig.properties.length, prop, ii = 0;
    for (var i = 0; i < propsLength; i++) {
        prop = ETFTable.dataConfig.properties[i];
        if ((prop.showCol && prop.showCol == true) || typeof (prop.showCol) == 'undefined') {
            myColumnDefs[ii] = { key: prop.name, label: prop.name, sortable: true };
            myDataSource.responseSchema.fields[ii] = prop.name;
            ii++;
        }
    }

    var initDataTable = function(h) {

        myDataTableDeferred = new lib.widget.DataTable("dataTableContainer", myColumnDefs, myDataSource, {
            paginator: new lib.widget.Paginator({ rowsPerPage: 100, containers: 'pagerContainer' }),
            scrollable: true,
            height: h + "px",
            width: "99.9%",
            renderLoopSize: 25
        });
        waitComplete();
    };

    layout.render();
});


//function returnEval(codeToEval) {
//    return
//}
