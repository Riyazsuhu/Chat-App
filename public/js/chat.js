const socket=io()
//element
const $messageForm=document.querySelector('#newMessage')
const $inputForm=$messageForm.querySelector('input')
const $buttonForm=$messageForm.querySelector('button')
const $buttonLocation=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')
//tempalte
const $messageTemplate=document.querySelector('#messageTemplate').innerHTML
const $locationTemplate=document.querySelector('#locationTemplate').innerHTML
const $sidebarTemplate=document.querySelector('#sidebarTemplate').innerHTML
//option
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoScroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild
    //height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    //visible Height
    const visibleHeight=$messages.offsetHeight
    //height of message container
    const containerHeight=$messages.scrollHeight
    //have far i have scrolled?
    const scrollOffset=$messages.scrollTop+visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(locationurl)=>{
    console.log(locationurl)
    const html=Mustache.render($locationTemplate,{
        username:message.username,
        locationurl:locationurl.text,
        createdAt:moment(locationurl.createdAt).format('hh:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $buttonForm.setAttribute('disabled','disabled')
    const newMessage=e.target.elements.message.value
    socket.emit('sendMessage',newMessage,(error)=>{
        $buttonForm.removeAttribute('disabled')
        $inputForm.value=''
        $inputForm.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})
$buttonLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation not supported for your browser')
    }
    $buttonLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        $buttonLocation.removeAttribute('disabled')
        socket.emit('sendLocation',`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,()=>{
            console.log('location shared')
        })
    })
})
