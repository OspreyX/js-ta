using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

/// <summary>
/// Summary description for JSONDataHandler
/// </summary>
public abstract class JSONDataHandler : YuiNet.UI.DataHandler
{
    protected bool UseGZipEncoding = true;

    protected abstract override YuiNet.UI.DataSourceResults FetchData(System.Collections.Specialized.NameValueCollection querystring, YuiNet.UI.FetchDataRequest dataRequestDetails);

    public override void ProcessRequest(HttpContext context)
    {
        if (UseGZipEncoding) { GZipEncodeResponse(); }
        base.ProcessRequest(context);
    }

    /// <summary>
    /// Sets up the current page or handler to use GZip through a Response.Filter
    /// IMPORTANT: 
    /// You have to call this method before any output is generated!
    /// </summary>
    public static void GZipEncodeResponse()
    {
        if (IsGZipSupported())
        {
            HttpResponse Response = HttpContext.Current.Response;

            string AcceptEncoding = HttpContext.Current.Request.Headers["Accept-Encoding"];
            if (AcceptEncoding.Contains("gzip"))
            {

                Response.Filter = new System.IO.Compression.GZipStream(Response.Filter,

                                          System.IO.Compression.CompressionMode.Compress);

                Response.AppendHeader("Content-Encoding", "gzip");

            }
            else
            {

                Response.Filter = new System.IO.Compression.DeflateStream(Response.Filter,

                                          System.IO.Compression.CompressionMode.Compress);

                Response.AppendHeader("Content-Encoding", "deflate");

            }
        }
    }

    /// <summary>
    /// Determines if GZip is supported
    /// </summary>
    /// <returns></returns>
    public static bool IsGZipSupported()
    {
        string AcceptEncoding = HttpContext.Current.Request.Headers["Accept-Encoding"];
        if (!string.IsNullOrEmpty(AcceptEncoding) &&
             AcceptEncoding.Contains("gzip") || AcceptEncoding.Contains("deflate"))
        {
            return true;
        }
        return false;
    }
}
