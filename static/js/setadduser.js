import {initBoard} from './board123.js'

const groupId = new URLSearchParams(window.location.search).get('groupId');

if (groupId) {
    loadFolders(groupId)
}
const canvas = document.getElementById('canvas');

if (canvas) {
    initBoard(canvas, groupId);
}
else {
    console.error('Canvas не найден');
}