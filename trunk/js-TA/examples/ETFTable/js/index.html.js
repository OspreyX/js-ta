// <reference path="js/yui/yahoo/yahoo-debug.js" />
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
	    var myDataSource = new lib.util.XHRDataSource("http://localhost:2702/Nath.YUITest/js_handlers/TableDataTest.ashx");
	    // Set the responseType as JSON
	    myDataSource.responseType = lib.util.DataSource.TYPE_JSON;
		
	    // Define the data schema
	    myDataSource.responseSchema = {
	        resultsList: "ResultSet.Results", // Dot notation to results array
	        fields: ["Ticker","Close","CurPrice","Ema5","Ema20","Ema40","Ema50","Ema100","Volume"], // Field names
	        metaFields: {                       // optional or "magic" meta
	            totalRecords: "ResultSet.TotalRecords"
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
	        ,{key:"Ema5", label:"Ema5", sortable:true}
	        ,{key:"Ema20", label:"Ema20", sortable:true}
			,{key:"Ema40", label:"Ema40", sortable:true}
			,{key:"Ema50", label:"Ema50", sortable:true}
			,{key:"Ema100", label:"Ema100", sortable:true}
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
		arrClose = lst[i].Close.split(',');
		lst[i].CloseSeries = arrClose;
		lst[i].Last = '<span class="up">' + arrClose[0] + '</span>';
		lst[i].Previous = arrClose[1];
	}
	obj.results = lst;
	return obj;
}
