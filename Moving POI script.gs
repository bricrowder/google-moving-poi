function getPOI() {
  //init sheet and range based on last row
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var lr = sheet.getLastRow();
  var inforange = sheet.getRange("A2:F" + lr);
  var info = inforange.getValues();
  //init search params
  var timerad=25*60;   // is in seconds: 25*60 == 1500 seconds
  var keywords = ['grocery','school','coffee','pharmacy','stores'];
  var apikey = 'YOUR API KEY HERE';

  //loop through the range
  for (p=0;p<info.length;p++){
    //check if row needs filling in (if there is an address without store info)
    if (info[p][0].length>0 && info[p][1].length==0){

      //Get place info
      var placeurl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=' + info[p][0] + '&inputtype=textquery&fields=formatted_address,geometry&key=' + apikey;
      var placeresponse = UrlFetchApp.fetch(placeurl, {'muteHttpExceptions': true});
      var placejson = placeresponse.getContentText();
      var placedata = JSON.parse(placejson);
      //get long and lat from first search hit
      var olat = placedata.candidates[0].geometry.location.lat;
      var olng = placedata.candidates[0].geometry.location.lng;

      
      for (k=0;k<keywords.length;k++){
        // each keyword search result will be put into its own cell
        //offset the starting column index
        var ki = k+1;

        //POI keyword search based on olat, olng
        //var poiurl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + olat + ',' + olng + '&radius=' + rad + '&keyword=' + keywords[k] + '&key=' + apikey;
        var poiurl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + olat + ',' + olng + '&rankby=distance&keyword=' + keywords[k] + '&key=' + apikey;
        //var poiurl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + orig + '&rankby=distance&keyword=' + keywords[k] + '&key=' + apikey;
        var response = UrlFetchApp.fetch(poiurl, {'muteHttpExceptions': true});
        var poijson = response.getContentText();
        var poidata = JSON.parse(poijson);
        
        //built POI lat/lngs for distance request
        var destparam='';
        for (var i=0;i<poidata.results.length;i++){
          destparam = destparam + poidata.results[i].geometry.location.lat + ',' + poidata.results[i].geometry.location.lng;
          // if not last POI, add a "|" delim
          if (i<poidata.results.length-1) {
            destparam = destparam + '%7C';
          }
        }
        
        //get walking distances of POI
        //var disturl = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + olat + ',' + olng + '&destinations=' + destparam + '&mode=walking&key=' + apikey;
        var disturl = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + info[p][0] + '&destinations=' + destparam + '&mode=walking&key=' + apikey;
        var distresponse = UrlFetchApp.fetch(disturl, {'muteHttpExceptions': true});
        var distjson = distresponse.getContentText();
        var distdata = JSON.parse(distjson);
        
        // build POI and DIST information from two REST api calls
        var txt=''
        for (var i=0;i<poidata.results.length;i++){
          if (distdata.rows[0].elements[i].duration.value<=1200){
            txt = txt + poidata.results[i].name;
            txt = txt + ' -- ' + distdata.rows[0].elements[i].distance.text + ' (' + distdata.rows[0].elements[i].duration.text + ')';
            // if not last POI, add a new line
            if (i<poidata.results.length-1) {
              txt = txt + '\n';
            }
          }
        }
        if (txt==''){
          txt="no results";
        }
        info[p][ki] = txt;
      }
    }
  }
  //set the info back into the table
  inforange.setValues(info);
}
