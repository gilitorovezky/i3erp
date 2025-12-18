    function addDashes(f) {
            var r = /(\D+)/g,
                npa = '',
                nxx = '',
                last4 = '';
            f.value = f.value.replace(r, '');
            npa = f.value.substr(0, 3);
            nxx = f.value.substr(3, 3);
            last4 = f.value.substr(6, 4);
            f.value = npa + '-' + nxx + '-' + last4;
    }

    function getNewLead(leadID) {

        let dateLead = new Date();
        let minutesLead =  dateLead.getMinutes();
        let minutesHour =  dateLead.getHours();
        if ( minutesLead < 10 )
            minutesLead = '0'+minutesLead;
        if ( minutesHour < 10 )
            minutesHour = '0'+minutesHour;


        var record=`<tr><td><div id=lead`+leadID+`><table style="width:100%"><tr>
        <td class="cell-1"><label style="font-weight:bold">Lead ID:</label><label id="lead_id" style="display:inline-flex;justify-content:center;width:40%">`+leadID+`</label></td>
        <td class="cell-2"><label for="dDate" style="font-weight:bold">Appnt Date:</label>
        <input type="date" id="leadDate" value=`+today+` class="inputDate" style="background-color:white" required/>
        </td>
        <td class="cell-3"><label for="tTime" style="font-weight:bold">Appnt Time:</label>
        <input type="time" id="tTime" name="time" class="inputTime" value=`+minutesHour+ ":" +minutesLead+` style="background-color:white" required/>
        </td>
        <td class="cell-4"><label for="pm-dropdown" style="font-weight:bold">Assign To:</label>
        <select id="pm-dropdown" style="width:66%;"><option id="Eyal">Eyal</option></select></td>            
        <td class="cell-5"><label for="addrsSlctor" style="font-weight:bold">Billing Address </label>
            <input type="checkbox" class="img_chkbox" id="addrsSlctor" name=`+leadID+` style="vertical-align:middle">
            <label for="adrsLine1" style="font-weight:bold">Address Line1: </label>
            <input type="text" id="adrsLine1" name="adrsLine1" required maxlength="50" style="width:60%"/>
        </td>
        <td class="cell-6"><label for="adrsLine2" style="font-weight:bold">Address Line2:</label>
            <input type="text" id="adrsLine2" name="adrsLine2" required maxlength="50" style="width:65%" value="apt/floor"/>
        </td>
        <td class="cell-20"><label for="zip" style="font-weight:bold">Zip:</label>
            <input type="text" id="zip" name="zip" required maxlength="5" style="width:55%"/>
        </td>
        <td class="cell-7"><label for="city" style="font-weight:bold">City: </label>
            <select id="city-dropdown" style="width:80%;"><option id="SD">San Diego</option><option id="PWY">Poway</option><option id="ESCND">Escondido</option></select> <!--style="width:150px" -->
        </td>
        <td class="cell-8"><label style="font-weight:bold">State:</label><label id="state" style="background:white">CA</label></td>
        </td>
        <td class="cell-9"><label style="font-weight:bold">Files:</label><a class="hyperlinkLabel" id="LeadFileID" name="LeadFile" style="background:white">0</a></td>
        </td></tr></table><table><tr>
        <td class="cell-10"><label for="leadName" style="font-weight:bold">First Name: </label><input type="text" id="leadName" required maxlength="50" /></td>
        <td class="cell-11"><label for="lastName" style="font-weight:bold">Last Name: </label><input type="text" id="lastName" style="width:75%" required maxlength="50" /></td>
        <td class="cell-12"><label for="telNumber" style="font-weight:bold">Tel Number: </label><input id="telNumber" maxlength="15" name="atn" size="12" onKeyup='addDashes(this)' /></td>
        <td class="cell-13"><label for="leadEmail" style="font-weight:bold">email: </label><input type="text" id="leadEmail" style="width:80%" required maxlength="50" ></td>
        <td class="cell-14"><label for="notes" style="font-weight:bold">Notes:</label><input type="text" id="notes" style="width:95%" required maxlength="70" /></td>
        </tr></table></div></td></tr>`;

        return record;
    }

    function leads() {
            
        const screen_name="Leads";
        windowLog.trace("Inside "+screen_name);
    
    }

    function newLead() {

         //if ( ($("#LeadsPane tbody tr").length) == 0 )  // no rows displayed then show header
                    //const out = ;
        windowLog.trace("Inside newLead");
        if ( $("#LeadsPane")[0].rows.length == 0 )  // if no leads are displayed than add the 1st otherwqise add after the last
            $('#LeadsPane').html(getNewLead(lastID["Leads"]++));
        else
            $('#LeadsPane > tr').eq($("#LeadsPane")[0].rows.length-1).after(getNewLead(lastID["Leads"]++)); 
        $("#newLeadsBtn").removeClass("button").prop("disabled",true);  // disable after creating a new Leads till the new one is saved
        //$("#LeadsPane").html(newLeadRow);
        
    }