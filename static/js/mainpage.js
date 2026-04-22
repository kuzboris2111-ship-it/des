const userId = localStorage.getItem('userId')
if (userId) {
    fetch(`/auth/groups?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('groups-list')
            if (container){
                container.innerHTML=''
                data.groups.forEach(group =>{
                    const div = document.createElement('div')
                    div.className = 'group-card'
                    div.innerHTML = `
                        <button onclick="location.href='/static/aflr1/aflr2/addUsers.html?groupId=${group._id}&mode=desk' ", class="button-link01">${group.groupname}</button>`
                    container.appendChild(div)
                })
            }
        })
        .catch(err => console.error('Ошибка загрузки групп:', err))
}
else{
    console.log('userId не найден в localStorage')
}
