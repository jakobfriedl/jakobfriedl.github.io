$(document).ready( async () => {
    await getBlogEntries()
})

const getBlogEntries = async () => {
    let data = await fetch("../js/content.json")
    let json = await data.json()
    
    let content = json['content']
    for (let i = 0; i < content.length; i++) {
        if(content[i].name === "blog"){
            content = content[i].content;
            break;
        }
    }

    for (let i = 0; i < content.length; i++) {
        let entry = `<div class="blog-entry" onclick="window.open('${content[i].link}','_blank');" style="cursor: pointer;">
            <p class="date">${content[i].date}</p>
            <h2 class="blog-title">${content[i].name}</h2>
            <p class="blog-description">${content[i].content}</p>
        </div>`
        $(".blog").append(entry)
    }
}