<%@ Page Title="" Language="C#" MasterPageFile="~/Main.master" AutoEventWireup="true"
   CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="c1" ContentPlaceHolderID="head" runat="Server">
   <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.6.0/build/container/assets/skins/sam/container.css" />
   <link type="text/css" rel="stylesheet" href="http://yui.yahooapis.com/2.6.0/build/datatable/assets/skins/sam/datatable.css" />
   <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.6.0/build/paginator/assets/skins/sam/paginator.css">
   <!-- Skin CSS files resize.css must load before layout.css -->
   <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.6.0/build/assets/skins/sam/resize.css" />
   <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.6.0/build/assets/skins/sam/layout.css" />

   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/yahoo-dom-event/yahoo-dom-event.js"></script>

   <!-- Source file for Containers -->

   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/container/container-min.js"></script>

</asp:Content>
<asp:Content ID="c2" ContentPlaceHolderID="cont1" runat="Server">
   <div id="waitDialog">
      <div id="waitDialogHeader" class="hd">
         Loading...</div>
      <div id="waitDialogBody" class="bd">
         <span>Please wait while we download lots of raw data and make it useful to you...</span>
         <br /><br />
         <%--<img id="imgProgress" src="http://us.i1.yimg.com/us.yimg.com/i/us/per/gr/gp/rel_interstitial_loading.gif"
            alt="Loading..." />--%>
         <div id="progressContainer">
            <div id="progressbar">
               <div>
               </div>
            </div>
            <span id="percentComplete">0%</span>
         </div>
         <br />
         <span id="spnStatus">Downloading...</span>
      </div>
   </div>
   <div id="center1">
      <div id="dataTableContainer">
      </div>
      <div id="pagerContainer">
      </div>
   </div>
   <div id="menu">
      <%--<div id="menu-list">
         <li>Save Screen</li>
         <li>Add Filter</li>
         <li>Add Column</li>
      </div>--%>
      <%--<img alt="ETF Detail" id="detailImg" src="js/lib/yui/assets/skins/sam/wait.gif" />--%>
      <iframe id="detailFrame" frameborder="0" height="625" width="470" marginheight="0" marginwidth="0" scrolling="no" title="ETF Detail" style="display:none; position:absolute; top:0px; left:0px;"></iframe>
   </div>
</asp:Content>
<asp:Content ID="c3" ContentPlaceHolderID="scripts" runat="Server">

   <script type="text/javascript">
      var lib = YAHOO, Dom = lib.util.Dom, Event = lib.util.Event;
      var ETFTable = {};
      ETFTable.ui = {};

      ETFTable.ui.wait = new lib.widget.Panel("waitDialog",
      {
         fixedcenter: true,
         close: false,
         draggable: false,
         zindex: 4,
         modal: true,
         visible: false
      });
      ETFTable.ui.wait.setHeader(document.getElementById('waitDialogHeader').innerHTML);
      ETFTable.ui.wait.setBody(document.getElementById('waitDialogBody').innerHTML);
      //ETFTable.ui.wait.setHeader('Loading...');
      //ETFTable.ui.wait.setBody('Please wait while we download lots of raw data and make it useful to you...<br /><img src="http://us.i1.yimg.com/us.yimg.com/i/us/per/gr/gp/rel_interstitial_loading.gif" alt="Loading..." />');
      ETFTable.ui.wait.render(document.body);

      function waiting() {
         document.getElementById('pageContainer').style.display = 'none'
         ETFTable.ui.wait.show();
      }
      function setWaitStatus(percentComplete, description) {
         var el = document.getElementById("progressbar").getElementsByTagName('div')[0];
         var percentEl = document.getElementById("percentComplete");
         var statusEl = document.getElementById("spnStatus");
         el.style.width = percentComplete + "%";
         percentEl.innerHTML = percentComplete + "%";
         if (description) {
            statusEl.innerHTML = description;
         }
         if (percentComplete >= 100) {
            percentEl.className = 'complete';
            statusEl.className = 'complete';
         }
      }
      function waitComplete() {
         document.getElementById('pageContainer').style.display = 'block';
         ETFTable.ui.wait.hide();
      }

      ETFTable.formatters = {};
      ETFTable.formatters.myFormatDetailLink = function(elCell, oRecord, oColumn, oData) {
         var jsTemplate = "ETFTable.ui.showDetailFrame('<<TICKER>>');";
         elCell.innerHTML = '<a href="javascript:' + jsTemplate.replace('<<TICKER>>', oRecord.getData("Ticker")) + '" alt="Click for ETF Details">' + oData + '</a>';
         return true;
      }

      ETFTable.dataConfig = {
         list: "Results",
         item: "Item",
         properties: [
           { name: "Ticker", value: "Item.Ticker", allowRemoveCol: false, allowRemoveProp: false, dataType: "string", formatter: ETFTable.formatters.myFormatDetailLink },
           { name: "CloseSeries", value: "Item.Closes.split(',')", allowRemoveProp: false, showCol: false, allowRemoveProp: false },
           { name: "VolumeEMA10", label: "Vol (10 Day Avg)", value: "Item.VolumeEMA10", dataType: "number", formatter: "number" },
           { name: "Last", label: "Price", colGroup: "Last", value: "Item.CloseSeries[0]", dataType: "number" },
           { name: "Date", label: "Date/Time", colGroup: "Last", value: "Item.Date", dataType: "date", formatter: "date" },
           { name: "Perf1", colGroup: "% Performance", label: "1 Day", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[1]).roundFloat()", dataType: "number" },
           { name: "Perf2", colGroup: "% Performance", label: "1 Wk", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[4]).roundFloat()", dataType: "number" },
           { name: "Perf3", colGroup: "% Performance", label: "2 Wk", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[9]).roundFloat()", dataType: "number" },
           { name: "Perf4", colGroup: "% Performance", label: "4 Wk", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[19]).roundFloat()", dataType: "number" },
           { name: "Perf5", colGroup: "% Performance", label: "12 Wk", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[59]).roundFloat()", dataType: "number" },
           { name: "Perf6", colGroup: "% Performance", label: "24 Wk", value: "PercentDiff(Item.CloseSeries[0], Item.CloseSeries[119]).roundFloat()", dataType: "number" },
           { name: "EMA5Series", showCol: false, value: "Item.CloseSeries.slice(0,25).EMAverage(5)" },
           { name: "EMA15Series", showCol: false, value: "Item.CloseSeries.slice(0,35).EMAverage(15)" },
           { name: "EMA45Series", showCol: false, value: "Item.CloseSeries.slice(0,65).EMAverage(45)" },
           { name: "EMA135Series", showCol: false, value: "Item.CloseSeries.slice(0,155).EMAverage(135)" },
           { name: "Cross1", colGroup: "EMA Crossover - % Fast is over Slow", label: "5/15", value: "PercentDiff(Item.EMA5Series[0],Item.EMA15Series[0]).roundFloat()", dataType: "number" },
           { name: "Cross2", colGroup: "EMA Crossover - % Fast is over Slow", label: "15/45", value: "PercentDiff(Item.EMA15Series[0],Item.EMA45Series[0]).roundFloat()", dataType: "number" },
           { name: "Cross3", colGroup: "EMA Crossover - % Fast is over Slow", label: "45/135", value: "PercentDiff(Item.EMA45Series[0],Item.EMA135Series[0]).roundFloat()", dataType: "number" }
         ],
         sort: {by: "VolumeEMA10", byDir: "desc", thenBy: "VolumeEMA10", thenByDir: "desc"},
         filters: [
            "Item.VolumeEMA10 > 1000"
         ]
      };
   </script>

   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/dragdrop/dragdrop-min.js"></script>
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/connection/connection-min.js"></script>
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/datasource/datasource-min.js"></script>
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/element/element-beta-min.js"></script>

   <!-- Optional Animation Support-->
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/animation/animation-min.js"></script>

   <!-- Optional Resize Support -->
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/resize/resize-min.js"></script>

   <!-- Source file for the Layout Manager -->
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/layout/layout-min.js"></script>
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/datatable/datatable-min.js"></script>
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/json/json-min.js"></script>

   <!-- Source File for Paginator -->
   <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/paginator/paginator-min.js"></script>

   <!-- page specific script -->
   <script src="js/js-TA.js" type="text/javascript"></script>
   <script type="text/javascript" src="Default.aspx.js"></script>

</asp:Content>
