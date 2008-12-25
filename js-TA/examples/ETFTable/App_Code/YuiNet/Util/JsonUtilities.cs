using System;
using System.Collections.Generic;
using System.Text;
using System.Reflection;
using System.Web.UI;
using System.Collections;
using System.Collections.Specialized;

namespace YuiNet.Util
{
    /// <summary>
    /// Provides utilities for writing .NET objects to JSON (which is
    /// notation for building JavaScript objects).
    /// </summary>
    public static class JsonUtilities
    {
        public static NameValueCollection[] ParseCollectionFromJSON(string json)
        {
            string jsonMod = json.Trim();
            if (jsonMod.StartsWith("[") && jsonMod.EndsWith("]"))
            {
                List<NameValueCollection> lst = new List<NameValueCollection>();
                int openBracket = jsonMod.IndexOf("{");
                int closeBracket = jsonMod.IndexOf("}");
                while (closeBracket >= 0 && openBracket >= 0)
                {
                    string innards = jsonMod.Substring(openBracket + 1, closeBracket - openBracket);
                    innards = innards.Trim();
                    if (innards.EndsWith(","))
                        innards = innards.Remove(innards.Length - 1);

                    lst.Add(ParseObjectFromJSON(innards));

                    openBracket = jsonMod.IndexOf("{", closeBracket);
                    closeBracket = jsonMod.IndexOf("}", closeBracket + 1);
                }
                return lst.ToArray();
            }
            else
            {
                return new NameValueCollection[] { ParseObjectFromJSON(json) };
            }
        }

        private static NameValueCollection ParseObjectFromJSON(string json)
        {
            // Replace any escaped " character so that we can rely on it
            string temp = json.Trim().Replace("\\\"", "&quot;");
            if (temp.StartsWith("{"))
                temp = temp.Remove(0, 1);
            if (temp.EndsWith("}"))
                temp = temp.Remove(temp.Length - 1, 1);

            int previousIndex = -1;
            int index = -1, nextIndex = -1;
            GetQuoteIndexes(temp, previousIndex, ref index, ref nextIndex);

            NameValueCollection results = new NameValueCollection();

            while (index > previousIndex)
            {
                int colon = (temp.Length > previousIndex + 1 ?
                    temp.IndexOf(":", previousIndex + 1, index - (previousIndex + 1))
                    : -1);

                if (colon >= 0)
                {
                    string x = temp.Substring(previousIndex + 1, colon - (previousIndex + 1));
                    string y = temp.Substring(index + 1, nextIndex - (index + 1));

                    if (x.Trim().StartsWith(","))
                        x = x.Trim().Remove(0, 1);

                    // Strip out quotes from the name parameter
                    x = x.Replace("\"", "");

                    results.Add(x.Trim(), y.Trim().Replace("&quot;", "\""));
                }

                previousIndex = nextIndex;
                GetQuoteIndexes(temp, previousIndex, ref index, ref nextIndex);
            }

            return results;
        }

        /// <summary>
        /// Obtains the first and next index of the quote characters that surround the value
        /// portion of the JSON for this string.
        /// </summary>
        private static void GetQuoteIndexes(string temp, int previousIndex, 
            ref int index, ref int nextIndex)
        {
            int colonIndex = temp.IndexOf(":", previousIndex + 1);
            int afterIndex = (colonIndex >= 0 ? colonIndex : previousIndex);

            // Find the first quote.
            // If there is a colon in the string, find the first quote after the colon
            // so that we can accept both forms of JSON parsing:
            // Example1: {"name":"Vinny"}
            // Example2: {name:"Vinny"}
            if (temp.Length > afterIndex)
            {
                index = temp.IndexOf("\"", afterIndex);
            }
            else
            {
                index = -1;
            }

            if (temp.Length > index + 1)
            {
                nextIndex = temp.IndexOf("\"", index + 1);
            }
            else
            {
                nextIndex = -1;
            }
        }

        public static void WriteObjectToJSON(object obj, StringBuilder sBuilder)
        {
            Type objType = obj.GetType();
            PropertyInfo[] props = objType.GetProperties();
            if (props.Length > 0 && !objType.Name.ToLower().Equals("string"))
            {
                StringBuilder sProp = new StringBuilder();
                foreach (PropertyInfo prop in props)
                {
                    if (sProp.Length > 0)
                        sProp.Append("," + Environment.NewLine);

                    object value = DataBinder.GetPropertyValue(obj, prop.Name);

                    sProp.Append("\"" + prop.Name + "\":");
                    WriteValue(value, sProp);
                }
                sBuilder.Append("{" + sProp.ToString() + "}");
            }
            else
            {
                // If this object has no properties, we bind the key as the type name
                // and the value as the ToString method
                sBuilder.Append("{");
                sBuilder.AppendFormat("\"{0}\":",
                    objType.Name);
                WriteValue(obj.ToString(), sBuilder);
                sBuilder.Append("}");
            }
        }

        public static void WriteValue(object obj, StringBuilder sBuilder)
        {
            ICollection objAsColl = obj as ICollection;
            if (objAsColl != null)
            {
                WriteCollectionToJSON(objAsColl, sBuilder);
                return;
            }

            if (obj == null)
            {
                sBuilder.Append("null");
                return;
            }

            Type objType = obj.GetType();
            PropertyInfo[] props = objType.GetProperties();
            if (ShouldWriteProperties(objType))
            {
                StringBuilder sProp = new StringBuilder();
                foreach (PropertyInfo prop in props)
                {
                    if (sProp.Length > 0)
                        sProp.Append(",");

                    object value = DataBinder.GetPropertyValue(obj, prop.Name);

                    if (value == null)
                    {
                        sProp.AppendFormat("{0}:null",
                            prop.Name);
                    }
                    else
                    {
                        sProp.AppendFormat("{0}:", prop.Name);
                        WritePrimitiveValue(value, sBuilder);
                    }
                }
                sBuilder.Append(Environment.NewLine + "{" + sProp.ToString() + "}" + Environment.NewLine);
            }
            else
            {
                WritePrimitiveValue(obj, sBuilder);
            }
        }

        private static void WritePrimitiveValue(object obj, StringBuilder sBuilder)
        {
            // Value types should not be given quotes so that they
            // maintain their type information in JavaScript
            Type objType = obj.GetType();
            bool enableQuotes = true;
            string value = obj.ToString();

            if (objType.IsValueType)
            {
                enableQuotes = false;
                if (objType == typeof(DateTime))
                    enableQuotes = true;

                if (objType.IsEnum)
                    enableQuotes = true;

                if (objType == typeof(Guid))
                    enableQuotes = true;

                // JavaScript booleans are lowercase only
                if (objType == typeof(bool))
                    value = obj.ToString().ToLower();
            }

            if (!enableQuotes)
                sBuilder.Append(Escape(value));
            else
                sBuilder.Append("\"" + Escape(value) + "\"");
        }

        private static string Escape(string str)
        {
            return str.Replace("\\", "\\\\").Replace("\"", "\\\"").
                                Replace("\r", "\\r").Replace("\n", "\\n");
        }

        private static bool ShouldWriteProperties(Type objType)
        {
            // At this time we are never writing nested properties
            return false;

            //PropertyInfo[] props = objType.GetProperties();
            //if (props.Length > 0 && !objType.Name.ToLower().Equals("string") &&
            //    !objType.IsValueType)
            //    return true;
            //return false;
        }

        public static void WriteCollectionToJSON(ICollection coll, StringBuilder sBuilder)
        {
            sBuilder.Append("[" + Environment.NewLine);
            bool hasData = false;
            foreach (object obj in coll)
            {
                if (hasData)
                    sBuilder.AppendFormat("," + Environment.NewLine);

                WriteObjectToJSON(obj, sBuilder);
                hasData = true;
            }
            sBuilder.Append("]" + Environment.NewLine);
        }
    }
}
