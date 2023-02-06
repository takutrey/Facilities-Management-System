$(document).ready(function () {
	//Only needed for the filename of export files.
	//Normally set in the title tag of your page.
	document.title = "Simple DataTable";
	// Create search inputs in footer
	$("#example tfoot th").each(function () {
		var title = $(this).text();
		$(this).html('<input type="text" placeholder="Search ' + title + '" />');
	});
	// DataTable initialisation
	var table = $("#example").DataTable({
        serverMethod: "get", 
        serverSide: true,
        ajax:{
          "url": "/addpaymentstatus"
        },
		dom: '<"dt-buttons"Bf><"clear">lirtp',
		paging: true,
		autoWidth: true,
        
		buttons: [
			"colvis",
			"copyHtml5",
			"csvHtml5",
			"excelHtml5",
			"pdfHtml5",
			"print"
		],
		initComplete: function (settings, json) {
			var footer = $("#example tfoot tr");
			$("#example thead").append(footer);
		}
	});

	// Apply the search
	$("#example thead").on("keyup", "input", function () {
		table.column($(this).parent().index())
		.search(this.value)
		.draw();
	});
});