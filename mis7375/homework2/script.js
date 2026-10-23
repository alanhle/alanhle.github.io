function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function result(errors) {
  if (errors.length === 0) {
    return "pass";
  }
  return '<span style="color:red">ERROR: ' + esc(errors.join("; ")) + "</span>";
}

function reviewForm() {
  var f = document.forms["registration"];
  var rows = [];

  // Name
  var e = [];
  if (!/^[A-Za-z'\-]{1,30}$/.test(f.firstname.value)) e.push("First name must be 1 to 30 letters, apostrophes or dashes");
  if (f.middleinitial.value !== "" && !/^[A-Za-z]$/.test(f.middleinitial.value)) e.push("Middle initial must be one letter");
  if (!/^[A-Za-z'\-2-5]{1,30}$/.test(f.lastname.value)) e.push("Last name must be 1 to 30 letters, apostrophes, dashes or numbers 2 to 5");
  rows.push(["First, MI, Last Name", esc(f.firstname.value + " " + f.middleinitial.value + " " + f.lastname.value), result(e)]);

  
  // Date of birth
  e = [];
  if (f.dob.value === "") {
    e.push("Date of birth is missing");
  } else {
    var dob = new Date(f.dob.value + "T00:00:00");
    var today = new Date();
    var oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    if (dob > today) e.push("Cannot be in the future");
    if (dob < oldest) e.push("Cannot be more than 120 years ago");
  }
  rows.push(["Date of Birth", esc(f.dob.value), result(e)]);

  // Email
  e = [];
  if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(f.email.value)) e.push("Email must look like name@domain.com");
  if (f.email.value !== f.confirmemail.value) e.push("Emails do not match");
  rows.push(["Email", esc(f.email.value), result(e)]);

  
  // Phone
  e = [];
  if (f.phone.value !== "" && !/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(f.phone.value)) e.push("Phone must look like 123-456-7890");
  rows.push(["Phone", esc(f.phone.value), result(e)]);
   // SSN
  e = [];
  var ssn = f.ssn.value;
  if (ssn !== "" && !/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/.test(ssn)) e.push("SSN must look like 123-45-6789");
  rows.push(["Social Security Number", ssn === "" ? "" : "***-**-" + esc(ssn.slice(-4)), result(e)]);

  // Address
  e = [];
  var zip = f.zipcode.value.substring(0, 5);
  if (f.address.value.length < 2) e.push("Address line 1 must be 2 to 30 characters");
  if (f.address2.value !== "" && f.address2.value.length < 2) e.push("Address line 2 must be 2 to 30 characters");
  if (f.city.value.length < 2) e.push("City must be 2 to 30 characters");
  if (f.state.value === "") e.push("Please choose a state");
  if (!/^[0-9]{5}(-[0-9]{4})?$/.test(f.zipcode.value)) e.push("Zip code must be 5 digits, or zip+4");
  var addr = esc(f.address.value) + "<br>" + (f.address2.value !== "" ? esc(f.address2.value) + "<br>" : "") + esc(f.city.value) + ", " + esc(f.state.value) + " " + esc(zip);
  rows.push(["Address", addr, result(e)]);

  // Other info
  rows.push(["Gender", f.gender.value, ""]);
  rows.push(["Emergency Urgency", f.emergencyurgency.value + " out of 10", ""]);
  rows.push(["Comments", esc(f.comments.value), ""]);
  // Health checkboxes
  var boxes = document.querySelectorAll('input[name="conditions"]');
  for (var i = 0; i < boxes.length; i++) {
    rows.push([boxes[i].value, boxes[i].checked ? "Y" : "N", ""]);
  }

  // User ID and password
  var userid = f.userid.value.toLowerCase();
  e = [];
  if (!/^[a-z][a-z0-9_\-]{4,29}$/.test(userid)) e.push("User ID must be 5 to 30 characters, start with a letter, and use only letters, numbers, dash or underscore");
  rows.push(["User ID", esc(userid), result(e)]);

  var pw = f.userpassword.value;
  var pwLower = pw.toLowerCase();
  e = [];
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9"\s])[^"\s]{8,30}$/.test(pw)) e.push("Password needs 8 to 30 characters with an uppercase letter, lowercase letter, number and special character, and no quotes");
  if (pw !== f.confirmpassword.value) e.push("Passwords do not match");
  if (userid.length >= 3 && pwLower.indexOf(userid) !== -1) e.push("Password cannot contain your user ID");
  var names = [f.firstname.value.toLowerCase(), f.lastname.value.toLowerCase()];
  for (var n = 0; n < names.length; n++) {
    if (names[n].length >= 3 && pwLower.indexOf(names[n]) !== -1) {
      e.push("Password cannot contain your name");
      break;
    }
  }
  rows.push(["Password", "*".repeat(pw.length), result(e)]);

  var html = "<h3>PLEASE REVIEW THIS INFORMATION</h3><table>";
  for (var j = 0; j < rows.length; j++) {
    html += "<tr><th>" + rows[j][0] + "</th><td>" + rows[j][1] + "</td><td>" + rows[j][2] + "</td></tr>";
  }
  html += "</table>";

  document.getElementById("review-area").innerHTML = html;
}

function updateUrgency() {
  var level = document.getElementById("emergencyurgency").value;
  document.getElementById("urgency-value").innerHTML = level + " out of 10";
}

function checkPasswords() {
  var pw = document.getElementById("userpassword").value;
  var confirm = document.getElementById("confirmpassword");
  var msg = document.getElementById("password-message");

  if (confirm.value === "") {
    msg.innerHTML = "";
    confirm.setCustomValidity("");
  } else if (pw !== confirm.value) {
    msg.innerHTML = " Passwords do not match";
    confirm.setCustomValidity("Passwords do not match");
  } else {
    msg.innerHTML = " Passwords match";
    confirm.setCustomValidity("");
  }
}

function formatDate(d) {
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

function setDobRange() {
  var today = new Date();
  var oldest = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  var dob = document.getElementById("dob");
  dob.max = formatDate(today);
  dob.min = formatDate(oldest);
}

setDobRange();


var checkIds = ["firstname", "middleinitial", "lastname", "userid", "email",
  "confirmemail", "dob", "address", "address2", "zipcode", "phone", "city",
  "state", "ssn"];

function checkField(field) {
  var span = document.getElementById(field.id + "-error");

  if (field.id === "confirmemail") {
    var same = field.value === document.getElementById("email").value;
    field.setCustomValidity(same || field.value === "" ? "" : "Emails do not match");
  }

  if (field.validity.valid) {
    span.textContent = "";
  } else if (field.validity.valueMissing) {
    span.textContent = "This field is required.";
  } else if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
    span.textContent = "Date cannot be in the future or more than 120 years ago.";
  } else if (field.validity.customError) {
    span.textContent = field.validationMessage;
  } else {
    span.textContent = field.title;
  }
}

function setupErrors() {
  for (var i = 0; i < checkIds.length; i++) {
    var field = document.getElementById(checkIds[i]);
    var span = document.createElement("span");
    span.className = "error";
    span.id = field.id + "-error";
    field.insertAdjacentElement("afterend", span);

    field.addEventListener("blur", function () { checkField(this); });
    field.addEventListener("input", function () {
      var msg = document.getElementById(this.id + "-error");
      if (msg.textContent !== "" || this.id === "confirmemail") checkField(this);
    });
  }

  document.getElementById("email").addEventListener("input", function () {
    var c = document.getElementById("confirmemail");
    if (c.value !== "") checkField(c);
  });

  document.forms["registration"].addEventListener("invalid", function (e) {
    if (e.target.id && document.getElementById(e.target.id + "-error")) checkField(e.target);
  }, true);
}

setupErrors();


function checkRules() {
  var pw = document.getElementById("userpassword").value;
  var msgs = [];
  if (pw.length < 8) msgs.push("8+ characters");
  if (!/[a-z]/.test(pw)) msgs.push("a lowercase letter");
  if (!/[A-Z]/.test(pw)) msgs.push("an uppercase letter");
  if (!/[0-9]/.test(pw)) msgs.push("a number");
  if (!/[^A-Za-z0-9"\s]/.test(pw)) msgs.push("a special character");
  var out = document.getElementById("pw-rules");
  if (pw === "") {
    out.textContent = "";
  } else {
    out.textContent = msgs.length ? " Still needs: " + msgs.join(", ") : " Password looks good";
  }
}