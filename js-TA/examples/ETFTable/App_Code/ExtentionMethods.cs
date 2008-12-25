using System;
using System.Data;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;
using System.Collections.Generic;

public static partial class ExtensionMethods
{

   public static TimeSeries<T> ToTimeSeries<T>(this IEnumerable<KeyValuePair<DateTime, PointInTime<T>>> source)
   {
      TimeSeries<T> retVal = new TimeSeries<T>();

      foreach (var kv in source)
      {

         retVal.Add(new PointInTime<T> { Time = kv.Key, Value = kv.Value.Value });
      }
      return retVal;
   }

   public static TimeSeries<decimal> ToTimeSeries<T>(this IEnumerable<T> source, OhlcBarPart barPart) 
       where T : IOhlcBar
   {
      TimeSeries<decimal> retVal = new TimeSeries<decimal>();
      foreach (IOhlcBar bar in source)
      {
         decimal pointValue = 0.00M;
         switch (barPart)
         {
            case OhlcBarPart.Open:
               pointValue = bar.OpenPrice;
               break;
            case OhlcBarPart.High:
               pointValue = bar.HighPrice;
               break;
            case OhlcBarPart.Low:
               pointValue = bar.LowPrice;
               break;
            case OhlcBarPart.Close:
               pointValue = bar.ClosePrice;
               break;
            case OhlcBarPart.Volume:
               pointValue = Convert.ToDecimal(bar.Volume.HasValue ? (long)bar.Volume : 0);
               break;
            default:
               throw new ArgumentException("Parameter barPart in not a valid value for OhlcBarPart enumeration.");
               break;
         }
         retVal.Add(new PointInTime<decimal> { Time = bar.Date, Value = pointValue });
      }
      return retVal;
   }
}
