const uppercase_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase_letters = "abcdefghijklmnopqrstuvwxyz";
let interval = null;

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

// Typewriter effect
const typewriterList = ["Cybersecurity Student", "Penetration Tester", "Security Researcher", "Programming Enthusiast"]
let typewriterIndex = 0;
let typewriterInterval = null;

// Typewriter write 
const typewriter = (string) => {
    let iteration = 0;
    clearInterval(interval);
    typewriterInterval = setInterval(() => {
        $(".typewriter").text(string.slice(0, iteration));
        if(iteration >= string.length) {
            clearInterval(typewriterInterval);
        }
        iteration += 1;
    }, 100);

    setTimeout(clearTypewriter, 3000);
}

// Typewriter clear
const clearTypewriter = () => { 
    let string = $(".typewriter").text();
    let iteration = string.length;
    clearInterval(typewriterInterval);
    typewriterInterval = setInterval(() => {
        $(".typewriter").text(string.slice(0, iteration));
        if(iteration <= 0) {
            clearInterval(typewriterInterval);
        }
        iteration -= 1;
    }, 75);

    typewriterIndex = (typewriterIndex + 1) % typewriterList.length;
    setTimeout(typewriter, 2000, typewriterList[typewriterIndex]);
}

$(document).ready( () => {
    typewriter(typewriterList[typewriterIndex]);
})