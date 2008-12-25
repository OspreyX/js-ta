using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Collections;
using System.Collections.Specialized;

namespace YuiNet.UI
{
    public abstract class DataHandler : IHttpHandler
    {
        #region IHttpHandler Members
        public virtual bool IsReusable
        {
            get { return true; }
        }

        public virtual void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/javascript";

            // Prevent caching
            context.Response.Cache.SetNoStore();
            context.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            try
            {
                FetchDataRequest request = new FetchDataRequest(context.Request.QueryString);

                DataSourceResults results = FetchData(context.Request.QueryString,
                    request);
                context.Response.Write("{\"ResultSet\":");
                WriteResults(context, results);
                context.Response.Write("}");
            }
            catch (Exception ex)
            {
                context.Response.Clear();
                context.Response.Write("{\"error\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
            }
        }
        #endregion

        protected virtual void WriteResults(HttpContext context, DataSourceResults results)
        {
            context.Response.Write(results.GetJSON());
        }

        protected virtual DataSourceResults FetchData(NameValueCollection querystring)
        {
            return FetchData(querystring, new FetchDataRequest());
        }

        protected abstract DataSourceResults FetchData(NameValueCollection querystring, 
            FetchDataRequest dataRequestDetails);
    }
}
