// const socket =io('https://socket-io-server-lilac.vercel.app');
const socket =io('http://localhost:8000/');



let uname;
// const names=prompt("enter your name to join ");
// socket.emit('newuser',names);

const app= document.querySelector(".app");

let messagebox =app.querySelector(".chat-screen  #message-input");

const canvasContainer=document.querySelector(".canvas-container")
let  toolsContainer=document.querySelector(".tools-container");
app.querySelector(".join-screen  #join-user").addEventListener("click" ,()=>{

    let username=app.querySelector(".join-screen  #username").value;
    if(username.length<=0 )
    return;
    if(username.length>=10){
        app.querySelector(".alert").classList.remove("inactive");
        return ;

    }

    socket.emit("newuser",username);
    uname=username;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");

    // canvasContainer.classList.remove("inactive");
    toolsContainer.classList.remove("inactive");



})


app.querySelector(".chat-screen #send-message").addEventListener("click" ,()=>{
    handleSubmit();

})


  messagebox.addEventListener('keydown', function(event) {
    
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

function handleSubmit(){

    let message =app.querySelector(".chat-screen  #message-input").value;
    
    if(message.length==0 )
    return ;

    renderMessage("my",
    {
        username:uname,
        text:message
    })
    socket.emit("send" ,message);
    app.querySelector(".chat-screen #message-input").value="";

}


socket.on("recieve", data =>{
    renderMessage("other",{
        username:data.user,
        text:data.message
    })
})

socket.on("update-joined", data =>{
    renderMessage("update",data)
})

socket.on("update-left", data =>{
    renderMessage("update",data)
})


app.querySelector(".chat-screen #exit-chat").addEventListener("click",()=>{
    console.log("clickes");
    document.getElementById('user-list').classList.toggle("inactive");


    socket.emit('get-users');

})


 function renderMessage(type,obj)
{
    let messageContainer = app.querySelector(".chat-screen .messages")
    if(type=="my")
    {
        let el=document.createElement("div");
        el.setAttribute("class" , "message my-message");
        el.innerHTML=`<div>
        <div class="name">You</div>
        <div class="text">${obj.text}</div>
    </div>`;

    messageContainer.appendChild(el)
    }


    else if(type=="other")
    {
        let el=document.createElement("div");
        el.setAttribute("class" , "message other-message");
        el.innerHTML=`<div>
        <div class="name">${obj.username}</div>
        <div class="text">${obj.text}</div>
    </div>`;

    messageContainer.appendChild(el)
    }


    else if(type=="update")
    {
        let el=document.createElement("div");
        el.setAttribute("class" , "update");
        el.innerText=obj;    

    messageContainer.appendChild(el)
    }


     messageContainer.scrollTop = messageContainer.scrollHeight-messageContainer.clientHeight;
    console.log(type,obj)
}


socket.on('user-list', userList => {
    const userListContainer = document.getElementById('user-list');
    userListContainer.innerHTML = ''; // Clear the previous list
    userList.forEach(user => {

        console.log(user)
        const userItem = document.createElement('div');
        userItem.textContent = user;
        userListContainer.appendChild(userItem);
    });
});






