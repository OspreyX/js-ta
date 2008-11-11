// <reference path="js/ETFTables.TA.js" />
/**
 * @author ndavis
 */

function InitVars(){
    lib = YAHOO;
	Dom = lib.util.Dom,
    Event = lib.util.Event;
}
var lib, Dom, Event;
InitVars();

(function() {
    
    Event.onDOMReady(function() {
        
		var myDataTableDeferred = new lib.util.Element('dataTableContainer');
		
		// Point to a URL
	    var myDataSource = new lib.util.XHRDataSource("js_handlers/DailyHandler.ashx");
	    // Set the responseType as JSON
	    myDataSource.responseType = lib.util.DataSource.TYPE_JSON;
		
	    // Define the data schema
	    myDataSource.responseSchema = {
	        resultsList: "ResultSet.Results", // Dot notation to results array
	        fields: ["Ticker","Closes","AdjustedClosePrice","EMA20","Volume"], // Field names
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
	        {key:"Ticker", label:"Ticker", sortable:true}
	        ,{key:"Last", label:"Last", sortable:true}
			,{key:"Previous", label:"Previous", sortable:true}
	        ,{key:"EMA20", label:"EMA20", sortable:true}
	        //,{key:"Close", label:"Close"}
	    ];
	    
		var initDataTable = function(h){
			
			myDataTableDeferred = new lib.widget.DataTable("dataTableContainer", myColumnDefs, myDataSource, {
				scrollable: true,
				height: h + "px",
				width: "99.9%",
				renderLoopSize: 125
			});
		};
		
		var layout = new lib.widget.Layout({
            units: [
                { position: 'top', height: 70, body: 'top1', gutter: '0px', collapse: false, resize: false },
                { position: 'center', body: 'center1', gutter: '2px', scroll: false },
				{ position: 'left', body: 'menu', header: '', width: 130, gutter: '2px', scroll: true, collapse: true, animate: true },
				{ position: 'bottom', body: 'footer', height: 36, gutter: '2px', scroll: false, collapse: false}
            ]
        });
		layout.on("resize", function() {
			myDataTableDeferred.set('height', (this.getSizes().center.h - 34) + 'px');
		});
		layout.on("render", function() {
			initDataTable(layout.getSizes().center.h - 34);
		});
        layout.render();
		
    });
})();

// defer instantiation
//lib.util.Event.addListener(window, "load", function() {
	
//});

function transform(obj) {
	var lst = obj.results, strClose, arrClose;
	for (var i=0,len=lst.length; i < len; i++) {
		arrClose = lst[i].Closes.split(',');
		lst[i].CloseSeries = arrClose;
		lst[i].Last = '<span class="up">' + arrClose[0] + '</span>';
		lst[i].Previous = arrClose[1];

		// EMAs
		var ema20Series = TA.EMAverage(arrClose, 20);
		lst[i].EMA20 = ema20Series[0];
		lst[i].EMA20_Previous = ema20Series[1];
	}
	obj.results = lst;
	return obj;
}
