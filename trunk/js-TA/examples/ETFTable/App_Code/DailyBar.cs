using System;
using System.Linq;

using System.Collections.Generic;
using System.Runtime.Serialization;

/// <summary>
/// Summary description for DailyBar
/// </summary>
[DataContract]
public class DailyBar : Daily, IOhlcBar
{
   ETFTableDataContext dataContext = new ETFTableDataContext();

   #region Public Props

   //private decimal? _sma20 = 0.00M;
   //[DataMember]
   //public decimal? SMA20
   //{
   //   get
   //   {
   //      return _sma20;
   //   }
   //   set { _sma20 = value; }
   //}

   //private decimal? _sma50 = 0.00M;
   //[DataMember]
   //public decimal? SMA50
   //{
   //   get
   //   {
   //      return _sma50;
   //   }
   //   set { _sma50 = value; }
   //}

   //private decimal? _ema10 = 0.00M;
   //[DataMember]
   //public decimal? EMA10
   //{
   //   get { return _ema10; }
   //   set { _ema10 = value; }
   //}

   //private decimal? _ema120 = 0.00M;
   //[DataMember]
   //public decimal? EMA120
   //{
   //   get { return _ema120; }
   //   set { _ema120 = value; }
   //}

   //private decimal? _ema40 = 0.00M;
   //[DataMember]
   //public decimal? EMA40
   //{
   //   get { return _ema40; }
   //   set { _ema40 = value; }
   //}

   //private decimal? _ema50 = 0.00M;
   //[DataMember]
   //public decimal? EMA50
   //{
   //   get { return _ema50; }
   //   set { _ema50 = value; }
   //}

   //private decimal? _linReg4 = 0.00M;
   //[DataMember]
   //public decimal? LinReg4
   //{
   //   get { return _linReg4; }
   //   set { _linReg4 = value; }
   //}

   //private decimal? _linReg10 = 0.00M;
   //[DataMember]
   //public decimal? LinReg10
   //{
   //   get { return _linReg10; }
   //   set { _linReg10 = value; }
   //}

   [DataMember]
   public new decimal OpenPrice
   {
      get { return base.OpenPrice; }
      set { base.OpenPrice = value; }
   }

   [DataMember]
   public new decimal HighPrice
   {
      get { return base.HighPrice; }
      set { base.HighPrice = value; }
   }

   [DataMember]
   public new decimal LowPrice
   {
      get { return base.LowPrice; }
      set { base.LowPrice = value; }
   }

   //[DataMember]
   //public new decimal ClosePrice
   //{
   //   get { return base.ClosePrice; }
   //   set { base.ClosePrice = value; }
   //}

   [DataMember]
   public string Closes
   {
      get;
      set;
   }

   [DataMember]
   System.Nullable<long> Volume
   {
      get { return base.Volume; }
      set { base.Volume = value; }
   }
   #endregion

   public DailyBar()
   {
   }

   //public DailyBar(string ticker)
   //{
   //    var bars = (from daily in dataContext.Dailies
   //               where daily.Ticker.ToUpper() == ticker.ToUpper()
   //               orderby daily.Date descending
   //               select daily).Take(201).ToList();


   //    this.AdjustedClosePrice = bars[0].AdjustedClosePrice;
   //    this.ClosePrice = bars[0].ClosePrice;
   //    this.Date = bars[0].Date;
   //    this.HighPrice = bars[0].HighPrice;
   //    this.LowPrice = bars[0].LowPrice;
   //    this.OpenPrice = bars[0].OpenPrice;
   //    this.Ticker = bars[0].Ticker.ToUpper();
   //    this.Volume = bars[0].Volume;

   //}

   public static List<DailyBar> GetCurrentDailyBars()
   {
      ETFTableDataContext dataContext = new ETFTableDataContext();
      var all = from daily in dataContext.Dailies
                where daily.Date > DateTime.Now.AddDays(-201)
                orderby daily.Date descending
                group daily by daily.Ticker;

      List<DailyBar> currentBars = new List<DailyBar>();
      foreach (var ticker in all)
      {
         List<Daily> listTicker = ticker.ToList();
         currentBars.Add(
             new DailyBar()
             {
                AdjustedClosePrice = listTicker[0].AdjustedClosePrice,
                Closes = listTicker.Aggregate(String.Empty, (r, p) => r += "," + Decimal.Round(p.ClosePrice,2).ToString()).TrimStart(','),
                Date = listTicker[0].Date,
                HighPrice = listTicker[0].HighPrice,
                LowPrice = listTicker[0].LowPrice,
                OpenPrice = listTicker[0].OpenPrice,
                Ticker = listTicker[0].Ticker,
                Volume = listTicker[0].Volume,
             });
      }
      return currentBars;
   }
}
