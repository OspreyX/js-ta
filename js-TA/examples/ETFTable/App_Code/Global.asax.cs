using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Caching;
using System.Configuration;
using System.Threading;

/// <summary>
/// Summary description for Global
/// </summary>
public class Global : HttpApplication
{
	
   protected void Application_Start(Object sender, EventArgs e)
   {
      RegisterCacheEntries();
      ThreadStart newThreadMethod = new ThreadStart(RegisterCacheEntries);
      Thread newThread = new Thread(newThreadMethod);
      newThread.Start();
   }

   private void RegisterCacheEntries()
   {
      string[] activeTickers = ConfigurationManager.AppSettings["ETFTable.ActiveTickers"].Replace("\r", "").Split(' ', '\n', ',');
      int secondsTilExpire = 20;
      foreach (string ticker in activeTickers)
      {
         RegisterLastDLCacheEntry(ticker, secondsTilExpire);
         System.Threading.Thread.Sleep(5);
         secondsTilExpire = secondsTilExpire + 5;
      }
   }
   private bool RegisterLastDLCacheEntry(string ticker, int secondsTilExpire)
   {
      if (System.Web.HttpRuntime.Cache[ticker + "_LastDL"] != null)
      {
         System.Web.HttpRuntime.Cache.Remove(ticker + "_LastDL");
      }
      System.Web.HttpRuntime.Cache.Add(ticker + "_LastDL", DateTime.UtcNow.ToString(), null,
          DateTime.Now.AddSeconds(secondsTilExpire), Cache.NoSlidingExpiration,
          CacheItemPriority.Normal,
          new CacheItemRemovedCallback(LastDLCacheItemRemovedCallback));

      return true;
   }

   public void LastDLCacheItemRemovedCallback(string key,
            object value, CacheItemRemovedReason reason)
   {
      System.Diagnostics.Debug.WriteLine("Cache item callback: " + key + " - " + DateTime.Now.ToLongTimeString() + "- Reason: " + reason.ToString());
      
      OHLC_Downloader downloader = new OHLC_Downloader();
      downloader.GetForSymbols(new string[] { key.Replace("_LastDL", "") }, 201, false);

      // Do the service works
      RegisterLastDLCacheEntry(key.Replace("_LastDL", ""), 120);
      
   }
    
    void Application_End(object sender, EventArgs e) 
    {
        //  Code that runs on application shutdown

    }
        
    void Application_Error(object sender, EventArgs e) 
    { 
        // Code that runs when an unhandled error occurs

    }

    void Session_Start(object sender, EventArgs e) 
    {
        // Code that runs when a new session is started

    }

    void Session_End(object sender, EventArgs e) 
    {
        // Code that runs when a session ends. 
        // Note: The Session_End event is raised only when the sessionstate mode
        // is set to InProc in the Web.config file. If session mode is set to StateServer 
        // or SQLServer, the event is not raised.

    }
}
