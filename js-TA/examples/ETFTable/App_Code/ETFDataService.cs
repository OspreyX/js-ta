using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Collections.Generic;

[ServiceContract(Namespace = "")]
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class ETFDataService
{
	// Add [WebGet] attribute to use HTTP GET
	[OperationContract]
   [WebGet(ResponseFormat = WebMessageFormat.Json)]
	public string Hello()
	{
		// Add your operation implementation here
      return "Hello";
	}

	// Add more operations here and mark them with [OperationContract]
   [OperationContract]
   [WebGet(ResponseFormat = WebMessageFormat.Json)]
   List<DailyBar> GetCurrentDailyBars()
   {
      return DailyBar.GetCurrentDailyBars();
   }
}
