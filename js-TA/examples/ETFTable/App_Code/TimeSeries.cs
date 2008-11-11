using System;
using System.Linq;

/// <summary>
/// Summary description for TimeSeries
/// </summary>
public class TimeSeries<TValue> : System.Collections.Generic.Dictionary<DateTime, PointInTime<TValue>> //, IDictionary<DateTime, TValue>
{
   public TimeSeries<TValue> OrderChronological()
   {
      return this.OrderBy(kv => kv.Key).ToTimeSeries<TValue>();
   }

   public TimeSeries<TValue> OrderReverseChronological()
   {
      return this.OrderByDescending(kv => kv.Key).ToTimeSeries<TValue>();
   }

   public void Add(PointInTime<TValue> value)
   {
      this.Add(value.Time, value);
   }

   protected DateTime GetKeyForItem(PointInTime<TValue> item)
   {
      return item.Time;
   }
}

public struct PointInTime<TValue>
{
   public DateTime Time;
   public TValue Value;

   public PointInTime(DateTime time, TValue value)
   {

      Time = time;
      Value = value;
   }

}
