
function resetDateRange(event) {

   // alert("Reset");

}

function submitDateRange(event) {

    windowLog.trace("inside submitDateRange..");

    var tab=document.getElementById("result-table1");
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    var tab_text = "";
    var reportArray =[];

    var totalPerPEmployee=[];
    tab_text=tab_text+'<table><thead><tr><th>Name</th><th>Date</th><th>Job SignIn</th><th>Lunch SignIn</th><th>Lunch SignOut</th><th>Job Sign Out</th><th>Total Hours(minutes)</th><th>Total Hours(decimal)</th><th>Total per Day></th></tr></thead>';
    for (j = 1; j < tab.rows.length; j++) {
        var row=[];
        const jobDate=tab.rows[j].cells[3].childNodes[0].value;
        if ( ( jobDate >= fromDate ) && ( jobDate <= toDate )) {

            row.push(tab.rows[j].cells[2].childNodes[0].value); // name
            row.push(tab.rows[j].cells[3].childNodes[0].value); // date
            row.push(tab.rows[j].cells[4].childNodes[0].value);
            row.push(tab.rows[j].cells[5].childNodes[0].value);
            row.push(tab.rows[j].cells[6].childNodes[0].value);
            row.push(tab.rows[j].cells[7].childNodes[0].value);
            const total_hours=tab.rows[j].cells[8].childNodes[0].value;  
            row.push(tab.rows[j].cells[8].childNodes[0].value);
  
            if ( ( total_hours != "" ) ) {
                
                const min_decimal=Math.round((Number(total_hours.split(".")[1])/60*100));
                const hours=total_hours.split(".")[0];
                row.push(hours+"."+min_decimal);
                if (  typeof totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value] === "undefined" ) {
                    totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value] = [];
                    totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value][tab.rows[j].cells[3].childNodes[0].value] = 0;    // initialize
                }
                else
                    if (typeof totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value][tab.rows[j].cells[3].childNodes[0].value] === "undefined" ) 
                        totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value][tab.rows[j].cells[3].childNodes[0].value] = 0;    // initialize

                totalPerPEmployee[tab.rows[j].cells[2].childNodes[0].value][tab.rows[j].cells[3].childNodes[0].value] += Number(hours+"."+min_decimal);
            }
            else
                row.push("");
            reportArray.push(row);
        }        
        
    }

    // sort the array based on the employee name // per Eyal 06-17
    reportArray.sort(function(a,b) {

        let ret = 0; // default, names are equal
        if (a < b) 
            ret= -1;
        else
          if (a > b) 
            ret = 1;    
        
        return ret; 
    });

    // construct the html
    for (let i = 0; i < reportArray.length; ++i) {
        tab_text += '<tr><td width="300px">'+reportArray[i][0]+'</td>';  // full name
        tab_text += '<td>'+reportArray[i][1]+'</td>';                    // Date
        tab_text += '<td>'+reportArray[i][2]+'</td>';                    // Sign In
        tab_text += '<td>'+reportArray[i][3]+'</td>';                    // lunch In
        tab_text += '<td>'+reportArray[i][4]+'</td>';                    // lunch out
        tab_text += '<td>'+reportArray[i][5]+'</td>';                    // Sign Out
        tab_text += '<td>'+reportArray[i][6]+'</td>';                    // Total Hours
        tab_text += '<td>'+reportArray[i][7]+'</td>';               // Total Hours (Decimal)
        if (i+1 < reportArray.length) { // make sure not overflow over the array
            if  ( reportArray[i][0] == reportArray[i+1][0] ) { // check if same employee and different day
                 if ( reportArray[i][1] != reportArray[i+1][1] ) 
                    tab_text += '<td>'+totalPerPEmployee[reportArray[i][0]][reportArray[i][1]]+'</td>';
            }
            else 
                tab_text += '<td>'+totalPerPEmployee[reportArray[i][0]][reportArray[i][1]]+'</td>';
        }
        else
            tab_text += '<td>'+totalPerPEmployee[reportArray[i][0]][reportArray[i][1]]+'</td>';   
        tab_text += '</tr>';               // end of tr

     }

    tab_text = tab_text + "</table>";

    var msie = window.navigator.userAgent.indexOf("MSIE ");

    // If Internet Explorer
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, "employee_jobs.xls");
    } else
        // other browser not tested on IE 11
        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        
    document.getElementById("exportDateRangeDialog").close();
    $(".hyperlinkLabel").visible(); // hide the export label
    return false;
}

function onChangeDate(event) {

    windowLog.trace("inside onChangeReport..");

    const date1 = Date.parse(document.getElementById("fromDate").value);
    const date2 = Date.parse(document.getElementById("toDate").value);

    //var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    //var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    if (date2 < date1)
        document.getElementById("submitDateRangeID").disabled = true;
    else 
        document.getElementById("submitDateRangeID").disabled = false;
}

function cancelDateDlg(event) {

    windowLog.trace("inside cancelReport..");

    const exportDialog = document.getElementById("exportDateRangeDialog");
    exportDialog.close();

    $(".hyperlinkLabel").visible(); // show again the export label

    //return false;
}

function exportDlgReport(event) {

    //var tab_text = "<table>";
    //var j = 0;
    //var tab = document.getElementById('result-table'); // 

    windowLog.trace("inside exportReport..");
    $(".hyperlinkLabel").invisible(); // hide the export label
    var out = '<form action="" method="POST" onsubmit="return submitDateRange(this);">';
    out += '<p>';
    out += '<label>';
    out += 'Please select a date range to export:<br><br>'; 
    out += `From: <input type="date" class="inputDate" value=${today} name="datepicker" onchange="onChangeDate(event);" id="fromDate" required/>`;
    out += `&nbsp&nbsp`;
    out += `To:<input type="date" class="inputDate" value=${today} name="datepicker2" onchange="onChangeDate(event);" id="toDate" required /> <br>`;
    out += '</label>';
    out += '</p>';
    out += '<div>';
    out += `<input type="button" value="Cancel" onclick="return cancelDateDlg(event)";>`;
    out += `&nbsp&nbsp`
    out += `<input type="reset" value="Reset" id="resetForm">`;
    out += `&nbsp&nbsp`
    out += `<input type="submit" value="Submit" id="submitDateRangeID">`;
    out += '</div>';
    out += "</form>";

    const exportDialog=document.getElementById("exportDateRangeDialog");
    exportDialog.innerHTML=out;
    exportDialog.showModal();

    //return false;
}