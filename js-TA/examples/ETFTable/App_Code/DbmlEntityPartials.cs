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
using System.Runtime.Serialization;

[DataContract]
public partial class Daily : IOhlcBar //add implement of IOhlcBar and DataContractAttribute
{
	
}

public interface IOhlcBar
{
   [DataMember]
   DateTime Date { get; set; }
   [DataMember]
   decimal OpenPrice { get; set; }
   [DataMember]
   decimal HighPrice { get; set; }
   [DataMember]
   decimal LowPrice { get; set; }
   [DataMember]
   decimal ClosePrice { get; set; }
   [DataMember]
   System.Nullable<long> Volume { get; set; }
}

public enum OhlcBarPart
{
   Open,
   High,
   Low,
   Close,
   Volume
}
