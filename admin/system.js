
    function system() {

        windowLog.trace("Inside system");
        const aboutDlg=document.getElementById("aboutDialog");
        let tree=`<table class="systemTbl" name="system"><tbody>`;
        tree += `<tr>`;
        //tree += `<div style="overflow-y:scroll" name="system" id="systemID"></div>`; 
        tree += `<td><table style="width:100%;height:100%;border:2px solid red" >`;
        tree += `<tr><td><a id="permissionsID" class="hyperlinkLabel">Permissions</a></td></tr>`;
        tree += `<tr><td><a id="foldersID" class="hyperlinkLabel">Folders</a></td></tr>`; 
        //        tree += `<tr><td style="border: 2px solid black" id=""></td></tr>`; // project name input
        tree += `<tr><td id="ph1"><a class="hyperlinkLabel">Placeholder1</a></td></tr>`;
        tree += `<tr><td id="ph2"><a class="hyperlinkLabel">Placeholder2</a></td></tr>`;
        tree += `</tbody></table></td>`;
        tree += `<td id="systemMainTD" style="border:2px solid red;width:65%">55555</td></tr>`;
        //tree += `<table style="width:100%,height=100%,overflow-y:scroll" id="prjListTableID">`;
        //tree += `<tr style="height:10px"><td style="height:10px">tttt</td></tr></td>`;
        tree += `<tr><td colspan="2"><center><input type='button' class='button' value='Close' id='closeSystemDlg'/></center></td></tr></tr></tbody></table>`;

        $(".aboutDlg").css({'width'     : "50vw",
                            'height'    : "60vh",
                            'overflow'  : 'hidden'});
        $("#overLay ul").empty(); // $("#overLay").remove();  
        aboutDlg.innerHTML=tree;
        aboutDlg.showModal();
        //$('#systemMenueOption').append( "<li><a hi there</a></li>");
        //const aboutDialog=document.getElementById("aboutDialog");
        /*    out += "<p>System Settings</p>";
        out += '<p class="settingDlg fas fa-sign-out-alt">Enable Total Cost in Employee Jobs<input type="checkbox" name="isTC" value="" onclick="updateEnableTotalCost(event);"></p>';
        out += `<input type="button" value="Ok" id='systemBtnId'>`;
        aboutDialog.innerHTML=out;
        aboutDialog.showModal();
    
        function Ok() {
            
            aboutDialog.close();
            return false;
        }   
        $('#systemBtnId').click(Ok);*/
    }
    
    function system2() {
    
        var outList="";
        outList = `<li tabindex="-1" id="focusableElement">111111</li>`; // bjuikld the 300 results at a time.
        outList += `<li tabindex="-1" id="focusableElement">2222</li>`; // bjuikld the 300 results at a time.
        $("#systemMenueOption").html(outList);
        $("#systemMenueOption").menu();
    
    }
    function updateEnableTotalCost(event) {
    
        classArray["Employee Jobs"].isTotalCost=event.target.checked;
    
       var arrChkBox = document.getElementsByName("labor_cost");
            $(arrChkBox).toggle();
    
        return false;
    }



    function permisssions() {

        $("#systemMainTD").html("This is sytem placehoder");
    }
    
    function foldersMngmnt() {

        $("#systemMainTD").html("This is folders placehoder");

    }