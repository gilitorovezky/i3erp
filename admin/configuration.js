    function configuration() {

        windowLog.trace("Inside Configuration");
        screenNumber="config";
        $(".scrollit").hide();
        $("#editLabelID").hide();
        $("#result-table1").unbind('mouseover');
        $("#result-table1").unbind('mouseleave');
        $("#result-table1").unbind('mouseenter');
        $("#ul, #ur, #ll, #lr").addClass("configScreen");
        $("#ul, #ur, #ll, #lr").removeClass("homeScreen");
    
        //$("#searchDivID").invisible();

        displayMainMenue("config");
       // $("#main-menue").css("background-color","#4ccd4a");

       // $("#exportDialogueID").invisible(); 
        $(".grid-gallery").hide();
        //$(".grid-gallery").css({'display' : "none"});
        $("#screen_name").html("Configuration");
        
        
        $('#result-table1,#postScrollit').html("");
       
        if ( lastScreen === "Scheduler" ) { // if the last screen was Scheduler than restore default
            document.getElementById('result-table').id = 'result-table1';
            $("#newTaskShortCutID").invisible();
            $("#result-table1").removeClass("tbl_schedule");
            $("#result-table1").removeClass("res_table");
            $("#result-table1").addClass("outer-table");
            $(".res_table1 thead th:first-child").css({'width':'22px'});
            document.getElementById("exportID").hidden=true;
        }

        document.getElementById("result-table1").hidden=true;
        lastScreen="Configuration";
        screenName="Configuration";
        
        $('#newProject,#addSingleRec,#overLay,#screen_name,#editDiv,#bHalf,#customers,#tHalf,#newScheduler').hide();
        $(".main_menue").css({'background-color':'#4ccd4a'});
        $("#main-menue, #centercellID, #parentDiv").show();
        $("#centercellID").visible();
        $("#upperLeft").focus();
        editing=false;
        charactersCount=0;  // reset the coutner
        origText="";
    }

    function showHR(employee_id) {

        windowLog.trace("Inside manageHR...");

        manageHR(employee_id,"#result-table1");

        /*$.ajax({url         :   "../main/read_hourlyrate.php",
                method      :   "POST",
                dataType    :   "json",
                async       :   false,  
                data        :   {employeeID: employee_id},
                success     :   function (data) { 
                    if ( Number(data[0].Status) > 0 ) {
                            // manageHR(data,"#result-table1");
                    }},
                error       :   function (jqXHR, textStatus, errorThrown) { 
                    windowLog.warn(errorThrown); }
        });*/
    }

    function manageHR(eID,targetDisplay) {

        windowLog.trace("Inside manageHR...");
        const screen_name="Hourly Rate";
        //var passedArray = response;
        const passedArray=classArray["Hourly Rate"].arr.filter((x) => ( ( x.employee_id == eID) ));

        const length=passedArray.length;  // Get the number of entries
        prepareDisplay(targetDisplay); // hide the top menue
        
        let out = "";
        var tabI=1;

        lastScreen=screen_name;
        
        $("#screen_name").html(screen_name);//+" ("+passedArray[1].fullname+")"); // retreving from row 1 since row 0 is the return msg
        
        out =`<thead id="mainHeader"><tr><th></th>`; 
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        for (var i = 0; i < length; i++) { //loop throu the return msg, starting from 1 since 0 is for the return message
            out += `<tr><td></td>`;
            out += `<td><input tabindex="0" type="text" maxlength="5" name="hourlyRate" class="projectNameClass" readonly value=${passedArray[i].hourlyrate}>`;
            out += `<input type="hidden" id=''${headers[$("#screen_name").html()]['primaryKey']}' name="hourlyRateID" value=${passedArray[i].hr_id}></td>`;
            //out += `<td tabindex="0"><input type="date" class="inputDate" name="hourlyRateDate" value=${passedArray[i].effective_date}></td>`;
            out += `<td tabindex="0">${passedArray[i].effective_date}</td>`;
            out += `</tr>`;
        }
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML = out+`</tbody`; // print to screen the return messages
        $('th:nth-child(1)')[0].id=passedArray[0].employee_id;
        lastID["Hourly Rate"]=Number(passedArray[length-1].hr_id);
        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)').first(); // currCell points to 2nd TD in the last TR
        currCell.children().first().focus();// focus on the first input!!

        return false;
    }

     function manageEmployees() {

        windowLog.trace("Inside manageEmployees...");

        targetDisplay = "#result-table1";
        const screen_name="Employees";
		let out = "";

        lastScreen=screen_name;
        $("#screen_name").html(screen_name);
	
		const eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
        const length=eArray.length;		
        prepareDisplay(targetDisplay);
      
        out = `<thead id="mainHeader"><tr><th></th>`; 
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
     
        if (length == 0) {	// No records found, just show an empty record
            
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' value="DeleteImage" alt='plus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" type="text" name="fullName" class="projectNameClass" maxlength="30">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="employeeID" value="1"></td>`;
            out += `<td><input tabindex="0" type="text" name="employmentType" class="projectNameClass" maxlength="10"></td>`;
            out += `<td><input tabindex="0" type="text" name="hourlyRate" class="projectNameClass" value=""></td>`;
            out += `<td><input tabindex="0" class="inputDate" type="date" name="hourlyRateDate" value=${today}></td>`;
            out += `<td><input tabindex="0" class="inputDate" type="checkbox" name="isActive" value="IsActive" checked>`;
            out += `<label for="isActive"></td>`;
            out += `</tr>`;
        }
        else {
            for (var i = 1; i < length; i++) { //loop throu the return msg, starting from 1 since 0 is for unassigned
                var jsDate=sql2JSDate(eArray[i].effective_date,1);
                out += `<tr>`;
                out += `<td></td>`;
                out += `<td class="fullNameClass"><input readonly tabindex="0" type="text" name="fullname" id="fullNameID" class="projectNameClass" maxlength="30" value="${eArray[i].fullname}">`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="employeeID" value=${eArray[i].employee_id}>`;
                out += `<input tabindex="0" type="color" id="emplColorInputID" class="emplColor" name="employeePrflColor" value=${classArray["Employees"].colors[eArray[i].fullname]}></td>`;
                out += `<td><input tabindex="0" type="text" name="employmentType" id="employmentTypeID" class="projectNameClass" maxlength="20" value='${eArray[i].employment_type}'></td>`;
                out += `<td><input tabindex="0" type="text" id="hourlyRateID" name="hourlyRate" readonly maxlength="7" class="projectNameClass" value='${eArray[i].hourlyrate}'></td>`;
                out += `<td id="hrDateID">${jsDate}</td>`;
                if ( eArray[i].is_active === "1" )
                    out += `<td><input tabindex="0" id="isActEmplID" class="inputDate" type="checkbox" name="isActive" value="IsActive" checked></td>`;
                else 
                    out += `<td><input tabindex="0" id="isActEmplID" class="inputDate" type="checkbox" name="isActive" value="IsActive"></td>`;

                out += `<td><input tabindex="0" tabindex="0" name="password" class="projectNameClass" maxlength="10" type="password" value='${eArray[i].password}' required></td>`;
                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));  
                out += `<td>${fileupload}</td>`;
                out += `</tr>`;
            }
            DelCounter++;
        }
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML = out; // print to screen the return messages
        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)').first(); // currCell points to 2nd TD in the last TR
        setCellFocus();
        //$('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"));
        //AddingSort(); // adding sorting option to the table
    
        return false;
    }

    function displayVendors(targetDisplay) {

        windowLog.trace("Inside displayVendors...");
		
        var tabI=1;
        const screen_name="Vendors";
        let out = "";
        let eArray=[];

        lastScreen=screen_name;
        $("#screen_name").html(screen_name);
     
        eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
		const length=eArray.length;
        prepareDisplay(targetDisplay);
        out = `<thead id="mainHeader"><tr><th></th>`; 
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        if ( length === 0 ) {	// No records found, just show an empty record
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" type="text" name="vendorName" class="projectNameClass" maxlength="20">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="vendorNameID" value="1"></td>`;
            out += `<td><input tabindex="0" type="text" name="vendorAddress" class="projectNameClass" maxlength="50" value=""></td>`;
            out += `<td><input tabindex="0" type="text" name="vendorNotes" class="projectNameClass" maxlength="50" value=""></td>`;
            out += `</tr>`;
        }
        else {
            for (var i = 0; i < length; i++) { //loop throu the return msg , starting from 1 since 0 is for the return message                    
                out += `<tr>`;
                out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
                out += `<td><input tabindex="0" type="text" name="vendorName" id="vendorNameID" class="projectNameClass" maxlength="20" value="${eArray[i].vendor_name}">`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="employeeID" value=${eArray[i].vendor_id}></td>`;
                out += `<td><input tabindex="0" type="text" name="vendorAddress" id="vendorAddressID" class="projectNameClass" maxlength="40" value='${eArray[i].vendor_address}'></td>`;
                out += `<td><input tabindex="0" type="text" name="vendorNotes" id="notesID" class="projectNameClass" maxlength="50" value="${eArray[i].notes}"></td>`;
                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));
                out += `<td>${fileupload}</td>`;
                out += `</tr>`;
            }
        } 
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML = out; // print to screen the return messages
        
        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)').first(); // currCell points to 2nd TD in the last TR
        currCell.children().first().focus();// focus on the first input!!
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"))
    }

    function displayContractors(targetDisplay) {

        const screen_name="Contractors";
        windowLog.trace("Inside displayContractors...");
        let out = "";

        $("#screen_name").html(screen_name);
        lastScreen=screen_name;
      
        prepareDisplay(targetDisplay);
        eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
		length=eArray.length;

        out = `<thead id="mainHeader"><tr><th></th>`; 
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
        if (length == 0) {	// No records found, just show an empty record
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="deleteImage" alt='plus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" id="contractorNameID" type="text" name="contractorName" class="projectNameClass" maxlength="20" value="">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="contractorID" value="1"></td>`;
            out += `<td><input tabindex="0" id="notesID" type="text" name="notes" class="projectNameClass" maxlength="50" value=""></td>`;
            out += `</tr>`;
        }
        else {
            for (var i = 0; i < length; i++) { //loop throu the return msg , starting from 1 since 0 is for the return message                    
                //vendorsArray.push(passedArray[i].vendor_name);
                out += `<tr>`;
                out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="deleteImage" alt='plus' width='10' height='10'></td>`;
                out += `<td><input tabindex="0" type="text" name="contractorName" id="contractorNameID" class="projectNameClass" maxlength="30" value="${eArray[i].contractorName}">`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="contractorID" value=${eArray[i].contractor_id}></td>`;
                out += `<td><input tabindex="0" type="text" name="notes" id="notesID" class="projectNameClass" maxlength="50" value="${eArray[i].notes}"></td>`;
                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));
                out += `<td>${fileupload}</td>`;
                out += `</tr>`;
            }
            DelCounter=length;
         }
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML = out; // print to screen the return messages
        
        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)').first(); // currCell points to 2nd TD in the last TR
        currCell.children().first().focus();// focus on the first input!!
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"))

        return false;
    }

    function displayCompaniesResults(targetDisplay) {

        windowLog.trace("Inside displayCompanies...");

        const screen_name="Companies";
        let out = "";
        var tabI=1;

        $("#screen_name").html(screen_name);
        lastScreen=screen_name;

        prepareDisplay(targetDisplay);
        eArray = classArray[screen_name].arr;//EmployeeJobs.arrEmployeeJobs;
		const length=eArray.length;
       
        out = `<thead id="mainHeader"><tr><th></th>`; 
        out += headers[screen_name]['columns']+`</tr></thead>`;
        out += `<tbody class="thover">`;
      
        if (length == 0) {	// No records found, just show an empty record
            out += `<tr>`;
            out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
            out += `<td><input tabindex="0" type="text" name="companyName" id="cmpnyID" class="projectNameClass" maxlength="30">`;
            out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="companyID" value="1"></td>`;
            out += `<td><input tabindex="0" type="text" name="companyNotes" id="notesID" class="projectNameClass" maxlength="50" value=""></td>`;
            out += `</tr>`;
        }
        else {
            for (var i = 0; i < length; i++) { //loop throu the return msg , starting from 1 since 0 is for the return message                    
                out += `<tr>`;
                out += `<td><img src='../misc/minus-2.jpg' id="delImageID" value="DeleteImage" alt='plus' width='10' height='10'></td>`;
                out += `<td><input tabindex="0" type="text" name="companyName" id="cmpnyNameID" class="projectNameClass" maxlength="30" value="${eArray[i].company_name}">`;
                out += `<input type="hidden" id='${headers[$("#screen_name").html()]['primaryKey']}' name="companyID" value=${eArray[i].company_id}></td>`;
                out += `<td><input tabindex="0" type="text" name="companyNotes" id="notesID" class="projectNameClass" maxlength="50" value="${eArray[i].notes}"></td>`;
                fileupload=uploadFilesMngr(Number(eArray[i].file_uploaded),(eArray[i].project_number != ""));
                out += `<td>${fileupload}</td></tr>`;
            }
            DelCounter=length;
        }
        out += `</tbody></table>`;
        document.querySelector(targetDisplay).innerHTML = out;//+`</tbody>`; // print to screen the return messages

        currCell = $(targetDisplay+' tbody tr:last td:nth-child(2)'); // currCell points to 2nd TD in the last TR
        currCell.children().first().focus();// focus on the first input!!
        $('.scrollit').scrollTop($('.scrollit').prop("scrollHeight"))
        
        return false;
    }