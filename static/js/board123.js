
canvas.addEventListener('click', (event) => {
    const x = event.clientX
    const y = event.clientY
    console.log(`Координаты на странице: (${x}, ${y})`)
});


export function initBoard(canvas, groupId) {


async function loadChatHistory() {
    const res = await fetch(`/groups/chat/${groupId}/${localStorage.getItem('currentFolderId')}`)
    const data = await res.json()
    chatMessages.innerHTML = ''
    data.message.forEach(msg => {
        const du = document.createElement('div')
        du.innerHTML = `<b>${msg.username}:</b> ${msg.text}`
        if (msg.fileUrl) du.innerHTML += ` <a href="${msg.fileUrl}">📎 ${msg.fileName}</a>`
        chatMessages.appendChild(du)
    })
}
//---------------------

const swimline = document.getElementById('swimline');
    const sidebar = document.getElementById('sidebar');
    let d = false;

    swimline.addEventListener('mousedown', (e) => {
        d = true;
        document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!d) return;
        const newWidth = e.clientX;
        if (newWidth>150 && newWidth<500) {
            sidebar.style.width=newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        d= false;
        document.body.style.cursor='';
    });
    const btnDesk=document.getElementById('btnDesk')
    const btnChat=document.getElementById('btnChat')
    const deskPanel = document.getElementById('deskPanel');
    const chatPanel = document.getElementById('chatPanel');
    btnDesk.addEventListener('click', () => {
        btnDesk.classList.add('active');
        btnChat.classList.remove('active');
        deskPanel.style.display = 'block';
        chatPanel.style.display = 'none';
    });

    btnChat.addEventListener('click', () => {
        btnChat.classList.add('active');
        btnDesk.classList.remove('active');
        deskPanel.style.display = 'none';
        chatPanel.style.display = 'block';
        loadChatHistory()
    });
//---------------------
const ctx = canvas.getContext('2d')
function clearCanvas(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
}
const socket = io()
const currentFolderId = localStorage.getItem('currentFolderId')
socket.emit('join-group', `${groupId}_${currentFolderId}`)
socket.on('draw', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.from.x, data.from.y)
    ctx.lineTo(data.to.x, data.to.y)
    ctx.stroke()
})


canvas.width=canvas.offsetWidth
canvas.height=canvas.offsetHeight
let movement=false
let painting=false
let flag =true
let mosX=0
let mosY=0

let secX=0
let secY=0

let genX=0
let genY=0

let startGenX=0
let startGenY=0

let lines=[]
let thilines=[]

let  chat = false




let but=document.getElementById("myPic")
but.onclick=()=>{
    if(flag==false) {
    flag=true
    movement=false
    painting=false
        }

    else {
    flag=false
    movement=false
    painting=false
    }
    if (but.src.indexOf("image1.png") != -1) {
    but.src = "image2.png";
  } else {
     but.src = "image1.png";
  }

    }
canvas.addEventListener('mousedown', (e) => {
    if(flag){
    mosX=e.clientX
    mosY=e.clientY
    startGenY=genY
    startGenX=genX
    movement=true
    painting=false
    }
    else{
        ctx.beginPath();
        const x = e.offsetX
        const y = e.offsetY
        ctx.moveTo(x, y)
        thilines = [{ x, y }]
        painting=true
        movement=false
    }
    })

canvas.addEventListener('mousemove', (e)=>{
    if(movement && flag){
    secX=e.clientX-mosX
    secY=e.clientY-mosY

    genX=startGenX+secX
    genY=startGenY+secY
    draw()
}
    else if (painting && !flag){
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX-rect.left)
    const y = e.clientY-rect.top
    ctx.lineTo(x, y)
    thilines.push({ x, y })
    socket.emit('draw', {groupId, x,y})
    draw()

}

    })
canvas.addEventListener('mouseup', (e)=>{
    if(movement && flag){
    movement=false
    draw()
    }

    else if(painting && !flag){

    const newLine={

        points:[...thilines],
        lineId:String(Date.now())

    }
    lines.push(newLine)
        fetch('/groups/drawing/line', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                groupId: groupId,
                folderId: localStorage.getItem('currentFolderId'),
                line: newLine
            })
        })
        thilines = []
        painting=false
        draw()
    }


})

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(genX, genY)
    let leng=20
    let x= Math.floor((-genX)/leng)*leng
    let y=Math.floor((-genY)/leng)*leng
    ctx.beginPath()
    for (let i=x; i<=canvas.width-genX ; i+=leng){
        for (let j=y; j<=canvas.height-genY;j+=leng){
        ctx.fillStyle = 'orange'
        ctx.fillRect(i,j, 1,1)
    }}
    for (let i=0; i<lines.length; i++){
        let line=lines[i]
        const points = line.points
        if(points.length<2) continue
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)

        for (let j=0; j<points.length; j++){

            ctx.lineTo(points[j].x, points[j].y)
        }
        ctx.stroke()
    }
    if(thilines.length>2){
        ctx.beginPath()
        ctx.moveTo(thilines[0].x, thilines[0].y)

        for (let j=0; j<thilines.length; j++){

            ctx.lineTo(thilines[j].x, thilines[j].y)
        }
        ctx.stroke()
}
    ctx.restore()
}

    async function loadLines(folderId) {
        try {
            clearCanvas()
            const groupId = new URLSearchParams(window.location.search).get('groupId')
            const res=await fetch(`/groups/drawing/${groupId}/${folderId}`)
            const data=await res.json()
            lines=[]
            thilines=[]
            if (data.lines) {
                lines=data.lines
                draw()
            }
        } catch (e){
            console.log('Error in load lines', e)
        }
    }
if (groupId) {
    loadLines(localStorage.getItem('currentFolderId'))
} else {
    draw()
}

//----------------------------ЛОГИКА ЧАТА---------------------
let message=[]

const chatMessages = document.getElementById('chatMessages')

const add=document.getElementById("chatSend")
const chatInput=document.getElementById('chatInput')
const chatFile=document.getElementById('chatFile')
const chatFileBtn=document.getElementById('chatFileBtn')
let pendingFile=null

chatFileBtn.onclick =()=>{
    chatFile.click()}
chatFile.onchange= async ()=>{
    const file=chatFile.files[0]
    if(!file) return
    const formData= new FormData()
    formData.append('file', file)
    const res = await fetch('/upload', {
        method: 'POST',
        body: formData
    })
    const data = await res.json()
    pendingFile = {fileUrl:data.fileUrl, fileName:data.fileName}

}

add.addEventListener('click', ()=>{
    const text=chatInput.value
    if(!text) return
    console.log('Клик по кнопке отправки', text)
    const messageDate={groupId: groupId,
                folderId: localStorage.getItem('currentFolderId'),
                text:text,
                username: localStorage.getItem('username'),
                fileUrl: pendingFile?.fileUrl,
                fileName: pendingFile?.fileName
    }
    fetch('/groups/chat/message', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(messageDate)
        })
            socket.emit('chat-message', messageDate)

        chatInput.value=''
        pendingFile = null
        chatFile.value = ''

})
socket.on('chat-message', (data) => {
    if (data.folderId === localStorage.getItem('currentFolderId')) {
        const du = document.createElement('div')
        du.innerHTML = `<b>${data.username}:</b> ${data.text}`
        if (data.fileUrl) du.innerHTML+=`<a href="${data.fileUrl}">📎 ${data.fileName}</a>`
        chatMessages.appendChild(du)
        chatMessages.scrollTop = chatMessages.scrollHeight
    }
})


//------------------------------------------------------------
window.loadLines=loadLines
}
