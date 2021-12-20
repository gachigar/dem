audioCtx = new AudioContext();
destination = audioCtx.destination;
analyserRaw = audioCtx.createAnalyser();
source = audioCtx.createMediaElementSource(player);
source.connect(analyserRaw);
analyserRaw.connect(destination);

analyserFreq = audioCtx.createAnalyser();
source.connect(analyserFreq);

analyserRaw.fftSize = 2048;
analyserFreq.fftSize = 2048;
analyserFreq.smoothingTimeConstant = 0.84;
/*analyserFreq.maxDecibels = 0;
analyserFreq.minDecibels = -100;*/

var pl1 = document.getElementById("player");
pl1.volume = 0.5;

var canvas = document.getElementById("render"),
    ctx = canvas.getContext("2d");
canvas.setAttribute('width', window.innerWidth);
canvas.setAttribute('height', window.innerHeight);
count = 1024;
var dataRaw = new Float32Array(count);
var dataFreq = new Uint8Array(count);

function vol(freqd, start, end) {
    var s = 0;
    for (var i = start; i < end + 1; i++) {
        s = s + freqd[i];
    }
    return s / (end - start);
}

ctx.lineWidth = 1;
ctx.strokeStyle = "#e2375f";
var t = 0;
ctx.fillStyle = "rgba(126,222,226,0.9)";

var partcount = 64,
    x = [partcount], y = [partcount], vx = [partcount], vy = [partcount], vr = [partcount];

var FK = 0.04, xf = 0;

for (var i = 0; i < partcount; i++) {
    x[i] = Math.random() * window.innerWidth;
    y[i] = Math.random() * window.innerHeight;
    vr[i] = 1 + Math.random() / 3;
    vx[i] = Math.random() / 4 - 0.125;
    vy[i] = Math.random() / 4 - 0.125;
    //x[i] = 100 + i * 20;
    //y[i] = window.innerHeight / 2;
}

setInterval(function () {
    t++;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    analyserRaw.getFloatTimeDomainData(dataRaw);
    analyserFreq.getByteFrequencyData(dataFreq);

    for (var i = 0; i < partcount; i++) {
        x[i]+=vx[i];
        y[i]+=vy[i];
    }

    for (var i = 0; i < partcount/4; i++) {
        ctx.fillStyle = "rgba(126,222,226," + (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5),2)*20/240) + ")";
        ctx.beginPath();
        ctx.arc(x[i], y[i], vr[i] /*vol(dataFreq, i * 32, (i + 1) * 32)*/, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
    for (var i = partcount/4; i < partcount/2; i++) {
        ctx.fillStyle = "rgba(126,222,226," + ((vol(dataFreq, 128, 256) / 2)/50) + ")";
        ctx.beginPath();
        ctx.arc(x[i], y[i], vr[i] /*vol(dataFreq, i * 32, (i + 1) * 32)*/, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
    for (var i = partcount/2; i < partcount; i++) {
        ctx.fillStyle = "rgba(126,222,226," + (vol(dataFreq, i * 8, (i + 1) * 8)/50) + ")";
        //console.log(vol(dataFreq, i * 8, (i + 1) * 8)/50);
        ctx.beginPath();
        ctx.arc(x[i], y[i], vr[i] /*vol(dataFreq, i * 32, (i + 1) * 32)*/, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }

    ctx.beginPath();
    ctx.lineTo(1, window.innerHeight / 2 - (vol(dataFreq, 10, 24) * Math.sin(0 / 40 + t / 50) * 4 - vol(dataFreq, 17, 64) * vol(dataFreq, 17, 64) * Math.sin(0 / 8 - t / 12) * 0.02 - vol(dataFreq, 54, 511) * Math.sin(0 / 4 - t / 5) * 4) / 10);
    //ctx.lineTo(0, window.innerHeight/2 - (vol(data, 0, 16)*Math.sin(0/40 + t/50) * 4 - vol(data, 17, 64)*vol(data, 17, 64)*Math.sin(0/5 - t/12) * 0.02 - vol(data, 54, 511)*Math.sin(0/0.5 - t/5) * 8) / 10);
    for (var i = 1; i < window.innerWidth; i++) {
        //ctx.lineTo(i * 2, window.innerHeight/2 - (vol(data, 0, 16)*Math.sin(i/40 + t/50) * 4 - vol(data, 17, 64)*vol(data, 17, 64)*Math.sin(i/5 - t/12) * 0.02 - vol(data, 54, 511)*Math.sin(i/0.5 - t/5) * 8) / 10);
        ctx.lineTo(i * 2, window.innerHeight / 2 - (vol(dataFreq, 10, 24) * Math.sin(i / 40 + t / 50) * 4 - vol(dataFreq, 17, 64) * vol(dataFreq, 17, 64) * Math.sin(i / 8 - t / 12) * 0.02 - vol(dataFreq, 54, 511) * Math.sin(i / 4 - t / 5) * 4) / 10);
    }
    //ctx.closePath();
    ctx.stroke();

    xf = (1-FK)*xf + FK*vol(dataFreq, 3, 5);
    ctx.beginPath();
    ctx.lineTo(1, window.innerHeight / 2 - (vol(dataFreq, 10, 24) * Math.sin(0 / 40 + t / 50) * 4 - vol(dataFreq, 17, 64) * vol(dataFreq, 17, 64) * Math.sin(0 / 8 - t / 12) * 0.02 - vol(dataFreq, 54, 511) * Math.sin(0 / 4 - t / 5) * 4) / 10);
    //ctx.lineTo(0, window.innerHeight/2 - (vol(data, 0, 16)*Math.sin(0/40 + t/50) * 4 - vol(data, 17, 64)*vol(data, 17, 64)*Math.sin(0/5 - t/12) * 0.02 - vol(data, 54, 511)*Math.sin(0/0.5 - t/5) * 8) / 10);
    for (var i = 1; i < window.innerWidth; i++) {
        //ctx.lineTo(i * 2, window.innerHeight/2 - (vol(data, 0, 16)*Math.sin(i/40 + t/50) * 4 - vol(data, 17, 64)*vol(data, 17, 64)*Math.sin(i/5 - t/12) * 0.02 - vol(data, 54, 511)*Math.sin(i/0.5 - t/5) * 8) / 10);
        ctx.lineTo(i * 2, window.innerHeight / 2 - ((xf - 230) * Math.sin(i / 30 - t / 20) * 4) / 10);
    }
    //ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(1, window.innerHeight / 2 - (vol(dataFreq, 10, 24) * Math.sin(0 / 40 + t / 50) * 4 - vol(dataFreq, 17, 64) * vol(dataFreq, 17, 64) * Math.sin(0 / 8 - t / 12) * 0.02 - vol(dataFreq, 54, 511) * Math.sin(0 / 4 - t / 5) * 4) / 10);
    //ctx.lineTo(0, window.innerHeight/2 - (vol(data, 0, 16)*Math.sin(0/40 + t/50) * 4 - vol(data, 17, 64)*vol(data, 17, 64)*Math.sin(0/5 - t/12) * 0.02 - vol(data, 54, 511)*Math.sin(0/0.5 - t/5) * 8) / 10);
    for (var i = 1; i < window.innerWidth; i++) {
        ctx.lineTo(i * 2, window.innerHeight / 2 - dataRaw[i] * 50)
    }
    //ctx.closePath();
    ctx.stroke();
}, 16);