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
  if (!/^[A-Za-z'\-]{1,30}$/.test(f.lastname.value)) e.push("Last name must be 1 to 30 letters, apostrophes or dashes");
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
  if (!/^[0-9]{5}$/.test(f.zipcode.value)) e.push("Zip code must be exactly 5 digits");
  var addr = esc(f.address.value) + "<br>" + (f.address2.value !== "" ? esc(f.address2.value) + "<br>" : "") + esc(f.city.value) + ", " + esc(f.state.value) + " " + esc(zip);
  rows.push(["Address", addr, result(e)]);

  // Other info
  rows.push(["Gender", f.gender.value || "Not selected", ""]);
  rows.push(["Emergency Urgency", f.emergencyurgency.value + " out of 10", ""]);
  rows.push(["Comments", esc(f.comments.value), ""]);

  // Appointment availability
  var days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  var times = ["morning", "afternoon", "evening"];
  var avail = [];
  for (var d = 0; d < days.length; d++) {
    for (var t = 0; t < times.length; t++) {
      if (f[days[d] + "-" + times[t]].checked) {
        avail.push(days[d].charAt(0).toUpperCase() + days[d].slice(1) + " " + times[t]);
      }
    }
  }
  rows.push(["Appointment Availability", avail.length ? avail.join(", ") : "None selected", ""]);

  // Notification preference
  var notify = "No preference";
  if (document.getElementById("notify-yes").checked) notify = "Receive email notifications";
  if (document.getElementById("notify-no").checked) notify = "Opted out of email notifications";
  rows.push(["Email Notifications", notify, ""]);
  // Health checkboxes
  var boxes = document.querySelectorAll('input[name="conditions"]');
  for (var i = 0; i < boxes.length; i++) {
    rows.push([boxes[i].value, boxes[i].checked ? "Y" : "N", ""]);
  }

  // User ID and password
  var userid = f.userid.value.toLowerCase();
  e = [];
  if (!/^[a-z][a-z0-9_\-]{4,19}$/.test(userid)) e.push("User ID must be 5 to 20 characters, start with a letter, and use only letters, numbers, dash or underscore");
  rows.push(["User ID", esc(userid), result(e)]);

  var pw = f.userpassword.value;
  var pwLower = pw.toLowerCase();
  e = [];
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[^"\s]{8,30}$/.test(pw)) e.push("Password needs 8 to 30 characters with an uppercase letter, a lowercase letter and a number, and no quotes or spaces");
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

function oldcheckField(field) {
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
  var out = document.getElementById("pw-rules");
  if (pw === "") {
    out.textContent = "";
  } else {
    out.textContent = msgs.length ? " Still needs: " + msgs.join(", ") : " Password looks good";
  }
}


// Homework 3: hint text next to each field (prompting)
var hints = {
  userid: "5 to 20 characters. Start with a letter. Letters, numbers, - and _ only.",
  userpassword: "8+ characters with an uppercase letter, a lowercase letter and a number. Cannot contain your User ID.",
  confirmpassword: "Type the same password again.",
  email: "Format: name@domain.com",
  confirmemail: "Type the same email again.",
  dob: "Not in the future and not more than 120 years ago.",
  address: "2 to 30 characters.",
  address2: "Optional. 2 to 30 characters if entered.",
  zipcode: "Exactly 5 digits.",
  phone: "Optional. Format 123-456-7890.",
  city: "2 to 30 characters.",
  state: "Choose a state from the list.",
  ssn: "9 digits. Dashes are added as you type."
};

function addHints() {
  for (var id in hints) {
    var field = document.getElementById(id);
    if (!field) continue;
    var span = document.createElement("span");
    span.className = "hint";
    span.id = id + "-hint";
    span.textContent = hints[id];
    field.insertAdjacentElement("afterend", span);
  }
}

addHints();


  // Homework 3: our own JavaScript rule for each field.
// Each rule returns "" when the value is fine, or the message to show.
var rules = {
  firstname: function (v) {
    if (v === "") return "First name is required.";
    if (!/^[A-Za-z'\-]+$/.test(v)) return "Letters, apostrophes and dashes only.";
    if (v.length > 30) return "No more than 30 characters.";
    return "";
  },
  middleinitial: function (v) {
    if (v === "") return "";
    if (!/^[A-Za-z]$/.test(v)) return "One letter only, no numbers.";
    return "";
  },
  lastname: function (v) {
    if (v === "") return "Last name is required.";
    if (!/^[A-Za-z'\-]+$/.test(v)) return "Letters, apostrophes and dashes only.";
    if (v.length > 30) return "No more than 30 characters.";
    return "";
  },
  userid: function (v) {
    if (v === "") return "User ID is required.";
    if (/^[0-9]/.test(v)) return "Cannot start with a number.";
    if (/\s/.test(v)) return "No spaces allowed.";
    if (!/^[A-Za-z0-9_\-]+$/.test(v)) return "Letters, numbers, dash and underscore only.";
    if (v.length < 5) return "Must be at least 5 characters.";
    if (v.length > 20) return "No more than 20 characters.";
    return "";
  },
  email: function (v) {
    if (v === "") return "Email is required.";
    if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(v)) return "Use the format name@domain.com.";
    return "";
  },
  confirmemail: function (v) {
    if (v === "") return "Please type the email again.";
    if (v.toLowerCase() !== document.getElementById("email").value.trim().toLowerCase()) return "Emails do not match.";
    return "";
  },
  dob: function (v) {
    if (v === "") return "Date of birth is required.";
    var d = new Date(v + "T00:00:00");
    var now = new Date();
    var oldest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    if (isNaN(d.getTime())) return "Enter a valid date.";
    if (d > now) return "Cannot be in the future.";
    if (d < oldest) return "Cannot be more than 120 years ago.";
    return "";
  },
  address: function (v) {
    if (v === "") return "Address is required.";
    if (v.length < 2) return "Must be at least 2 characters.";
    if (v.length > 30) return "No more than 30 characters.";
    return "";
  },
  address2: function (v) {
    if (v === "") return "";
    if (v.length < 2) return "If entered, must be at least 2 characters.";
    if (v.length > 30) return "No more than 30 characters.";
    return "";
  },
  city: function (v) {
    if (v === "") return "City is required.";
    if (v.length < 2) return "Must be at least 2 characters.";
    if (!/^[A-Za-z .'\-]+$/.test(v)) return "Letters, spaces, periods, apostrophes and dashes only.";
    return "";
  },
  state: function (v) {
    if (v === "") return "Please choose a state.";
    return "";
  },
  zipcode: function (v) {
    if (v === "") return "Zip code is required.";
    if (!/^[0-9]+$/.test(v)) return "Numbers only.";
    if (v.length !== 5) return "Must be exactly 5 digits.";
    return "";
  },
  phone: function (v) {
    if (v === "") return "";
    if (!/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(v)) return "Use the format 123-456-7890.";
    return "";
  },
  ssn: function (v) {
    if (v === "") return "Social Security Number is required.";
    if (!/^[0-9\-]+$/.test(v)) return "Numbers only.";
    if (!/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/.test(v)) return "Must be 9 digits, like 123-45-6789.";
    return "";
  }
};

function checkField(field) {
  var span = document.getElementById(field.id + "-error");
  var rule = rules[field.id];
  if (!span || !rule) return "";
  var message = rule(field.value.trim());
  span.textContent = message;
  return message;
} 

// Homework 3: validate on every keystroke and when a choice changes
function setupLiveChecks() {
  for (var id in rules) {
    var field = document.getElementById(id);
    if (!field) continue;
    field.addEventListener("input", function () { checkField(this); });
    field.addEventListener("change", function () { checkField(this); });
  }
}

// Homework 3: add the dashes to the SSN as the user types
function formatSSN() {
  var ssn = document.getElementById("ssn");
  ssn.addEventListener("input", function () {
    var digits = this.value.replace(/\D/g, "").slice(0, 9);
    var out = digits;
    if (digits.length > 3) out = digits.slice(0, 3) + "-" + digits.slice(3);
    if (digits.length > 5) out = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
    this.value = out;
    checkField(this);
  });
}

setupLiveChecks();
formatSSN();


// Homework 3: password rules (checked as the user types)
rules.userpassword = function (v) {
  if (v === "") return "Password is required.";
  if (v.length < 8) return "Must be at least 8 characters.";
  if (v.length > 30) return "No more than 30 characters.";
  if (!/[A-Z]/.test(v)) return "Needs at least one uppercase letter.";
  if (!/[a-z]/.test(v)) return "Needs at least one lowercase letter.";
  if (!/[0-9]/.test(v)) return "Needs at least one digit.";
  if (/["\s]/.test(v)) return "No quotes or spaces allowed.";
  var id = document.getElementById("userid").value.trim().toLowerCase();
  if (id !== "" && v.toLowerCase().indexOf(id) !== -1) return "Cannot be, or contain, your User ID.";
  return "";
};

rules.confirmpassword = function (v) {
  if (v === "") return "Please type the password again.";
  if (v !== document.getElementById("userpassword").value.trim()) return "Passwords do not match.";
  return "";
};

function setupPasswordChecks() {
  var ids = ["userpassword", "confirmpassword"];
  for (var i = 0; i < ids.length; i++) {
    var field = document.getElementById(ids[i]);
    var span = document.createElement("span");
    span.className = "error";
    span.id = ids[i] + "-error";
    field.parentNode.appendChild(span);

    field.addEventListener("input", function () {
      checkField(this);
      var c = document.getElementById("confirmpassword");
      if (c.value !== "") checkField(c);
    });
    field.addEventListener("blur", function () { checkField(this); });
  }

  // changing the User ID can make the password invalid, so re-check it
  document.getElementById("userid").addEventListener("input", function () {
    var p = document.getElementById("userpassword");
    if (p.value !== "") checkField(p);
  });
}

setupPasswordChecks();


// Homework 3: the Validate button runs every rule, then shows Submit only if there are no errors
var validateIds = ["firstname", "middleinitial", "lastname", "userid", "userpassword",
  "confirmpassword", "email", "confirmemail", "dob", "address", "address2",
  "city", "state", "zipcode", "phone", "ssn"];

function validateForm() {
  // force lower case in the email boxes
  var email = document.getElementById("email");
  var confirmEmail = document.getElementById("confirmemail");
  email.value = email.value.trim().toLowerCase();
  confirmEmail.value = confirmEmail.value.trim().toLowerCase();

  var errorCount = 0;
  for (var i = 0; i < validateIds.length; i++) {
    var field = document.getElementById(validateIds[i]);
    if (checkField(field) !== "") errorCount++;
  }

  var msg = document.getElementById("validate-message");
  var submitBtn = document.getElementById("submit-btn");
  if (errorCount === 0) {
    msg.textContent = " All fields are valid. You may now submit.";
    msg.style.color = "#1b7f3b";
    submitBtn.style.display = "inline";
  } else {
    msg.textContent = " Please fix " + errorCount + " field(s) marked in red.";
    msg.style.color = "#b00020";
    submitBtn.style.display = "none";
  }
}

// any change to the form hides Submit again until Validate is clicked
function hideSubmit() {
  document.getElementById("submit-btn").style.display = "none";
  document.getElementById("validate-message").textContent = "";
}

var theForm = document.forms["registration"];
theForm.addEventListener("input", hideSubmit);
theForm.addEventListener("change", hideSubmit);
theForm.addEventListener("reset", function () {
  hideSubmit();
  var errs = document.querySelectorAll(".error");
  for (var i = 0; i < errs.length; i++) errs[i].textContent = "";
});


theForm.addEventListener("submit", function (e) {
  validateForm();
  if (document.getElementById("submit-btn").style.display === "none") {
    e.preventDefault();
  }
});