//constants and variables
var count = 128;

//tech shit
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(80, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var postprocessing = {};


var particle = [], geometry = [], material = [];
var t = 0;


for (var i = 0; i < 14*count/16; i++) { // z при генерации разделить на -5 и умножить на X(max 9) и Y(max 4.5)
    geometry[i] = new THREE.CircleBufferGeometry(8, 32);
    material[i] = new THREE.MeshBasicMaterial({
        color: "rgb(" + parseInt(Math.random() * 255) + ",0,255)",
        transparent: false
    });
    particle[i] = new THREE.Mesh(geometry[i], material[i]);
    scene.add(particle[i]);
    particle[i].position.z = Math.random() * 555 - 600;
    particle[i].material.opacity = 0.25;
    particle[i].position.x = (Math.random() * 18 - 9) * particle[i].position.z / -5;
    particle[i].position.y = (Math.random() * 9 - 4.5) * particle[i].position.z / -5;
    console.log(particle[i].position.z);
}

for (var i = 14*count/16; i < 63*count/64; i++) { // z при генерации разделить на -5 и умножить на X(max 9) и Y(max 4.5)
    geometry[i] = new THREE.CircleBufferGeometry(8, 32);
    material[i] = new THREE.MeshBasicMaterial({
        color: "rgb(" + parseInt(Math.random() * 255) + ",0,255)",
        transparent: false
    });
    particle[i] = new THREE.Mesh(geometry[i], material[i]);
    scene.add(particle[i]);
    particle[i].position.z = Math.random() * 40 - 120;
    particle[i].material.opacity = 0.25;
    particle[i].position.x = (Math.random() * 18 - 9) * particle[i].position.z / -5;
    particle[i].position.y = (Math.random() * 9 - 4.5) * particle[i].position.z / -5;
    console.log(particle[i].position.z);
}

for (var i = 63*count/64; i < count; i++) { // z при генерации разделить на -5 и умножить на X(max 9) и Y(max 4.5)
    geometry[i] = new THREE.CircleBufferGeometry(8, 32);
    material[i] = new THREE.MeshBasicMaterial({
        color: "rgb(" + parseInt(Math.random() * 255) + ",0,255)",
        transparent: false
    });
    particle[i] = new THREE.Mesh(geometry[i], material[i]);
    scene.add(particle[i]);
    particle[i].position.z = Math.random() * 10 - 20;
    particle[i].material.opacity = 0.25;
    particle[i].position.x = (Math.random() * 18 - 9) * particle[i].position.z / -5;
    particle[i].position.y = (Math.random() * 9 - 4.5) * particle[i].position.z / -5;
    console.log(particle[i].position.z);
}

camera.position.z = 10;


initPostprocessing();


function initPostprocessing() {
    var renderPass = new THREE.RenderPass(scene, camera);
    var bokehPass = new THREE.BokehPass(scene, camera, {
        focus: 500.0,
        aperture: 0.00006,
        maxblur: 3,
        width: window.innerWidth,
        height: window.innerHeight
    });
    bokehPass.renderToScreen = true;
    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;
}

var render = function () {
    t++;
    postprocessing.bokeh.uniforms["focus"].value = 500 + Math.sin(t / 10) * 50;//Math.sin(t / 10) * (300) + 310;
    //camera.fov = Math.sin(t/10) + 80;
    //camera.updateProjectionMatrix();
    //console.log(postprocessing.bokeh.uniforms["focus"].value);
    for (var i = 0; i < count; i++) {
        //particle[i].position.x += Math.cos(t);
        //particle[i].position.y += Math.sin(t);
    }
    //renderer.render(scene, camera);
    postprocessing.composer.render(1);
    requestAnimationFrame(render);
};

render();
