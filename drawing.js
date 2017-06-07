document.body.onload = function() {
    var mouse = {x: 0, y: 0};
    var start_mouse = {x: 0, y: 0};
    var last_mouse = {x: 0, y: 0};
    var sprayIntervalID, tmp_canvas, tmp_ctx, canvas, ctx, controls;

    var density = 5;
    var lineWidth = 15;
    var sprayRadius = 10;
    var flowRate = 50;

    function addCanvas() {
        canvas = createCanvas();
        canvas.style.zIndex = 999;
        ctx = canvas.getContext("2d");
        document.body.insertBefore(canvas, document.body.firstChild);
        canvas.addEventListener("mouseup", function(){
            last_mouse = {x: 0, y: 0};
        });
    }

    function addTempCanvas() {
        tmp_canvas = createCanvas();
        tmp_ctx = tmp_canvas.getContext("2d");
        tmp_canvas.id = "tmp_canvas";
        document.body.insertBefore(tmp_canvas, document.body.firstChild);

        tmp_canvas.addEventListener('mousemove', function(e) {
            mouse = getMouseLocation(e);
        }, false);

        tmp_ctx.lineWidth = lineWidth;
        tmp_ctx.lineJoin = 'round';
        tmp_ctx.lineCap = 'round';

        tmp_canvas.addEventListener('mousedown', function(e) {
            tmp_canvas.addEventListener('mousemove', generateSprayParticles, false);

            mouse = getMouseLocation(e);

            start_mouse.x = mouse.x;
            start_mouse.y = mouse.y;

            sprayIntervalID = setInterval(generateSprayParticles, 100 - flowRate);
        }, false);

        tmp_canvas.addEventListener('mouseup', function() {
            tmp_canvas.removeEventListener('mousemove', generateSprayParticles, false);
            ctx.drawImage(tmp_canvas, 0, 0);
            tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
            clearInterval(sprayIntervalID);
        }, false);
    }

    function createCanvas() {
        var canvas = document.createElement("canvas");
        canvas.width= document.body.scrollWidth;
        canvas.height= document.body.scrollHeight;
        return canvas;
    }

    function addCanvasDebugger(canvas) {
        ctx.fillStyle = "red";
        ctx.globalAlpha = "0.2";
        ctx.rect(0,0,canvas.width, canvas.height);
        ctx.fill();
    }

    function addControls() {
        var table = document.createElement("table");
        controls = table;
        var row = document.createElement("tr");
        table.appendChild(row);

        var colors = ["black", "silver", "white", "maroon", "red", "purple", "fuchsia", "green", "lime", "yellow", "orange", "blue", "aqua"];
        for (var i = 0; i < colors.length; i++) {
            var data = document.createElement("td");
            data.style.backgroundColor = colors[i];
            data.addEventListener("click", changeToColor(colors[i]));
            row.appendChild(data);
        }

        var buttonActions = {
            "Flow": sliderDidChange("flow"),
            "Alpha": sliderDidChange("alpha"),
            "Size": sliderDidChange("size"),
            "Clear": clearCanvas,
            "Disable": disable
        };

        for (var title in buttonActions) {
            if (title == "Clear" || title == "Disable") {
                var button = document.createElement("button");
                button.innerHTML = title;
                button.onclick = buttonActions[title];
                row.appendChild(button);
                button.id = title.toLowerCase();
                button.addEventListener("mousedown",function(){this.style.backgroundColor = "gainsboro";});
                button.addEventListener("mouseup", function(){this.style.backgroundColor = "gray";})

            } else {
                var container = document.createElement("div");
                container.classList.add("graff-slider-container");

                var label = document.createElement("label");
                label.innerHTML = title + ":";
                label.classList.add("graff-label");

                var slider = document.createElement("input");
                slider.classList.add("graff-slider");
                slider.type = "range";
                slider.min = 1;
                slider.max = 100;
                slider.addEventListener('input', buttonActions[title]);
                container.appendChild(label);
                container.appendChild(slider);
                row.appendChild(container);
            }
        }

        document.body.insertBefore(table, document.body.firstChild);
    }

    function sliderDidChange(property) {
        var action;
        if (property === "flow") {
            action = function(self) {
                flowRate = self.value;
                density = self.value / 10
            };
        } else if (property === "alpha") {
            action = function(self) {tmp_ctx.globalAlpha = self.value / 100;}
        } else if (property === "size") {
            action = function(self) {sprayRadius = self.value}
        }
        return function() {
            action(this);
            this.style.backgroundImage = '-webkit-gradient(linear, left top, right top, '
                + 'color-stop(' + (this.value / 100) + ', cyan), '
                + 'color-stop(' + (this.value / 100) + ', #C5C5C5))';
        }
    }

    function changeToColor(color) {
        return function() {
            tmp_ctx.strokeStyle = color;
            tmp_ctx.fillStyle = color;
        }
    }

    function getMouseLocation(event) {
        var canvas = document.getElementsByTagName('canvas')[0];
        var rect = canvas.getBoundingClientRect();
        return {"x": event.clientX - rect.left, "y": event.clientY - rect.top};
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function disable() {
        canvas.remove();
        tmp_canvas.remove();
        var button = document.getElementById("disable");
        button.style.backgroundColor = "red";
        button.innerHTML = "Enable";
        button.onclick = enable;
    }

    function enable() {
        addCanvas();
        addTempCanvas();
        var button = document.getElementById("disable");
        button.innerHTML = "Disable";
        button.style.backgroundColor = "gray";
        button.onclick = disable;
    }

    var getRandomOffset = function(radius) {
        var random_angle = Math.random() * (2*Math.PI);
        var random_radius = Math.random() * radius;
        return {
            x: Math.cos(random_angle) * random_radius,
            y: Math.sin(random_angle) * random_radius
        };
    };

    var generateSprayParticles = function() {
        var _density = density * sprayRadius;
        for (var i = 0; i < _density; i++) {
            var offset = getRandomOffset(sprayRadius);

            var x = mouse.x + offset.x;
            var y = mouse.y + offset.y;

            tmp_ctx.fillRect(x, y, 1, 1);
        }
    };

    addCanvas();
    addTempCanvas();
    addControls();
};