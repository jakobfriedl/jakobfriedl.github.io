const uppercase_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase_letters = "abcdefghijklmnopqrstuvwxyz";
let interval = null;

$(document).ready( () => {
    $("h1").trigger("mouseover");
    $(".command")
        .val("")
        .focus();
    $("body").on("click", () => $(".command").focus());
}); 

// Font effect
const fontEffect = async (event, letters) => {
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

$(".effect").on("mouseover", async (e) => await fontEffect(e, uppercase_letters));

// Terminal functionality
const github = "https://github.com/jakobfriedl"
const linkedin = "https://www.linkedin.com/in/jakobfriedl"
const tryhackme = "https://tryhackme.com/p/Jako0b"

var pwd = "~"

class Command {
    constructor(name, output, hidden = false) {
        this.name = name;
        this.output = output;
        this.hidden = hidden;
    }
}

const showHelp = () => {
    let output = `
        <table class="response command-help">
            <tr>
                <td>help</td>
                <td>Displays all available commands</td>
            </tr>
            <tr>
                <td>whoami</td>
                <td>Get to know me :)</td>
            </tr>
            <tr>
                <td>blog</td>
                <td>Get information about my blog and how to access it</td>
            </tr>
            <tr>
                <td>ls [directory]</td>
                <td>Lists all files and directories in the current or specified directory</td>
            </tr>
            <tr>
                <td>cd [directory]</td>
                <td>Changes the current directory to the specified directory. Passing no parameters returns to '~'</td>
            </tr>
            <tr>
                <td>cat [file]</td>
                <td>Prints the content of the specified file</td>
            </tr>
            <tr>
                <td>clear</td>
                <td>Clears the terminal (CTRL+L is also supported)</td>
            </tr>
        </table><br>`
    $(".history").append(output);
}

const clearTerminal = () => {  
    $(".history").empty();
}

const showAbout = () => {
    let output = `
    <div class="response">
    Hi, my name is Jakob! I am a computer science student from Austria with a passion for cybersecurity and penetration testing. Next to that, I also enjoy going to the gym and lifting weights.<br><br> You can find me on the following platforms:<br>
    - <a class="social" href="${github}" target="_blank">GitHub</a><br>
    - <a class="social" href="${linkedin}" target="_blank">LinkedIn</a><br>
    - <a class="social" href="${tryhackme}" target="_blank">TryHackMe</a><br>
    </div><br>`
    $(".history").append(output);
}

const showBlog = () => {
    let output = `
    <div class="response">
    Use 'ls blog' to view my latest blog posts and write-ups or visit <a href="blog">/blog</a> for a more detailed and organized overview.<br>
    </div><br>`
    $(".history").append(output);
}

const getPwd = (json) => {
    if (pwd !== "~") {
        for (let i = 0; i < json.length; i++) {
            if(json[i].name === pwd){
                return json[i].content;
            }
        }
    } 
    return json;
}

const listDirectory = async (args) => {
    $.ajax({
        url: "./js/content.json",
        dataType: "json",
        async: false,
        success: (json) => {
            let content = json['content']

            // Get current directory
            content = getPwd(content)

            // Get specified directory
            let found = false;
            if(args.length > 0) {
                for(let j = 0; j < content.length; j++) {
                    if(content[j].name === args[0]){
                        if(content[j].type !== "directory") {
                            $(".history").append(`<div class="response">ls: '${args[0]}': Not a directory</div><br>`)
                            return
                        }
                        found = true;
                        content = content[j].content;
                        break;
                    }
                }
            }
            if(!found && args.length > 0 && args[0] !== "") {
                $(".history").append(`<div class="response">ls: cannot access '${args[0]}': No such file or directory</div><br>`)
                return
            }


            // List content
            let output = `<div class="response"><table>
                <tr class="table-header">
                    <td>Permissions</td>
                    <td>Owner</td>
                    <td>Size</td>
                    <td>Name</td>
                </tr>`
            for (let i = 0; i < content.length; i++) {                
                let directoryIdentfier = content[i].type === "directory" ? "d" : "-";
                let size =  content[i].type === "directory" ? "-" : content[i].content.length;
                let name = content[i].link !== undefined ? `<a target="_blank" href="blog/${content[i].link}">${content[i].name}</a>` : content[i].name;
                output += `<tr>
                    <td>${directoryIdentfier}rwxr--r--</td>
                    <td>jakob</td>
                    <td>${size}</td>
                    <td>${content[i].icon !== undefined ? content[i].icon : "\uf4a5"} ${name}</td>
                </tr>`
            }
            output += "</table></div><br>"
            $(".history").append(output);
        },
        error: (err) => {
            console.log(err);
        }
    })
}

const changeDirectory = async (args) => {
    $.ajax({
        url: "./js/content.json",
        dataType: "json",
        async: false,
        success: (json) => {
            let content = json['content']

            // Get current directory
            content = getPwd(content)

            // Get specified directory
            let found = false;
            if(args.length > 0) {
                for(let j = 0; j < content.length; j++) {
                    if(content[j].name === args[0]){
                        if (content[j].type !== "directory") {
                            $(".history").append(`<div class="response">cd: ${args[0]}: Not a directory</div><br>`)
                            return
                        }
                        found = true;
                        content = content[j].content;
                        break;
                    }
                }   
            }
            if(!found && args.length > 0 && args[0] !== "") {
                $(".history").append(`<div class="response">cd: no such file or directory: ${args[0]}</div><br>`)
                return
            } else {
                // Change to specified directory
                pwd = (args[0] === undefined || args[0] == "") ? "~" : args[0];
                // $(".history").append(`<div class="response">Changed directory to '${pwd}'</div><br>`)
                $("#pwd").text(`:${pwd === "~" ? pwd : "~/"+pwd}$`)
            }
        }
    })
}

const printFile = async (args) => {
    if (args.length === 0 || args[0] === "") {
        $(".history").append(`<div class="response">Usage: cat [file]</div><br>`)
        return
    }

    $.ajax({
        url: "./js/content.json",
        dataType: "json",
        async: false,
        success: (json) => {
            let content = json['content']

            // Get current directory
            content = getPwd(content)

            // Get specified file
            let fileContent = "";
            if(args.length > 0) {
                for(let j = 0; j < content.length; j++) {
                    if(content[j].name === args[0]){
                        if(content[j].type !== "file") {
                            $(".history").append(`<div class="response">cat: ${args[0]}: Is a directory</div><br>`)
                            return
                        }
                        fileContent = content[j].content;
                        break;
                    }
                }
            }
            if(fileContent === "") {
                $(".history").append(`<div class="response">cat: ${args[0]}: No such file or directory</div><br>`)
                return
            }   

            // Print file
            let output = `<div class="response">${fileContent}</div><br>`
            $(".history").append(output);
        },
        error: (err) => {
            console.log(err);
        }
    })
}

const sudo = () => {
    $(".history").append(`<div class="response">Congratulations, you found a secret command! Still won't let you use 'sudo' though.</div><br>`)
}
const vim = () => {
    $(".history").append(`<div class="response">Thank god you didn't want to use nano.</div><br>`)
}
const nano = () => {
    $(".history").append(`<div class="response">Disgusting.</div><br>`)
}


const commands = [
    new Command("help", showHelp),
    new Command("whoami", showAbout),
    new Command("blog", showBlog),
    new Command("ls", listDirectory),
    new Command("cd", changeDirectory),
    new Command("cat", printFile),
    new Command("clear", clearTerminal),

    // hidden commands
    new Command("sudo", sudo, hidden=true),
    new Command("vim", vim, hidden=true),
    new Command("nano", nano, hidden=true),
]

onkeydown = function(e){
    // Clear terminal with CTRL + L
    if(e.ctrlKey && e.key == 'l'){
        e.preventDefault();
        clearTerminal()
    }

    if(e.key != 'Tab'){
        $(".suggestions").text("");
    }

    // handle tab auto-complete
    if(e.key == 'Tab'){
        e.preventDefault();

        let curr = $(".command").val().toLowerCase().split(" ")
        
        if(curr.length == 1){
            // Autocomplete command if its the first word
            complete(curr.at(-1), commands)
        } else {
            // Get files and directories in current directory
            $.ajax({
                url: "./js/content.json",
                dataType: "json",
                async: false,
                success: (json) => {
                    let content = json['content']
                    content = getPwd(content)
                    complete(curr.at(-1), content)
                }
            });
        }
    }
} 

const complete = (word, content) => {
    // Get matching files and directories
    let matches = []
    for (let i = 0; i < content.length; i++) {
        if(content[i].name.toLowerCase().startsWith(word) && !content[i].hidden){
            matches.push(content[i].name);
        }
    }

    // If there is only one match, complete the word
    if(matches.length == 1){
        let command = $(".command").val().split(" ")
        command[command.length - 1] = matches[0]
        $(".command").val(command.join(" "))
    } else {
        // If there are multiple matches, show them under the command
        let output = ""
        for (let i = 0; i < matches.length; i++) {
            output += matches[i] + " "
        }
        $(".suggestions").text(output)
    }
}

// Submit command
const ENTER = 13; 
$(".command").on("keydown", (event) => {
    if(event.keyCode === ENTER) {
        let input = event.currentTarget.value;
        // Filter out unwanted characters

        input = input.replace(/[<>/\\&%:\(\)\[\]\}\{}]/g, "")
        // Append command & output to history
        $(".history").append(`<label><span class='username'>guest</span>@<span class='hostname'>localhost</span>:${pwd === "~" ? pwd : "~/"+pwd}$ ${input}</label><br>`); 

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

    // Handle complex command
    let c = commands.find(o => o.name === command.toLowerCase());
    if(c){
        await c.output(args);
        return;
    } 

    // Handle invalid command
    $(".history").append(`<div class="response">Command '${command}' not found</div><br>`);
}
