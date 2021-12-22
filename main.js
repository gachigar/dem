let canvas = document.getElementById('canvas');

const maxValue = 2048;

var audioCtx;
var destination;
var analyserRaw;
var source;
var gainNode;

var analyserFreq;

/*analyserFreq.maxDecibels = 0;
 analyserFreq.minDecibels = -100;*/

fp = false;

var pl1 = document.getElementById("player");
pl1.volume = 0.5;

var pl2 = document.getElementById("player2");
pl2.volume = 1;

document.addEventListener('click', function (e) {
    pl1.volume = 0.5;
    pl2.volume = 0.5;

    if (pl1.paused) {
        if (!fp) {
            audioCtx = new AudioContext();
            destination = audioCtx.destination;
            analyserRaw = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(player);
            gainNode = audioCtx.createGain();
            gainNode.gain.value = 0;

            source.connect(analyserRaw);
            source.connect(gainNode);
            gainNode.connect(destination);

            analyserFreq = audioCtx.createAnalyser();
            source.connect(analyserFreq);

            analyserRaw.fftSize = 2048;
            analyserFreq.fftSize = 2048;
            analyserFreq.smoothingTimeConstant = 0.7;
        }
        /*analyserFreq.maxDecibels = 0;
         analyserFreq.minDecibels = -100;*/

        pl1.play();
        setTimeout(() => pl2.play(), 10);
    } else {
        setTimeout(() => pl2.pause(), 10);
        pl1.pause();
        fp = true;
    }
})

//pl2.addEventListener('seeked', function (e) {
//    console.log("SEEK");
//})

count = 2048;
var dataRaw = new Float32Array(count);
var dataFreq = new Uint8Array(1024);
var t = 0;

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    var allText;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
                //alert(allText);
            }
        }
    }
    rawFile.send(null);
    return allText;
}

function vol(freqd, start, end) {
    var s = 0;
    for (var i = start; i < end + 1; i++) {
        s = s + freqd[i];
    }
    return s / (end - start);
}

//ctx.strokeStyle = "#e2375f";      ULTRAColor

var partcount = 32,
    x = [partcount], y = [partcount], vx = [partcount], vy = [partcount], vr = [partcount];

var FK = 0.2, xf = [];

var part = [], geo = [], mat = [];

for (var i = 0; i < maxValue * 2; i++) {
    xf[i] = 0;
}

var particles = [];
var kRotation = [];
var geometry, material1, material2, texture1, texture2;

var camera, scene, renderer, composer, copyPass, taaRenderPass, shaderPass, renderPass, bloomPass;
var gui, texture;
var gui_params = {
    //TAAEnabled: "1",
    //TAASampleLevel: 0,
    rotation_speed: 0.015,
    direction_speed: 0.5,
    opacity: 0.03,
    amount: 300,
    color: 0x93b5c0
};
var width = window.innerWidth,
    height = window.innerHeight;
i
var textar = [];
var begar = [];
var endar = [];
pos = 0;
last_ypos = 0;
last_xpos = 0;
last_len = 0;
last_end = 0;

function textIt(start, end, word) {
    var textnode = document.createElement("div");
    textnode.innerHTML = word;
    //textnode.id = start;
    textnode.classList.add("text-tr");
    if (start - 25 < last_end) {
        last_xpos = last_xpos + 1 + last_len * 2.5;
    } else {
        last_xpos = (Math.random() * 3 + 8);
        last_ypos = (Math.random() * 20 + 16);
    }
    if (last_xpos > 28) {
        last_xpos = (Math.random() * 3 + 8);
        last_ypos = last_ypos + 10;
    }
    if (last_ypos > 80) {
        last_ypos = (Math.random() * 20 + 16);
        last_xpos = (Math.random() * 3 + 8);
    }
    textnode.style.top = last_ypos.toString() + "vh";
    textnode.style.left = (last_xpos + 3).toString() + "vw";
    document.getElementById("text-disp").appendChild(textnode);

    setTimeout(() => textnode.style.color = "rgba(255, 255, 255, 1)", 1);
    last_len = word.length;
    last_end = end;
    setTimeout(() => textnode.classList.add("text-hide"), end - start + 20);
}

init();

var geometryUF = new THREE.CircleGeometry(12, 64);
//let textureCE = new THREE.TextureLoader().load("CRTLOGCB2.svg");
var materialUF = new THREE.MeshBasicMaterial({ color: 0xffffff });
var circleUF = new THREE.Mesh(geometryUF, materialUF);
scene.add(circleUF);

var geometryF = new THREE.CircleGeometry(10.5, 64);
//let textureCE = new THREE.TextureLoader().load("CRTLOGCB2.svg");
var materialF = new THREE.MeshBasicMaterial({ color: 0x091C3D, transparent: true });
var circleF = new THREE.Mesh(geometryF, materialF);
scene.add(circleF);

var geometryCE = new THREE.CircleGeometry(10, 32);
var textureCE = new THREE.TextureLoader().load("CRTLOGCBBIG.svg");
//const materialCE = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
var matCE = new THREE.MeshBasicMaterial({
    color: "#7edee2",
    map: textureCE,
    transparent: true
});
matCE.opacity = 0.1;
var circleCE = new THREE.Mesh(geometryCE, matCE);
scene.add(circleCE);

animate();
function init() {
    txt = readTextFile("textKostylCuttedPrepared.xml");
    //console.log(txt)
    var lines = txt.split('\n');
    for (var i = 0; i < lines.length; i++) {
        lw = lines[i].indexOf('>') + 1;
        rw = lines[i].indexOf('<', 2);
        console.log(lines[i].substring(lw, rw));
        textar.push(lines[i].substring(lw, rw));

        lalb = lines[i].indexOf('begin="') + 7;
        ralb = lines[i].indexOf('"', lalb + 1);
        console.log(lines[i].substring(lalb, ralb));
        begar.push(parseInt(lines[i].substring(lalb, ralb)));

        lale = lines[i].indexOf('end="') + 5;
        rale = lines[i].indexOf('"', lale + 1);
        console.log(lines[i].substring(lale, rale));
        endar.push(parseInt(lines[i].substring(lale, rale)));
    }

    if (gui) gui.destroy();
    gui = new dat.GUI();
    /*gui.add(gui_params, 'TAAEnabled', {
     'Disabled': '0',
     'Enabled': '1'
     }).onFinishChange(function () {
     if (taaRenderPass) {
     taaRenderPass.enabled = ( gui_params.TAAEnabled === "1" );
     renderPass.enabled = ( gui_params.TAAEnabled !== "1" );
     }
     });
     gui.add(gui_params, 'TAASampleLevel', {
     'Level 0: 1 Sample': 0,
     'Level 1: 2 Samples': 1,
     'Level 2: 4 Samples': 2,
     'Level 3: 8 Samples': 3,
     'Level 4: 16 Samples': 4,
     'Level 5: 32 Samples': 5
     }).onFinishChange(function () {
     if (taaRenderPass) {
     taaRenderPass.sampleLevel = gui_params.TAASampleLevel;
     }
     });*/
    gui.add(gui_params, "rotation_speed", 0.0001, 0.1);
    gui.add(gui_params, "direction_speed", 0.01, 1);
    gui.add(gui_params, "opacity", 0.0, 1.0);
    var amount_controller = gui.add(gui_params, "amount", 10, 1000);
    gui.addColor(gui_params, "color");
    gui.open();

    (function () {
        let script = document.createElement('script');
        script.src = '//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
        script.onload = function () {
            let stats = new Stats();
            document.body.appendChild(stats.dom);
            requestAnimationFrame(function loop() {
                stats.update();
                requestAnimationFrame(loop)
            });
        };

        document.head.appendChild(script);
    })();
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x151c24);
    geometry = new THREE.PlaneBufferGeometry(400, 300);
    texture1 = new THREE.TextureLoader().load("smoke1.png");
    texture2 = new THREE.TextureLoader().load("smoke2.png");

    material1 = new THREE.MeshLambertMaterial({
        color: gui_params.color,
        map: texture1,
        transparent: true,
        opacity: gui_params.opacity
    });

    material2 = new THREE.MeshLambertMaterial({
        color: gui_params.color,
        map: texture2,
        transparent: true,
        opacity: gui_params.opacity
    });
    //
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
    camera.position.z = 1000;
    scene = new THREE.Scene();
    amount_controller.onFinishChange(300);
    // postprocessing

    function initPart() {
        {
            for (let i = 0, len = particles.length; i < len; i++) {
                scene.remove(particles[i]);
            }
            scene = new THREE.Scene();
            let light = new THREE.AmbientLight(0xffffff, 0.9);
            scene.add(light);
            /*for (let i = 0; i < 10; i++) {
             let lightPoint = new THREE.PointLight(0xff4455, 8, 300);
             let z = Math.random() * 1000 - 100;
             let y = Math.random() * (z - 500) / 10;
             let x = Math.random() * 2 * width - 250;
             lightPoint.position.set(x, y, z);
             scene.add(lightPoint);
             }*/


            let textureParticle = new THREE.TextureLoader().load("particle.png");

            for (let i = 0; i < partcount; i++) {
                let lightPoint;
                geo[i] = new THREE.CircleBufferGeometry(30, 32);
                if (i < partcount / 4) {
                    mat[i] = new THREE.MeshBasicMaterial({
                        color: "#7edee2",
                        map: textureParticle,
                        transparent: true
                    });
                    lightPoint = new THREE.PointLight(0x7edee2, (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240) * 30, 240, 2);
                }
                if (i >= partcount / 4 && i < partcount / 2) {
                    mat[i] = new THREE.MeshBasicMaterial({
                        color: "#e2375f",
                        map: textureParticle,
                        transparent: true
                    });
                    lightPoint = new THREE.PointLight(0xe2375f, (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240) * 30, 240, 2);
                }
                if (i >= partcount / 2) {
                    mat[i] = new THREE.MeshBasicMaterial({
                        color: "#af34e2",
                        map: textureParticle,
                        transparent: true
                    });
                    lightPoint = new THREE.PointLight(0xaf34e2, (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240) * 30, 240, 2);
                }
                part[i] = new THREE.Mesh(geo[i], mat[i]);
                scene.add(part[i]);
                part[i].position.z = Math.random() * 800;
                part[i].material.opacity = 0.0;
                part[i].position.x = (Math.random() * 18 - 9) * part[i].position.z / -5;
                part[i].position.y = (Math.random() * 9 - 4.5) * part[i].position.z / -5;

                let position = new THREE.Vector3();
                position.setFromMatrixPosition(part[i].matrixWorld);
                lightPoint.position.set(position.x, position.y, position.z + 2);
                lightPoint.name = i;
                scene.add(lightPoint);
            }
            particles = [];
            for (let i = 0, len = gui_params.amount; i < len; i++) {
                var particle;
                if (i % 2 == 0) {
                    particle = new THREE.Mesh(geometry, material1);
                } else {
                    particle = new THREE.Mesh(geometry, material2);
                }


                let z = Math.random() * 1000 - 100;
                let y = Math.random() * (z - 500) / 10;
                let x = Math.random() * 2 * width - 250;
                kRotation[i] = Math.random() - 0.5;
                particle.position.set(x, y, z);
                particle.rotation.z = Math.random() * Math.PI * 2;
                scene.add(particle);
                let d = (Math.random() * (0.3 + 0.3) - 0.3);
                d.toFixed(2);
                particles.push({ mesh: particle, self_direction: d });
                /*composer = new THREE.EffectComposer(renderer);
                 shaderPass = new THREE.ShaderPass(THREE.FXAAShader);
                 shaderPass.uniforms['resolution'].value.set(1 / width, 1 / height);
                 shaderPass.renderToScreen = false;
    
                 taaRenderPass = new THREE.TAARenderPass(scene, camera);
                 taaRenderPass.unbiased = false;
                 composer.addPass(taaRenderPass);
                 renderPass = new THREE.RenderPass(scene, camera);
                 composer.addPass(shaderPass);
                 taaRenderPass.enabled = false;
                 renderPass.enabled = true;
                 composer.addPass(renderPass);
                 copyPass = new THREE.ShaderPass(THREE.CopyShader);
                 copyPass.renderToScreen = true;
                 composer.addPass(copyPass);
                 taaRenderPass.accumulate = false;*/

            }
            renderPass = new THREE.RenderPass(scene, camera);
            //shaderPass = new THREE.ShaderPass(THREE.FXAAShader);
            //shaderPass.uniforms['resolution'].value.set(1 / width, 1 / height);
            //shaderPass.renderToScreen = false;
            //copyPass = new THREE.ShaderPass(THREE.CopyShader);
            bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.46); //1.0, 9, 0.5, 512););
            bloomPass.renderToScreen = true;
            //copyPass.renderToScreen = true;
            composer = new THREE.EffectComposer(renderer);
            composer.addPass(renderPass);
            //composer.addPass(shaderPass);
            composer.addPass(bloomPass);
        }

    }
    amount_controller.onFinishChange((value) => initPart());
    initPart();
}

function animate() {
    requestAnimationFrame(animate);
    let length = particles.length;
    while (length--) {
        particles[length].mesh.rotation.z += gui_params.rotation_speed * kRotation[length];
        material1.opacity = gui_params.opacity;
        material1.color = new THREE.Color(gui_params.color);
        material2.opacity = gui_params.opacity;
        material2.color = new THREE.Color(gui_params.color);
        particles[length].mesh.position.x -= gui_params.direction_speed;

        if (particles[length].mesh.position.x < -width) {
            particles[length].mesh.position.set(width, Math.random() * 500 - 250,
                Math.random() * 1000 - 100);
        }
    }
    if (!pl1.paused) {
        analyserRaw.getFloatTimeDomainData(dataRaw);
        analyserFreq.getByteFrequencyData(dataFreq);
        /*for (let i = 0; i < Math.floor(partcount / 4); i++) {
         scene.remove(scene.getObjectByName(i));
         part[i].material.opacity = (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240);
         let position = new THREE.Vector3();
         position.setFromMatrixPosition(part[i].matrixWorld);
         let lightPoint = new THREE.PointLight(0x7edee2, (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240) * 30, 240, 2);
         lightPoint.position.set(position.x, position.y, position.z + 2);
         lightPoint.name = i;
         scene.add(lightPoint);
         }
         for (let i = Math.floor(partcount / 4); i < Math.floor(partcount / 2); i++) {
         scene.remove(scene.getObjectByName(i));
         part[i].material.opacity = (vol(dataFreq, 128, 256) / 2) / 50;
         let position = new THREE.Vector3();
         position.setFromMatrixPosition(part[i].matrixWorld);
         let lightPoint = new THREE.PointLight(0xe2375f, (vol(dataFreq, 128, 256) / 2) / 50 * 30, 240, 2);
         lightPoint.position.set(position.x, position.y, position.z + 2);
         lightPoint.name = i;
         scene.add(lightPoint);
         }
         for (let i = Math.floor(partcount / 2); i < partcount; i++) {
         scene.remove(scene.getObjectByName(i));
         part[i].material.opacity = vol(dataFreq, i * 8, (i + 1) * 8) / 50;
         let position = new THREE.Vector3();
         position.setFromMatrixPosition(part[i].matrixWorld);
         let lightPoint = new THREE.PointLight(0xaf34e2, vol(dataFreq, i * 8, (i + 1) * 8) / 50 * 30, 240, 2);
         lightPoint.position.set(position.x, position.y, position.z + 2);
         lightPoint.name = i;
         scene.add(lightPoint);
         }*/

        //!for (let i = 0; i < Math.floor(partcount / 4); i++) {
        //!    part[i].material.opacity = (Math.pow((vol(dataFreq, 1, 8) / 20), 2) * 20 / 240);
        //!    let position = new THREE.Vector3();
        //!    position.setFromMatrixPosition(part[i].matrixWorld);
        //!    let lightPoint = scene.getObjectByName(i);
        //!    lightPoint.position.set(position.x, position.y, position.z + 2);
        //!    lightPoint.intensity = (Math.pow((vol(dataFreq, 1, 8) / 20), 2) * 20 / 240) * 30;
        //!}
        //!for (let i = Math.floor(partcount / 4); i < Math.floor(partcount / 2); i++) {
        //!    part[i].material.opacity = (vol(dataFreq, 128, 256) / 2) / 50;
        //!    let position = new THREE.Vector3();
        //!    position.setFromMatrixPosition(part[i].matrixWorld);
        //!    let lightPoint = scene.getObjectByName(i);
        //!    lightPoint.position.set(position.x, position.y, position.z + 2);
        //!    lightPoint.intensity = (vol(dataFreq, 128, 256) / 2) / 50 * 30;
        //!}
        //!for (let i = Math.floor(partcount / 2); i < partcount; i++) {
        //!    part[i].material.opacity = vol(dataFreq, i * 8, (i + 1) * 8) / 50;
        //!    let position = new THREE.Vector3();
        //!    position.setFromMatrixPosition(part[i].matrixWorld);
        //!    let lightPoint = scene.getObjectByName(i);
        //!    lightPoint.position.set(position.x, position.y, position.z + 2);
        //!    lightPoint.intensity = vol(dataFreq, i * 8, (i + 1) * 8) / 50 * 30;
        //!}
        circleUF.scale.x = 1 + 0 * vol(dataFreq, 128, 256) / 1500 + vol(dataFreq, 1, 8) / 1000;; // SCALE
        circleUF.scale.y = 1 + 0 * vol(dataFreq, 128, 256) / 1500 + vol(dataFreq, 1, 8) / 1000;; // SCALE
        circleUF.scale.z = 1 + 0 * vol(dataFreq, 128, 256) / 1500 + vol(dataFreq, 1, 8) / 1000;; // SCALE
        circleUF.material.transparent = true;
        circleUF.material.opacity = 0.31 + vol(dataFreq, 128, 256) / 900;


        circleF.scale.x = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleF.scale.y = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleF.scale.z = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleF.material.transparent = true;


        circleCE.scale.x = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleCE.scale.y = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleCE.scale.z = 1 + vol(dataFreq, 1, 8) / 1000; // SCALE
        circleCE.material.transparent = true;
        circleCE.material.opacity = 0.36 + vol(dataFreq, 1, 8) / 1000;

        let position = new THREE.Vector3();
        circleCE.position.set(position.x + 20, position.y, 950);
        circleF.position.set(position.x + 20, position.y, 950);
        circleUF.position.set(position.x + 20, position.y, 950);

        this.index = this.index || 0;
        this.index++;
        renderer.setPixelRatio(1);
        composer.render();
        //console.log(textar);
        if (pl2.currentTime + 0.2 > begar[pos] / 1000) {
            console.log(textar[pos]);
            textIt(begar[pos], endar[pos], textar[pos]);
            pos += 1;
        }
    }
    //console.log(dataFreq);
}
