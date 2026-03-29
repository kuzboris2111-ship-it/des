        let data=[
]
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
                } else {
                    const parent = map[data[j].parentId]
                    if (parent) {
                        parent.children.push(map[data[j].id])
                    }
        }
            }
            return folders
        }
        // созданеие дерева
        function renderTree(tree){
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
                fol.appendChild(header)

                const childrenContainer = document.createElement('div')
                childrenContainer.style.marginLeft = '20px'
                childrenContainer.style.display = 'none'

            if (folder.children && folder.children.length > 0) {
                const childrenTree = renderTree(folder.children)
                childrenContainer.appendChild(childrenTree)
                fol.appendChild(childrenContainer)
            }
            arrow.addEventListener('click', function() {
            if (childrenContainer.style.display === 'none') {
                childrenContainer.style.display = 'block'
                arrow.textContent = '⋎ '
            } else {
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
    updateParentSelect()
    document.getElementById('myModal').style.display = 'none'
}
    function setupForm() {
    const form = document.getElementById('addForm')
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const name = document.getElementById('folder-name').value
        const parentId = document.getElementById('parent-id').value
        addFolder(name, parentId === 'null' ? null : parentId)
        form.reset()
    })
    }
    // Обновление списка родителей
function updateParentSelect() {
    const select = document.getElementById('parent-id')
    select.innerHTML = '<option value="null">Корень</option>'
    data.forEach(folder => {
        const option = document.createElement('option')
        option.value = folder.id
        option.textContent = folder.name
        select.appendChild(option)
    })
}

// Показать окно
document.getElementById('showModalBtn').onclick = () => {
    document.getElementById('myModal').style.display = 'block'
    updateParentSelect()
}


    setupForm()
    refreshTree()
