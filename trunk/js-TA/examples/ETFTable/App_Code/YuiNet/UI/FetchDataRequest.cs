using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.Specialized;

namespace YuiNet.UI
{
    /// <summary>
    /// This class encapsulates paging and sorting data for GET requests 
    /// to a generic HTTP handler that functions as a data source for the DataTable control.
    /// </summary>
    public class FetchDataRequest
    {
        #region Members and Constructors
        private int _startIndex;
        private int _numberOfRecords;
        private string _sortColumnKey;
        private string _sortDirection;

        public FetchDataRequest()
        {
            _startIndex = -1;
            _numberOfRecords = -1;
            _sortDirection = "asc";
        }

        public FetchDataRequest(NameValueCollection queryString)
        {
            string temp = queryString["startIndex"];
            int.TryParse(temp, out _startIndex);
            temp = queryString["results"];
            int.TryParse(temp, out _numberOfRecords);

            _sortColumnKey = queryString["sort"];
            temp = queryString["dir"];

            if (temp != null && temp.ToLower().Equals("desc"))
                _sortDirection = "desc";
            else
                _sortDirection = "asc";
        } 
        #endregion

        #region Properties
        public int PagingStartIndex
        {
            get { return _startIndex; }
            set { _startIndex = value; }
        }

        public int PagingNumberOfRecords
        {
            get { return _numberOfRecords; }
            set { _numberOfRecords = value; }
        }

        public string SortColumnKey
        {
            get { return _sortColumnKey; }
            set { _sortColumnKey = value; }
        }

        public string SortDirection
        {
            get { return _sortDirection; }
            set
            {
                if (value != null && value.ToLower().Equals("desc"))
                    _sortDirection = "desc";
                else
                    _sortDirection = "asc";
            }
        } 
        #endregion
    }
}
