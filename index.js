//Copyright 2020, James Theodore Oswald, All rights reserved.

"use strict"

const TetrahedronLight = new THREE.Mesh(new THREE.TetrahedronGeometry(0.2, 0), new THREE.MeshPhongMaterial({color: "#ff0101", shininess:200, reflectivity:1}));
const CubeLight = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.23, 0.23), new THREE.MeshPhongMaterial({color: "#01ff01", shininess:200, reflectivity:1}));
const OctahedronLight = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshPhongMaterial({color: "#ffff01", shininess:200, reflectivity:1}));
const DodecahedronLight = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), new THREE.MeshPhongMaterial({color: "#ff01ff", shininess:200, reflectivity:1}));
const IcosahedronLight = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), new THREE.MeshPhongMaterial({color: "#0121f3", shininess:200, reflectivity:1}));
//let DefMat = new THREE.MeshPhongMaterial({color: "gray", shininess:200, reflectivity:1});
const DefMat = new THREE.MeshPhongMaterial({color: "white", shininess:200, reflectivity:1});
const starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshPhongMaterial({color: "white", emissive: "white"}));

class Player{
    constructor(world){
        this.world = world;
        this.speed = 50;
        this.jumpVel = 11;
        this.fallVel = 15;
        this.fov = 70;
        this.camera = new THREE.PerspectiveCamera(this.fov, window.innerWidth / window.innerHeight, 0.01, 100);
        this.camera.position.x = 0;
        this.camera.position.y = 2.5;
        this.camera.position.z = 18;
        this.camera.lookAt(this.camera.position.x, this.camera.position.y, this.camera.position.z + 1);
        this.controls = new THREE.PointerLockControls(this.camera, document.body);
        this.onPage = false;
        this.shrine = null;
        this.controls.addEventListener('lock', function(){
            if(!this.onPage)
                this.world.menu.hide();
            //this.inGame = false;
        }.bind(this));
        this.controls.addEventListener('unlock', function(){
            if(!this.onPage)
                this.world.menu.show();
            else{
                this.camera.lookAt(this.shrine.position);
            }
            //this.inGame = false;
        }.bind(this));
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        //this.inGame = false;
        document.addEventListener('keydown', function(event){
            switch(event.keyCode){
                case 38: // up
                case 87: // w
                    this.moveForward = true;
                    break;
                case 37: // left
                case 65: // a
                    this.moveLeft = true;
                    break;
                case 40: // down
                case 83: // s
                    this.moveBackward = true;
                    break;
                case 39: // right
                case 68: // d
                    this.moveRight = true;
                    break;
                case 49: //1
                    if(!this.onPage){
                        if(!this.controls.isLocked) 
                            this.lock();
                        else
                            this.unlock();
                    }
                    break;
                case 32: // space
                    if (this.canJump === true) 
                        this.velocity.y += this.jumpVel;
                    this.canJump = false;
                    break;
                case 27: //esc
                    if(this.world.menu.shown)
                        setTimeout(function(){this.lock();}.bind(this), 100);
            }
		}.bind(this));
        document.addEventListener('keyup', function (event){
            switch (event.keyCode) {
                case 38: // up
                case 87: // w
                    this.moveForward = false;
                    break;
                case 37: // left
                case 65: // a
                    this.moveLeft = false;
                    break;
                case 40: // down
                case 83: // s
                    this.moveBackward = false;
                    break;
                case 39: // right
                case 68: // d
                    this.moveRight = false;
                    break;
            } 
        }.bind(this));
        this.cursorX;
        this.cursorY;
        window.addEventListener('mousemove', function(e){
            this.cursorX = e.clientX;
            this.cursorY = e.clientY;
        }.bind(this), false);
        window.addEventListener('click', function(e){
            this.world.menu.onClick();
        }.bind(this), false);
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 1);
        this.velocity = new THREE.Vector3();
	    this.direction = new THREE.Vector3();
        this.world.scene.add(this.controls.getObject());
        this.light = new THREE.PointLight(0x707070, 0.5, 100, 2);
        this.world.add(this.light);
    }

    move(vec){
        this.light.position.copy(vec);
        this.camera.position.copy(vec);
    }

    lock(){
        //console.log("locked");
        //this.inGame = true;
        this.controls.lock();
    }

    unlock(){
        //console.log("unlocked");
        //this.inGame = false;
        this.controls.unlock();
    }

    update(delta){
        if(this.controls.isLocked === true){
            this.light.position.copy(this.camera.position);
            this.velocity.x -= this.velocity.x * 10.0 * delta;
			this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= this.fallVel * delta;
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
			this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();
            if(this.moveForward || this.moveBackward) 
                this.velocity.z -= this.direction.z * this.speed * delta;
            if(this.moveLeft || this.moveRight) 
                this.velocity.x -= this.direction.x * this.speed * delta;
            this.raycaster.ray.origin.copy(this.controls.getObject().position);
            this.raycaster.ray.origin.y -= 0.1;
            let intersections = this.raycaster.intersectObjects(this.world.objects);
            let onObject = intersections.length > 0;
            if (onObject === true){
                this.velocity.y = Math.max(0, this.velocity.y);
                this.canJump = true;
            }
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.getObject().position.y += (this.velocity.y * delta);
            if (this.controls.getObject().position.y < 1) {
                this.velocity.y = 0;
                this.controls.getObject().position.y = 1;
                this.canJump = true;
            }
            if(Math.abs(this.velocity.y) > 1)
                this.canJump = false;
        }
        else{
            
        }
        //let wd = this.camera.getWorldDirection();
        //this.world.vars.innerHTML += "<p>pos:(" + this.camera.position.x.toFixed(2) + "," + this.camera.position.y.toFixed(2) + "," + this.camera.position.z.toFixed(2) + ")</p>";
        //this.world.vars.innerHTML += "<p>vel:(" + this.velocity.x.toFixed(2) + "," + this.velocity.y.toFixed(2) + "," + this.velocity.z.toFixed(2) + ")</p>";
        //this.world.vars.innerHTML += "<p>cam:(" + wd.x.toFixed(2) + "," + wd.y.toFixed(2) + "," + wd.z.toFixed(2) + ")</p>";
        //this.world.vars.innerHTML += "<p>jump:" + this.canJump.toString() + "</p>";
    }
}

class Menu{
    constructor(world){
        this.world = world;
        this.about = TetrahedronLight.clone();
        this.members = CubeLight.clone();
        this.contact = OctahedronLight.clone();
        this.events = IcosahedronLight.clone();
        this.explore = DodecahedronLight.clone();
        this.objs = [this.about, this.members, this.contact, this.events, this.explore];
        this.labels = document.getElementById("pages").children;
        this.header = document.getElementById("header");
        //this.objsGroup = new THREE.Group();
        for (let obj of this.objs){
            obj.scale.set(0,0,0);
            this.world.add(obj);
            //this.objsGroup.add(obj);
        }    
        this.shown = false;
        this.showing = false;
        this.hiding = false;
        //console.log(this.world.skyColor);
        //this.fogCol = this.world.skyColor.copy();
        this.fog = new THREE.Fog(0x000000, 1, 100);
        this.world.scene.fog = this.fog;
        this.foging = false;
        this.unfoging = false;
        this.selected = 0;
        this.startTime = performance.now();
        this.raycaster = new THREE.Raycaster();
        this.ry = 10;
    }

    show(){
        this.shown = true;
        this.full = false;
        this.showing = true;
        this.hiding = false;
        let p = this.world.player.camera.position;
        let cdir = this.world.player.camera.getWorldDirection();
        let theta = Math.atan2(cdir.z,cdir.x);
        for(let i = 0; i < this.objs.length; i++){
            let posTheta = theta + (i - 2) * (THREE.Math.degToRad(this.world.player.fov) / (this.objs.length));
            let nx = p.x + 2*Math.cos(posTheta);
            let nz = p.z + 2*Math.sin(posTheta);
            this.objs[i].position.set(nx, p.y, nz);
        }
        this.world.player.camera.lookAt(this.objs[2].position);
        this.startTime = performance.now();
        this.ry = p.y;
        this.header.classList.add("vis");
    }

    hide(){
        this.hiding = true;
        this.showing = false;
        this.startTime = performance.now();
        this.header.classList.remove("vis");
        this.labels[5].classList.remove("vis");
    }

    onClick(){
        let mouse = {x:0,y:0};
        mouse.x = (this.world.player.cursorX  / window.innerWidth) * 2 - 1;
        mouse.y = -(this.world.player.cursorY  / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(mouse, this.world.player.camera);   
        let intersects = this.raycaster.intersectObjects(this.objs);
        if(intersects.length > 0){
            let obj = intersects[0].object;
            this.selected = this.objs.indexOf(obj);
            if(this.selected == 4)
                this.world.player.controls.lock();
            else{
                this.foging = true;
                this.world.player.controls.lock();
                this.startTime = performance.now();
            }
        }
    }

    update(delta){
        let s = performance.now() - this.startTime;
        let t = 0.001 * s;
        if(this.showing){
            if(s / 1000 < 1){
                for (let obj of this.objs)
                    obj.scale.set(t, t, t);
            }else{
                for (let obj of this.objs)
                    obj.scale.set(1, 1, 1);
                this.showing = false;
            }
        }
        if(this.hiding){
            if(s / 1000 < 1){
                let q = 1 - t;
                for (let obj of this.objs)
                    obj.scale.set(q, q, q)
            }else{
                for (let obj of this.objs)
                    obj.scale.set(0, 0, 0);
                this.hiding = false;
                this.shown = false;
            }
        }
        if(this.shown){
            for (let obj of this.objs){
                obj.rotation.x += 0.005;
                obj.rotation.z += 0.005;
                obj.position.y = 0.07*Math.sin(t) + this.ry;
            }
            let mouse = {x:0,y:0};
            mouse.x = (this.world.player.cursorX  / window.innerWidth) * 2 - 1;
            mouse.y = -(this.world.player.cursorY  / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(mouse, this.world.player.camera);   
            let intersects = this.raycaster.intersectObjects(this.objs);
            if(intersects.length > 0){
                let obj = intersects[0].object;
                let i = this.objs.indexOf(obj);
                let label = this.labels[i];
                if(!label.classList.contains("vis")){
                    label.classList.add("vis");
                }
                this.labels[5].classList.remove("vis");
                obj.rotation.y += 0.06;
            }
            else{
                for(let i = 0; i < 5; i++)
                    if(this.labels[i].classList.contains("vis"))
                        this.labels[i].classList.remove("vis");
                if(!this.hiding && !this.labels[5].classList.contains("vis"))
                    this.labels[5].classList.add("vis");
            }
        }
        //const fadeSpeed = 30; 
        if(this.unfoging){
            if(s / 1000 < 1){
                this.world.scene.fog.far = 100*t + 2;
                //this.world.scene.background.setScalar(-1/(fadeSpeed*(t-1)-1/fadeSpeed));
                let col = this.teleColor(this.world.skyColor, this.objs[this.selected].material.color, -t+1);
                this.world.scene.background.copy(col); 
                this.fog.color.copy(col);
            }else{
                this.world.scene.fog.far = 100;
                //this.fog.color.copy();
                this.world.scene.background = this.world.skyColor.clone();
                this.unfoging = false;
            }
        }
        if(this.foging){
            if(s / 1000 < 1){
                this.world.scene.fog.far = -100*(t-1) + 2;
                //this.world.scene.background.setScalar(1/(fadeSpeed*t) - 1/fadeSpeed);
                //console.log(this.objs[this.selected].material.color);
                let col = this.teleColor(this.world.skyColor, this.objs[this.selected].material.color, t);
                this.world.scene.background.copy(col); 
                this.fog.color.copy(col);
            }else{
                this.fog.far = 3;
                this.foging = false;
                this.unfoging = true;
                let shrineLoc = this.world.shrines[this.selected].position.clone();
                let newPlayerPos = shrineLoc.clone();
                newPlayerPos.z += 3;
                newPlayerPos.y += 0.5;
                this.world.player.move(newPlayerPos);
                this.world.player.camera.lookAt(shrineLoc);
                this.startTime = performance.now();
                //return; //use only if unfoging is after fogging, which it's not anymore
            }
        }
        //let cdir = this.world.player.camera.getWorldDirection();
        //let theta = Math.atan2(cdir.x,cdir.z);
        //this.world.vars.innerHTML+= "<p>theta:" + theta + "</p>"
        //this.world.vars.innerHTML+= "<p>showning:" + this.showing + "</p>"
        //this.world.vars.innerHTML+= "<p>hiding:" + this.hiding + "</p>"
        //this.world.vars.innerHTML+= "<p>shown:" + this.shown + "</p>"
        //this.world.vars.innerHTML+= "<p>unfog:" + this.unfoging + "</p>"
        //this.world.vars.innerHTML+= "<p>mouse:(" + this.world.player.cursorX + "," + this.world.player.cursorX + ")</p>";
        //let col = this.world.scene.background;
        //this.world.vars.innerHTML+= "<p>col:(" + col.r + "," + col.g + "," + col.b + ")</p>";
    }

    //helper fucntion to derive the teleportation color exponentially rather then linearly 
    teleColor(a, b, t){
        let rv = new THREE.Color();
        rv.r = a.r * Math.pow(b.r / a.r, t);
        rv.g = a.g * Math.pow(b.g / a.g, t);
        rv.b = a.b * Math.pow(b.b / a.b, t);
        //console.log(rv);
        //console.log(t);
        return rv;
    }

    
}

class World{
    constructor(){
        this.texLoader = new THREE.TextureLoader();
        this.objLoader = new THREE.OBJLoader();
        this.vars = document.getElementById("vars");
        this.scene = new THREE.Scene();
        this.skyColor = new THREE.Color("#010c18"); //cant be 0 for tele math
        this.scene.background = this.skyColor.clone();
        this.objects = [];
        this.shrines = [];
        this.updateable = [];
        this.menu = new Menu(this);
        this.player = new Player(this);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.prevTime = performance.now();
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', function(){
            //console.log("yes");
            this.player.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }.bind(this), false);
        //const light = new THREE.AmbientLight(0xffffff, 1);
        const light = new THREE.HemisphereLight(0xafafaf, 0x707070, 1);
        this.scene.add(light);
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    add(obj){
        this.objects.push(obj);
        this.scene.add(obj);
    }

    animate(){
        requestAnimationFrame(this.animate.bind(this));
        this.stats.begin();
        //this.vars.innerHTML = "";
        let time = performance.now();
		let delta = (time - this.prevTime) / 1000;
        this.player.update(delta);
        this.menu.update(delta);
        for(let u of this.updateable)
            u.update(delta);
        this.renderer.render(this.scene, this.player.camera);
        this.prevTime = time;
        this.stats.end();
    }
}

class Shrine{
    constructor(world, mesh, link, loc = new THREE.Vector3(0,0.5,0), scale = 2){
        this.world = world;
        this.position = loc;
        this.link = link;
        this.box = new THREE.Mesh(new THREE.CylinderGeometry(scale/2, scale/2, scale, 32), DefMat.clone()); //poorly named, used to be boxs, now are cyls
        this.box.position.copy(loc);
        this.world.add(this.box);
        this.shape = mesh.clone();
        this.shape.position.copy(loc);
        this.shape.position.y += scale;
        this.shape.scale.set(scale*2, scale*2, scale*2);
        this.world.add(this.shape);
        this.outline = new THREE.Mesh(mesh.geometry, mesh.material.clone());
        this.outline.material.wireframe = true;
        this.outline.material.color = new THREE.Color("gray");
        this.outline.position.copy(loc);
        this.outline.position.y += scale;
        this.outline.scale.set(scale*4, scale*4, scale*4);
        this.world.add(this.outline);
        this.jazz = [];
        //this.jazzLights = []
        this.jazzSlop = [];
        for(let i = 0; i < 100; i++){
            this.jazz[i] = mesh.clone();
            this.jazz[i].position.copy(loc);
            this.jazz[i].scale.set(scale*0.5,scale*0.5,scale*0.5);
            this.world.add(this.jazz[i]);
            let jpx = 2 * (Math.random() - 0.5);
            //jpx += jpx > 0 ? 1 : -1;
            let jpy = Math.random() - 0.3;
            let jpz = 2 * (Math.random() - 0.5);
           // jpz += jpz > 0 ? 1 : -1;
            this.jazzSlop[i] = new THREE.Vector3(loc.x + jpx , loc.y + jpy, loc.z + jpz).sub(loc);
            //this.jazzLights[i] = new THREE.PointLight(mesh.material.color.getHex(), 1, 4, 2);
            //this.jazzLights[i].position.copy(loc);
            //this.world.add(this.jazzLights[i]);
        }
        this.light = new THREE.PointLight(mesh.material.color.getHex(), 10, 4, 2);
        this.light.position.copy(loc);
        this.world.add(this.light);
        this.scale = scale;
        this.world.updateable.push(this);
        this.opening = false;
        this.recClosed = false;
        this.startTime = performance.now();
        this.page = document.getElementById("content");
    }

    update(delta){
        this.shape.rotation.y +=0.03
        let d2p = this.position.distanceTo(this.world.player.camera.position);
        if(d2p < 8){
            for(let i = 0; i < this.jazz.length; i++){
                let v = new THREE.Vector3().copy(this.jazzSlop[i]).multiplyScalar(-d2p + 8).add(this.position);
                this.jazz[i].position.copy(v);
                //this.jazzLights[i].position.copy(v);
                this.jazz[i].rotation.y += 0.1;
            }
        }
        else{
            for(let i = 0; i < this.jazz.length; i++){
                this.jazz[i].position.set(this.position);
            }
        }
        if(d2p < 3.141 && !this.recClosed){
            this.opening = true;
            this.recClosed = true;
            this.page.classList.add("show");
            this.world.player.onPage = true;
            this.world.player.unlock();
            this.world.player.shrine = this;
            this.startTime = performance.now();
            document.getElementById("frame").src = this.link;
            //this.world.player.camera.lookAt(this.position);
            //this.world.player.camera.position.add(this.world.player.camera.getWorldDirection().negate().multiplyScalar(0.1));
        }
        if(d2p > 3.141)
            this.recClosed = false;
        //Js Opening, replaced with CSS transitions for smoother result
        /*if(this.opening){
            let t = (performance.now() - this.startTime) / 1000;
            if(t < 1){
                let s = Math.floor(80 * t).toString() + "%";
                let m = Math.floor(-40 * t + 50).toString() + "%";
                this.page.style.width = s;
                this.page.style.height = s;
                this.page.style.left = m;
                this.page.style.top = m;
            }
            else{
                this.opening = false;
                this.page.style.width = "80%";
                this.page.style.height = "80%";
                this.page.style.left = "10%";
                this.page.style.top = "10%";
            }
        }*/
    }
}

class Pillar{
    constructor(world, position){
        this.world = world;
        this.position = position;
        this.base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), DefMat.clone());
        this.base.position.copy(position);
        this.world.add(this.base);
        this.top = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.5), DefMat.clone());
        this.top.position.copy(position);
        this.top.position.y += 3;
        this.world.add(this.top);
        this.cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 32), DefMat.clone());
        this.cyl.position.copy(position);
        this.cyl.position.y += 1.5;
        this.world.add(this.cyl);
        this.dec = starMesh.clone();
        this.dec.position.copy(position);
        this.dec.position.y += 3.4;
        this.world.add(this.dec);
        this.world.updateable.push(this);
    }

    update(delta){
        this.dec.rotation.y += 0.01;
        this.dec.position.y = 0.1 * Math.sin(performance.now() / 800) + this.position.y + 3.5;
    }
}

class Castle{
    constructor(world, position){
        this.world = world;
        this.position = position;
        this.base = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 10), DefMat.clone());
        this.base.position.copy(this.position);
        this.world.add(this.base);
        this.step1 = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), DefMat.clone());
        this.step1.position.copy(this.position);
        this.step1.position.z -= 3.5;
        this.world.add(this.step1);
        this.step2 = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), DefMat.clone());
        this.step2.position.copy(this.position);
        this.step2.position.z -= 4.5;
        this.step2.position.y -= 0.5;
        this.world.add(this.step2);
        for(let i = 0; i < 10; i+=2){
            new Pillar(this.world, this.position.clone().add(new THREE.Vector3(4.5, 1.15, i - 4)));
            new Pillar(this.world, this.position.clone().add(new THREE.Vector3(-4.5, 1.15, i - 4)));
        }
    }
}

class Statue{
    constructor(world, position){
        this.world = world;
        this.position = position;
        this.base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3, 32), DefMat.clone());
        this.base.position.copy(this.position);
        this.world.add(this.base);
        this.knot = new THREE.Mesh(new THREE.TorusKnotBufferGeometry(1, 0.3, 64, 16), new THREE.MeshPhongMaterial({color: "#0021f3", shininess:200, reflectivity:1, flatShading: true}));
        this.knot.position.copy(this.position)
        this.knot.position.y += 5;
        this.knot.position.z += 0.4;
        this.world.add(this.knot);
        this.world.updateable.push(this);
        this.logo = null;
        this.world.objLoader.load("model.obj", function(obj){
            this.logo = obj;
            this.logo.traverse(function(child){
                if (child instanceof THREE.Mesh)
                    child.material = new THREE.MeshPhongMaterial({color: "#0021f3", shininess:200, reflectivity:1, flatShading: true});
            });
            this.logo.scale.set(0.15, 0.15, 0.5);
            this.logo.position.y += 3.6;
            this.world.add(this.logo);
        }.bind(this),
        function(){},
        function(error){
            console.error(error);
        });
        /*this.cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 32), DefMat.clone());
        this.cyl.position.copy(position);
        this.cyl.position.y += 0.4;
        this.world.add(this.cyl);
        this.cyl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 32), DefMat.clone());
        this.cyl2.position.copy(position);
        this.cyl2.position.y += 3.1;
        this.world.add(this.cyl2);
        this.world.updateable.push(this);*/
    }

    update(delta){
        if(this.logo != null){
            this.logo.rotation.y += 0.01;
            //object.rotateOnAxis(axis,rad);
        }
        this.knot.rotation.y += 0.01;
        this.knot.rotation.z += 0.01;
    }
}

class Stars{
    constructor(world, count){
        this.world = world;
        this.count = count;
        this.stars = [];
        this.starpos = [];
        this.starMovement = [];
        this.starWaveOffset = [];
        this.dists = [];
        this.center = new THREE.Vector3(0, 25, 0);
        this.starMesh = starMesh;
        for(let i = 0; i < this.count; i++){
            this.stars[i] = this.starMesh.clone();
            this.starpos[i] = new THREE.Vector3(50*Math.random() - 25, /*10*Math.random()*/ + 20, 50*Math.random() - 25)
            this.stars[i].position.copy(this.starpos[i]);
            this.world.add(this.stars[i]);
            this.starMovement[i] = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            this.starWaveOffset[i] = Math.random() * 2 * Math.PI;
            this.dists[i] = this.center.distanceTo(this.starpos[i]);
        }
        this.world.updateable.push(this);
    }
    
    update(delta){
        let p = performance.now() / 1000;
        for(let i = 0; i < this.count; i++){
            
            this.starpos[i].x = this.dists[i]*Math.cos(1/this.dists[i]*p + this.starWaveOffset[i]);
            this.starpos[i].z = this.dists[i]*Math.sin(1/this.dists[i]*p + this.starWaveOffset[i]);
            this.stars[i].position.copy(this.starMovement[i].clone().multiplyScalar(2 * Math.sin(0.5*p + this.starWaveOffset[i])).add(this.starpos[i]));
            //this.stars[i].position.copy(this.starpos[i]);
        }
    }
}

let world;

function init() {
    /*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        consle.log(navigator.userAgent);
        alert(navigator.userAgent);
        //window.location.replace("baddevice.html");
    }*/

    if(window.innerWidth < window.innerHeight)
        alert("This site does not work with mobile!, Please use a mouse and keyboard");

    world = new World();
    
    let floor = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 100, 100), new THREE.MeshPhongMaterial({color: 0xf0f0f0, shininess:200, reflectivity:1}));
    floor.position.y -= 50;
    //let floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50).rotateX(-Math.PI / 2), new THREE.MeshPhongMaterial({color: 0xf0f0f0, shininess:200, reflectivity:1}));
    world.add(floor);

    new Castle(world,new THREE.Vector3(0,0.5,20));
    new Statue(world, new THREE.Vector3(0,1.5,0));
    new Stars(world, 200);

    let sl = [[-15,0.5,0],[-10,0.5,-15],[10,0.5,-15],[15,0.5,0]];
    let links = ["about.html","members.html","contact.html","events.html"];
    for(let i = 0; i < world.menu.objs.length - 1; i++){
        world.shrines[i] = new Shrine(world, world.menu.objs[i], links[i], new THREE.Vector3(sl[i][0], sl[i][1], sl[i][2]));
    }

    /*let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshNormalMaterial();
    let mesh = new THREE.Mesh(geometry, material);
    world.add(mesh);*/

    //mesh.position.y = 1;
    world.menu.show();
    world.animate();
}

function closeit(){
    console.log("closing")
    let page = world.player.shrine.page;
    //page.style.width = "0%";
    //page.style.height = "0%";
    page.classList.remove("show");
    world.player.lock();
    world.player.onPage = false;
}
