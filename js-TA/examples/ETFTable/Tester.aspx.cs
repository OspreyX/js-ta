using System;
using System.Collections;
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

public partial class Tester : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        TimeSeries<decimal> prices = new TimeSeries<decimal> {
            {new PointInTime<decimal>( new DateTime(2007,1,1), 1.3M )},
            {new PointInTime<decimal>( new DateTime(2007,1,2), 2.1M )},
            {new PointInTime<decimal>( new DateTime(2007,1,3), 3.8M )},
            {new PointInTime<decimal>( new DateTime(2007,1,4), 4.4M )},
            {new PointInTime<decimal>( new DateTime(2007,1,5), 5.0M )},
            {new PointInTime<decimal>( new DateTime(2007,1,6), 6.2M )},
            {new PointInTime<decimal>( new DateTime(2007,1,7), 7.9M )},
            {new PointInTime<decimal>( new DateTime(2007,1,8), 8.0M )},
            {new PointInTime<decimal>( new DateTime(2007,1,9), 9.4M )},
            {new PointInTime<decimal>( new DateTime(2007,1,10), 10.9M )},
            {new PointInTime<decimal>( new DateTime(2007,1,11), 11.3M )},
            {new PointInTime<decimal>( new DateTime(2007,1,12), 10.7M )},
            {new PointInTime<decimal>( new DateTime(2007,1,13), 8.8M )},
            {new PointInTime<decimal>( new DateTime(2007,1,14), 8.6M )},
        };
        TimeSeries<decimal?> emaVals = Indicators.EMAverage(prices,6);
        TimeSeries<decimal?> lrVals = Indicators.LinearRegressionLine(prices,6);
        var query = from item in prices
                    join ema in emaVals on item.Key equals ema.Key
                    join lr in lrVals on ema.Key equals lr.Key
                    select new { Date = item.Key, Price = item.Value.Value, EMA = ema.Value.Value, LinReg = lr.Value.Value };
        GridView1.DataSource = query;
        GridView1.DataBind();
    }
}
