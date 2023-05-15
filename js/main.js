const uppercase_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase_letters = "abcdefghijklmnopqrstuvwxyz";
let interval = null;

const github = "https://github.com/jakobfriedl"
const linkedin = "https://www.linkedin.com/in/jakobfriedl"
const tryhackme = "https://tryhackme.com/p/Jako0b"

var pwd = "~"

class Command {
    constructor(name, output) {
        this.name = name;
        this.output = output;
    }
}

const showHelp = () => {
    return `
        <div class="response">
            Available commands:<br>
            - help<br>
            - whoami<br>  
            - ls [directory]<br>
            - cd [directory] (in progress)<br>
            - cat [file] (in progress)<br>
            - clear
        </div><br>`
}

const showAbout = () => {
    return `
    <div class="response">
    Hi, my name is Jakob! I am a computer science student from Austria with a passion for cybersecurity and penetration testing.<br> You can find me on the following platforms:<br>
    - <a class="social" href="${github}" target="_blank">GitHub</a><br>
    - <a class="social" href="${linkedin}" target="_blank">LinkedIn</a><br>
    - <a class="social" href="${tryhackme}" target="_blank">TryHackMe</a><br>
    </div><br>`
}

const listDirectory = async (args) => {
    let data = await fetch("./js/content.json")
    let json = await data.json()

    let output = `<table class='response'>
    <tr class="table-header">
        <td>Permissions</td>
        <td>Owner</td>
        <td>Size</td>
        <td>Name</td>
    </tr>`
    
    let content = json['content']
    if(args.length > 0) {
        for(let j = 0; j < content.length; j++) {
            if(content[j].name === args[0]){
                content = content[j].content;
                break;
            }
        }
    }

    for (let i = 0; i < content.length; i++) {
        let directoryIdentfier = content[i].type === "directory" ? "d" : "-";
        let size =  content[i].type === "directory" ? "-" : content[i].content.length;
        output += `<tr>
            <td>${directoryIdentfier}rwxr--r--</td>
            <td>guest</td>
            <td>${size}</td>
            <td>${content[i].icon !== undefined ? content[i].icon : "\uf4a5"} ${content[i].name}</td>
        </tr>`
    }
    output += "</table><br>"
    return output
}

const changeDirectory = async (args) => {
    return `<div class="response">cd: not implemented</div><br>`
}

const printFile = async (args) => {
    return `<div class="response">cat: not implemented</div><br>`
}

const commands = [
    new Command("help", showHelp),
    new Command("whoami", showAbout),
    new Command("ls", listDirectory),
    new Command("cd", changeDirectory),
    new Command("cat", printFile)
]

$(document).ready( () => {
    $("h1").trigger("mouseover");
    $(".command")
        .val("")
        .before(`<span class='username'>guest</span>@<span class='hostname'>localhost</span>:${pwd}$ `)
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
        let input = event.currentTarget.value;
        // Filter out unwanted characters

        input = input.replace(/[<>/\\&%:\(\)\[\]\}\{}]/g, "")
        // Append command & output to history
        $(".history").append(`<label><span class='username'>guest</span>@<span class='hostname'>localhost</span>:${pwd}$ ${input}</label><br>`); 

        let command = input.split(" ");
        let args = command.slice(1);

        // Handle command
        handleCommand(command[0], args);
        // Clear input
        event.currentTarget.value = "";
        // Scroll to bottom
        $("main").scrollTop($("main")[0].scrollHeight);
    }
}); 

// Handle command 
const handleCommand = async (command, args) => {
    if (command === "") return;
    if (command === "clear") {
        $(".history").html("");
        return;
    }

    // Handle complex command
    let c = commands.find(o => o.name === command.toLowerCase());
    if(c){
        let output =  await c.output(args);
        $(".history").append(output);
        return;
    } 

    // Handle invalid command
    $(".history").append(`<div class="response">Command '${command}' not found</div><br>`);
}
