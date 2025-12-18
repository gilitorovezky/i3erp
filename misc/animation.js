var toggle=true;

function zoom(newScale) {
  
  //  splash.hidden=false;
    let parentDiv= document.getElementById("parentDiv");
    parentDiv.style.transform = `scale(${newScale},${newScale})`;
  /*
    if (toggle) {
        parentDiv.style.transform = "scale(1,1)";
        //splash.style.transform = "scale(2,2)";
        toggle=false;
        windowLog.trace("Expanding..");
    }
    else {
        //splash.style.transform = "scale(1,1)";
        parentDiv.style.transform = "scale(0.5,0.5)";
        toggle=true;
        windowLog.trace("Retracting");
    }
        */
  }