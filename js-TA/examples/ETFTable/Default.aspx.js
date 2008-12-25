/// <reference path="js/ETFTables.TA.js" />
/// <reference path="js/lib/yui/yahoo-dom-event/yahoo-dom-event.js" />
/// <reference path="js/lib/yui/connection/connection.js" />
/// <reference path="js/js-TA.js" />

/**
* @author ndavis
*/

var lib = YAHOO, Dom = lib.util.Dom, Event = lib.util.Event;
if (typeof (ETFTable) == 'undefined') {
    var ETFTable = {};
}
ETFTable.expandedData = {}; ETFTable.tempData = {}; ETFTable.initialData = {};
ETFTable.expandComplete = new lib.util.CustomEvent("expandComplete");

function copy(obj) {
    return lib.lang.JSON.parse(lib.lang.JSON.stringify(obj));
}

//ETFTable.addMethods = function() {
    //extend Array
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

    //Extend number
    Number.prototype.roundFloat = function(n) {
        return TA.Helpers.roundDecimal(this, n);
    };

    //general
    PercentDiff = function(val1, val2) {
        return TA.Helpers.percentDiff(val1, val2)
    };

    //custom sorting
    SignedNumberSort = function(a, b) {
        var va = parseFloat(a), vb = parseFloat(b);
        if (!isFinite(va) ||
        isNaN(va) ||
        typeof (va) == 'undefined' ||
        va == null) {
            va = -9999999.999;
        }
        if (!isFinite(vb) ||
        isNaN(vb) ||
        typeof (vb) == 'undefined' ||
        vb == null) {
            vb = -9999999.999;
        }

        if (va === vb) {
            return 0;
        }
        else if (va < vb) {
            return -1;
        }
        return 1;
    };
    SimpleIntRank = function(a, b, desc) {
        var descFactor = desc ? -1 : 1;
        if (a < b) {
            return -1 * descFactor;
        } else if (a === b) {
            return 0;
        }
        return 1 * descFactor;
    };
//};

    ETFTable.doPreFilter = function(data) {
        var filterStr, filterFunc;
        for (var f = 0; f < ETFTable.dataConfig.filters.length; f++) {
            filterStr = ETFTable.dataConfig.filters[f];
            filterFunc = new Function("Item", "return " + filterStr);
            for (var i = 0; i < data.length; i++) {
                if (!filterFunc(data[i])) {
                    data.splice(i, 1);
                    i = i - 1;
                }
            }
        }
        ETFTable.initialData.Results = data;
    }

ETFTable.doTransform = function(initialData, progressFn, callbackFn) {
    ETFTable.expandedData = copy(initialData);
    var data = ETFTable.expandedData.Results;
    var length = data.length;
    var propsLength = ETFTable.dataConfig.properties.length, prop;
    var i = 0;
    var timeoutFreq = 1000;
    var timeoutLength = 0;
    var callbackCalled = false;

    (function() {
        var start = new Date().getTime();
        var props, toReplace, valFormula, val;
        for (; i < length; i++) {

            for (var iCfg = 0; iCfg < propsLength; iCfg++) {
                prop = ETFTable.dataConfig.properties[iCfg];
                toReplace = new RegExp(ETFTable.dataConfig.item, "gi");
                valFormula = new String(prop.value).replace(toReplace, "data[i]");
                val = eval(valFormula);
                
                data[i][prop.name] = val;
            }

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

ETFTable.doRankings = function(progressFn, callbackFn) {
    var data = ETFTable.expandedData.Results;
    var length = data.length;
    var propsLength = ETFTable.dataConfig.properties.length, prop;
    //var i = 0;
    //var timeoutFreq = 1000;
    //var timeoutLength = 0;
    //var callbackCalled = false;

    //(function() {
    //var start = new Date().getTime();
    //var props, toReplace, valFormula, val;
    //for (; i < length; i++) {

    for (var iCfg = 0; iCfg < propsLength; iCfg++) {
        prop = ETFTable.dataConfig.properties[iCfg];
        if ((prop.showCol && prop.showCol == true) || typeof (prop.showCol) == 'undefined') {
            switch (prop.dataType) {
                case "number":
                    data.sort(function(a, b) {
                        var retSort = SignedNumberSort(a[prop.name], b[prop.name]);
                        if (retSort == 0) {
                            retSort = SimpleIntRank(a.VolumeEMA10, b.VolumeEMA10, true);
                        }
                        return retSort;
                    });
                    break;
                default:
                    data.sort(function(a, b) {
                        var retSort = lib.util.Sort.compare(a[prop.name], b[prop.name]);
                        if (retSort == 0) {
                            retSort = lib.util.Sort.compare(a.VolumeEMA10, b.VolumeEMA10);
                        }
                        return retSort;
                    });
                    break;
            }
            for (var i = 0; i < length; i++) {
                data[i][prop.name + "_Rank"] = i + 1;
            }
        }
    }
    //back to initial sort
    data.sort(function(a, b) {
        var sortCfg = ETFTable.dataConfig.sort;
        return SimpleIntRank(a[sortCfg.by + "_Rank"], b[sortCfg.by + "_Rank"], (sortCfg.byDir == "desc"));
    });
    //}
    //})();
    callbackFn(ETFTable.expandedData);
    return true;
};

Event.onDOMReady(function() {
    waiting();
    var callback =
    {
        success: function(o) {
            ETFTable.initialData = YAHOO.lang.JSON.parse(o.responseText).ResultSet;
            var percentComplete;
            //ETFTable.addMethods();
            ETFTable.doPreFilter(ETFTable.initialData.Results);
            ETFTable.doTransform(
                ETFTable.initialData,
                function(value, total) {
                    percentComplete = (100 * value / total).roundFloat(2);
                    setWaitStatus(percentComplete, "Transforming Data...");
                },
                function(o) {
                    setWaitStatus(99, "Ranking Data...");
                    ETFTable.doRankings(
                        function(value, total) {
                            percentComplete = (100 * value / total).roundFloat(2);
                            setWaitStatus(percentComplete, "Ranking Data...");
                        },
                        function(o) {
                            ETFTable.tempData.expandComplete = true;
                            ETFTable.expandComplete.fire(o);
                        }
                    );
                }
            );
        },
        failure: function(o) { alert("Cannot Connect to Data Source. Please try again later."); },
        argument: ["ARG_DATA"]
    }
    setWaitStatus(90, "Downloading...");
    var sUrl = "js_handlers/DailyHandler.ashx";
    var request = YAHOO.util.Connect.asyncRequest('GET', sUrl, callback, null);
});

// defer instantiation
ETFTable.expandComplete.subscribe(function(evt, args) {

    ETFTable.ui.dataTable = new lib.util.Element('dataTableContainer');

    var layout = new lib.widget.Layout({
        units: [
                { position: 'top', height: 67, body: 'top1', gutter: '0px', collapse: false, resize: false },
                { position: 'center', body: 'center1', gutter: '2px', scroll: false },
				{ position: 'right', body: 'menu', header: '', width: 477, gutter: '2px', scroll: true, collapse: true, animate: false, resize: true}//,
        //{ position: 'bottom', body: 'footer', height: 36, gutter: '2px', scroll: false, collapse: false }
            ]
    });
    layout.on("resize", function() {
        ETFTable.ui.dataTable.set('height', (this.getSizes().center.h - 82) + 'px');
    });
    layout.on("render", function() {
        layout.getUnitByPosition('right').collapse();
        initDataTable(layout.getSizes().center.h - 82);
    });

    ETFTable.ui.showDetailFrame = function(ticker) {
        var WAIT_IMG = "js/lib/yui/assets/skins/sam/wait.gif";
        var YAH_BADGE_SRC = "http://stockcharts.com/h-sc/ui?s=<<TICKER>>&p=D&yr=0&mn=3&dy=0&id=p28717686630&r=5030&cmd=sendchart";
        var el = document.getElementById("detailFrame");
//        var elWait = document.getElementById("detailImg");
//        elWait.style.display = "inline";
        el.src = WAIT_IMG;
        el.style.display = "block";
        layout.getUnitByPosition('right').expand();
        el.src = YAH_BADGE_SRC.replace("<<TICKER>>", ticker);
    };

    // Point to a URL
    ETFTable.ui.dataSource = new YAHOO.util.LocalDataSource(args[0]);
    // Set the responseType as JSON
    ETFTable.ui.dataSource.responseType = lib.util.DataSource.TYPE_JSON;

    // Define the data schema
    ETFTable.ui.dataSource.responseSchema = {
        resultsList: "Results", // Dot notation to results array
        fields: [], // Field names specified later
        metaFields: {                       // optional or "magic" meta
            totalRecords: "ResultSet.TotalRecords",
            sortDirection: "ResultSet.SortDirection",
            sortKey: "ResultSet.SortKey"
        }
    };
    ETFTable.ui.dataSource.doBeforeCallback = function(oRequest, oFullResponse, oParsedResponse, oCallback) {
        // do whatever you want with oParsedResponse.
        // The other arguments are there for reference, in case you need some extra information
        // Whatever you return will be what the DataTable gets
        return oParsedResponse;
    };

    var myColumnDefs = [];
    var propsLength = ETFTable.dataConfig.properties.length, prop, colIdx = 0, dsIdx = 0, groupIdx, groupChildren, dsField;
    for (var i = 0; i < propsLength; i++) {
        prop = ETFTable.dataConfig.properties[i];
        if ((prop.showCol && prop.showCol == true) || typeof (prop.showCol) == 'undefined') {
            if (typeof (prop.colGroup) != 'undefined') {
                groupIdx = colIdx;
                for (var j = 0; j < myColumnDefs.length; j++) {
                    if (typeof (myColumnDefs[j].label) != 'undefined' &&
                            myColumnDefs[j].label == prop.colGroup) {
                        groupIdx = j;
                        break;
                    }
                }
                if (!myColumnDefs[groupIdx] || !myColumnDefs[groupIdx].children) {
                    groupChildren = [];
                    colIdx++;
                } else {
                    groupChildren = myColumnDefs[groupIdx].children;
                }
                groupChildren.push({
                    key: prop.name,
                    label: (typeof (prop.label) == 'undefined' ? prop.name : prop.label),
                    sortable: true,
                    resizeable: true,
                    //sortOptions: { field: prop.name + "_Rank" },
                    sortOptions: {
                        //                        sortFunction:
                        //                            function(a, b, desc) {
                        //                                return SimpleIntRank(a.getData(prop.name + "_Rank"), b.getData(prop.name + "_Rank"), desc);
                        //                            },
                        field: prop.name + "_Rank",
                        defaultDir: YAHOO.widget.DataTable.CLASS_DESC
                    },
                    formatter: prop.formatter
                });
                myColumnDefs[groupIdx] = {
                    label: prop.colGroup,
                    sortable: false,
                    resizeable: true,
                    children: groupChildren
                };
            } else {
                myColumnDefs[colIdx] = {
                    key: prop.name,
                    label: (typeof (prop.label) == 'undefined' ? prop.name : prop.label),
                    sortable: true,
                    resizeable: true,
                    //rankByProp: prop.name + "_Rank",
                    sortOptions: {
                        //                        sortFunction:
                        //                            function(a, b, desc) {
                        //                                return SimpleIntRank(a.getData(prop.name + "_Rank"), b.getData(prop.name + "_Rank"), desc);
                        //                            },
                        field: prop.name + "_Rank",
                        defaultDir: lib.widget.DataTable.CLASS_DESC
                    },
                    formatter: prop.formatter
                };
                colIdx++;
            }
            dsField = { key: prop.name };
            if (prop.dataType) {
                dsField.parser = prop.dataType;
            }
            ETFTable.ui.dataSource.responseSchema.fields[dsIdx] = dsField;
            dsIdx++;
            dsField = { key: prop.name + "_Rank", parser: "number" };
            ETFTable.ui.dataSource.responseSchema.fields[dsIdx] = dsField;
            dsIdx++;
        }
    }

    var initDataTable = function(h) {

        ETFTable.ui.dataTable = new lib.widget.DataTable("dataTableContainer", myColumnDefs, ETFTable.ui.dataSource, {
            paginator: new lib.widget.Paginator({ rowsPerPage: 100, containers: 'pagerContainer' }),
            sortedBy: { key: ETFTable.dataConfig.sort.by, dir: ETFTable.dataConfig.sort.byDir },
            scrollable: true,
            height: h + "px",
            width: "99.9%",
            renderLoopSize: 25
        });
        ETFTable.ui.dataTable.doBeforeSortColumn = function(oColumn, sSortDir) {
            return true;
        };
        waitComplete();
    };

    layout.render();
    //showDetailFrame("uyg");
});


//function returnEval(codeToEval) {
//    return
//}
