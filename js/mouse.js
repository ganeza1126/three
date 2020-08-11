document.addEventListener('mousemove', function(e) {
  let body = document.querySelector('#bg');
  let circle = document.createElement('span');
  let x = e.offsetX;
  let y = e.offsetY;
  circle.style.left = x + "px";
  circle.style.top = y + "px";
  let size = Math.random() * 100;
  circle.style.width = 15 + size + "px";
  circle.style.height = 15 + size + "px";
  body.appendChild(circle);
  setTimeout(function() {
    circle.remove();
  }, 1800);
});