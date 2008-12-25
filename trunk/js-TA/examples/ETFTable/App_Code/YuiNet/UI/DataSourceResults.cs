using System;
using System.Collections.Generic;
using System.Text;
using System.Collections;
using YuiNet.Util;

namespace YuiNet.UI
{
    /// <summary>
    /// Encapsulates the results for a DataSource operation.
    /// </summary>
    public class DataSourceResults
    {
        #region Members and Constructors
        private ICollection _results;
        private int _recordsReturned;
        private int _totalRecords;
        private int _startIndex;
        private string _sortKey;
        private string _sortDirection;

        public DataSourceResults()
        {
            _sortKey = "";
            _sortDirection = "asc";
        }
        #endregion

        #region Properties
        public ICollection Results
        {
            get { return _results; }
            set { _results = value; }
        }

        public int TotalRecords
        {
            get { return _totalRecords; }
            set { _totalRecords = value; }
        }

        public int RecordsReturned
        {
            get { return _recordsReturned; }
            set { _recordsReturned = value; }
        }

        public int StartIndex
        {
            get { return _startIndex; }
            set { _startIndex = value; }
        }

        public string SortKey
        {
            get { return _sortKey; }
            set { _sortKey = value; }
        }

        public string SortDirection
        {
            get { return _sortDirection; }
            set { _sortDirection = value; }
        } 
        #endregion

        public string GetJSON()
        {
            StringBuilder sBuilder = new StringBuilder();
            JsonUtilities.WriteObjectToJSON(this, sBuilder);
            return sBuilder.ToString();
        }
    }
}
