<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
   <title>Untitled Page</title>
</head>
<body>
   <form id="form1" runat="server">
   <asp:ScriptManager ID="scriptMan" runat="server" EnablePartialRendering="false" EnableScriptGlobalization="false"
      EnableScriptLocalization="false" />
   <p>
      <asp:TextBox ID="txtSymbolsToLoad" runat="server" Width="389px" Height="220px" TextMode="MultiLine"></asp:TextBox>
      <br />
      <asp:Button ID="txtDownload" runat="server" OnClick="txtDownload_Click" Text="Load From Download To DB"
         Width="200px" />
      &nbsp;
      <asp:Button ID="btnClearAll" runat="server" OnClick="btnClearAll_Click" Text="Clear All Tickers"
         Width="200px" />
      &nbsp;
      <asp:Button ID="btnCreateCommaSepList" runat="server" OnClick="btnCreateCommaSepList_Click"
         Text="Create Comma List" Width="200px" />
      <br />
   </p>
   <div>
      <span id="spnTextOutput" runat="server" style="width:99%;"></span>
      <asp:GridView ID="GridView1" runat="server" AutoGenerateColumns="False" AllowSorting="true"
         EmptyDataText="There are no data records to display.">
         <Columns>
            <%--<asp:BoundField DataField="LinReg4" HeaderText="LinReg(4)" SortExpression="LinReg4" />--%>
            <asp:BoundField DataField="Ticker" HeaderText="Ticker" SortExpression="Ticker" />
            <asp:BoundField DataField="Date" HeaderText="Date" SortExpression="Date" />
            <asp:BoundField DataField="OpenPrice" HeaderText="OpenPrice" SortExpression="OpenPrice" />
            <asp:BoundField DataField="HighPrice" HeaderText="HighPrice" SortExpression="HighPrice" />
            <asp:BoundField DataField="LowPrice" HeaderText="LowPrice" SortExpression="LowPrice" />
            <asp:BoundField DataField="Closes" HeaderText="Closes" SortExpression="Closes" />
            <asp:BoundField DataField="Volume" HeaderText="Volume" SortExpression="Volume" />
            <%--<asp:BoundField DataField="EMA10" HeaderText="EMA(10)" SortExpression="EMA10" />--%>
            <%--<asp:BoundField DataField="LinReg10" HeaderText="LinReg(10)" SortExpression="LinReg10" />
                <asp:BoundField DataField="LinReg4" HeaderText="LinReg(4)" SortExpression="LinReg4" />
                <asp:BoundField DataField="EMA40" HeaderText="EMA(40)" SortExpression="EMA40" />
                <asp:BoundField DataField="SMA20" HeaderText="SMA(20)" SortExpression="SMA20" />
                <asp:BoundField DataField="SMA50" HeaderText="SMA(50)" SortExpression="SMA50" />--%>
         </Columns>
      </asp:GridView>
      <%--<asp:SqlDataSource ID="SqlDataSource1" runat="server" ConnectionString="<%$ ConnectionStrings:ETFTableConnectionString1 %>"
            ProviderName="<%$ ConnectionStrings:ETFTableConnectionString1.ProviderName %>"
            SelectCommand="SELECT [Ticker], [Date], [OpenPrice], [HighPrice], [LowPrice], [ClosePrice], [Volume], [AdjustedClosePrice] 
                            FROM [Daily] WHERE Date >= '12/3/2007' 
                            ORDER BY Volume DESC">
        </asp:SqlDataSource>--%>
   </div>
   </form>
</body>

<script src="../js/ETFTables.TA.js" type="text/javascript"></script>

</html>
