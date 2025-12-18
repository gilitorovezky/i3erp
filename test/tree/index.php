<!doctype html>
<html lang="en">
  <head>
    <!-- required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.6.3/css/all.min.css"  />
    <link rel="stylesheet" href="../css/style-tree.css"> <!-- tables stylesheet -->
    <link rel="stylesheet" href="../css/style-tables.css"> <!-- tables stylesheet -->
		<link rel="stylesheet" href="../js/themes/default/style.min.css">
		
		<script type="text/javascript" src="../js/jquery-3.7.1.js"></script> <!-- for development -->
		<script type="text/javascript" src="../js/jquery-ui.js"></script> <!-- for development -->
		<script type="text/javascript" src="../js/jstree.js"></script> <!-- for development -->
    <title>Tree</title>
    
  </head>
  <body>
    <dialog id="rootDivID" class="aboutDlg"></dialog>
        <script>
          $(".aboutDlg").css({'height' : "50vh",
                              'width'  : "50vw"});
        var treeHTML=`<table class="folderTable"><tbody><tr><td id="td1" class="folderTableTD" style="width:50%"><center><label><input id="copyRadioID" type="radio" name="opRadio" value="move" />Copy file</label></td><td id="td2" class="folderTableTD" style="width:50%"><center><label><input id="moveRadioID" type="radio" name="opRadio" value="move" />Move file</label></td></tr>`;
        treeHTML +=  `<tr id="trFanyFourID" style="visibility:hidden">`;
        treeHTML +=  `<td class="folderTableTD" id="ejID"><label><input id="inputEJID" type="radio" name="dstFolderRadio" value="ej" />Employee Jobs</label></td>`;
        treeHTML +=  `<td class="folderTableTD" id="pymntsID"><label><input id="inputPymntsID" type="radio" name="dstFolderRadio" value="payments" />Payments</label></td>`;
        treeHTML +=  `<td class="folderTableTD" id="prchsID"><label><input id="inputPurchasesID" type="radio" name="dstFolderRadio" value="purchases" />Purchases</label></td>`;
        treeHTML +=  `<td class="folderTableTD" id="cjID"><label><input id="inputCJD" type="radio" name="dstFolderRadio" value="cj" />Contractor Job Payments</label></td>`;
        treeHTML +=  `</tr><tr><td><div id="jstree">`;

        treeHTML +=`<?php
            //define('SITE_URL', 'https://bootstrapfriendly.com/demo/live-demo/file-directory-tree-php_1654194145');

              $tree="";
              function listFolderFiles($dir) {

                global $tree;
                  //$allowed = array('php', 'html', 'css', 'js', 'txt');
              
                  $fileFolderList = scandir($dir);
                  //echo '<ul >';
                  $tree .= '<ul>';
                  foreach ($fileFolderList as $fileFolder) {
                      if ($fileFolder != '.' && $fileFolder != '..' && $fileFolder != '.DS_Store') {
                          if (!is_dir($dir.'/'.$fileFolder)) {  
                            //echo '<li>'.$fileFolder;
                            $tree .='<li id="f_'.$fileFolder.'">'.$fileFolder;
                          } else {
                              //echo '<li>'.$fileFolder;
                              $tree .='<li id="d_'.$fileFolder.'">'.$fileFolder;
                          }
                          if (is_dir($dir.'/'.$fileFolder)) {
                              listFolderFiles($dir.'/'.$fileFolder);
                          }
                          //echo '</li>';
                          $tree .='</li>';
                      }
                  }
                  //echo '</ul>';
                  $tree .='</ul>';
              }

              listFolderFiles('../uploads/1001-y9 construction inc-AHK-PROGRAM-OREL-ROSELLE');
              
              echo $tree;

            ?>`
      treeHTML += `</div></td>`; // the jtree td
      treeHTML += `<td style="width:300px"><table style="width:100%" id="prjListTableID"><tr><td id="inputDstnPrjID"></td></tr>`; // project name input
      treeHTML += `<tr><td style="height:250px" id="buttomHalfID"><div class="dstnPrjList" id="overLay"><ul data-tag="channelList" class="uList" id="uListID"></div></td></tr>`;
      treeHTML += `</table><tr><td colspan="2"><center><input type='button' class='button' value='Close' id='closeTreeDlg'/></center></td></tr></tbody></table>`;

      const handler=document.getElementById("rootDivID");
      handler.innerHTML=treeHTML;
      handler.showModal();
      $('#jstree').jstree();
      $('#jstree').jstree({"plugins" : [
      "contextmenu"
    ]});
      $('#jstree')
      .on("changed.jstree", function (e, data) {
        if(data.selected.length) {
          $("#trFanyFourID").css({'visibility' : "hidden"});
          /*var ref = $('#jstree').jstree(true),
          sel = ref.get_selected();
          ret = ref.delete_node(sel);*/
          // windowLog.trace('The selected node is: ' + data.instance.get_node(data.selected[0]).text);
        }
      })
      .on("contextmenu", function(e) {
          
          if ( e.target.id[0] == "f" ) { // file

            var fileName=e.target.parentNode.parentNode.parentNode.id.split("_")[1]+"/"+e.target.innerText;

            $("#jstree").addClass("greyed-out");
            $('#overLay').unbind("keydown");
            $("#trFanyFourID").css({'visibility' : "visible"});
            //$('#overLay').on("keydown",{srcFilename:fileName},overLayKeyDown)
            text="";
            
			      /*var inputPrjName=`<input type="text" name="projectNumber" id="prjTreeID" class="projectNameClass" value="please type the project number" size="44" maxlength="50">`;
            $("#inputDstnPrjID").html(inputPrjName);
            $("#prjTreeID").focus();
            $("#prjTreeID").unbind('keydown');              // to be safe, unbind the handler
            $("#prjTreeID").bind('keydown',TblKeyDown);     // assign the keydown handler to the input project to accept project name
            */
          }
          //else  // directory
            //windowLog.trace(e.target.innerText);
          e.preventDefault();
      });
      //console.log(tmp);

      $('#closeTreeDlg').on( "click", function() {
        alert($('input[name=dstFolderRadio]:checked').val());
        document.getElementById("rootDivID").close();
      });
    </script>
</body>
</html>