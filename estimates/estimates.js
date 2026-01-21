    let estimateSaveIntervalId;
    let notes="";

    function estimate(e) {
            
        const screen_name="Estimates";
        windowLog.trace("Inside "+screen_name);
    
    }

    function newEstimate(e) {

        windowLog.trace("Inside newEstimate");

        cstmrID=Number($("#customerTblID").find('td[id='+headers["Customers"]['primaryKey']+']').text()); // get the customer_id value

        entryNumber=classArray[lastScreen].retEntrybyID(cstmrID);

        $("#editDiv").hide();
        $("#aboutDialog").addClass("greyed-out");

        const estimateDlg=document.getElementById("estimateDlg");
        let estmDlg=`<table style="width:100%" name="newEstimate">`;
        estmDlg += `<tr><td style="height:50px;width:20%"><img alt='Y9' src="../misc/y9-logo.png" style="margin:5px;cursor:none"></td>`;
        estmDlg += `<td><table style="width:100%">`;
        estmDlg += `<tr><td style="width:80%;text-align-last:end;font-weight:bold">Date:</td><td>${date.toDateString()}</td></tr>`;
        estmDlg += `<tr><td style="width:80%;text-align-last:end;font-weight:bold">Estimate Number :</td><td>${Number(lastID["Estimates"])+1}</td></tr>`;
        estmDlg += `</table></td>`;
        estmDlg += `</tr></table>`;
        estmDlg += `<table style="font-size:13px;font-weight:bold;width:100%">`;
        estmDlg += `<tr style="height:50px"><td style="width:5%;"></td>`;
        estmDlg += `<td style="width:50%;white-space:pre;">Y9 Construction\n10637 Roselle St Suite D San Diego CA 92121\ninfo@y9construction.com Tel:1.619.436.6527</td>`;
        estmDlg += `<td><table><tr><td>address lkine1</td><td>address line2</td></tr><tr><td>city</td><td>state</td><td>zip</td></tr></table></td>`;
        estmDlg += `<td style="width:5%;"></td>`;
        estmDlg += `</tr>`;
        estmDlg += `</table>`;
        estmDlg += `<br><table id="estimaNotesTblID" style="width:100%">`;
        estmDlg += `<tr><td style="width:40%;font-weight:bold;text-align:end"><label for="estimateTitleID">Title:</label></td>`;
        estmDlg += `<td style="width:50%"><input type="text" id="estimateTitleID" size="50" maxlength="50"></td>`;
        estmDlg += `<td><button id="estimateUploadFileID" class='button'>Upload file(s)</button></td></tr>`;
        estmDlg += `<tr><td colspan="3" style="width:100%;"><center><textarea rows="20" style="width:80%;height:100%;overflow-y:auto;" id="notesID"></textarea></center></td></tr>`;
        estmDlg += `<tr><td colspan="2" style="font-weight:bold;text-align:end"><label for="estimateAmountID">Estimate Amount: $</label></td><td style="width:10%"><input type="text" id="estimateAmountID" size="10" maxlength="10"></td></tr>`;
        estmDlg += `<br>`;
        estmDlg += `<tr><td colspan="3"><center>`;
        estmDlg += `<button type='button' class='button' id='resetEstmateBtn'>Reset</button>`;
        estmDlg += `<button type='button' class='button' id='closeEstmateBtn'>Close</button>`;
        estmDlg += `<button type='button' class='button2' id='printEstmateBtn' disabled>Print</button>`;
        estmDlg += `<button type='button' class='button2' id='emailEstmateBtn' disabled>email</button>`;
        estmDlg += `<button type='button' class='button2' id='pdfEstmateBtn' disabled>PDF</button>`;

        estmDlg += `</center></td></tr>`;
        estmDlg += `</table>`;

        $("#overLay").remove(); // remove the orioginal to allw the input key to process the keys 
        estimateDlg.innerHTML = estmDlg;
        $("#estimateDlg").visible();
        $("#estimateDlg").show();
        //estimateDlg.showModal();
        const screen_name="newEstimates";

        estimateSaveIntervalId=setInterval(() => {
            if (notes != $("#notesID").val())
                windowLog.trace("Saving estimate");
                //saveEstimate();
            
        }, 5000);
    }

    function estimate2PDF() {

        const element = document.getElementById('aboutDialog');
        const options = {
            margin: 1,
            filename: 'my-document.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        $("#closeEstmateDlg").remove();
        html2pdf().set(options).from(element).save();
       // $("#closeEstmateDlg").show()
    }

    function closeEstimateScreen() {

        clearInterval(estimateSaveIntervalId);
        //$("#result-table1").removeClass("greyed-out");
        $("#estimateDlg").invisible();
        $("#editDiv").show();
        $("#aboutDialog").removeClass("greyed-out");
    }

    
    function resetEstimateScreen() {

        $("#notesID").val("");
        $("#emailEstmateBtn,#printEstmateBtn,#pdfEstmateBtn").removeClass("button").prop("disabled",true);

    }