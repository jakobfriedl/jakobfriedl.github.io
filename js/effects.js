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
