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
        let entry = `<div class="blog-entry">
            <h2 class="blog-title"><a href=${content[i].link} target="_blank">${content[i].name}</a></h2>
            <p class="date">TODO Date</p>
        </div>`
        $(".blog").append(entry)
    }
}