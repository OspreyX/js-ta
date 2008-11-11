using System;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

public partial class _Default : System.Web.UI.Page
{
   protected void Page_Load(object sender, EventArgs e)
   {
      if (Request.QueryString["from"] != null && Request.QueryString["from"] == "config")
      {
         txtSymbolsToLoad.Text = ConfigurationManager.AppSettings["ETFTable.ActiveTickers"];
         txtDownload_Click(null, null);
      }
      if (!IsPostBack)
      {
         GridView1.DataSource = DailyBar.GetCurrentDailyBars();
         GridView1.DataBind();
      }
   }
   protected void txtDownload_Click(object sender, EventArgs e)
   {
      string[] symbols = txtSymbolsToLoad.Text.Replace("\r", "").Split(' ', '\n', ',');
      OHLC_Downloader downloader = new OHLC_Downloader();
      downloader.GetForSymbols(symbols, 201, false);
      Response.Redirect("Default.aspx", true);
   }
   protected void btnClearAll_Click(object sender, EventArgs e)
   {
      ETFTableDataContext dataContext = new ETFTableDataContext();
      //dataContext.Dailies.DeleteAllOnSubmit(
      //    from daily in dataContext.Dailies
      //    select daily
      //    );
      const string deleteAllSql = "DELETE FROM [Daily]";
      dataContext.ExecuteCommand(deleteAllSql);
      Response.Redirect("Default.aspx", true);
   }
   protected void btnCreateCommaSepList_Click(object sender, EventArgs e)
   {
      string[] symbols = txtSymbolsToLoad.Text.Replace("\r", "").Split(' ', '\n', ',');
      string strList = "";
      foreach (string item in symbols)
      {
         strList += item + ",";
      }
      spnTextOutput.InnerHtml = strList.Trim(',', ' ');
   }

}
