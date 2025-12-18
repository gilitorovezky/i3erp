function addSearchHeader() {

    var out;

    switch ($("#screen_name").html()) {

        case "Employee Jobs":
            out = `<td></td><td>Project Number</td>`;

        break;
    }
    out += headers[$("#screen_name").html()]['columns'];
    out=out.replaceAll("th","td");
    $("#searchID").html(out);
}