function reviewForm() {
    // Get the form element
    var f = document.forms["registration"];
    
    var rows = [
    ["Name", f.firstname.value + " " + f.middleinitial.value + " " + f.lastname.value],
    ["Date of Birth", f.dob.value],
    ["Email", f.email.value],
    ["Phone", f.phone.value],
    ["Address", f.address.value + " " + f.address2.value + ", " + f.city.value + ", " + f.state.value + " " + f.zipcode.value],
    ["User ID", f.userid.value.toLowerCase()],
    ["Gender", f.gender.value],
    ["Emergency Urgency", f.emergencyurgency.value + " out of 10"],
    ["Comments", f.comments.value]
  ];

  var html = "<h3>PLEASE REVIEW THIS INFORMATION</h3><table>";
  for (var i = 0; i < rows.length; i++) {
    html += "<tr><th>" + rows[i][0] + "</th><td>" + rows[i][1] + "</td></tr>";
  }
  html += "</table>";

  document.getElementById("review-area").innerHTML = html;
}

function updateUrgency() {
  var level = document.getElementById("emergencyurgency").value;
  document.getElementById("urgency-value").innerHTML = level + " out of 10";
}
