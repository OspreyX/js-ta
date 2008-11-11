using System;
using System.Web;
using System.IO.Compression;

public class MyBasePage : System.Web.UI.Page
{
    protected bool UseCompression = true;

    protected override void OnInit(EventArgs e)
    {
        if (UseCompression) { SetupCompressedStream(); }
        base.OnInit(e);
    }
    private void SetupCompressedStream()
    {
        HttpResponse response = HttpContext.Current.Response;
        string acceptEncodingValue = HttpContext.Current.Request.Headers["Accept-Encoding"];
        if (acceptEncodingValue.Contains("gzip"))
        {
            response.Filter = new GZipStream(response.Filter, CompressionMode.Compress);
            response.AppendHeader("Content-Encoding", "gzip");
        }
        else if (acceptEncodingValue.Contains("deflate"))
        {
            response.Filter = new DeflateStream(response.Filter, CompressionMode.Compress);
            response.Headers["Content-Encoding"] = "deflate";
        }
    }
}
