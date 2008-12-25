using System;
using System.Linq;

/// <summary>
/// Summary description for Indicators
/// </summary>
public static class Indicators
{

   /// <summary>
   /// Calculates exponential moving average values for a given period on a TimeSeries
   /// </summary>
   /// <param name="data"></param>
   /// <param name="period"></param>
   /// <returns></returns>
   public static TimeSeries<decimal?> EMAverage(this TimeSeries<decimal> data, int period)
   {
      TimeSeries<decimal?> retVal = new TimeSeries<decimal?>();
      data = data.OrderChronological();
      decimal startingSMA = data.Select(kv => kv.Value.Value).Average();
      decimal previousEMA = startingSMA;
      decimal smoothingConst = Convert.ToDecimal(2.00M / (period + 1));
      DateTime dt;
      decimal v;
      decimal currentEMA;

      int length = data.Count - 1;
      for (int i = 0; i <= length; i++)
      {
         dt = data.Keys.ElementAt(i);
         v = data[dt].Value;
         if (i < period - 1)
         {
            retVal.Add(new PointInTime<decimal?>(dt, null));
         }
         else if (i == period - 1)
         {
            retVal.Add(new PointInTime<decimal?>(dt, startingSMA));
         }
         else
         {
            currentEMA = ((v - previousEMA) * smoothingConst) + previousEMA;
            retVal.Add(new PointInTime<decimal?>(dt, currentEMA));
            previousEMA = currentEMA;
         }
      }
      retVal.OrderByDescending(d => d.Key);
      return retVal;
   }

   /// <summary>
   /// Calculates linear regression values for a given period on a TimeSeries
   /// </summary>
   /// <param name="data"></param>
   /// <param name="period"></param>
   /// <returns></returns>
   public static TimeSeries<decimal?> LinearRegressionLine(this TimeSeries<decimal> data, int period)
   {
      TimeSeries<decimal?> retVal = new TimeSeries<decimal?>();
      data = data.OrderChronological();
      decimal sumX = (decimal)period * (period - 1) * 0.5M;
      //decimal divisor = sumX * sumX - period * period * (period - 1) * (2 * period - 1) / 6;
      decimal divisor = (sumX * sumX) - ((period * period * (period - 1) * (2 * period - 1)) / 6);
      decimal sumXY = 0;
      decimal slope;
      decimal intercept;
      DateTime dt;
      decimal v;

      int length = data.Count - 1;
      for (int i = 0; i <= length; i++)
      {
         dt = data.Keys.ElementAt(i);
         if (i >= period - 1)
         {
            sumXY = 0;
            for (int count = 0; count < period; count++)
            {
               v = data.Values.ElementAt(i - count).Value;
               sumXY += count * v;
            }
            slope = (period * sumXY - sumX * (decimal)Sum(
                        data.Take(i + 1).ToTimeSeries(), period)[dt].Value) / divisor;
            intercept = ((decimal)Sum(
                        data.Take(i + 1).ToTimeSeries(), period)[dt].Value - slope * sumX) / period;
            retVal.Add(new PointInTime<decimal?>(dt, intercept + slope * (period - 1)));
         }
         else
         {
            retVal.Add(new PointInTime<decimal?>(dt, null));
         }
      }
      retVal.OrderByDescending(d => d.Key);
      return retVal;
   }

   public static TimeSeries<decimal?> Sum(TimeSeries<decimal> data, int period)
   {
      TimeSeries<decimal?> retVal = new TimeSeries<decimal?>();
      data = data.OrderReverseChronological();
      DateTime dt;

      int length = data.Count() - 1;
      for (int i = 0; i <= length; i++)
      {
         dt = data.ElementAt(i).Key;
         if ((i + period) <= length + 1)
         {
            retVal.Add(new PointInTime<decimal?>(dt, data.Skip(i).Take(period)
                        .Select(kv => kv.Value.Value).Sum()));
         }
         else
         {
            retVal.Add(new PointInTime<decimal?>(dt, null));
         }
      }
      retVal.OrderByDescending(d => d.Key);
      return retVal;
   }

   public static TimeSeries<decimal?> RateOfChange(TimeSeries<decimal> data, int period)
   {
      TimeSeries<decimal?> retVal = new TimeSeries<decimal?>();
      data = data.OrderChronological();
      DateTime dt;
      decimal v;
      decimal currentRoc;
      decimal valueNBack;

      int length = data.Count - 1;
      for (int i = 0; i <= length; i++)
      {
         dt = data.Keys.ElementAt(i);
         v = data[dt].Value;
         if (i < period)
         {
            retVal.Add(new PointInTime<decimal?>(dt, null));
         }
         else
         {
            valueNBack = data.ElementAt(i - period).Value.Value;
            currentRoc = ((v - valueNBack) / valueNBack) * 100;
            retVal.Add(new PointInTime<decimal?>(dt, currentRoc));
         }
      }
      retVal.OrderReverseChronological();
      return retVal;
   }

}
