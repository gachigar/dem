const maxValue = 2048;

var audioCtx = new AudioContext();
var destination = audioCtx.destination;
var analyserRaw = audioCtx.createAnalyser();
var source = audioCtx.createMediaElementSource(player);
source.connect(analyserRaw);
analyserRaw.connect(destination);

var analyserFreq = audioCtx.createAnalyser();
source.connect(analyserFreq);

analyserRaw.fftSize = 2048;
analyserFreq.fftSize = 2048;
analyserFreq.smoothingTimeConstant = 0.84;
/*analyserFreq.maxDecibels = 0;
 analyserFreq.minDecibels = -100;*/

var pl1 = document.getElementById("player");
pl1.volume = 0.5;

count = 2048;
var dataRaw = new Float32Array(count);
var dataFreq = new Uint8Array(1024);
var t = 0;
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

var camera, scene, renderer, composer, copyPass, taaRenderPass, renderPass;

{
    "use strict";

    let canvas = document.getElementById('canvas');
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);

    /*
     Delete in production;
     Get FPS stats;
     */
    (function () {
        let script = document.createElement('script');
        script.onload = function () {
            let stats = new Stats();
            document.body.appendChild(stats.dom);
            requestAnimationFrame(function loop() {
                stats.update();
                requestAnimationFrame(loop)
            });
        };
        script.src = '//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
        document.head.appendChild(script);
    })();

    /*
     Effect itself;
     */

    let smoke = function (width, height) {

        /*
         Delete in prod;
         GUI presets;
         */
        var gui_params = {
            TAAEnabled: "1",
            TAASampleLevel: 0,
            rotation_speed: 0.01,
            direction_speed: 0.5,
            opacity: 0.5,
            amount: 300,
            color: 0x93b5c0
        };


        let particles = [];
        var kRotation = [];
        var camera, scene, renderer, geometry, material1, material2, texture1, texture2, gui, frustum;

        this.init = function () {

            camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);
            camera.position.z = 1000;

            scene = new THREE.Scene();
            renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: false});
            renderer.setPixelRatio(1);
            renderer.setSize(width, height);
            renderer.setClearColor(0x151c24);

            composer = new THREE.EffectComposer(renderer);
            taaRenderPass = new THREE.TAARenderPass(scene, camera);
            taaRenderPass.unbiased = false;
            composer.addPass(taaRenderPass);
            renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);
            copyPass = new THREE.ShaderPass(THREE.CopyShader);
            copyPass.renderToScreen = true;
            composer.addPass(copyPass);
            taaRenderPass.accumulate = false;
            renderPass.enabled = false;

            geometry = new THREE.PlaneBufferGeometry(400, 300);
            texture1 = new THREE.TextureLoader().load("/static/smoke1.png");
            texture2 = new THREE.TextureLoader().load("/static/smoke2.png");

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

            /*
             Delete in prod;
             GUI bar;
             */
            gui = new dat.GUI();
            gui.add(gui_params, 'TAAEnabled', {
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
            });
            gui.add(gui_params, "rotation_speed", 0.0001, 0.1);
            gui.add(gui_params, "direction_speed", 0.01, 1);
            gui.add(gui_params, "opacity", 0.0, 1.0);
            let amount_controller = gui.add(gui_params, "amount", 10, 1000);
            gui.addColor(gui_params, "color");

            //  Я не могу вспомнить зачем мне был нужен фрустум, я просто перенем его, может он дейсвтительно важен.
            frustum = new THREE.Frustum();
            frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));


            amount_controller.onFinishChange((value) => {
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
                for (var i = 0; i < partcount; i++) {
                    geo[i] = new THREE.CircleBufferGeometry(3, 8);
                    if (i < partcount / 4) {
                        mat[i] = new THREE.MeshBasicMaterial({
                            color: "#7edee2",
                            transparent: true
                        });
                    }
                    if (i > partcount / 4 && i < partcount / 2) {
                        mat[i] = new THREE.MeshBasicMaterial({
                            color: "#e2375f",
                            transparent: true
                        });
                    }
                    if (i > partcount / 2) {
                        mat[i] = new THREE.MeshBasicMaterial({
                            color: "#af34e2",
                            transparent: true
                        });
                    }
                    part[i] = new THREE.Mesh(geo[i], mat[i]);
                    scene.add(part[i]);
                    part[i].position.z = Math.random() * 800;
                    part[i].material.opacity = 0.25;
                    part[i].position.x = (Math.random() * 18 - 9) * part[i].position.z / -5;
                    part[i].position.y = (Math.random() * 9 - 4.5) * part[i].position.z / -5;
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
                    particles.push({mesh: particle, self_direction: d});
                }
            });
            for (let i = 0, len = gui_params.amount; i < len; i++) { //comment this
                scene = new THREE.Scene();
                let light = new THREE.AmbientLight(0xdddddd, 0.8);
                scene.add(light);
                /*for (let i = 0; i < 10; i++) {
                 let lightPoint = new THREE.PointLight(0xff4455, 8, 300);
                 let z = Math.random() * 1000 - 100;
                 let y = Math.random() * (z - 500) / 10;
                 let x = Math.random() * 2 * width - 250;
                 lightPoint.position.set(x, y, z);
                 scene.add(lightPoint);
                 }*/

                let materialLine = new THREE.LineBasicMaterial({color: 0x0000ff});
                let geometryLine = new THREE.Geometry();
                geometryLine.vertices.push(new THREE.Vector3(-10, 0, 600));
                geometryLine.vertices.push(new THREE.Vector3(0, 10, 600));
                geometryLine.vertices.push(new THREE.Vector3(10, 0, 600));
                var line = new THREE.Line(geometryLine, materialLine);
                line.name = "line";
                scene.add(line);

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
                    particles.push({mesh: particle, self_direction: d});
                }
            }
            animate();
        };

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
            //t++;
            analyserRaw.getFloatTimeDomainData(dataRaw);
            analyserFreq.getByteFrequencyData(dataFreq);
            //scene.remove(scene.getObjectByName("line"));

            /*let materialLine = new THREE.LineBasicMaterial({color: 0xff0022});
             let geometryLine = new THREE.Geometry();
             geometryLine.vertices.push(new THREE.Vector3(-maxValue, (vol(dataFreq, 10, 24) * Math.sin(0 / 40 + t / 50) * 4 - vol(dataFreq, 17, 64) * vol(dataFreq, 17, 64) * Math.sin(0 / 8 - t / 12) * 0.02 - vol(dataFreq, 54, 511) * Math.sin(0 / 4 - t / 5) * 4) / 10, 600));
             for (let i = 1; i < maxValue; i++) {
             scene.remove(scene.getObjectByName(i));
             xf[i] = (1 - FK) * xf[i] + FK * dataRaw[i];
             geometryLine.vertices.push(new THREE.Vector3(i * 2 - maxValue, Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * Math.sin(i / 40 - t / 15) * 4 - (vol(dataFreq, 10, 24) * Math.sin(i / 40 - t / 15) * 4) / 10 + xf[i] * 180, i / 2));
             if (i % 32 == 0) {
             let lightPoint = new THREE.PointLight(0xff4455, 20, 120, 2);
             lightPoint.position.set(i * 2 - maxValue, Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * Math.sin(i / 40 - t / 15) * 4 - (vol(dataFreq, 10, 24) * Math.sin(i / 40 - t / 15) * 4) / 10 + xf[i] * 180, i / 2);
             lightPoint.name = i;
             scene.add(lightPoint);
             }
             }
             var line = new THREE.Line(geometryLine, materialLine);
             line.name = "line";
             scene.add(line);*/
            for (let i = 0; i < partcount / 4; i++) {
                scene.remove(scene.getObjectByName(i));
                part[i].material.opacity = (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240);
                let position = new THREE.Vector3();
                position.setFromMatrixPosition(part[i].matrixWorld);
                let lightPoint = new THREE.PointLight(0x7edee2, (Math.pow((vol(dataFreq, 1, 8) / 20 - 9.5), 2) * 20 / 240) * 30, 240, 2);
                lightPoint.position.set(position.x, position.y, position.z + 2);
                lightPoint.name = i;
                scene.add(lightPoint);
            }
            for (let i = partcount / 4; i < partcount / 2; i++) {
                scene.remove(scene.getObjectByName(i));
                part[i].material.opacity = (vol(dataFreq, 128, 256) / 2) / 50;
                let position = new THREE.Vector3();
                position.setFromMatrixPosition(part[i].matrixWorld);
                let lightPoint = new THREE.PointLight(0xe2375f, (vol(dataFreq, 128, 256) / 2) / 50 * 30, 240, 2);
                lightPoint.position.set(position.x, position.y, position.z + 2);
                lightPoint.name = i;
                scene.add(lightPoint);
            }
            for (let i = partcount / 2; i < partcount; i++) {
                scene.remove(scene.getObjectByName(i));
                part[i].material.opacity = vol(dataFreq, i * 8, (i + 1) * 8) / 50;
                let position = new THREE.Vector3();
                position.setFromMatrixPosition(part[i].matrixWorld);
                let lightPoint = new THREE.PointLight(0xaf34e2, vol(dataFreq, i * 8, (i + 1) * 8) / 50 * 30, 240, 2);
                lightPoint.position.set(position.x, position.y, position.z + 2);
                lightPoint.name = i;
                scene.add(lightPoint);
            }
            //renderer.render(scene, camera);
            //renderer.render(scene, camera);
            composer.render();
        }
    };

    let b = new smoke(canvas.offsetWidth, canvas.offsetHeight);
    b.init();
}
