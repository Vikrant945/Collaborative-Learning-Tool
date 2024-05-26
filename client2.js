document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let penColor="black";

    let erazorColor="#fafafa";
    const sizeSlider = document.getElementById('size-slider');
    let erazor= document.querySelector(".erasor");
    let brush = document.querySelector(".brush");

   
    sizeSlider.value=4;
  



    let colors=document.querySelectorAll(".colors .option")
   

    for( let color of colors){

       
       
        color.addEventListener("click",()=>{
            erazor.classList.remove("active");
            penColor=`${color.id}`;
            for( let color of colors)
            {
                if(color.classList.contains("selected"))
                 {
                 color.classList.remove("selected")
                  }
                
            }
            color.classList.add("selected")


            if(sizeSlider.value < 2 )
            {
                sizeSlider.value =2;
        
            }

        })

    


    }



    erazor.addEventListener("click",()=>{
        // console.log("clicked erazor");
        brush.classList.remove("active");

        erazor.classList.add("active");
        penColor=erazorColor;

    })

    brush.addEventListener("click",()=>{
        brush.classList.add("active");

        erazor.classList.remove("active");
        for(let color  of colors)
        {
            if(color.classList.contains("selected"))
            {
                penColor=`${color.id}`;
            
             }

        }

    })


   
    ctx.lineWidth = sizeSlider.value;

    // Resize the canvas to fill its container
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    function startPosition(e) {
   socket.emit("down", {x:e.clientX - canvas.offsetLeft ,y:e.clientY - canvas.offsetTop})
        
        drawing = true;
        draw(e);
    }

    function endPosition() {

        socket.emit("my-start-path","mouseup");
        drawing = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;

        ctx.lineWidth = sizeSlider.value; // You can adjust the stroke width here
        ctx.lineCap = 'round';
        ctx.strokeStyle = penColor; // You can change the color here

        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

        socket.emit("mydraw" ,{x:e.clientX - canvas.offsetLeft ,y:e.clientY - canvas.offsetTop, lWidth:ctx.lineWidth ,penColor:penColor});


    }

    // Event listeners for mouse actions
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);

    // Event listeners for touch actions (for mobile devices)
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', () => {
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    // Prevent scrolling when touching the canvas
    canvas.addEventListener('touchstart', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });



    let namebox = null;

    // Get the canvas position relative to the document
const canvasRect = canvas.getBoundingClientRect();


//if someone else draws
    socket.on("other-draw", position =>{

        ctx.lineWidth = position.lWidth; // You can adjust the stroke width here
        ctx.lineCap = 'round';
        ctx.strokeStyle = position.penColor; // You can change the color here

        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);


      


        // Remove the previous namebox if it exists
    if (namebox) {
        namebox.remove();
    }
        
    let hiname=position.user;
    const textWidth = hiname.length * 8;
    const boxWidth = textWidth+20;


        namebox = document.createElement("div");
        namebox.classList.add("namebox");
        namebox.innerText=hiname;
        namebox.style.height="24px";
        namebox.style.width=`${boxWidth}px`;
        namebox.style.padding="2px";
        namebox.style.textAlign="center";
        namebox.style.border=`1px solid ${position.penColor}`;
        namebox.style.color=`${position.penColor}`;


// Set absolute positioning
    namebox.style.position = "absolute";
    namebox.style.left = `${canvasRect.left + position.x +160}px`;
    namebox.style.top = `${canvasRect.top + position.y +45}px`;

    

  

    // Append the namebox to a container or the body
    document.body.appendChild(namebox);

        
    })



    socket.on("ondown", position =>{
        ctx.moveTo(position.x, position.y);
        
    })

    socket.on("other-start-path", message=>{
        namebox.remove();

        ctx.beginPath();
        
    })



    // let remoteDrawingTimeout;



});
