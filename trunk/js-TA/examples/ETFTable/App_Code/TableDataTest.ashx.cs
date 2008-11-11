using System;
using System.Web;
using System.Collections;
using System.Collections.Specialized;
using System.Collections.Generic;
using YuiNet.UI;

public class TableDataTest : JSONDataHandler
{
    // 101 days worth
    string VOL_DATA = "468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,19070000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17030000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,17000000,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,19070000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17030000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087,468685,38474786,17000000,4762087,5600033,1234567,468685,38474786,17000000,4762087";
    string DEC_DATA = "10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,90.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50,10.50,20.50,30.50,40.50,50.50,60.50,70.50,80.50,90.50,100.50";
    string[] TICKERS = new string[] { "ABCD", "EPUD", "WPU", "POIU", "WNDV", "QWER", "DSA", "LGU", "AJAX", "YUI", "BCDE", "UEKD", "NATH" };
    protected override DataSourceResults FetchData(NameValueCollection querystring,
        FetchDataRequest request)
    {
        DataSourceResults retVal = new DataSourceResults();
        retVal.RecordsReturned = 900; //request.PagingNumberOfRecords;
        retVal.SortDirection = "desc"; //request.SortDirection;
        retVal.SortKey = "Ema20"; //request.SortColumnKey;
        retVal.StartIndex = 0; //request.PagingStartIndex;
        retVal.TotalRecords = retVal.RecordsReturned; //request.PagingNumberOfRecords;

        Random randomizer = new Random();

        ICollection<BarData> data = new List<BarData>();
        BarData item;
        for (int i = 0; i < retVal.RecordsReturned; i++)
        {
            decimal factor = (decimal)randomizer.NextDouble();

            item = new BarData();
            item.CurPrice = Decimal.Round(80.75M * factor, 2);
            item.Close = ShuffleStringArrayAndRandomizeLastNChars(DEC_DATA.Split(','), 2);
            item.Ema5 = Decimal.Round(81.53M * factor, 2);
            item.Ema20 = Decimal.Round(80.73M * factor, 2);
            item.Ema40 = Decimal.Round(78.90M * factor, 2);
            item.Ema50 = Decimal.Round(78.55M * factor, 2);
            item.Ema100 = Decimal.Round(78.46M * factor, 2);
            item.Ticker = TICKERS[randomizer.Next(12)];
            item.Volume = ShuffleStringArrayAndRandomizeLastNChars(VOL_DATA.Split(','), 4);

            data.Add(item);
        }
        retVal.Results = (ICollection)data;
        //retVal.Results =

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
    protected override void WriteResults(HttpContext context, DataSourceResults results)
    {
        base.WriteResults(context, results);
    }

    private static string ShuffleStringArrayAndRandomizeLastNChars(string[] c, int lastNToRandomize)
    {
        string retVal = String.Empty;
        //int length = c.Length;
        //Random randomizer = new Random();

        //List<string> orig = new List<string>(c);
        //List<string> randomized = new List<string>(length);

        //for (int i = 0; i < length; i++)
        //{
        //    int index = randomizer.Next(orig.Count);
        //    randomized.Add(orig[index]);
        //    orig.RemoveAt(index);
        //}
        string strMax = String.Empty;
        for (int i = 1; i <= lastNToRandomize; i++)
        {
            strMax += "9";
        }
        int max = Int32.Parse(strMax);
        Random randomizer = new Random();

        List<string> randomized = new List<string>(Util<string>.Shuffle(c)); 

        string sep = String.Empty;
        int replacement;
        string strReplacement;
        foreach (object item in randomized)
        {
            replacement = randomizer.Next(max);
            strReplacement = Convert.ToString(item);
            strReplacement = strReplacement.Remove(strReplacement.Length - strMax.Length);
            strReplacement += replacement.ToString();
            retVal += sep + strReplacement;
            sep = ",";
        }

        return retVal;
    }

    internal class BarData
    {
        private string _ticker;
        public string Ticker
        {
            get { return _ticker; }
            set { _ticker = value; }
        }

        private decimal _curPrice;
        public decimal CurPrice
        {
            get { return _curPrice; }
            set { _curPrice = value; }
        }

        private string _volume;
        public string Volume
        {
            get { return _volume; }
            set { _volume = value; }
        }

        private string _close;
        public string Close
        {
            get { return _close; }
            set { _close = value; }
        }

        private decimal _ema5;
        public decimal Ema5
        {
            get { return _ema5; }
            set { _ema5 = value; }
        }

        private decimal _ema20;
        public decimal Ema20
        {
            get { return _ema20; }
            set { _ema20 = value; }
        }

        private decimal _ema40;
        public decimal Ema40
        {
            get { return _ema40; }
            set { _ema40 = value; }
        }

        private decimal _ema50;
        public decimal Ema50
        {
            get { return _ema50; }
            set { _ema50 = value; }
        }

        private decimal _ema100;
        public decimal Ema100
        {
            get { return _ema100; }
            set { _ema100 = value; }
        }

    }

    internal static class Util<T>
    {
        private static Random rng = new Random();
        public static ICollection<T> Shuffle(ICollection<T> c)
        {
            T[] a = new T[c.Count];
            c.CopyTo(a, 0);
            byte[] b = new byte[a.Length];
            rng.NextBytes(b);
            Array.Sort(b, a);
            return new List<T>(a);
        }
    }

}