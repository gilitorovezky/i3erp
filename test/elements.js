//elements = [1, 2, 9, 15].join(',');
var elements ={};
elements["a"]="a";

$.post('test.php', {elements: JSON.stringify(elements)})