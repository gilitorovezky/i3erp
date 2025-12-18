    const cstrIDtoProperty={"customerNumber":"customer_number",
                            "customerFirstName":"customer_first_name",
                            "customerLastName":"customer_last_name",
                            "AddrLine1":"customer_address_line1",
                            "AddrLine2":"customer_address_line2",
                            "city":"customer_city",
                            "state":"customer_state",
                            "zip":"customer_zip",
                            "email":"customer_email",
                            "telNumber":"customer_tel_number",
                            "notesID":"customer_notes",
                            "fileUploaded":"file_uploaded",
                            "files":"images_json"
                        };

    $( "body" ).delegate("#"+cstrIDtoProperty.state,"change",function(event) {

        windowLog.trace("Inside state change");
        const saveResult=saveCustomer("");

    });

    function customers() {
            
        const screen_name="Customers";
        windowLog.trace("Inside "+screen_name);
        let out = "";
        var tabI=1;
        var sumOfInvoices =0;
        const targetDisplay = "#result-table1"; 
        $("#screen_name").html(screen_name);
        lastScreen=screen_name;
        prepareDisplay(targetDisplay);

        const length=classArray[screen_name].arr.length;
        out = headers[screen_name]['columns'];
        out += `<tbody class="thover">`;

        /*for (const element of classArray[screen_name].arr) {
            windowLog.trace("Element:"+element);
        }*/
        //const idName=headers["Customers"]['primaryKey'];
        for (var i = 0; i < length; i++) { //loop throu the return msg starting from 1 since entry 0 holds the return msg
            const fileupload=uploadFilesMngr(Number(classArray[screen_name].arr[i].file_uploaded),(classArray[screen_name].arr[i].project_number != ""));
           
            outFiles = `<td tabindex="0">${fileupload}</td>`;
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' id="delImageID" alt='minus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" type="text" id='${headers[$("#screen_name").html()]['primaryKey']}' class="projectNameClass" size="10" readonly value="${classArray[screen_name].arr[i].customer_id}">`;

            //id="${cstrIDtoProperty.customerNumber}" value="${customerNumber}"
            out += `<input type="hidden"  id="${cstrIDtoProperty.customerNumber}" value=${classArray[screen_name].arr[i].customer_number}></td>`;
            //out += `<input type="hidden" id='${idName}' value=${classArray[screen_name].arr[i].customer_id}></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.customerFirstName}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_first_name}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.customerLastName}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_last_name}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.telNumber}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_tel_number}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.email}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_email}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.AddrLine1}"class="projectNameClass" value='${classArray[screen_name].arr[i].customer_address_line1}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.AddrLine2}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_address_line2}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.city}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_city}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.state}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_state}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.zip}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_zip}'></td>`;
            out += `<td><input tabindex="0" type="text" id="${cstrIDtoProperty.notesID}" class="projectNameClass" value='${classArray[screen_name].arr[i].customer_notes}'></td>`;
            out += outFiles+`</tr>`;
        }

        out += `</tbody></table>`;

        $(targetDisplay).html(out); // print to screen the return messages
        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)').first();
        setCellFocus();
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"));

        return false;
    }

    function showCustomer(customerNumber,eventId) {    // customerIndx point to the record in the customers array

        var customerRec={"customer_id":"",
                         "customer_number":0,
                         "customer_first_name":"",
                         "customer_last_name":"",
                         "customer_address_line1":"",
                         "customer_address_line2":"",
                         "customer_city":"",
                         "customer_state":defaultState.abbreviation,
                         "customer_zip":"",
                         "customer_email":"",
                         "customer_tel_number":"",
                         "customer_notes":"",
                         "file_uploaded":0,
                         "images_json":""
                        };

        windowLog.trace("Inside showCustomer");
        let isNewCustomer=false;
        lastScreen = "Customers";
        const screen_name="Customers";
        windowLog.trace("Inside "+screen_name);

        $("#navID,#result-table1").addClass("greyed-out");
        const aboutDlg=document.getElementById("aboutDialog");
        prepareDisplay("stub");
        
        //var tabindex=1;

        if ( customerNumber == -1 ) {
            windowLog.trace("New customer");
            $("#editCBID").prop( "checked", true );   // enable Edit mode
            isNewCustomer=true;
            customerNumber=(classArray["Customers"].arr.length)+1;  // cutoemr nubeer is the next entry
            customerRec.customer_id=Number(classArray["Customers"].arr[classArray["Customers"].arr.length-1].customer_id)+1;
        }
        else {
            windowLog.trace("Customer number:"+customerNumber);
            customerRec=classArray["Customers"].arr[customerNumber];
        }
        let cstmrForm=`<table class="" name="newCustomer" id="customerTblID" style="width:100%;height:25%;border-bottom:2px solid"><tbody><tr><td style="width:50%">`;
        cstmrForm += `<table><tbody>`;
        cstmrForm += `<tr style="height:20px">`;
        cstmrForm += `<td style="width:28%;font-weight:bold" >Customer ID:</td>`; //<input type="hidden" id="customerNumber" value="1" readonly>
        cstmrForm += `<td id='${headers["Customers"]['primaryKey']}'>${customerRec.customer_id}</td><input type="hidden" id="${cstrIDtoProperty.customerNumber}" value="${customerNumber}" readonly></tr>`;
        cstmrForm += `<tr style="height:20px">`;
        cstmrForm += `<td style="width:28%;font-weight:bold"><label for="${cstrIDtoProperty.customerFirstName}">First Name:</label></td><td style="width:20%"><input tabindex="0" type="text" id="${cstrIDtoProperty.customerFirstName}" size="15" maxlength="50" value="${customerRec.customer_first_name}" required></td>`;
        cstmrForm += `<td style="width:0%"></td><td style="width:17%;font-weight:bold"><label for="${cstrIDtoProperty.customerLastName}">Last Name:</label></td><td><input tabindex="0" type="text" id="${cstrIDtoProperty.customerLastName}" size="15" maxlength="50" value="${customerRec.customer_last_name}" required></td></tr>`;
        cstmrForm += `</tbody></table>`;
        cstmrForm += `<table><tbody><tr><td style="font-weight:bold">Billing Address</td></tr></tbody></table>`;
        cstmrForm += `<table><tbody>`;
        cstmrForm += `<tr style="height:30px">`;
        cstmrForm += `<td style="width:28%;font-weight:bold"><label for="${cstrIDtoProperty.AddrLine1}">Address Line1:</label></td><td style="width:20%"><input type="text" id="${cstrIDtoProperty.AddrLine1}" size="15" maxlength="50" value="${customerRec.customer_address_line1}"></td>`;
        cstmrForm += `<td style="width:0%"></td><td style="width:16%;font-weight:bold"><label for="${cstrIDtoProperty.AddrLine2}">Address Line2:</label></td><td><input type="text" id="${cstrIDtoProperty.AddrLine2}" size="5" maxlength="50" value="${customerRec.customer_address_line2}"></td></tr>`;
        cstmrForm += `<tbody></table>`;

        cstmrForm += `<table><tbody>`;
        cstmrForm += `<tr style="height:30px">`;
        cstmrForm += `<td style="width:30%;font-weight:bold"><label for="${cstrIDtoProperty.city}">City:</label><td style="width:0%"><input type="text" id="${cstrIDtoProperty.city}" size="15" maxlength="50" value="${customerRec.customer_city}"></td>`;
        cstmrForm += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="${cstrIDtoProperty.state}">State:</label></td><td style="width:0%">`;
        if (isNewCustomer)
            cstmrForm += `<select id="${cstrIDtoProperty.state}" style="width:150px" disabled><option value=${defaultState.abbreviation}>${defaultState.name}</option></select></td>`;
        else
            cstmrForm += `<select id="${cstrIDtoProperty.state}" style="width:150px" ><option value=${customerRec.customer_state}>${customerRec.customer_state}</option></select></td>`;

        cstmrForm += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="${cstrIDtoProperty.zip}">Zip:</label></td><td style="width:10%"><input type="text" id="${cstrIDtoProperty.zip}" size="5" maxlength="5" value="${customerRec.customer_zip}"></td></tr>`;
        cstmrForm += `</tbody></table>`;
        cstmrForm += `<table><tbody>`;
        cstmrForm += `<tr style="height:30px">`;
        cstmrForm += `<td style="width:10%;font-weight:bold"><label for="${cstrIDtoProperty.email}">email:</label></td><td><input type="text" id="${cstrIDtoProperty.email}" size="40" maxlength="30" value="${customerRec.customer_email}"></td>`;
        cstmrForm += `<td style="width:0%"></td><td style="width:15%;font-weight:bold"><label for="${cstrIDtoProperty.telNumber}">Tel Number:</label></td><td><input id="${cstrIDtoProperty.telNumber}" style="width:90px" size="10" maxlength="10" value="${customerRec.customer_tel_number}"></td></tr>`;
        cstmrForm += `<tbody></table>`;
        cstmrForm += `</td>`; 
        cstmrForm += `<td style="width:50%">`;
        cstmrForm += `<table style="width:100%">`;
        cstmrForm += `<tr>`;
        cstmrForm += `<td style="font-weight:bold;width:80%"><label for="${cstrIDtoProperty.notesID}">Notes:</label ></td>`;
        if (isNewCustomer)
            cstmrForm += `<td style="width:20%;text-align:end"><button id="cstmrUploadFileID" type='button' class='button' hidden>Upload file(s)</button></td>`;

        else {
            if ( Number(customerRec.file_uploaded) > 0 ) // not new customer and file already uploaded
                cstmrForm += `<td style="width:20%;text-align:end""><select id='selectFiles' class='filesSelect button'><option value='uploadFiles'>Upload Files</option><option value='showFiles'>Show Files</option></select></td>`;
            else
                cstmrForm += `<td style="width:20%;text-align:end"><button id="cstmrUploadFileID" type='button' class='button'>Upload file(s)</button></td>`;
        }

        cstmrForm += `</tr>`;
        cstmrForm += `<tr><td colspan="2"><textarea rows="6" style="width:100%;height:100%;overflow-y: scroll;resize: none;" id="${cstrIDtoProperty.notesID}">${customerRec.customer_notes}</textarea></td></tr>`;
        //cstmrForm += `<tr><td class="paneTopRow"><input hidden type='button' class='button' value="Update record" id="updateRecordBtn"/></td></tr>`;  // tr for the update button of estiamtes/leads/projects when the user loiop throu custoemrs records
        cstmrForm += `</table></td></tr>`;  // notes
        cstmrForm += `</tbody></table>`;

        //cstmrForm += `<div id="scrollDivID1" hidden class="scrollit">`; // leads pane
        //var pane="leads";
        /* Dont shopw any leads/Estimates/Projectspane
        customerPanes.map(function(pane) {  // loop over the panes
        
            cstmrForm += `<table id="${pane}TableWrap" class="paneTableClass">`;

            cstmrForm += `<tr><td>`;
            cstmrForm += `<table style="width:100%;height:23%"<tr><td style="font-size:16px;font-weight:bold">${pane}</td><td></td>`;
            if (isNewCustomer)
                cstmrForm += `<td style="width:33%" id="menueTD" class="paneTopRow"><input type='button' class='button' value="Add New" hidden id="new${pane}Btn"/></td>`;
            else
                cstmrForm += `<td style="width:33%" id="menueTD" class="paneTopRow"><input type='button' class='button' value="Add New" id="new${pane}Btn"/></td>`;

            cstmrForm +=`</tr></table>`; // of topRow

            cstmrForm +=`</td></tr>`;   // of the first row
            cstmrForm += `<tr><td>`;    // start the 2nd row - main
            cstmrForm += `<div id="scrollDivID2" class="scrollit2">`; // estimates pane

            cstmrForm += `<table id="${pane}Pane" class="paneContentTable"></table>`;
            cstmrForm += `</div>`;
            cstmrForm +=`</td></tr></table>`;   // close the 2nd row and the leadsTableWrap
        }); */

        /*cstmrForm += `<table id="estimatesPane" style="width:100%;height:23%;border:2px solid;"></table>`;
        cstmrForm += `<table id="projectsPane" style="width:100%;height:20%;border:2px "></table>`;*/

        cstmrForm += `<tr><td style="width:0%">`;
        cstmrForm += `<center><input type='button' class='button' value='Close' id='closeCstmnrDlg'/></td></tr>`;
        cstmrForm += `</tbody></table>`; // customertTblID

        //$('#'+cstrIDtoProperty.customerFirstName).focus();
        
        $("#aboutDialog").addClass("customersDlg"); // set the hxw
        $("#aboutDialog").css({'padding' 	: '0px'});
        //$("#overLay").remove(); // remove the orioginal to allw the input key to process the keys 
        aboutDlg.innerHTML=cstmrForm;
        aboutDlg.showModal();
    
        const dropdown =$("#customerTblID").find("#"+cstrIDtoProperty.state); //$("#"+cstrIDtoProperty.state); 

        // Populate the dropdown with states
        $.each(states, function(index, state) {
          dropdown.append($("<option></option>")
            .attr("value", state.abbreviation)
            .text(state.name));
        });

        //if ( isNewCustomer )
        //    $('#'+cstrIDtoProperty.state+' option[value='+defaultState.name+']').attr("selected",true);

        customerPanes.map(function(pane) {  // loop over the panes
            if ( !isNewCustomer ) // if it is a new custoemr then no leads no estiamtes and no projects to show 
                displayAssociatedRecords(pane,customerNumber);
        })
        
        //currCell=$$("#customerTblID").find('input[id="customer_first_name"]').closest('td'); // Identify the TD {cstrIDtoProperty.customerFirstName}
        //setCellFocus();
        $("#customerTblID").find('input[id="customer_first_name"]').focus();
    }

    function displayAssociatedRecords(pane,cstmrEntry) {

        let out="";
        let arr="";
        const paneAction = {
            "Leads"       : () => { 
                            isLinksRecords=(Number(classArray["Customers"].arr[cstmrEntry].isLeads) === 1?1:0);},

            "Estimates"   : () => { 
                            isLinksRecords=(Number(classArray["Customers"].arr[cstmrEntry].isEstimates) === 1?1:0);},

            "Projects"    : () => { 
                            isLinksRecords=(Number(classArray["Customers"].arr[cstmrEntry].isProjects) === 1?1:0);}
        }
        paneAction[pane]();
        //arr=pane;
        if ( isLinksRecords ) {
            cstmrIdx=classArray["Customers"].arr[cstmrEntry].customer_id;
            assctRecords=classArray[pane].arr.filter(record => record.customer_id === cstmrIdx );
            if ( assctRecords != "" ) {
                //out = headers[pane]["columns"];
                out = `<table><tbody>`;
                out += `<tr style="height:30px">`; // line 1
                out += `<td style="width:30%;font-weight:bold"><label for="city">City:</label><td style="width:0%"><input type="text" id="${cstrIDtoProperty.city}" size="15" maxlength="50" value="${customerRec.customer_city}"></td>`;
                out += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="state">State:</label></td><td style="width:0%">`;
                out += `<select id="${cstrIDtoProperty.state}" style="width:150px"><option value=${defaultState.abbreviation}>${defaultState.name}</option></select></td>`;
                out += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="zip">Zip:</label></td><td style="width:10%"><input type="text" id="zip" size="5" maxlength="5" value="${customerRec.customer_zip}"></td></tr>`;

                out += `<tr style="height:30px">`; // line 2
                out += `<td style="width:30%;font-weight:bold"><label for="city">City:</label><td style="width:0%"><input type="text" id="${cstrIDtoProperty.city}" size="15" maxlength="50" value="${customerRec.customer_city}"></td>`;
                out += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="state">State:</label></td><td style="width:0%">`;
                out += `<select id="${cstrIDtoProperty.state}" style="width:150px"><option value=${defaultState.abbreviation}>${defaultState.name}</option></select></td>`;
                out += `<td style="width:0%"></td><td style="width:0%;font-weight:bold"><label for="zip">Zip:</label></td><td style="width:10%"><input type="text" id="${cstrIDtoProperty.zip}" size="5" maxlength="5" value="${customerRec.customer_zip}"></td></tr>`;

                out += `</tbody></table>`;


                out += `<tbody class="thover">`;
                switch (pane) {

                    case "Leads"        :
                        break;

                    case "Estimates"    :
                        break;

                    case "Projects"     :
                        out += prepareProjectRecords2Display(assctRecords);
                        break;
                }
                out += `</tbody>`;  // close the tbody
                $("#"+pane+"Pane").html(out);
            }
        } else {    // empty pane then show the header
            out = "";
            if ( pane != "Leads")
                out = headers[pane]["columns"];
            out += `<tbody class="thover">`;
            $("#"+pane+"Pane").html(out);
        }
    }
    
    function updateCustomerPane(cstmrId)    {

        const cstmrNumber=classArray["Customers"].arr.findIndex(t => t.customer_id == cstmrId);
        if ( cstmrNumber != -1) {
            windowLog.trace("cstmID:"+cstmrId+" found");
            $("#"+headers["Customers"]['primaryKey']).text(cstmrId);    // retain the index entry to ber used later to populate custoemr form if needed
            $("#customerNumber").val(cstmrNumber);
            for (const [key, value] of Object.entries(cstrIDtoProperty)) {
               //$("#"+Object.keys(x)[0]).val(classArray["Customers"].arr[cstmrNumber][Object.values(x)[0]]);
               $("#"+key).val(classArray["Customers"].arr[cstmrNumber][value]);
            }
            updaterCustomerPanes(cstmrNumber); // now update the panes
        } else
            windowLog.trace("cstmID:"+cstmrId+" not found!");
    }

    function updaterCustomerPanes(customerNumber) {

        customerPanes.map(function(pane) {  // loop over the panes
            displayAssociatedRecords(pane,customerNumber);
        })
    }

    function buildCstmrSearchString(empEntry) {

        return empEntry.customer_first_name+empEntry.customer_last_name+empEntry.customer_address_line1+empEntry.customer_city+empEntry.customer_email+empEntry.customer_tel_number;
    }

    function updateCustomerView(row,arrEntry) {



    }