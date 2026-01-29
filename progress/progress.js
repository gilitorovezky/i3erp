$(".navtop,#caption,#mainDiv,#footer,#welcomeNameID").invisible();
setTimeout(() => {
  let progressBar = document.getElementById("myProgressBar");
  let barwidth = 2;
  let ab = setInterval(progressFunction, 30);

  function progressFunction() {
    if (barwidth >= 100) {
      clearInterval(ab);
      setTimeout(() => {
        progressBar.classList.add("height-0");
      }, appConfig.saveMsgTimeout); // 2 Sec delay before the progress bar disapears
      setTimeout(() => {
        document.getElementById("loader").classList.add("hide-loader");
        $(".navtop,#caption,#mainDiv,#footer,#welcomeNameID").visible();
      }, 2500);
    } else {
      barwidth++;
      progressBar.style.width = barwidth + "%";
      document.getElementById("incrementpercentage").innerHTML = barwidth + "%";
    }
  }
}, 500);
