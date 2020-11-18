# google-moving-poi

A Google Sheets script that uses Google Point and Distance API's to list out what stores, schools, etc. are within the defined walking distance.

The script will process any address in column A that doesn't have results in column B-F.

Steps:
- If there is an address in column A an no POI info in column B-F then it will do a search
- The script uses the address in column A, gets the lng/lat coordinates
- Using the returned coordinates, it queries for point of interests based for each category in columns B-F
- For each POI, it gets the walking distances from the address in column A

Files:
- Moving POI Output.pdf, Moving POI Output.csv - export of the Sheets
- Moving POI script.gs - the Google Apps Script 

# Note!!  The Google Point and Distance API's is pay per use / returned element.  Please research what returned data elements cost money before you use this!
