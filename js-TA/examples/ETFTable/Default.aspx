<%@ Page Title="" Language="C#" MasterPageFile="~/Main.master" AutoEventWireup="true"
   CodeFile="Default.aspx.cs" Inherits="_Default" %>
<asp:Content ID="c1" ContentPlaceHolderID="head" runat="Server">       
<link type="text/css" rel="stylesheet" href="js/lib/yui/datatable/assets/skins/sam/datatable.css" />
<!-- Skin CSS files resize.css must load before layout.css -->
<link rel="stylesheet" type="text/css" href="js/lib/yui/assets/skins/sam/resize.css" />
<link rel="stylesheet" type="text/css" href="js/lib/yui/assets/skins/sam/layout.css" />	
</asp:Content>
<asp:Content ID="c2" ContentPlaceHolderID="cont1" runat="Server">
   <div id="center1">
      <div id="dataTableContainer">
      </div>
   </div>
   <div id="menu">
      <li>Link One</li>
      <li>Link Two</li>
      <li>Link Three</li>
   </div>
</asp:Content>
<asp:Content ID="c3" ContentPlaceHolderID="scripts" runat="Server">
<script type="text/javascript" src="js/lib/yui/yahoo-dom-event/yahoo-dom-event.js"></script>  
<script type="text/javascript" src="js/lib/yui/dragdrop/dragdrop-min.js"></script>
<script type="text/javascript" src="js/lib/yui/connection/connection-min.js"></script>  
<script type="text/javascript" src="js/lib/yui/datasource/datasource-min.js"></script>  
<script type="text/javascript" src="js/lib/yui/element/element-beta-min.js"></script> 
<!-- Optional Animation Support-->
<script type="text/javascript" src="js/lib/yui/animation/animation-min.js"></script> 
<!-- Optional Resize Support -->
<script type="text/javascript" src="js/lib/yui/resize/resize-min.js"></script>
<!-- Source file for the Layout Manager -->
<script type="text/javascript" src="js/lib/yui/layout/layout-min.js"></script> 
<script type="text/javascript" src="js/lib/yui/datatable/datatable-min.js"></script>  
<script type="text/javascript" src="js/lib/yui/json/json-min.js"></script> 
<!-- page specific script -->
<script src="js/js-TA.js" type="text/javascript"></script>
<script type="text/javascript" src="Default.aspx.js"></script>
</asp:Content>
