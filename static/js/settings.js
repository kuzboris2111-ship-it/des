const groupId = new URLSearchParams(window.location.search).get('groupId')
const container = document.getElementById('tree-container')
const urlParams = new URLSearchParams(window.location.search)
const mode = urlParams.get('mode')
localStorage.setItem('currentFolderId', '1')
console.log('folderId =', localStorage.getItem('currentFolderId'))

let menu
let currentFolderId = null


let data=[{id:1, name:"Main Folder", parentId:null} ]
if (groupId) {
    loadFolders(groupId)
} else {
    refreshTree()
}

        //перестройка в дерево
        function buildTree(){
            let map = {}
            for (let i = 0; i < data.length; i++) {
                map[data[i].id] = { ...data[i], children: [] }
            }
            let folders =[]
            for (let j =0; j<data.length; j++){
                if (data[j].parentId === null) {
                    folders.push(map[data[j].id])
                }
                else {
                    const parent = map[data[j].parentId]
                    if (parent) {
                        parent.children.push(map[data[j].id])
                    }
        }
            }
            return folders
        }
if(mode=='settings') {
menu = document.createElement('div')
menu.style.position = 'absolute'
menu.style.backgroundColor = 'white'
menu.style.border = '1px solid #ccc'
menu.style.borderRadius = '4px'
menu.style.padding = '5px'
menu.style.display = 'none'
menu.style.zIndex = '1000'

const addBtn = document.createElement('button')
addBtn.textContent = '➕ Добавить'
addBtn.style.display = 'block'
addBtn.style.width = '100%'
addBtn.style.margin = '2px 0'
addBtn.style.padding = '5px'

const deleteBtn = document.createElement('button')
deleteBtn.textContent = '🗑️ Удалить'
deleteBtn.style.display = 'block'
deleteBtn.style.width = '100%'
deleteBtn.style.margin = '2px 0'
deleteBtn.style.padding = '5px'

const renameBtn = document.createElement('button')
renameBtn.textContent = '✏️ Переименовать'
renameBtn.style.display = 'block'
renameBtn.style.width = '100%'
renameBtn.style.margin = '2px 0'
renameBtn.style.padding = '5px'




menu.appendChild(renameBtn)
menu.appendChild(addBtn)
menu.appendChild(deleteBtn)
document.body.appendChild(menu)

currentFolderId = null


addBtn.onclick = () => {
    document.getElementById('myModal').style.display = 'block'


    }
    const form = document.getElementById('addForm')
    if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const name = document.getElementById('folder-name').value
        const parentId = currentFolderId
        createFolder(groupId, name, parentId === 'null' ? null : parentId)
        document.getElementById('myModal').style.display = 'none'
        form.reset()
    })
    }

deleteBtn.onclick = () => {
    if (currentFolderId) {
        deleteFolder(groupId, currentFolderId)
    }
    menu.style.display = 'none'
}
renameBtn.onclick = () => {
    const newName = prompt('Новое название папки:', currentFolderName)
    if (newName) {
        renameFolder(groupId, currentFolderId, newName)
    }
    menu.style.display = 'none'
}
document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) {
        menu.style.display = 'none'
    }

})}
else{
    menu=document.createElement('div')
    menu.style.display='none'
    document.body.appendChild(menu)
}
        // создание дерева
        function renderTree(tree){
        console.log('renderTree вызван, tree.length:', tree.length)
            const container = document.createElement('div')
            for (let i=0; i<tree.length;i++){
                let folder=tree[i]
                const fol=document.createElement('div')
                fol.style.marginLeft = '20px'
                const header = document.createElement('div')
                const arrow=document.createElement('span')
                arrow.textContent='≻ '
                arrow.style.cursor = 'pointer'
                const nameSpan = document.createElement('span')
                nameSpan.textContent = folder.name

                header.appendChild(arrow)
                header.appendChild(nameSpan)
                header.className = 'folder-header'
                fol.appendChild(header)

                const childrenContainer = document.createElement('div')
                childrenContainer.style.marginLeft = '20px'
                childrenContainer.style.display = 'none'
                fol.appendChild(childrenContainer)
                if (folder.children && folder.children.length > 0) {
                    const childrenTree = renderTree(folder.children)
                    childrenContainer.appendChild(childrenTree)
                }

//================================================================
               header.addEventListener('click', (e)=>{
                    e.stopPropagation()
                    currentFolderId = folder.id
                    currentFolderName = folder.name
                    document.querySelectorAll('.folder-header').forEach(i => {
                        i.style.backgroundColor = ''
                    })
                    header.style.backgroundColor = 'rgba(255,217,102,0.2)'
                    if (mode=='desk') {
                        localStorage.setItem('currentFolderId', currentFolderId)
                        console.log("load:", typeof loadLines)
                    if(typeof clearCanvas==='function'){
                        clearCanvas()
                    } if (typeof loadLines === 'function') {
                        loadLines(currentFolderId)
                    }

                    }
                    else {
                        menu.style.display = 'block'
                        menu.style.left = e.pageX + 'px'
                        menu.style.top = e.pageY + 'px'
                    }
                })
//-----------------------------------------------------------------

                arrow.addEventListener('click', function(e) {
                    e.stopPropagation()
                if (childrenContainer.style.display === 'none') {
                    childrenContainer.style.display = 'block'
                    arrow.textContent = '⋎ '
                }
                else {
                    childrenContainer.style.display = 'none'
                    arrow.textContent = '≻ '
                }
                })

                container.appendChild(fol)
                }

return container
}


    //добавление имени
    function addFolder(name, parentId){
        const newId=String(Date.now())//различные айди
        data.push({ id: newId, name: name, parentId: parentId })
        refreshTree()
    }


    function refreshTree() {
    const container = document.getElementById('tree-container')
    container.innerHTML = ''
    const tree = buildTree()
    container.appendChild(renderTree(tree))
}





async function loadFolders(groupId) {
    const res = await fetch(`/groups/${groupId}/folders`)
    const folders = await res.json()
    if (Array.isArray(folders) && folders.length > 0) {
        data = folders
        const hasRoot = data.some(f => f.parentId === null)
        if (!hasRoot) {
            data.unshift({ id: 1, name: "Main Folder", parentId: null })
        }
    } else {
        data = [{id: 1, name: "Main Folder", parentId: null}]
    }
    refreshTree()
}
async function createFolder(groupId,name, parentId) {
    const res = await fetch('/groups/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, name, parentId })
    })
    const newFolder = await res.json()
    data.push(newFolder)
    refreshTree()
}
async function deleteFolder(groupId,folderId) {
    await fetch('/groups/folder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, folderId })
    })
    loadFolders()
}
async function renameFolder(groupId, folderId, newName) {
    await fetch('/groups/folder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, folderId, name: newName })
    })
    loadFolders()
}

if (groupId) {
    loadFolders(groupId)
}
else {
  refreshTree()
}
const letter=document.getElementById('creator')
if (letter) {
letter.addEventListener('click', ()=>{
if (groupId) {
    window.location.href = "./addUsers.html?groupId=" + groupId +  '&mode=desk'
}
else{
    console.error('groupId не определён')
}
})
}