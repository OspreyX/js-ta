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
        <div id="waitDialogHeader" class="hd">Loading...</div>
        <div id="waitDialogBody" class="bd">
            <span>Please wait while we download lots of raw data and make it useful to you...</span>
            <br /><br />
            <img src="http://us.i1.yimg.com/us.yimg.com/i/us/per/gr/gp/rel_interstitial_loading.gif" alt="Loading..." />
        </div>
    </div>
    <div id="center1">
        <div id="dataTableContainer">
        </div>
        <div id="pagerContainer"></div>
    </div>
    <div id="menu">
        <div id="menu-list">
            <li>Save Screen</li>
            <li>Add Filter</li>
            <li>Add Column</li>
            
        </div>
    </div>
</asp:Content>
<asp:Content ID="c3" ContentPlaceHolderID="scripts" runat="Server">
    
    <script type="text/javascript">
var lib = YAHOO, Dom = lib.util.Dom, Event = lib.util.Event;
var ETFTable = {};
ETFTable.expandedData = {}; ETFTable.tempData = {}; ETFTable.initialData = {}; ETFTable.ui = {};
ETFTable.expandComplete = new lib.util.CustomEvent("expandComplete");
ETFTable.ui.wait = new lib.widget.Panel("waitDialog",
    {
    fixedcenter: true,
    close: false,
    draggable: false,
    zindex: 4,
    modal: true,
    visible: false
    }
);
ETFTable.ui.wait.setHeader(document.getElementById('waitDialogHeader').innerHTML);
ETFTable.ui.wait.setBody(document.getElementById('waitDialogBody').innerHTML);
//ETFTable.ui.wait.setHeader('Loading...');
//ETFTable.ui.wait.setBody('Please wait while we download lots of raw data and make it useful to you...<br /><img src="http://us.i1.yimg.com/us.yimg.com/i/us/per/gr/gp/rel_interstitial_loading.gif" alt="Loading..." />');
ETFTable.ui.wait.render(document.body);

function waiting() {
    document.getElementById('pageContainer').style.display = 'none'
    ETFTable.ui.wait.show();
}
function waitComplete() {
    document.getElementById('pageContainer').style.display = 'block';
    ETFTable.ui.wait.hide();
}
    </script>
    
    <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/dragdrop/dragdrop-min.js"></script>
    <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/connection/connection.js"></script>
    <script type="text/javascript" src="http://yui.yahooapis.com/2.6.0/build/datasource/datasource.js"></script>
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
