using System;
using System.Web;
using System.Collections;
using System.Collections.Specialized;
using System.Collections.Generic;
using YuiNet.UI;

public class DailyHandler : JSONDataHandler
{
    protected override DataSourceResults FetchData(NameValueCollection querystring,
         FetchDataRequest request)
    {
        DataSourceResults retVal = new DataSourceResults();
        List<DailyBar> data;

        if (HttpContext.Current.Cache["DailyBar.GetCurrentDailyBars"] != null)
        {
            data = (List<DailyBar>)HttpContext.Current.Cache["DailyBar.GetCurrentDailyBars"];
        }
        else
        {
            data = DailyBar.GetCurrentDailyBars();
            HttpContext.Current.Cache.Insert("DailyBar.GetCurrentDailyBars",
                        data,
                        null,
                        DateTime.UtcNow.AddMinutes(10.0),
                        System.Web.Caching.Cache.NoSlidingExpiration);
        }

        retVal.RecordsReturned = data.Count; //request.PagingNumberOfRecords;
        retVal.SortDirection = "desc"; //request.SortDirection;
        retVal.SortKey = "EMA20"; //request.SortColumnKey;
        retVal.StartIndex = 0; //request.PagingStartIndex;
        retVal.TotalRecords = retVal.RecordsReturned; //request.PagingNumberOfRecords;
        retVal.Results = (ICollection)data;

        return retVal;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    protected override DataSourceResults FetchData(NameValueCollection querystring)
    {
        return base.FetchData(querystring);
    }

    public override void ProcessRequest(HttpContext context)
    {
        this.UseGZipEncoding = true;
        base.ProcessRequest(context);
    }
}