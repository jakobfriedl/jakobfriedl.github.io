const uppercase_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase_letters = "abcdefghijklmnopqrstuvwxyz";
let interval = null;

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
        console.log(event)
        $(".history").append(`<label><span class='username'>guest</span>@<span class='hostname'>localhost</span>:~$ ${event.currentTarget.value}</label><br>`); 
        handleCommand(event.currentTarget.value);
        event.currentTarget.value = "";
    }
}); 

// Handle command 
const handleCommand = (command) => {
    let res = ""; 
    switch(command) {
        case "help":
            res = `
                <div class="response">
                Available commands:<br>
                 - help<br>
                 - whoami<br>
                 - socials<br>
                 - clear
                </div><br>`; 
            $(".history").append(res);
            break;

        case "whoami":
            res = `
                <div class="response">
                Hi, my name is Jakob! I am a computer science student from Austria, with a passion for cybersecurity and penetration testing.
                </div><br>`
            $(".history").append(res);
            break;

        case "socials":
            res = `
                <div class="response">
                You can find me on the following platforms:<br>
                 - <a class="social" href="https://github.com/jakobfriedl" target="_blank">GitHub</a><br>
                 - <a class="social" href="https://www.linkedin.com/in/jakobfriedl" target="_blank">LinkedIn</a><br>
                 - <a class="social" href="https://tryhackme.com/p/Jako0b" target="_blank">TryHackMe</a><br>
                </div><br>`
            $(".history").append(res);
            break;

        case "clear":
            $(".history").html("");
            break;

        case '': 
            break;

        default:
            res = `
                <div class="response">
                Command '${command}' not found
                </div><br>`
            $(".history").append(res);
            break; 
    }
}
