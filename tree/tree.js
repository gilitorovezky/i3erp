    /*$(function () {
      $("#plugins2")
        .jstree({
  
      });
    });*/

  var selectedNode;
  const default_file_search_string="Please type the destination folder name";
  const default_folder_search_string="Please select the folder from below:";
  var activeTreePane="FILES";
  let isLastSelectedElementFile=true;

  function constructPath() {
    var path="";
    var regex=/^d_/s; // directory starts with d_
    if (regex.test($(this).attr("id" ))) {
      //console.log($(this).attr("id"));
      path=$(this).attr("id").split("_")[2];
      return path;
    }
  }
  
  function showTree(root) {

    windowLog.trace("Inside showTree");
    const aboutDialog=document.getElementById("aboutDialog");
    let tree=readDirectory(root);
    $('#aboutDialog').attr('name', "jstree"); // set default
    //lastScreen = "prjTree";
    $(".aboutDlg").css({'width'     : "80vw",
                        'height'    : "73vh",
                        'overflow'  : 'hidden'});
   
    //$("#overLay").remove(); // remove the orioginal to allw the input key to process the keys 
    aboutDialog.innerHTML=tree;
    aboutDialog.showModal();

    $('[name^="opRadio"]').change(function(event) {
     
      const fileAction = {
        cpRadioID       : () => {
                          $("#yesBtn").val($('input[name=opRadio]:checked').val()); // update the label according to the requested action
                          $("#inputDstnPrjID,#prjTreeID").visible();
                          if ( $('#aboutDialog').attr('name') == "jstree2" )
                            $("#buttomHalfID").visible();
                          else
                            $("#buttomHalfID").invisible();
                          if ( ( $("#prjTreeID").val() == "" ) ||
                               ( $("#prjTreeID").val() == default_folder_search_string ) )
                            $("#yesBtn").hide();  },

        mvRadioID       : () => {
                          $("#yesBtn").val($('input[name=opRadio]:checked').val()); // update the label according to the requested action
                          $("#inputDstnPrjID,#prjTreeID").visible();
                          if ( $('#aboutDialog').attr('name') == "jstree2" )
                            $("#buttomHalfID").visible();
                          else
                            $("#buttomHalfID").invisible();
                          if ( ( $("#prjTreeID").val() == "" ) ||
                                ( $("#prjTreeID").val() == default_folder_search_string ) )
                          $("#yesBtn").hide();  },

        dlRadioID       : () => {
                          $("#yesBtn").val($('input[name=opRadio]:checked').val()); // update the label according to the requested action
                          $("#buttomHalfID,#inputDstnPrjID,#prjTreeID").invisible();
                          /*$("#yesBtn").val("Delete");*/
                          $("#yesBtn").show();
                          $("#closeTreeTD").visible();  },
        upldFileRadioID : () => {
                          var ref = $('#jstree2').jstree(true);
                          const selectedNode = ref.get_selected()[0];  // get the selected node to know where to upl;aod the file
                          var regex=/^d_/s; // directory starts with d_
                          if (regex.test(selectedNode)) { // if direcory than process to show the upload
                              $("#inputDstnPrjID,#prjTreeID").invisible();
                              if ( $('#aboutDialog').attr('name') == "jstree2" )
                                $("#buttomHalfID").visible();
                              else
                                $("#buttomHalfID").invisible();
                              //$("#yesBtn").show();
                              $("#closeTreeTD").invisible();
                              
                              var parentFolder="";
                              var temp=$("#"+selectedNode).parents('.jstree-node').map(constructPath);  // get all the parents to construct the folder path
                              for (var i= (temp.length)-2; i >=0; i--) { // -2 to start from the 2nd parent
                                parentFolder+=temp[i].split("_")[2];
                                if ( i > 0 )
                                  parentFolder += "/";  // add the seperator except if this the last element
                              }
                              parentFolder+=selectedNode.split("_")[2]; // add the selected folder
                              // ret = ref.delete_node(sel);
                              showFileUpload(event,"deviceUpload","buttomHalfID",parentFolder)}
                            },
                            
        default         : () => {}
      };
      
      windowLog.trace('Change operation:'+event.target.id);
      fileAction[event.target.id]();
      event.stopPropagation();
      return false;
    });

    $('#jstree').jstree();
    $('#jstree2').jstree();
    $('#jstree3').jstree();
    $("#jstree")[0].children[0].id="rootTree";
    //$("#rootTree").addClass("tree_dlg");
    $('#jstree')
      .on("changed.jstree", function (e, data) {
        $("#prjListTableID").attr("name","jstree");
        $('#aboutDialog').attr('name', "jstree");
        windowLog.trace('Inside change');
        if (data.selected.length) {
           windowLog.trace('The selected node is: ' + data.instance.get_node(data.selected[0]).text);
        }
      })
      .on("contextmenu", function(e) {
        e.stopPropagation();
        $("#prjListTableID").attr("name","jstree");
        windowLog.trace('Inside tree contextmenu');
        $('#aboutDialog').attr('name', "jstree");
    
        //var t=$("#jstree").jstree();
        //var node=t.get_selected();
        if ( e.target.id[0] == "f" ) { // file
   
          var parentFolder="";
          var temp=$(e.target).parents('.jstree-node').map(constructPath);  // get all the parents to construct the folder path
          for (var i= (temp.length)-2; i >=0; i--) { // -2 to start from the 2nd parent
            parentFolder += temp[i];   // skip the first two _ (part of the name from the dir.php temp[i].slice(temp[i].indexOf("_")+1); //=temp[i].split("_")[2]
            if ( i > 0 )
              parentFolder += "/";  // add the seperator except if this the last element
          }
          //parentFolder += $("#jstree").jstree().get_path(e.target.id)[$("#jstree").jstree().get_path(e.target.id).length-2];
          //$("#opsFileID").show();
          //$("#opsFileID,#cancelFileID").show();
          //$("#cpRadioID").prop("checked", true);
          // const tempPath = e.target.innerText.split("/"); 
          //var fileName=tempPath[tempPath.length-2]+"/"+tempPath[tempPath.length-1];
          //selectedNode=e.target.innerText;
          //let parentFolder =$("#jstree").jstree().get_path(e.target.id)[($("#jstree").jstree().get_path(e.target.id).length)-2];  // the module
          $("#cancelFileID").show();
          $("#inputDstnPrjID").addClass("underLineTD")
          let fileName = e.target.innerText;// e.target.parentNode.parentNode.parentNode.innerText.replace("\n","/");
          $('#yesBtn').on("click",{parentFolder  : parentFolder,
                                   srcPath       : $("#jstree").jstree().get_path(e.target.id).slice(0, -1).join("/"),// full path minus the file name
                                   srcFilename   : fileName},fileOpsGo);

          $("#jstree").addClass("greyed-out");
          $('#overLay').unbind("keydown");
          $('#overLay').on("keydown",{parentFolder  : parentFolder,
                                      invoker       : "tree",
                                      srcPath       : $("#jstree").jstree().get_path(e.target.id).slice(0, -1).join("/"),// full path minus the file name
                                      srcFilename   : fileName},overLayKeyDown);
          
          let inputPrjName=`<input type="text" name="projectNumber" id="prjTreeID" class="projectNameClass" value="${default_file_search_string}" size="44" maxlength="50">`;
          $("#inputDstnPrjID").html(inputPrjName);
          $("#prjTreeID").focus();
          $("#prjTreeID").unbind('keydown');              // to be safe, unbind the handler
          $("#prjTreeID").bind('keydown',{ parentFolder : parentFolder,
                                           srcPath      : $("#jstree").jstree().get_path(e.target.id).slice(0, -1).join("/"),// full path minus the file name
                                           srcFilename  : fileName},TblKeyDown);     // assign the keydown handler to the input project to accept project name
        }
        else  // directory
          windowLog.trace("jstree Directory"+e.target.innerText);
        if ( activeTreePane == "FOLDERS" ) {
            windowLog.trace('Inside jtree first time');
            activeTreePane = "FILES";
            cleanupTree();
        }
       
      })
      .on("click", function(e,data) {
        $("#prjListTableID").attr("name","jstree");
        windowLog.trace('Inside jtree click');
        if ( activeTreePane == "FOLDERS" ) {
          windowLog.trace('Inside jtree first time');
          activeTreePane = "FILES";
          $("#td4").hide();  // remove the uploadfile td,
          $("#closeTreeDlgTD").attr("colspan",2); 
          $("#opsReturnID,#fileThumbnailID,#inputDstnPrjID,#buttomHalfID,#closeTreeTD").attr("colspan",3);
          cleanupTree();
        }
        e.stopPropagation();
      });

      $('#jstree2')
        .on("changed.jstree", function (e, data) {
          $('#aboutDialog').attr('name', "jstree2");
          $("#prjListTableID").attr("name","jstree2");
          windowLog.trace('Inside tree2 change');
          if (data.selected.length) {
            const regex=/^f_/s; // file starts with f_
            var ref = $('#jstree2').jstree(true);
            const isFile=regex.test(ref.get_selected());
            if ( isFile )   // 
              windowLog.trace('The selected node is (file):'+ data.node.id);
            else
              windowLog.trace('The selected node is (folder):'+ data.node.id);
            //isLastSelectedElementFile=regex.testuploadFile(selectedNode);
          
            if ( ($('input[name=opRadio]:checked').val() != "uploadFile") || (isFile)) {// if the last mode is upload file then hide the upload file
              $("#buttomHalfID").invisible();
              $("#cpRadioID").prop("checked", true);
            }
          }
        })
        .on("select_node.jstree",function (e, data) {
          windowLog.trace('Inside tree2 select-node');
        })
        .on("contextmenu", function(e,data) {
          windowLog.trace('Inside tree2 contextmenu');
          $("#prjListTableID").attr("name","jstree2");
          $("#td4").show();
          $("#closeTreeDlgTD").attr("colspan",3);
          $("#opsReturnID,#fileThumbnailID,#inputDstnPrjID,#buttomHalfID,#closeTreeTD").attr("colspan",4);
          if ( activeTreePane == "FILES" && $('input[name=opRadio]:checked').val() == "uploadFile" ) {
              var ref = $('#jstree').jstree(true);
              sel = ref.get_selected();
              //ret = ref.delete_node(sel);
            showFileUpload(e,"generalUpload","buttomHalfID","");
          }
          e.stopPropagation();
        })
        .on("click", function(e) {
          windowLog.trace('Inside jtree2 click');
          $("#prjListTableID").attr("name","jstree2");
          var ref = $('#jstree2').jstree(true);
          const selectedNode = ref.get_selected()[0];  // get the selected node to know where to uploaded the file
          var regex=/^f_/s; // file starts with f_
          if ( regex.test(selectedNode) ) {
            isLastSelectedElementFile=true;  // set the flag to true;
            $("#td4").hide();  // remove the uploadfile td,
            $("#closeTreeDlgTD").attr("colspan",2); 
            $("#opsReturnID,#fileThumbnailID,#inputDstnPrjID,#buttomHalfID,#closeTreeTD").attr("colspan",3);
            //manageFiles();
          }
          else { // manage directories

            if ( activeTreePane == "FILES" ) {  // first time in the directory pane (by default activeTreePane is set to FILES)
              windowLog.trace('Inside jtree2 first time');
              cleanupTree();  // reset the extended details pane (the right pane)
              $("#cpRadioID").prop("checked", true);
            }
            if (( activeTreePane == "FILES" ) || 
                ( isLastSelectedElementFile )) {  // if the last selected node was file than need to re-render the menue, otherwise, it is already rendered so skip it
              let inputPrjName=`<input type="text" name="projectNumber" id="prjTreeID" class="projectNameClass" value="please type the folder name" size="44" maxlength="50">`;
              $("#inputDstnPrjID").html(inputPrjName);
              $("#closeTreeDlgTD").attr("colspan",3); 
              $("#opsReturnID,#fileThumbnailID,#inputDstnPrjID,#buttomHalfID,#closeTreeTD").attr("colspan",4);
              $("#buttomHalfID,#td4,#opsFileID,#cancelFileID").show();
              if ( e.target.id[0] == "d" )  { // directory?
                $("#mvRadioID").next().text("Create new folder"); // hide move cause there is no move be
                $("#cpRadioID").next().text("Copy Folder");
                $("#dlRadioID").next().text("Delete Folder")
              }
              $("#yesBtn").val($('input[name=opRadio]:checked').val());
              if ( $('input[name=opRadio]:checked').val() == "uploadFile" )
                showFileUpload(e,"generalUpload","buttomHalfID","");
              isLastSelectedElementFile=false;  // set the flag to false;
            }
            activeTreePane = "FOLDERS";
          }
          e.stopPropagation();
        });
  }

  function readDirectory(prjNumber) { // 0-all projects or project number, 

    //var tree=`<table style="border : 2px solid black;width:100%"><tbody>`;
    //tree += `<tr style="border : 2px solid black"><td><div id="jstree">`; 
    
    var json={'prjNumber':prjNumber,"rootDir":appConfig.customers_dir};	// set the parqmteres to sent to the server
    var  folderTree="",systemTree="",configTree="";
    $.ajax({url       : "../fileops/dir.php",
            method		: "POST",
            data      : JSON.stringify(json),
            dataType	: "json",
            async     : false,  
            success		: function(result) {
              if ( Number(result[0].Status) > 0 )   //
                folderTree=result[1];
            }
    });

    var json={'prjNumber':0,"rootDir":appConfig.docket_dir};	// set the parqmteres to sent to the server   
    $.ajax({url       : "../fileops/dir.php",
            method		: "POST",
            data      : JSON.stringify(json),
            dataType	: "json",
            async     : false,  
            success		: function(result) {
              if ( Number(result[0].Status) > 0 )     // 
                systemTree=result[1];
      }
    });

    var json={'prjNumber':0,"rootDir":appConfig.config_dir};	// set the parqmteres to sent to the server   
    $.ajax({url       : "../fileops/dir.php",
            method		: "POST",
            data      : JSON.stringify(json),
            dataType	: "json",
            async     : false,  
            success		: function(result) {
              if ( Number(result[0].Status) > 0 )    // 
                configTree=result[1];
            }
    });
    var tree=`<table class="tree_dlg"><tbody>`;
    tree += `<tr><td>`;
    tree += `<table id="leftPaneTable" class="leftPaneTableID">`;
    tree += `<tbody><tr><td id="generalTreeTD" >`;
    tree += `<div style="height:100%;overflow-y:scroll" id="jstree">`; 
    tree += folderTree;
    tree += `</div></td></tr>`;
    tree += `<tr><td id="systemTreeTD"><div style="height:100%;overflow-y:scroll" id="jstree2">`;
    tree += systemTree;
    tree += `</div></td></tr>`;
    tree += `<tr><td id="configTreeTD"><div style="height:100%;overflow-y:scroll" id="jstree3">`;
    tree += configTree;
    tree += `</div></td></tr>`;
    tree += `</tbody></table>`; // the jtree td
    tree += `<td style="width:45%;height:100%;border:2px solid black">`;
    tree += `<table style="width:100%;height:100%" id="prjListTableID">`;
    tree += `<tr id="opsFileID" hidden style="height:10%"><td id="td1" style="text-align:center;"><input id="cpRadioID" type="radio" name="opRadio" value="Copy" checked/><label for="cpRadioID">Copy File</label></td>`;
    tree += `<td id="td2" style="text-align:center"><input id="mvRadioID" type="radio" name="opRadio" value="Move" /><label for="mvRadioID">Move File</label></td>`;
    tree += `<td id="td3" style="text-align:center"><input id="dlRadioID" type="radio" name="opRadio" value="Delete" /><label for="dlRadioID">Delete File</label></td>`;
    tree += `<td id="td4" style="text-align:center" hidden><input id="upldFileRadioID" type="radio" name="opRadio" value="uploadFile" /><label for="upldFileRadioID">Upload File</label></td></tr>`;
    tree += `<tr style="height:1%"><td colspan="3" id="opsReturnID"></td></tr>`;   // return message
    tree += `<tr style="height:1%"><td colspan="3" id="fileThumbnailID"></td></tr>`;   // return message
    tree += `<tr style="height:5%"><td colspan="3" id="inputDstnPrjID"></td></tr>`; // project name input
    tree += `<tr style="height:40%"><td colspan="3" id="buttomHalfID" style="display:table-cell;align-content:center;width:fit-content;justify-items:center" ><div class="dstnPrjList" id="overLay"><ul data-tag="channelList" class="uList" id="uListID"></div></td></tr>`;
    tree += `<tr><td id="closeTreeTD" colspan="3" style="height:10%"><center><input type='button' class='button' hidden value='Yes' id='yesBtn'/>&nbsp&nbsp<input type='button' class='button' hidden value='Cancel' id='cancelFileID'/></center></td></tr></table>`;
    tree += `<tr><td id="closeTreeDlgTD" colspan="2"><center><input type='button' class='button' value='Close' id='closeTreeDlg'/></center></td></tr></tbody></table>`;
    //align-content:flex-start
    return tree;
  }

  function cleanupTree() {

    windowLog.trace("cleanup tree");
    $("#jstree").removeClass("greyed-out");
    $("#moveRadioID").remove();
    $("#buttomHalfID").html('<div class="dstnPrjList" id="overLay"><ul data-tag="channelList" class="uList" id="uListID" ></ul></div>');
    $("#prjTreeID").val("");
    $("#prjTreeID").unbind('keydown');              // to be safe, unbind the handler
    $("#prjTreeID").bind('keydown',TblKeyDown);     // assign the keydown handler to the input project to accept project name
    $("#cancelFileID,#opsFileID,#opsReturnID,#yesBtn").hide();
    $("#inputDstnPrjID").removeClass("underLineTD");
    editing=false;

    return false;
  }


  function refreshTree(ops,dstTree,fname) {

    var ref = $('#'+dstTree).jstree(true),
    sel = ref.get_selected();
    switch (ops) {
      case  "create"  :
        var newNodeID=ref.create_node(sel,fname,"last");
        newID=Number($("#"+newNodeID)[0].previousSibling.id.split("_")[1])+1; // increase the last id 
        $("#"+newNodeID)[0].id="f_"+newID+"_"+data[0].fname;    // put together the new ID
    }
  }