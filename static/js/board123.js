
canvas.addEventListener('click', (event) => {
    const x = event.clientX
    const y = event.clientY
    console.log(`Координаты на странице: (${x}, ${y})`)
});


export function initBoard(canvas, groupId) {
const ctx = canvas.getContext('2d')
let currentFolderId = localStorage.getItem('currentFolderId')

const socket = io()
socket.emit('join-group', groupId)

socket.on('draw', (data) => {
    ctx.lineTo(data.x, data.y)
    ctx.stroke()
})



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
    const x = e.offsetX
const y = e.offsetY
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
                folderId: currentFolderId,
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
            const groupId = new URLSearchParams(window.location.search).get('groupId')
            const res=await fetch(`/groups/drawing/${groupId}/${folderId}`)
            const data=await res.json()
            lines=[]
            thilines=[]
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (data.lines) {
                lines=data.lines
                draw()
            }
        } catch (e){
            console.log('Error in load lines', e)
        }
    }
if (groupId) {
console.log(1)
} else {
    draw()
}
}
