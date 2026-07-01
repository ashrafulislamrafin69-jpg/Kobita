const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<120;i++){
particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3+1,
speed:Math.random()*1.5+0.5
});
}

function animate(){
ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{
ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fillStyle="#00e5ff";
ctx.fill();

p.y-=p.speed;

if(p.y<0){
p.y=canvas.height;
p.x=Math.random()*canvas.width;
}
});

requestAnimationFrame(animate);
}

animate();

document.getElementById("enterBtn").addEventListener("click",()=>{
document.body.style.transition="1s";
document.body.style.transform="scale(1.2)";
document.body.style.opacity="0";

setTimeout(()=>{
alert("🎵 Welcome to KOBITA Premium Experience");
},1000);
});

window.addEventListener("resize",()=>{
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
});
