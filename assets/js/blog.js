$(document).ready( async () => {
    await getBlogEntries()
})

const getBlogEntries = async () => {
    let data = await fetch("../assets/js/content.json")
    let json = await data.json()
    
    let content = json['content']
    for (let i = 0; i < content.length; i++) {
        if(content[i].name === "blog"){
            content = content[i].content;
            break;
        }
    }

    for (let i = 0; i < content.length; i++) {
        
        let tags = '<div class="tag-list">' 
        if (content[i].categories) { 
            content[i].categories.forEach((tag) => {
                tags += `<div class='tag'>${tag.tag}</div>`
            }) 
        }
        tags += "</div>"

        let entry = `<div class="blog-entry" onclick="window.open('${content[i].link}','${content[i].type == "pdf" ? "_blank" : "_self"}');" style="cursor: pointer;">
            <p class="date">${content[i].date}</p>
            <h2 class="blog-title">${content[i].name}</h2>
            <p class="blog-description">${content[i].content}</p>
            ${tags}
        </div>`
        $(".blog-list").append(entry)
    }
}