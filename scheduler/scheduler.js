let Monday = new Date();	// Holds the first Monday of the current week
//let origMonday = new Date();
  //var employeesArray="";
  var div_counter_arr=Array();
  const task_color={"open"    : "red",
                    "signin"  : "blue",
                    "closed"  : "green"};

  class pelement {

    static coordinate = [];
     
  }

  /*$(window).on('load', function () {

    windowLog.trace("Inside Scheduler load..");

  });

  //{"projectName":"Ptemp","Description":"Dtemp"}  
  $(document).ready( function() {

    windowLog.trace("Inside Scheduler ready..");
    
  });*/

  /*  $(document).ready(function() {
      $("#screen_name").hover(
        function() {
            // This function runs when the mouse enters the div
            $(this).css("color", "blue");
        },
        function() {
            // This function runs when the mouse leaves the div
            $(this).css("color", "black");
        }
      );
    });*/

  function scheduler() {

    windowLog.trace("Inside scheduler...");
    lastScreen="Scheduler";
    //window.location.hash = '#schdlr';
    prepareDisplay("#result-table1"); // hide the top menue
    $("#screen_name").html(lastScreen); // make sure to use the same name in save!!
    $("#leadsTab_name").html("Leads");
   
    $("#mainDiv").addClass('tab_border');
    $("#preWeekID").html('<a tabindex="0" id="previousWeekID">Previous Week</a>');
    $("#exportID").html(`<a tabindex="0" id="nextWeekID">Next Week</a>`);
    $("preWeekID,#exportID").hidden=false;
    $("#preWeekID").show();

    $('#screen_nameTD,#leadsTab_nameTD,#preWeekID,#exportID,#newTaskShortCutID').addClass('tab-td');
    $('#screen_nameTD').addClass('active');
    $('#screen_nameTD').unbind("click");
    $('#screen_nameTD,#leadsTab_nameTD').on('click', function () { //,#leadsTab_name'

      $('#screen_nameTD,#leadsTab_nameTD').removeClass('active');
      $(this).addClass('active');
      updateWeek(0,this.id);
    });

    document.getElementById('result-table1').id = 'result-table';

    $("#result-table").addClass("res_table tbl_schedule");
    $("#result-table").removeClass("outer-table");
    $(".res_table thead th:first-child").css({'width':'14em'});
    $(".tbl_schedule").addClass('active');
    
  
  
    $("#newTaskShortCutID").html('<a tabindex="0" id="newTaskSC">New Task</a>');
    $("#newTaskShortCutID,#preWeekID,#exportID").addClass('assign');

    //$(".tbl_schedule").show();

    Monday.setHours(-24 * ((Monday.getDay() || 7) - 1)); 
    updateWeek(0); // show the current week
  
    if ( $("#result-table tr:last td:last").index() >= appConfig.maxUAtasksInRow )
        showExceedUnAssgnTasksWarnning();
   
    $("#newTaskShortCutID").visible();
  
    //document.getElementById("saveTableLabel").hidden=false; //disabled per Eyal 6/29
    if ( ( Tasks.intervalEJID === 0 ) &&
         ( Object.keys(Tasks.noneClosedDailyTasks).length > 0 ) ) {
        //windowLog.trace("Set the clock to pollingTasks:"+appConfig.tsPolling_Interval*1000*60);
        Tasks.intervalEJID=window.setInterval(function() {
          refreshReportCallBack();
        }, appConfig.tsPolling_Interval*1000*60);
    }
    return false;
  }

  function binarySearchDate(arr, targetDay) {
    let low = 0;
    let high = arr.length - 1;

    let found=-1;
    const lowerDay=new Date(targetDay.toLocaleDateString('en-CA')).getTime();
    const UpperDay=new Date(targetDay.setDate(targetDay.getDate() + 7)).getTime();
    while  (low <= high){
      let mid = Math.floor((low + high) / 2);
      
      let midDate = new Date(arr[mid].task_date).getTime();
  
      if ( ( midDate >= lowerDay ) && // is the date wihtin the week
           ( midDate <= UpperDay) ) {
        found= mid;   // Found the date at index 'mid'
        low = high+1; // signal the while to exit
      } else 
        if (midDate < lowerDay) {
          low = mid + 1; // Search in the upper half
        } 
        else {
          high = mid - 1; // Search in the lower half
        }
    }
  
    return found; // Date not found
  }

  function updateWeek(phase) {   // Called upon user update the week: 0:current week, -7:previous week or +7 next week

    var iCol=0;
    var anyTaskFlag=false;
    const today = new Date(); // date is a global variable holds today

    div_counter_arr=Array(classArray["Employees"].arr.length+Number(appConfig.maxUArows)).fill([]).map((x) => x = Array((Number(appConfig.maxUAtasksInRow)+2)).fill(0)); // the first element is the employee name, the rest 7 represents one entry per day
    windowLog.trace("updatWeek: Monday is-"+Monday.toDateString());
  
    const dayNumber = today.getDay() || 7; // Get current day number, converting Sun. to 7
    if ( dayNumber !== 1 ) // Only manipulate the date if it isn't Monday since getDay returns 0-6 where 1 is Monday
      today.setHours(-24 * (dayNumber - 1)); // Set today to Sunday
    if ( phase == 0)
      Monday=today;  // set Monday to the original
    else 
      Monday.setDate(Monday.getDate() + phase);  // Inreament or decrement the days by 7

    let tomorrow= new Date(Monday);
    
    let out ="<thead><th>Employee</th>";  //<th>"+tomorrow.toDateString()+"</th>";
    for ( var i=0; i < 7 ; i++ ) {    // loop throu 6 days of the week beginning Monday
        out +="<th>"+tomorrow.toDateString()+"</th>";
        tomorrow.setDate(tomorrow.getDate() + 1)
    }
    out +=`</thead><tbody class="thover">`;    
    activeEmplArr=classArray['Employees'].arr.filter((x) => x.is_active === "1");      // array for all the assigned tasks  (employeeID = -1)

    let unAssignedTasksArr=Tasks.arrTasks.filter( (x) => ( ( x.employee_id === 0 || Number(x.is_assigned) === 0 ) ) );

    unAssignedTasksArr.sort((a, b) => {
      // Convert date strings to Date objects if they are not already
      const dateA = new Date(a.task_date);
      const dateB = new Date(b.task_date);
      return dateA.getTime() - dateB.getTime();   // Compare the dates using their getTime() values
    });
    //const numOfTasks=assignedTasksArr.length;
    

    // filter only the tasks for emplyee id ====3 and a specifc date .. much faster than today 
    //Tasks.arrTasks.filter((x) => x.employee_id ==== "3").filter((x) => x.task_date.split(" ")[0] ==== "2024-05-01")
    for (var employee=0; employee < activeEmplArr.length; employee++) {  // Loop over the list of active employees 
      div_counter_arr[employee][0]=activeEmplArr[employee].fullname//classArray['Employees'].arr[employee].fullname;

      var addEmpls=`<select id="activeEmplListID"><option value="`+activeEmplArr[employee].fullname+`">`+activeEmplArr[employee].fullname+`</option>`;  // build the active employee drop down menue
      var addEmplsHidden=`&nbsp&nbsp<select hidden id="activeEmplListID"><option value="`+activeEmplArr[employee].fullname+`">`+activeEmplArr[employee].fullname+`</option>`;   // build the active employe drop down menue
      const activeEmplys= classArray["Employees"].arr.filter((x) => (x.is_active === "1" && x.fullname != activeEmplArr[employee].fullname)).map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);
      addEmpls += `<option value="unassigned" style="font-weight: bold;">UA</option>`;
      addEmpls += activeEmplys +`</select>`;
      if ( Tasks.unAssignedCount >= appConfig.unAsgnCounter )
        addEmplsHidden +=`<option value="unassigned" disabled style="font-weight: bold;">UA</option>`;
      else
        addEmplsHidden +=`<option value="unassigned" style="font-weight: bold;">UA</option>`;
      
      addEmplsHidden += activeEmplys +`</select>`;
      
      addEmpls=addEmpls.replace(/\,/g, '');
      addEmplsHidden=addEmplsHidden.replace(/\,/g, '');

      const emplyeeName=activeEmplArr[employee].fullname;
      const employeeID=activeEmplArr[employee].employee_id;
      out +=`<tr id="assignedWeek"><td id="employeeName">${emplyeeName}<p hidden id=${employeeID}></p></td>`;
      iCol=0;
      let tomorrow= new Date(Monday);   // Calculate the current Monday
      const startWeek = formatDateForInput(new Date(Monday));
      const endWeek = formatDateForInput(new Date(Monday.getFullYear(),Monday.getMonth(),Monday.getDate()+6));
      let weeklyAssignedTasksArr=assignedTasksArr.filter((x) => ( (x.task_date.split(" ")[0] >= startWeek) && (x.task_date.split(" ")[0] <= endWeek) && x.employee_id === employeeID));
      const numOfTasks=weeklyAssignedTasksArr.length; // num of tasks of the empoloyee for the displayed week
      if ( numOfTasks > 1 ) {
        weeklyAssignedTasksArr.sort((a, b) => { // sort the tasks by date so any "processed" task will be removed from the list for efficiency
          const dateA = new Date(a.task_date);
          const dateB = new Date(b.task_date);

          return dateA.getTime() - dateB.getTime();   // Compare the dates using their getTime() values
        });
      }
      windowLog.trace("employee:"+emplyeeName+", number of tasks loaded for the week:"+numOfTasks);
      for (var i=0; i < 7; i++) {       // loop thru 7 days of the week beginning Monday
          var found =false;
          const suffix=`-${employee}-${iCol}-`;
          const inid="in"+suffix+"0";
          const tx_id="txdiv"+suffix+"0";
          const imgplus="imgpls"+suffix+"0";
          const imgminus="imgmns"+suffix+"0";
          const divid="div"+suffix+"0";
          var taskCounter=0;  // internal counter of tasks per day per employee
          
          for ( var task=0; task < numOfTasks; task++ ) { 
            if ( tomorrow.toLocaleDateString('en-CA') === weeklyAssignedTasksArr[task].task_date.split(" ")[0] ) { // check if the task is for the current day
              if (found) {    // not the first element, then need to add 
                
                windowLog.trace("Additional tasks.. task #:"+(task)+" taskID:"+weeklyAssignedTasksArr[task].task_id);
                windowLog.trace("Now processing "+emplyeeName+" prjNumber:"+weeklyAssignedTasksArr[task].project_name);

                const globalTask=Tasks.arrTasks.findIndex(x => x.task_id === weeklyAssignedTasksArr[task].task_id); // global used to convert from assigned entry to globsl entry
                newTaskHtml=addElement(document.getElementById("imgpls"+suffix+taskCounter),globalTask,false);  // return html code of the new added element
                out =  out.slice(0,-5);   // remove the </td>
                out += newTaskHtml;       // add the code
                out += '</td>';
                taskCounter++;
              }
              else {  // first element
                windowLog.trace("Show task.. task #:"+(task)+" taskID:"+weeklyAssignedTasksArr[task].task_id);
                windowLog.trace("Now processing "+emplyeeName+" prjNumber:"+weeklyAssignedTasksArr[task].project_name);
                prjNumber=weeklyAssignedTasksArr[task].project_name;
                task_descr=weeklyAssignedTasksArr[task].task_description;
                const color=task_color[weeklyAssignedTasksArr[task].task_status]; 
                weeklyAssignedTasksArr[task].inid=inid;
                  
                out += `<td id="assigned"><div id="rootElement" style="display:block">`; 
                if ( weeklyAssignedTasksArr[task].task_status === "open" )
                  out += `<div id=${divid} >`;
                else
                  out += `<div id=${divid} class="container">`;

                  out += `<div>`;
                  out += `<img tabindex="0" id=${imgplus} } src='../misc/plus.png' alt='plus' width='10' height='10' onclick='addElementWrapper(event.target,true)'>&nbsp`;
                  out += `<input tabindex="0" id=${inid} type='text' name='projectNumber' size='30' maxlength="200" value='${prjNumber}' style="border:2px solid ${color}">`;// project Name
                  out += `<input tabindex="0" type="text" hidden name='taskID' value='${weeklyAssignedTasksArr[task].task_id}'>&nbsp`; // task_id
                  out += `<img tabindex="0" id=${imgminus} src='../misc/minus-2.jpg' alt='minus' width='10' height='10' onclick='delElement(event.target,"prompt2Del")'>&nbsp`;
                  out += `<img tabindex="0" src='../misc/file.png' alt='file' width='10' height='10' id="allFilesID">&nbsp`;
                  out += `<button tabindex="0" hidden class="arrow-btn" id="moveUPTask" title="Move Up">↑</button>`;
                  out += `<button tabindex="0" hidden class="arrow-btn" id="moveDownTask" title="Move Down">↓</button>`;
                  if ( weeklyAssignedTasksArr[task].task_status === "open" )
                    out += `<p tabindex="0" id="editTaskID" class="assign">Edit</p>`;
                  
                  out += `</div></div>`;  // Wrapping up buttons and projectname
                  if ( weeklyAssignedTasksArr[task].task_status === "open") 
                    out += `<div id=${tx_id}>`;
                  else
                    out += `<div id=${tx_id} class="greyed-out">`; // if the task hs in progress or closed, disable editing

                  //out += `<div id=${tx_id}>
                  out += `<textarea tabindex="0" name='schdPrjctDscrptn' rows='2' cols='40' class="txtaClass" style="border:2px solid ${color}">${task_descr}</textarea>`;
                  //if ( assignedTasksArr[task].task_status === "open" ) // do not show Assign unlesss the task in open Gil Gil
                  //  out +=`<p id="assignID"  class="assign">&nbsp&nbsp Edit</p>`;

                  out += `</div>`;
                  out += `</div></td>`; // wrap div container
                  document.querySelector("#result-table").innerHTML = out;  // print out the code in order to be able to retrieve the id in case of additional elements
                  found=true;
                  div_counter_arr[employee][iCol+1]=1;  // signal that the first entry has information 
              } // of else
            }
          }
          if ( !found ) { // show empty job 
            out += `<td id="assigned"><div id="rootElement" style="display:block"><div id=${divid} class="container"><div>`;
            out += `<img tabindex="0" id=${imgplus} } src='../misc/plus.png' alt='plus' width='10' height='10' onclick='addElementWrapper(event.target,true)'>&nbsp`;
            out += `<input tabindex="0" id=${inid} type='text' name='projectNumber' size='30' value="">`;
            out += `<input tabindex="0" type="text" hidden name='taskID' value="0">&nbsp`;
            out += `<img tabindex="0" id=${imgminus} src='../misc/minus-2.jpg' alt='minus' width='10' height='10' onclick='delElement(event.target,"prompt2Del")'>&nbsp`;
            out += `<img tabindex="0" src='../misc/file.png' alt='file' width='10' height='10' id="allFilesID">&nbsp`;
            out += `<button tabindex="0" hidden class="arrow-btn" id="moveUPTask" title="Move Up">↑</button>`;
            out += `<button tabindex="0" hidden class="arrow-btn" id="moveDownTask" title="Move Down">↓</button>`;
            out += `<p tabindex="0" id="editTaskID" hidden class="assign">Edit</p>`;
            //out += `  <input type="date" id="unAssgnTskDateID" hidden min="${new Date().toISOString().split('T')[0]}" value="${tomorrow.toLocaleDateString('en-CA')}"></input>`;
            //const currentEmpl="<option value=\""+emplyeeName+"\">"+emplyeeName+"</option>";
            //out += addEmpls; //Hidden.replace(currentEmpl,"");
            //out += addEmplsHidden;
            out += `</div></div>`;  // wrapping up container
            out += `<div id=${tx_id}><textarea tabindex="0" name='schdPrjctDscrptn' rows='2' cols='40' class ="txtaClass"></textarea></div></div></td>`; 
          }
        tomorrow.setDate(tomorrow.getDate() + 1);   // incremeant the day by 1 to the next day
        iCol++;
      }
      out += "</tr>";
    }

    var dayRow=`<tr style="height:20px"></tr><tr style="height:20px"><td id="unAssignedCaptionID"></td></tr><tr id="unAssignElementsTR"><td></td>`; // gap row between the scheduler and all the unassigned tasks
    //tomorrow= new Date(Monday);   // reset the tomorrow back to Monday
    var unAsgnCounter=0;  // counter of unassigned tasks that used as a unique identifer for the unassignedcells

    if ( unAssignedTasksArr.length > 0 ) { 
     
        for (var unAssgnElement=0; unAssgnElement < Math.min(unAssignedTasksArr.length,Number(appConfig.maxUAtasksInRow)); unAssgnElement++) {  // loop over the unassigned tasks to set the default select value and color
            const iSuffix=`-${activeEmplArr.length+unAsgnCounter+2}-${unAssgnElement}-1`; // adding 2 to the row to account for the two Gap TR
                                                                                         
            const iNid="in"+iSuffix;
            const iTx_id="txdiv"+iSuffix;
            const imgminus="imgmns"+iSuffix;
            const iDivid="div"+iSuffix;
            var addEmpls=`&nbsp&nbsp<select id="activeEmplListID">`;
            if ( unAssignedTasksArr[unAssgnElement].employee_name != "unassigned" ) {
              var tActiveEmplys = classArray["Employees"].arr.filter((x) => x.is_active === "1").filter((x) => x.fullname !=  unAssignedTasksArr[unAssgnElement].employee_name ).map((x) => x.fullname );            
              tActiveEmplys.unshift( unAssignedTasksArr[unAssgnElement].employee_name ); // add to the top the employee_name to apears top at the select dropdown
              const activeEmplys = tActiveEmplys.map((x) => `<option value="${x}">${x}</option>`);
              addEmpls += activeEmplys+`<option value="unassigned" style="font-weight: bold;">UA</option></select>`;
            } else {
                addEmpls += `<option value="unassigned" style="font-weight: bold;">UA</option>`; // first add the UA
                const tActiveEmplys = classArray["Employees"].arr.filter((x) => x.is_active === "1").map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);
                addEmpls += tActiveEmplys +`</select>`;
            }

            dayRow += `<td id="unAssigned"><div id="rootElement" style="display:block">`;
            dayRow += `<div id=${iDivid} class='container'>`;
            dayRow += `<input tabindex="0" type="text" hidden name='taskID' value='${unAssignedTasksArr[unAssgnElement].task_id}'>`; // task_id
            dayRow += `<div>`;
            if ( unAssignedTasksArr[unAssgnElement].task_date.split(" ")[0] != dummyDate )
              dayRow += `<input tabindex="0" type="date" style="border:none" id="unAssgnTskDateID" min="${new Date().toISOString().split('T')[0]}" value="${unAssignedTasksArr[unAssgnElement].task_date.split(' ')[0]}"></input>`;
            else
              dayRow += `<input tabindex="0" type="date" style="border:none" id="unAssgnTskDateID" min="${new Date().toISOString().split('T')[0]}"></input>`;
            dayRow += addEmpls; // employee name drop down list
            dayRow += `</div></div>`;
            dayRow += `<div><input tabindex="0" id=${iNid} type='text' name='projectNumber' size='28' maxlength="200" value='${unAssignedTasksArr[unAssgnElement].project_name}' style="border:1px solid black">`;// project Name
            dayRow += `<img tabindex="0" id=${imgminus} src='../misc/minus-2.jpg' alt='minus' width='12' height='12' onclick='delElement(event.target,"prompt2Del")'>&nbsp`;
            dayRow += `<img tabindex="0" src='../misc/file.png' alt='file' width='12' height='12' id="allFilesID">`;
            if ( unAssignedTasksArr[unAssgnElement].task_date.split(" ")[0] != dummyDate  &&
                 unAssignedTasksArr[unAssgnElement].project_name  != "" && // add condition not empty project number
                 unAssignedTasksArr[unAssgnElement].employee_name != "unassigned" )// compare only the date portion
              dayRow += `<p tabindex="0" id="assignID" class="assign">&nbsp&nbsp Assign</p></div>`;
            else
              dayRow += `<p tabindex="0" id="assignID" hidden class="assign">&nbsp&nbsp Assign</p></div>`;
            dayRow += `<textarea tabindex="0" id=${iTx_id} name='schdPrjctDscrptn' rows='2' cols='40' class="txtaClass" style="border:1px solid black">${unAssignedTasksArr[unAssgnElement].task_description}</textarea>`;
            dayRow += `</div>`;  // Wrapping up buttons and projectname
            dayRow += `</div>`;  // wrap the rootElement
            dayRow += `</td>`;
       }
    }
    out += dayRow;
    out += "</tr>";   // close the last row
    out +="</tbody>"; // Close the body 
    document.querySelector("#result-table").innerHTML = out;  // update the week

    $('#result-table tbody tr').each(function() {

      if ( $(this).attr('id') === 'assignedWeek')
        $(this).find('td:gt(0)').each(function() { // skip td 0 which is the employee name
         if ( $(this).find('div[id="rootElement"]').length > 1)
          updateButtonStatus(this);

          //console.log("Cell Text: " + cellText + ", Cell ID: " + cellId);
        });
    });


    $('[id^="unAssgnTskDateID"]').unbind("change");
    $('[id^="unAssgnTskDateID"]').change(function(event) {   
        windowLog.trace("Inside unAssgnTskDateID change event(scheduler), new date value="+this.value);
        $("#result-table").removeClass("greyed-out");
        if ( this.value != "") {  // non empty date
          if ( this.closest('tr').id === "unAssignElementsTR" ) {  // show the assign  
              let firstParentDivWithText = $(this).parents('div').filter(function() {
                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
              }).first().next();
            if ( $(this).closest("div").find('[id="activeEmplListID"]').val() != "unassigned"  &&
                  firstParentDivWithText.find('[name="projectNumber"]').val() != "" ) 
              firstParentDivWithText.find('[id="assignID"]').show();
            else
              firstParentDivWithText.find('[id="assignID"]').hide();
          }
          else
              if ( $(this).closest("tr").find('[id="unAssgnTskDateID"]').val() != "" ) // if the date is not empty then  the save buttons
                  $(this).closest("div").parent().next().find('[id="assignID"]').show();
              else
                $(this).closest("div").parent().next().find('[id="assignID"]').hide();
        } else {
          if ( this.closest('tr').id === "unAssignElementsTR" ) { // if the date is not empty then hide the save buttons
            const firstParentDivWithText = $(this).parents('div').filter(function() {
              return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
            }).first().next();
            firstParentDivWithText.find('[id="assignID"]').hide();
          }
        }
        const taskID = $(this).parents('div').filter(function() {
                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
              }).first().find('[name="taskID"]').val();
        const resultT = Tasks.arrTasks.findIndex(t => t.task_id === taskID);
       
        const tToday=new Date();
        Tasks.arrTasks[resultT].task_date = this.value+" "+tToday.getHours()+":"+String(tToday.getMinutes()).padStart(2,'0')+":" + String(tToday.getSeconds()).padStart(2,'0');
        const retResult=saveScheduler(this,0,false);

        return retResult;
    });

    //$("#result-table").visible(); // make the scheduler visible 
    if ( unAssignedTasksArr.length > 0 ) // if there is at least one unassigned task then add the caption.
      $("#unAssignedCaptionID").text("Unassigned Tasks");

    unAsgnCounter = 0; // reset the unassigned counter to 0 for the next time

    for (var unAssgnElement=0; unAssgnElement < unAssignedTasksArr.length; unAssgnElement++) {  // loop over the unassigned tasks to set the default select value and color
      const iSuffix=`-${activeEmplArr.length+2}-${unAssgnElement}-1`;
      const iDivid="#div"+iSuffix;
      $(iDivid).find('[id="activeEmplListID"]').val(unAssignedTasksArr[unAssgnElement].employee_name); // set the default value of the select to the employee name
      $(iDivid).closest("td").css("background-color",classArray["Employees"].colors[unAssignedTasksArr[unAssgnElement].employee_name]); // set the background color 
      if ( unAssignedTasksArr[unAssgnElement].employee_name != "unassigned"  )
        $("#txdiv"+iSuffix).find('[id="assignID"]').show();
    }

    /*if ( anyTaskFlag ) {
      $('[id^="unAssgnTskDateID"]').change( function() {
        // const selectedValue = $(this).val();     // Get the selected value
        //const taskTimeStamp=selectedValue.split("T");
        //const taskDate=taskTimeStamp[0];
        //const taskTime=taskTimeStamp[1];
       
        windowLog.trace("Unassigned task: change date(" + $(this).val()+")");
        $("#result-table").removeClass("greyed-out");   

      });
     
    }*/
    
    currCell = $('#result-table tbody tr td:nth-child(2)').first();

    $(currCell).find('input').first().focus(); // Focus on the first input
    origText=$(currCell).find('input').first().val();
   
    if ( !$('#editCBID').is(":checked") )
          $("[id=editTaskID").addClass("greyed-out").prop("disabled",true);
        else
          $("[id=editTaskID").removeClass("greyed-out").prop("disabled",false);
    return false;
  }

  function addElementWrapper (target) {

     windowLog.trace("Inside addElementWrapper");

    if ( $('#editCBID').is(":checked") ) 
      addElement(target,-1,true);
    else {
      windowLog.trace("Ignore keydown..editMode:"+$('#editCBID').is(":checked"));
      enableEditDlg(target);
    }

    return false;
  }

  function addElement(target,task,isShow) {// isShow is a flag to determine if to display the new element or just add.. when calling from updateweek the flag is false, ll others calling is true

    windowLog.trace("Inside addElement (isShow:"+isShow+")");
   
    var addEmpls=`&nbsp&nbsp<select id="activeEmplListID"><option value="unassigned" style="font-weight: bold;">UA</option>`;  // build the active employee drop down menue
    var addEmplsHidden=`&nbsp&nbsp<select hidden id="activeEmplListID"><option value="unassigned" style="font-weight: bold;">UA</option>`;  // build the active employe drop down menue
    const activeEmplys= classArray["Employees"].arr.filter((x) => x.is_active === "1").map((x) => `<option value="${x.fullname}">${x.fullname}</option>`);
    addEmpls += activeEmplys+`</select>`;
    addEmplsHidden += `</select>`;
    addEmpls=addEmpls.replace(/\,/g, '');
    addEmplsHidden=addEmplsHidden.replace(/\,/g, '');
    
    let localOut = "";     // HTML code
    // coordinates is the row/column of the cell      
    const row=Number(target.id.split('-')[1]);
    const col=Number(target.id.split('-')[2]);
    const node_counter=Number(target.id.split('-')[3]); // current node counter (convert string to number)
    coordinates="-"+row+"-"+col+"-";//"-"+target.closest('tr').rowIndex+"-"+target.closest('td').cellIndex+"-";
    windowLog.trace("row:"+row+" column:"+col+" counter:"+node_counter);
    counter=++div_counter_arr[row][col+1];   // update the element counter of the cell (increase 1 to move 1 for the employee name in cell 0)
    div_id="div"+coordinates;   // map the div of the element
    if ( counter > 0 ) {  // counter is 0 when calling addelement when assigning unassigned task to an empty cell
    
      in_id="in"+coordinates;
      tx_id="txdiv"+coordinates;
      bdiv_id="bdiv"+coordinates;
      minus_id="imgmns"+coordinates;
      plus_id="imgpls"+coordinates;
      // Update all the prior siblings's ID after the new node was push between. This is neccesary to maintain nodes counter integrity
      for (var child=counter; child >= node_counter+2; child--) { // starting from the last node and going backwards to update the ids with the new id (current+1)  
          windowLog.trace("plus - child counter:"+child);
          $("#"+div_id+(child-1)).attr('id',div_id+child); // update the id
          $("#"+in_id+(child-1)).attr('id',in_id+child);
          $("#"+tx_id+(child-1)).attr('id',tx_id+child);
          $("#"+bdiv_id+(child-1)).attr('id',bdiv_id+child); // update the id
          $("#"+plus_id+(child-1)).attr('id',plus_id+child);
          $("#"+minus_id+(child-1)).attr('id',minus_id+child); // update the id
      }

      color = task_color["open"]; // default color
      tID=0;
      pName="";
      tDescription="";
      if ( task > 0 ) {  // task could be -1 (trigger by clicking on plus) or valid task_id
        color=task_color[Tasks.arrTasks[task].task_status]; 
        Tasks.arrTasks[task].inid=in_id+(node_counter+1);  // save the id for future use (to color the borders uopcon new status update)
        tID=Tasks.arrTasks[task].task_id; 
        pName=Tasks.arrTasks[task].project_name;
        tDescription=Tasks.arrTasks[task].task_description;
        if ( Tasks.arrTasks[task].task_status === "open" )
          localOut = `<div id="rootElement" style="display:block"><div id=${div_id+(node_counter+1)} class='container'>`;
        else
          localOut = `<div id="rootElement" style="display:block"><div id=${div_id+(node_counter+1)} class='container greyed-out'>`;
      } 
      else //empty task
        localOut = `<div id="rootElement" style="display:block"><div id=${div_id+(node_counter+1)} class='container'>`;  // if task is -1 then it is a new task, so no need to set the color

      localOut += `<div>`;
      localOut += `<img tabindex="0" id=${plus_id+(node_counter+1)} src='../misc/plus.png' alt='plus' width='10' height='10' onclick='addElementWrapper(event.target,true)'>&nbsp`;
      localOut += `<input tabindex="0" id=${in_id+(node_counter+1)} type='text' name='projectNumber' size='30' value='${pName}' style="border:2px solid ${color}">`; 
      localOut += `<input tabindex="0" type="text" hidden name='taskID' value='${tID}'>&nbsp`;
      localOut += `<img tabindex="0" id=${minus_id+(node_counter+1)} src='../misc/minus-2.jpg' alt='minus' width='10' height='10' onclick='delElement(event.target)'>`;
      localOut += `<img tabindex="0" src='../misc/file.png' alt='file' width='10' height='10' id="allFilesID">&nbsp`;
      localOut += `<button tabindex="0" hidden class="arrow-btn" id="moveUPTask" title="Move Up">↑</button>`;
      localOut += `<button tabindex="0" hidden class="arrow-btn" id="moveDownTask" title="Move Down">↓</button>`;

      if ( $('#editCBID').is(":checked") ) 
        localOut += `<p tabindex="0" id="editTaskID" class="assign">Edit</p>`;
      else
        localOut += `<p tabindex="0" id="editTaskID" class="assign greyed-out" disabled>Edit</p>`;
      
      localOut += `</div>`; // wrapping up buttons and projectnumber
      localOut += `</div>`; // wrapping up container
      if ( task > 0) {
        if ( Tasks.arrTasks[task].task_status === "open")               
          localOut += `<div id=${tx_id+(node_counter+1)}>`;
        else
          localOut += `<div id=${tx_id+(node_counter+1)} class="greyed-out">`; // if the task is NOT in open status

        //out += `<textarea rows='2' name='schdPrjctDscrptn' cols='40' class ="txtaClass" style="border:2px solid ${color}">${tDescription}</textarea>`;
      
        //if (  Tasks.arrTasks[task].task_status == "open" ) // do not show Assign unlesss the task in open Gil Gil
        //    out +=`<p id="editTaskID" hidden class="assign">Edit</p>`;
      } else 
        localOut += `<div id=${tx_id+(node_counter+1)}>`;
      
      localOut += `<textarea tabindex="0" rows='2' name='schdPrjctDscrptn' cols='40' class ="txtaClass" style="border:2px solid ${color}">${tDescription}</textarea>`;
      localOut += `</div>`;
      localOut += `</div>`;
      if (isShow) {
        $("#txdiv"+coordinates+node_counter).closest('div[id="rootElement"]').after(localOut); // Add new buttons and inputs
        $('#'+in_id+(node_counter+1)).focus();  // Set focus at the new added input
      }
    } else {
      if ( task > 0 ) {
        $("#"+div_id+"0").find('input[name="projectNumber"]').val(Tasks.arrTasks[task].project_name);
        $("#tx"+div_id+"0").find('textarea[name="schdPrjctDscrptn"]').val(Tasks.arrTasks[task].task_description);
        $("#"+div_id+"0").find('input[name="taskID"]').val(Number(Tasks.arrTasks[task].task_id));
        $("#"+div_id+"0").find('p[id="editTaskID"]').show();
        if ( !$('#editCBID').is(":checked") ) 
          $("#"+div_id+"0").find('p[id="editTaskID"]').addClass("greyed-out").prop("disabled",true);

        div_counter_arr[row][col+1]++;
      }
    }
   
    return localOut;
  }

  function updateButtonStatus(td) {
    //const tbody = document.querySelector('#movableTable tbody');
    //const rows = tbody.querySelectorAll('tr');
    const numOfElements = $(td).find('div[id="rootElement"]').length;
    
    $(td).find('div[id="rootElement"]').each(function(index, cell) {

      if ( Number($(cell).find('input[name="taskID')[0].value) > 0 ) {
        const upBtn = $(cell).find('button[id="moveUPTask"]');
        const downBtn = $(cell).find('button[id="moveDownTask"]');

        if (index === 0)
          $(downBtn).show();
        else
          if (index === numOfElements- 1) 
            $(upBtn).show();
          else {
            $(downBtn).show();
            $(upBtn).show();
          }
      }
    });
  }

  function delElement(target,promptFlag) {

    windowLog.trace("Inside delElement...");
    if ( $('#editCBID').is(":checked")  || 
        promptFlag === "promptOveride" ) {

      if ( promptFlag != "promptOveride" ) {  // show the confirmation msg unbless override is on
        exportDialog=document.getElementById("aboutDialog");
        exportDialog.innerHTML="<center>Notice</center><br><center>Are you sure you want to delete the task?<br><br><br></center><center><input type='button' class='button' value='No' id='delTaskNo'/>&nbsp<input type='button' class='button' value='Yes' id='delTaskYes' /></center>";
        exportDialog.showModal();
      
        $("#delTaskYes").on( "click", function() { goDelete(promptFlag) });
        $('#delTaskNo').click(noDelete);
      } else
        goDelete(promptFlag); // delete the element by bypassing the are you sure.. mostly wehen reassign UNassigned

      function goDelete(promptFlag) {

         windowLog.trace("Inside goDelete...");
         let delStatus=false;
         
         $("#saveTableLabel").html("Deleting...");
         $("#saveTableLabel").show();

          // coordinates is the row/column of the cell      
          const row=Number(target.id.split('-')[1]);
          const col=Number(target.id.split('-')[2]);
          const node_counter=+target.id.split('-')[3]; // current node counter (convert string to number)
          coordinates="-"+row+"-"+col+"-";
          windowLog.trace("coordinates:"+coordinates+" counter:"+node_counter);
          const task_id=Number($("#div"+coordinates+node_counter).find('input[name="taskID"]').val());
         
          const employeeJobsEntry=classArray["Employee Jobs"].arr.findIndex(x => Number(x.task_id) === task_id);
          if ( employeeJobsEntry >= 0 ) { // make sure the task exist in EJ
            classArray["Employee Jobs"].arr.splice(employeeJobsEntry, 1); 
            windowLog.trace("Delete task:"+employeeJobsEntry+" from employee_jobs");
          } else 
            windowLog.trace("error: tsdk_id("+task_id+") not found in employee_jobs");
          
          if ( promptFlag != "promptOveride" ) // if override then do not delete the task from the DB
            delStatus=deleteTask(task_id); // delete the task from the DB
        
          const entry=Tasks.arrTasks.findIndex(x => Number(x.task_id) === task_id);

          if (entry >= 0) {// just as a precausion , it should not happen
            if ( Tasks.arrTasks[entry].is_assigned === "1") {
              div_counter_arr[row][col+1]--;  // update the element array counter
              const assngEntry=assignedTasksArr.findIndex(x => Number(x.task_id) === task_id);
              assignedTasksArr.splice(assngEntry, 1);    // delete the entry from the assigned tasks
              if ( div_counter_arr[Number(row)][Number(col)+1] === 0) {  // asking to remove the last element then just clear the fields
                $("#txdiv"+coordinates+node_counter).children().first().val("");
                $("#in"+coordinates+node_counter).val("");  
                $("#div"+coordinates+node_counter).find('#unAssgnTskDateID').hide();  // hide the assign date and the assign name 
                $("#div"+coordinates+node_counter).find('#activeEmplListID').hide();
                for (var child=node_counter; child < div_counter_arr[row][col+1]; child++) {
                  windowLog.trace("minus - child counter:"+child);
                  const lSuffix=coordinates+child;
                  //updateElement(child+1,suffix); function to handle the id of the element
                  $("#div"+coordinates+(child+1)).attr('id',"div"+lSuffix); // update the id
                  $("#in"+coordinates+(child+1)).attr('id',"in"+lSuffix);
                  $("#tx"+coordinates+(child+1)).attr('id',"tx"+lSuffix);
                  $("#bdiv"+coordinates+(child+1)).attr('id',"bdiv"+lSuffix); // update the id
                  $("#imgpls"+coordinates+(child+1)).attr('id',"imgpls"+lSuffix);
                  $("#imgmns"+coordinates+(child+1)).attr('id',"imgmns"+lSuffix); // update the id
                  $("#p"+coordinates+(child+1)).attr('id',"p"+lSuffix);
                }
              } else
                $("#div"+coordinates+node_counter).closest('div[id="rootElement"]').remove(); // remove the elemen

            } else {  // this is unassigned task so remove the element from the UA row
                $("#in"+coordinates+node_counter).closest('td').remove();
                Tasks.unAssignedCount--;
            }
          } else 
             windowLog.trace("error: tsdk_id("+task_id+") not found in Tasks array");
          Tasks.arrTasks.splice(entry, 1); 
          document.getElementById("aboutDialog").close();
          setTimeout(() =>  $("#saveTableLabel").html("&nbsp"), appConfig.saveMsgTimeout);     // hide the delete message 

          return delStatus;
      }

      function noDelete() {
        document.getElementById("aboutDialog").close();
      }
    }
    else {
      windowLog.trace("Ignore keydown..editMode:"+$('#editCBID').is(":checked"));
      enableEditDlg(target);
    }
    return false;
}


function saveScheduler(element,overideAssignment,newTask) { // Save the element schedule to the DB

    windowLog.trace("Inside saveScheduler...");
    var arrObj=[];
    var anyRec=false;
    var employee_rec=[];
    var retValue=false;
    let textArea="";

    if ( $(element).closest('tr').attr('id') === 'unAssignElementsTR' )
      employeeName=$(element).closest('td').find('[id^="activeEmplListID"]').val();//$(element).closest('tr').children().first().text();
    else 
      employeeName=element.closest('tr').childNodes[0].innerText;

    // set the min day to be the start of the week and maxDate to be the Sunday
    //let minDate= new Date($('#result-table thead tr th:nth-child(1)').text());
    //let maxDate= new Date($('#result-table thead tr th:nth-child(7)').text());  //holds the date ranle of the changes to be used by the PHP module to retrieve only the elements within the date range

    //const fTD=$(element).closest('td');
    //windowLog.trace("name:"+$(element).closest('tr').children().first().text()+" eID:"+$(element).closest('tr').children().first().children('p').attr('id'));   // Employee Name nd ID
    const iRow=$(element).closest('tr').index();
    windowLog.trace("Row number:"+iRow);
    const iCol=$(element).closest('td').index();
    const tToday=new Date();
    const currentTime=tToday.getHours() + ":" + String(tToday.getMinutes()).padStart(2, '0')  + ":" + String(tToday.getSeconds()).padStart(2, '0');

    /*var firstParentDivWithText = $(element).parents('div').filter(function() {
      return this.id.includes("div-"+iRow+"-"+iCol);
    }).first();*/
    let taskTime=dummyDate; // init 
    if ( $(element).closest('tr').attr('id') === 'unAssignElementsTR' ) { // we are at the unassighned
     /* taskTime=formatDateForInput(new Date($('#result-table thead tr th:nth-child('+(iCol+1)+')').text()))+" "+currentTime;
      textArea=$("#txdiv"+element.id.substring(element.id.indexOf('-'))).find('[name="schdPrjctDscrptn"]').val()*/

      if ( $(element).closest("td").find('[id="unAssgnTskDateID"]').val() != "" ) 
        taskTime = $(element).closest("td").find('[id="unAssgnTskDateID"]').val();
        textArea=$(element).closest('td').find('textarea[name="schdPrjctDscrptn"]').val();
    } else {
      taskTime=formatDateForInput(new Date($('#result-table thead tr th:nth-child('+(iCol+1)+')').text()));
      textArea=$(element).closest('div[id="rootElement"]').find('[name="schdPrjctDscrptn"]').val()
    }

    taskTime += " "+currentTime;  // adding the hours minutes seconds
    
    // if the date is empty then set it to dummy date
      //taskTime=firstParentDivWithText.find('[id^="unAssgnTskDateID"]').val()+" "+currentTime;
    const rootElement=$(element).closest('div[id="rootElement"]');
    $(element).closest('div[id="rootElement"]').find('input[name="projectNumber"]').each(function() {  // loop over the elements(tasks for the employee for the day)
    //$(element).closest('td').find('input[name="projectNumber"]').each(function() {  // loop over the elements(tasks for the employee for the day)

      var projectName="";
      var projectNumber=0;
    
   
      //if ( ($(this).val().length > 0) || (textArea.length > 0 ) ) { // if input or txt area are not empty
  
      //if ($(this).val() === "") // the project nuber became empty, change the border to black
      //  bColor = "black"
      //else
      //  bColor ="red";
      //$(this).css({'border':'2px solid '+bColor}); // color the border in red to mark as open
      //$("#txdiv"+this.id.slice(2)).find('textarea[name="schdPrjctDscrptn"]').css({'border':'2px solid '+bColor}); // color thhe border in red to mark as open
      /*if (( $(this).val() === "" ) && // if both fields are now empty, hide the date and the select element
          ( textArea === "" )) {      // otherwise show the two elements 
        $(this).closest("div").find('#unAssgnTskDateID').hide();
        $(this).closest("div").find('#activeEmplListID').hide();
      }
      else {
          $(this).closest("div").find('#unAssgnTskDateID').show();
          $(this).closest("div").find('#activeEmplListID').show();
      }*/
      const task_id=Number($("#div"+this.id.slice(2)).find('[name^="taskID"]').val()); // obtain the task_id, tasks with either projects set or text field set have an assigned task
      const input_id=this.id;
      const seq_number=Number(input_id.split('-')[3]);  // extract the last digit hich is the counter
        
      if ( $(this).val() != "" ) { // project number not empty 
        projectName=$(this).val();
        projectNumber=projectName.split('-',1)[0];  //projectNumber;
      }
      windowLog.trace("input_id:"+input_id+" task_id:"+task_id+" prj name:"+projectName+" text:"+textArea); // project name
      /*if (tDate > minDate )
          minDate = new Date(tDate);
      if (tDate < maxDate)
          maxDate = new Date(tDate);*/
      if ( task_id > 0 ) {
        let resultT = Tasks.arrTasks.findIndex(t => t.task_id === task_id);
        if (resultT != -1) {  // if task exist then update the details
          windowLog.trace("Task exist: input_id:"+input_id+" task_id:"+task_id+" prj name:"+projectName+" text:"+textArea); 
          Tasks.arrTasks[resultT].task_description=textArea;
          Tasks.arrTasks[resultT].project_name=projectName;
          Tasks.arrTasks[resultT].project_number=projectNumber;
          Tasks.arrTasks[resultT].employee_name=employeeName;
          Tasks.arrTasks[resultT].task_date=taskTime;
          Tasks.arrTasks[resultT].employee_id=classArray["Employees"].pNames[employeeName];
        }
      }
      
      employee_rec.push({ "date"           : taskTime, //Convert the JS date to mySQL date before sending formatDateForInput(date)+" "+cTime
                          "projectName"    : projectName, //$(this).val(),
                          "projectNumber"  : projectNumber, //$(this).val().split('-',1)[0],
                          "description"    : textArea,
                          "task_id"        : task_id,
                          "input_id"       : input_id,
                          "seq_number"     : seq_number,
                          "new_task"        : newTask,
                          "file_uploaded"  : 0, // default value
                          "is_assigned"    : (overideAssignment===true?1:0)
                        });
      anyRec=true;
      origText="";
    })
  
  if ( anyRec ) {

    let hourlyRate = 0;
   
    if ( employeeName != "unassigned" ) { // if the employee is not selected then do not save
        const entry=classArray["Employees"].arr.findIndex(t => t.fullname === employeeName);
        hourlyRate = classArray["Employees"].arr[entry].hourlyrate;
    }

    arrObj.push({"Employee"   : employeeName,
                 "employeeID" : classArray["Employees"].pNames[employeeName], //$(element).closest('tr').children().first().children('p').attr('id'),
                 "rate"       : hourlyRate,
                 "Record"     : employee_rec}); // add a new record to the main array
    
    $("#saveTableLabel").html("Saving....");

    $.ajax({
            url       : "../db/save_schedule.php",
            method    : "POST",
            data      : {postSchedule:arrObj},
            dataType  : "json",
            async     : false,
            success   : (function(data) {
              retValue = true;
              if (data != '') { // data is not null only when a new task is created and task_id has been assigned by the DB (AI)
                windowLog.trace("Saving schedule to the db has been "+(data[0].Status === 1?"succesfull":"failed"));
                if ( data[0].Status === 1 ) {
                  $("#saveTableLabel").html("Changes saved successfully");
                  $("#saveTableLabel").css("color", "green");
                }
                else {
                  $("#saveTableLabel").html("Saving failed(-3)");
                  $("#saveTableLabel").css("color", "red");
                }
                setTimeout(() => $("#saveTableLabel").html("&nbsp"), appConfig.saveMsgTimeout); // clear the message after 2 sec
                // loop over the return task_id. Stating from 1 cause the 0 entry is the return code
                /*for (var ret=1; ret < Object.keys(data).length; ret++) { // there is only single entry if the return code form save is 0 so the loop will not execute
                  $("#"+data[ret].input_id)[0].nextSibling.defaultValue=data[ret].task_id; // update the task_id
                  $("#"+data[ret].input_id).closest("div").find('#unAssgnTskDateID').show(); // show the date element
                  $("#"+data[ret].input_id).closest("div").find('#activeEmplListID').show(); // show the employee drop down element
                  lastID["Employee Jobs"]=Number(data[ret].task_id)+1;  // update lastID array so next EJ task will start from the right entry
                  let resultT = Tasks.arrTasks.findIndex(t => t.task_id === data[ret].task_id);
                  if (resultT != -1)    // if task_id exist then just update the entry
                      windowLog.trace("Project found- do nothing");
                  else { // new task then add to the task array
                    const initd=data[ret].input_id;
                    const empName=$("#"+initd).closest('td').siblings(":first").text();
                    const colIndex=$("#"+initd).closest('td').index();
                    const dDay=new Date($('#result-table thead tr th:nth-child('+(colIndex)+')').text()); // date of the cell
                    //const cTime=date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();  // current time 
                    const prjName=$("#"+initd).val();
                    //sqlDate=dDay.getFullYear()+"-"+(("0" + (dDay.getMonth() + 1)).slice(-2))+"-"+(("0" + dDay.getDate()).slice(-2));
                    Tasks.arrTasks.push({
                        employee_id       :   classArray['Employees'].pNames[empName],  // empID is taken from the employee.pNames array
                        employee_name     :   empName,
                        project_address   :   "",
                        project_name      :   prjName,
                        project_number    :   prjName.split('-',1)[0],  //projectNumber;
                        task_date         :   taskTime,//formatDateForInput(date)+" "+cTime, //Convert the JS date to mySQL date before sending )sqlDate
                        task_description  :   $("#txdiv"+initd.slice(2)).find('textarea[name="schdPrjctDscrptn"]').val(),  // obtain the text area  textArea=$("#tx"+this.id.slice(2)).val();
                        task_id           :   data[ret].task_id,
                        task_status       :   'open',
                        inid              :   initd,
                        file_uploaded     :   0, // default value
                        seq_number        :   Number(initd.split('-')[3])
                    });
                  }
                  if ( new Date().toDateString() === $("table thead tr th").eq($("#"+data[ret].input_id).closest('td').index()).html() ) 
                    Tasks.noneClosedDailyTasks[data[ret].task_id+"-"]="open"; // add the new task only for today
                }*/
              } else {
                  windowLog.warn("Saving Schedule to the DB failed");
                  $("#saveTableLabel").html("Saving failed");
                  setTimeout(() => $("#saveTableLabel").html("nbsp"), appConfig.saveMsgTimeout); // clear the message after 2 sec
              }
            }),
            error   :  function (xhr, ajaxOptions, thrownError) {
              windowLog.warn("Save schedule to the db failed:("+xhr.status+")"); }
        });
  }
  return retValue;
}

function addUnassignedTask(element) { // Show the scheduler table

    windowLog.trace("Inside addUnassignedTask...");
    
    var newTD=""; 
    var addEmpls=`&nbsp&nbsp<select id="activeEmplListID">`;
    var tActiveEmplys = classArray["Employees"].arr.filter((x) => x.is_active === "1").filter((x) => x.fullname != element.employee_name).map((x) => x.fullname);
    if ( element.employee_name != "unassigned") // no need to add unassigned cuse it added below as the last element
      tActiveEmplys.unshift(element.employee_name); // add to the top the installer name to appears top at the select dropdown
    else
      addEmpls += `<option value="unassigned" style="font-weight: bold;">UA</option>`;

    const activeEmplys = tActiveEmplys.map((x) => `<option value="${x}">${x}</option>`);
    if ( element.employee_name != "unassigned")
      addEmpls += activeEmplys+`<option value="unassigned" style="font-weight: bold;">UA</option>`;
    else
      addEmpls += activeEmplys;
    addEmpls += `</select>`;

    //const unAsgnCounter = Tasks.arrTasks.filter( (x) => ( ( x.employee_id === 0 || Number(x.is_assigned) === 0 ) ) ).length;
  
    const iSuffix=`-${$("#result-table tr:last").index()}-${$("#result-table tr:last td:last").index()}-1`;  
    const iNid="in"+iSuffix;
    const iTx_id="txdiv"+iSuffix;
    //const iMgplus="imgpls"+iSuffix+"1";
    const imgminus="imgmns"+iSuffix;
    const iDivid="div"+iSuffix;

    if ( element.employee_name != "unassigned" )
      newTD += `<td id="unAssigned" style="background-color:${classArray["Employees"].colors[element.employee_name]}">`;
    else
      newTD += `<td id="unAssigned">`;

    newTD += `<div id=${iDivid} class='container'>`;
    newTD += `<input type="text" hidden name='taskID' value='${element.task_id}'>`; // task_id
    newTD += `<div>`;
    if ( element.task_date.split(" ")[0] != dummyDate)
      newTD += `<input type="date" style="border:none" id="unAssgnTskDateID" min="${new Date().toISOString().split('T')[0]}" value=${element.task_date.split(" ")[0]}></input>`;
    else
      newTD += `<input type="date" style="border:none" id="unAssgnTskDateID" min="${new Date().toISOString().split('T')[0]}"></input>`;
    newTD +=  addEmpls; // employee name drop down list
    newTD += `</div></div>`; // wrapping up container
    newTD += `<div><input id=${iNid} type='text' name='projectNumber' size='28' maxlength="200" value='${element.project_name}' style="border:1px solid black">`;// project Name
    newTD += `<img id=${imgminus} src='../misc/minus-2.jpg' alt='minus' width='12' height='12' onclick='delElement(event.target,"prompt2Del")'>&nbsp`;
    newTD += `<img src='../misc/file.png' alt='file' width='12' height='12' id="allFilesID">`;
    if ( element.employee_name != "unassigned" &&
          element.task_date.split(" ")[0]!= dummyDate )
      newTD += `<p id="assignID" class="assign">&nbsp&nbsp Assign</p></div>`;
    else
      newTD += `<p id="assignID" hidden class="assign">&nbsp&nbsp Assign</p></div>`
    newTD += `<textarea id=${iTx_id} name='schdPrjctDscrptn' rows='2' cols='40' class="txtaClass" style="border:1px solid black">${element.task_description}</textarea>`;
    newTD += `</div>`;  // Wrapping up buttons and projectname
    newTD += `</td>`;
    //newTD += `</div></div>`;  // Wrapping up buttons and projectname
    //newTD += `<div id=${iTx_id}><textarea name='schdPrjctDscrptn' rows='2' cols='40' class ="txtaClass" style="border:1px solid black">${element.Description}</textarea><p id="assignID" hidden class="assign">&nbsp&nbsp Edit</p></div></td>`;
    $("#result-table tr:last").append(newTD);   //$("#unAssignElementsTR").append(newTD);

    $('[id^="unAssgnTskDateID"]').unbind("change");
    $('[id^="unAssgnTskDateID"]').change(function(event) {   
      windowLog.trace("Inside unAssgnTskDateID change event(scheduler-unAssigned), new date value="+this.value);
      $("#result-table").removeClass("greyed-out");
      if ( this.value != "") {  // non empty date
        if ( this.closest('tr').id === "unAssignElementsTR" ) {  // show the assign  
          let firstParentDivWithText = $(this).parents('div').filter(function() {
                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
              }).first().next();
          if ( $(this).closest("div").find('[id="activeEmplListID"]').val() != "unassigned"  &&
            firstParentDivWithText.find('[name="projectNumber"]').val() != "" ) {
            firstParentDivWithText.find('[id="assignID"]').show();
          } else
            firstParentDivWithText.find('[id="assignID"]').hide();
        } else {
          alert("Bug");
          /*if ( $(this).closest("tr").find('[id="unAssgnTskDateID"]').val() != "" ) // if the date is not empty then  the save buttons
            $(this).closest("div").parent().next().find('[id="assignID"]').show();
          else
            $(this).closest("div").parent().next().find('[id="assignID"]').hide();*/
        }
      } else {
        if ( this.closest('tr').id === "unAssignElementsTR" ) { // if the date is not empty then hide the save buttons
            const firstParentDivWithText = $(this).parents('div').filter(function() {
              return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
            }).first().next();
            firstParentDivWithText.find('[id="assignID"]').hide();
        }
      }
      const taskID = $(this).parents('div').filter(function() {
                return this.id.includes("div-"+$(this).closest('tr').index()+"-"+($(this).closest('td').index()-1));
              }).first().find('[name="taskID"]').val();
      const resultT = Tasks.arrTasks.findIndex(t => t.task_id === taskID);
      Tasks.arrTasks[resultT].task_date = this.value+" "+formatCurrentTime(new Date());

      return saveScheduler(this,0,true);
    });

    Tasks.unAssignedCount++;  // increase the unassigned counter by 1
  }

  function reAssignTask(event) {

    windowLog.trace("Inside reAssignTask"); 
    var msg=[];
    msg.data=[];
    msg.target=event;
    
    msg.data.elementID=$(event).closest('div').find("img").attr('id'); // get the mns element id 
    msg.data.taskDate=$(event).closest('td').find('[id="unAssgnTskDateID"]').val();
    msg.data.assignmentOverride=1;
    msg.data.taskID = $(event).closest('td').find('[name="taskID"]').val();
    msg.data.name=$(event).closest('td').find('[id="activeEmplListID"]').val();
    msg.data.taskDescription=$(event).closest('td').find('textarea[name="schdPrjctDscrptn"]').val();
    msg.data.projectNumber=$(event).closest('td').find('input[name="projectNumber"]').val();
    msg.data.taskIX=Tasks.arrTasks.findIndex(t => t.task_id === msg.data.taskID );

    assignTaskHandler(msg);
  }

  function showExceedUnAssgnTasksWarnning() {

    var out="";
        
    out = `<center><p class="label1">Notice</p></center>`;
    out += `<center><p class="label1">The number of unAssigned Tasks has reached the limit({${Number(appConfig.maxUAtasksInRow)})</p></center><br>`;
    out += `<center><input type="button" class="button" value="Ok" id="okNoticeBtn"/></center>`;
    
    const editDialog=document.getElementById("editControl");      
    editDialog.innerHTML=out;
    editDialog.showModal();
    $(".editCntrlClass").visible();

     $('#okNoticeBtn').on('click',function (){
        document.getElementById("editControl").close();
     });
  }

  function reorderElement(srcElement,direction) {

    windowLog.trace("Inside reorderElement"); 

  }