document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let penColor = "black";
    const erazorColor = "#fafafa";
    const sizeSlider = document.getElementById('size-slider');
    const erazor = document.querySelector(".erasor");
    const brush = document.querySelector(".brush");
    const colors = document.querySelectorAll(".colors .option");
    let namebox = null;

    sizeSlider.value = 4;
    ctx.lineWidth = sizeSlider.value;

    // Resize the canvas to fill its container
    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color selection event listeners
    colors.forEach(color => {
        color.addEventListener("click", () => {
            erazor.classList.remove("active");
            penColor = color.id;
            colors.forEach(c => c.classList.remove("selected"));
            color.classList.add("selected");
            if (sizeSlider.value < 2) sizeSlider.value = 2;
        });
    });

    // Eraser event listener
    erazor.addEventListener("click", () => {
        brush.classList.remove("active");
        erazor.classList.add("active");
        penColor = erazorColor;
    });

    // Brush event listener
    brush.addEventListener("click", () => {
        brush.classList.add("active");
        erazor.classList.remove("active");
        colors.forEach(color => {
            if (color.classList.contains("selected")) {
                penColor = color.id;
            }
        });
    });

    let isDrawingLocally = false;

    // Drawing functions
    function startPosition(e) {
        isDrawingLocally = true;
        drawing = true;
        socket.emit("down", { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop });
        draw(e);
    }

    function endPosition() {
        drawing = false;
        isDrawingLocally = false;
        socket.emit("my-start-path", "mouseup");
        ctx.beginPath();
    }

    function draw(e) {
        if (!drawing) return;
        if (sizeSlider.value == 0) sizeSlider.value = 1;
        ctx.lineWidth = sizeSlider.value;
        ctx.lineCap = 'round';
        ctx.strokeStyle = penColor;
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        socket.emit("mydraw", { x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop, lWidth: ctx.lineWidth, penColor: penColor });
    }

    // Event listeners for mouse actions
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);

    // Event listeners for touch actions
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
    ['touchstart', 'touchend', 'touchmove'].forEach(event => {
        canvas.addEventListener(event, (e) => {
            if (e.target === canvas) e.preventDefault();
        }, { passive: false });
    });

    // Socket.IO event listeners
    socket.on("other-draw", position => {
        if (!isDrawingLocally) {
            handleRemoteDrawing(position);
        }
    });

    socket.on("ondown", position => {
        if (!isDrawingLocally) {
            handleRemoteStart(position);
        }
    });

    socket.on("other-start-path", () => {
        if (!isDrawingLocally) {
            handleRemoteEnd();
        }
    });

    // Separate functions for handling remote drawing
    function handleRemoteStart(position) {
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
    }

    function handleRemoteDrawing(position) {
        ctx.lineWidth = position.lWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = position.penColor;
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(position.x, position.y);
        showNameBox(position);
    }

    function handleRemoteEnd() {
        ctx.beginPath();
        if (namebox) namebox.remove();
    }

    // Function to show the name box
    function showNameBox(position) {
        if (namebox) namebox.remove();
        const canvasRect = canvas.getBoundingClientRect();
        namebox = document.createElement("div");
        namebox.classList.add("namebox");
        namebox.innerText = position.user;
        namebox.style.height = "24px";
        namebox.style.width = `${(position.user.length * 8) + 20}px`;
        namebox.style.padding = "2px";
        namebox.style.textAlign = "center";
        namebox.style.border = `1px solid ${position.penColor}`;
        namebox.style.color = `${position.penColor}`;
        namebox.style.position = "absolute";
        namebox.style.top = `${canvasRect.top + position.y - 26}px`;
        namebox.style.left = `${canvasRect.left + position.x - 19}px`;

        if (window.matchMedia("(max-width: 1276px)").matches) {
            namebox.style.left = `${canvasRect.left + position.x - 15}px`;
        } else if (window.matchMedia("(max-width: 1225px)").matches) {
            namebox.style.left = `${canvasRect.left + position.x -10 }px`;
        }
        

        document.body.appendChild(namebox);
    }
});
