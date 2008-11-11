using System;

using System.Net;
using System.IO;
using System.Text;
using System.Linq;
using System.Collections.Generic;

using LumenWorks.Framework.IO.Csv;

/// <summary>
/// Summary description for OHLC_Downloader
/// </summary>
public class OHLC_Downloader
{
   private const string URL_TEMPLATE = "http://ichart.finance.yahoo.com/table.csv?s={0}&a={1}&b={2}&c={3}&d={4}&e={5}&f={6}&g=d&ignore=.csv";
   private const string SQL_INSERT_TEMPLATE = "INSERT INTO [Daily] VALUES ('{0}','{1}',{2},{3},{4},{5},{6},{7})\n";
   private const string SQL_UPDATE_TEMPLATE = @"UPDATE [Daily] SET [OpenPrice] = {2}
      ,[HighPrice] = {3}
      ,[LowPrice] = {4}
      ,[ClosePrice] = {5}
      ,[Volume] = {6}
      ,[AdjustedClosePrice] = {7}
      WHERE [Ticker] = '{0}' AND [Date] = '{1}' \n";

   public bool GetForSymbols(string[] args, int daysBack, bool overwrite)
   {
      HttpWebRequest request;
      HttpWebResponse response;
      StreamReader responseStream;
      string url;
      DateTime now = DateTime.Now;
      StringBuilder sql;
      ETFTableDataContext dataContext = new ETFTableDataContext();
      DateTime lastDate, nowMinusNDays, iterationDate;

      //string strListOfSymbols = args[0];
      //string[] arrListOfSymbols = strListOfSymbols.Split(' ');
      foreach (string symbol in args)
      {
         sql = new StringBuilder();

         try
         {

            lastDate = (from daily in dataContext.Dailies
                        where daily.Date > DateTime.Now.AddDays(-1 * daysBack) &&
                              daily.Ticker == symbol
                        orderby daily.Date descending
                        select daily.Date).FirstOrDefault();
            if (lastDate == DateTime.MinValue) { lastDate = DateTime.Now.AddDays(-1 * daysBack); }
            if (!overwrite)
            {
               nowMinusNDays = lastDate.AddDays(1);
            }
            else
            {
               nowMinusNDays = DateTime.Now.AddDays(-1 * daysBack);
            }

            //Console.WriteLine("Getting " + symbol + "...");
            url = String.Format(URL_TEMPLATE,
                    symbol,
                    nowMinusNDays.Month - 1,
                    nowMinusNDays.Day,
                    nowMinusNDays.Year,
                    now.Month - 1,
                    now.Day,
                    now.Year);
            request = (HttpWebRequest)HttpWebRequest.Create(url);
            using (response = (HttpWebResponse)request.GetResponse())
            {
               responseStream = new StreamReader(response.GetResponseStream());

               using (CsvReader csv =
                       new CsvReader(responseStream, true))
               {
                  int fieldCount = csv.FieldCount;
                  string[] headers = csv.GetFieldHeaders();

                  while (csv.ReadNextRecord())
                  {
                     //for (int i = 0; i < fieldCount; i++)
                     //    Console.Write(string.Format("{0} = {1};",
                     //                  headers[i], csv[i]) );
                     iterationDate = DateTime.Parse(csv["Date"].ToString());
                     if (iterationDate < lastDate || iterationDate.ToShortDateString() == lastDate.ToShortDateString())
                     {
                        sql.AppendFormat(SQL_UPDATE_TEMPLATE,
                                symbol.ToUpper(),
                                csv["Date"],
                                csv["Open"],
                                csv["High"],
                                csv["Low"],
                                csv["Close"],
                                csv["Volume"],
                                csv["Adj Close"]);
                     }
                     else
                     {
                        sql.AppendFormat(SQL_INSERT_TEMPLATE,
                                symbol.ToUpper(),
                                csv["Date"],
                                csv["Open"],
                                csv["High"],
                                csv["Low"],
                                csv["Close"],
                                csv["Volume"],
                                csv["Adj Close"]);
                     }
                  }
               }
               responseStream.Close();
            }
            if (sql.Length > 1)
            {
               dataContext.ExecuteCommand(sql.ToString());
            }
         }
         catch (Exception exc)
         {
            //TO DO: Log this but don't throw.
         }
         finally
         {
            
         }
         //Console.WriteLine("Press any key to continue...");
         //Console.Read();
      }
      //Console.Read();
      return true;
   } //end GetForSymbols
} //end class
