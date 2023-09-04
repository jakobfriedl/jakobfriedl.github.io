$(document).ready(() => {
    if (sessionStorage.getItem("skills-tab") == null) {
        // Set the default active tab to the first tab
        sessionStorage.setItem("skills-tab", "lang")
    }

    // Get the current active tab from session storage and activate it
    $('#skills-tab-'+sessionStorage.getItem("skills-tab")).addClass("skills-tab-active");
    $("#skills-content-"+sessionStorage.getItem("skills-tab")).show();
});

// Handle tab selection
$(".skills-tab-item").click((event) => {
    // Get the current active tab
    let current = $(".skills-tab-active")[0];
    
    // Remove the active class from the current tab
    current.classList.remove("skills-tab-active");
    $(".skills-content").children().hide();

    // Add the active class to the clicked tab, store in session storage
    event.target.classList.add("skills-tab-active");
    let tab = event.target.id.split("-")[2];
    sessionStorage.setItem("skills-tab", tab);

    // Get the current active tab content
    $("#skills-content-"+tab).show(); 
});

