const uppercase_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase_letters = "abcdefghijklmnopqrstuvwxyz";
let interval = null;

const github = "https://github.com/jakobfriedl"
const linkedin = "https://www.linkedin.com/in/jakobfriedl"
const tryhackme = "https://tryhackme.com/p/Jako0b"

const commands = {
    "help": `
        <div class="response">
            Available commands:<br>
            - help<br>
            - whoami<br>  
            - clear
        </div><br>`,
    "whoami": `
        <div class="response">
        Hi, my name is Jakob! I am a computer science student from Austria with a passion for cybersecurity and penetration testing.<br> You can find me on the following platforms:<br>
        - <a class="social" href="${github}" target="_blank">GitHub</a><br>
        - <a class="social" href="${linkedin}" target="_blank">LinkedIn</a><br>
        - <a class="social" href="${tryhackme}" target="_blank">TryHackMe</a><br>
        </div><br>`,
}

$(document).ready( () => {
    $("h1").trigger("mouseover");
    $(".command")
        .val("")
        .before("<span class='username'>guest</span>@<span class='hostname'>localhost</span>:~$ ")
        .focus();
    $("body").on("click", () => $(".command").focus());
}); 

// Font effect
const fontEffect = (event, letters) => {
    let iteration = 0; 
    clearInterval(interval);
    interval = setInterval(() => {
        event.target.innerText = event.target.innerText
        .split("")
        .map((letter, index) => {
            if(letter === " ") return letter;
            if(index < iteration) {
                return event.target.dataset.value[index];
            }
            
            return letters[Math.floor(Math.random() * 26)]
        })
          .join("");
          
          if(iteration >= event.target.dataset.value.length){ 
          clearInterval(interval);
        }
        
        iteration += 1 / 2;
    }, 20);
} 

$("h1").on("mouseover", (e) => fontEffect(e, uppercase_letters));

// Submit command
const ENTER = 13; 
$(".command").on("keydown", (event) => {
    if(event.keyCode === ENTER) {
        // Append command & output to history
        $(".history").append(`<label><span class='username'>guest</span>@<span class='hostname'>localhost</span>:~$ ${event.currentTarget.value}</label><br>`); 
        handleCommand(event.currentTarget.value);
        
        // Clear input
        event.currentTarget.value = "";

        // Scroll to bottom
        $("main").scrollTop($("main")[0].scrollHeight);
    }
}); 

// Handle command 
const handleCommand = (command) => {
    if (command === "") return;
    if (command === "clear") {
        $(".history").html("");
        return;
    }
    if (command in commands) {
        $(".history").append(commands[command]);
        return;
    }
    $(".history").append(`<div class="response">Command '${command}' not found</div><br>`);
}
