import * as THREE from "three";
//import CSG from "three-js-csg"

export default class BuildingController {
    constructor(threejsWorld, lsystem = {}) {
        this.threejsWorld = threejsWorld;

        // L-system rules fit 3D more, but more boring 2D?
        /*this.lsystemWorld = {
            variables: 'urldab',
            rules: [
                {key: "uuuu", val: "uuau"},
                {key: "uuua", val: "uba"},
                {key: "uu", val: "uuu"},
                {key: "rl", val: "rdrul"},
                {key: "lr", val: "ba"},
                {key: "ud", val: "urd"},
                //{key: "du", val: "du"},
                {key: "a", val: "uar"},
                //{key: "aaa", val: ""},
                {key: "r", val: "rr"},
                {key: "rrr", val: "arr"},
                {key: "ur", val: "urur"},
                //{key: "ururb", val: "ururdr"},
            ] 
        };//*/
        this.lsystemWorld = {
            variables: 'urldab',
            rules: []
        }
        if(lsystem == {})
        {
            this.lsystemWorld.rules= [
                    {key: "uuu", val: "uuua"},
                    {key: "uua", val: "uuuba"},
                    {key: "uu", val: "uuu"},
                    {key: "rl", val: "rdrul"},
                    {key: "lr", val: "ldlur"},
                    {key: "ud", val: "urd"},
                    {key: "du", val: "dru"},
                    {key: "a", val: "aa"},
                    {key: "aaa", val: "aua"},
                    {key: "r", val: "rr"},
                    {key: "rrr", val: "arr"},
                    {key: "ur", val: "urur"},
                    {key: "ururur", val: "ururdr"},
                ]
        }

        // Sort rule keys from large to small
        this.lsystemWorld.rules = this.lsystemWorld.rules.sort(function (a, b) {
            return a.key.length < b.key.length;
        });


    }


    generateMultiple(nrOfbuidlings = 1, width = 100, height = 100, depth = 100, x = 0, y = 0, z = 0) {
        let arrToReturn = [];
        for (let i = 0; i < nrOfbuidlings; i++) {
            arrToReturn.push(this.get2D(this.lsystem(this.randomString(), 3), x, y, z, true, width, height, depth));
        }
        return arrToReturn;
    }

    generateBoudingBox(width, height, depth, x, y, z) {
        return this.get2D("ur", x, y, z, true, width, height, depth)
    }

    generate(width, height, depth, x, y, z, L_iteration = 3, L_lenghtmin = 1, L_lenghtmax = 4, chance3D = 0.05) {
        //return this.get3D('uuuuurruulluuuuurrr', x, y, z, true, width, height, depth);
        if (Math.random() <= chance3D)
            return this.get3D(this.lsystem(this.randomString(L_lenghtmin, L_lenghtmax), L_iteration), x, y, z, true, width, height, depth);
        else return this.get2D(this.lsystem(this.randomString(L_lenghtmin, L_lenghtmax), L_iteration), x, y, z, true, width, height, depth);
    }

    randomString(L_lenghtmin = 1, L_lenghtmax = 4) {
        var lstring = '';
        do {
            lstring = '';
            var length = Math.floor(Math.random() * L_lenghtmax) + L_lenghtmin;
            var possible = this.lsystemWorld.variables + 'uurr';
            var possibleBegin = 'uuuab'
            lstring += possibleBegin[Math.floor(Math.random() * possibleBegin.length)];
            for (var i = 0; lstring.length < length; i++) {
                lstring += possible[Math.floor(Math.random() * possible.length)];
            }
        } while ((!lstring.includes('r') && !lstring.includes('a') && !lstring.includes('b')))
        return lstring;
    }

    buildingBlob() {

        //symmetry on
        this.get2D("uuburarubluaar");//urabulur        
        this.get2D("uruuburrdr", 250, 0, 0);
        this.get2D("uuruurrruuuuuuuubuudrrrrrru", -300, 0, 0);
        this.get2D("ua", 550, 0, 0);
        this.get2D("baa", -600, 0, 0);

        //symmetry off
        this.get2D("uuburarubluaar", 0, 0, 300, false);//urabulur        
        this.get2D("uruuburrdr", 250, 0, 300, false);
        this.get2D("uuruurrruuuuuuuubuudrrrrrru", -300, 0, 300, false);
        this.get2D("ua", 550, 0, 300, false);
        this.get2D("baa", -600, 0, 300, false);

        let newS = this.lsystem("ud", 1);
        //console.log(newS);
        this.get2D(newS, 0, 0, 600);
    }

    get3D(lsystemstring, x = 0, y = 0, z = 0, symmetry = true, width = 100, height = 100, depth = 100) {
        //3D does not handle certain movements yet, thus filtered out
        lsystemstring = lsystemstring.replace('d', '');

        var a = this.occurrences(lsystemstring, 'a');
        var b = this.occurrences(lsystemstring, 'b');
        var r = this.occurrences(lsystemstring, 'r');
        var l = this.occurrences(lsystemstring, 'l');
        var u = this.occurrences(lsystemstring, 'u') + a + b;
        if (l > r) {//flip l en r
            lsystemstring = lsystemstring.replace('r', 'x')
            lsystemstring = lsystemstring.replace('l', 'r')
            lsystemstring = lsystemstring.replace('x', 'l')
            var temp = r;
            r = l;
            l = temp;
        }

        if (b + l > a + r) {//flip a en b
            //console.log(lsystemstring);
            lsystemstring = lsystemstring.replace('a', 'x')
            lsystemstring = lsystemstring.replace('b', 'a')
            lsystemstring = lsystemstring.replace('x', 'b')
            var temp = a;
            a = b;
            b = temp;
        }
        var wi = (width + 1) / (r - l + a - b);
        var hi = (height + 1) / (u);

        //create 3D
        //create an empty container
        var bmesh = new THREE.Object3D();

        //create material
        var bmat = new THREE.MeshPhongMaterial({
            color: 0xf25346,
            side: THREE.DoubleSide,
            //flatShading: THREE.FlatShading
        });

        //add all parts
        var nBlocs = (u); //+a+b);
        var cx = (l + b - a - r);
        if (cx < 0)
            cx = 0;
        var cy = 0;
        var ci = 0;
        while (ci < lsystemstring.length) {
            var charatci = lsystemstring.charAt(ci);
            var bgeom;
            var addlayer = false;
            switch (charatci) {
                case 'u':
                    bgeom = new THREE.BoxGeometry(width - cx * (wi), hi, width - cx * (wi));
                    addlayer = true;
                    cy += 1;
                    break;
                case 'a':
                    bgeom = new THREE.BoxGeometry(width - cx * (wi), hi, width - cx * (wi), 1, 1, 1);
                    bgeom.vertices[0].x -= wi / 2;
                    bgeom.vertices[0].z -= wi / 2;
                    bgeom.vertices[1].x -= wi / 2;
                    bgeom.vertices[1].z += wi / 2;
                    bgeom.vertices[4].x += wi / 2;
                    bgeom.vertices[4].z += wi / 2;
                    bgeom.vertices[5].x += wi / 2;
                    bgeom.vertices[5].z -= wi / 2;
                    cx = cx + 1;
                    addlayer = true;
                    cy += 1;
                    break;
                /*case 'b':
                  bgeom = new THREE.BoxGeometry(width - cx*(wi/2),hi,width - cx*(wi/2),1,1,1);//upside down a
                  bgeom.vertices[2].x-=wi/2;
                  bgeom.vertices[2].z-=wi/2;
                  bgeom.vertices[3].x-=wi/2;
                  bgeom.vertices[3].z+=wi/2;
                  bgeom.vertices[6].x+=wi/2;
                  bgeom.vertices[6].z+=wi/2;
                  bgeom.vertices[7].x+=wi/2;
                  bgeom.vertices[7].z-=wi/2;
                  cx= cx-2;
                  addlayer=true;
                  cy+=1;
                  break;*/
                case 'b':
                    if (ci == 0) cx += 1;
                    bgeom = new THREE.BoxGeometry(width - cx * (wi), hi, width - cx * (wi), 1, 1, 1);
                    bgeom.vertices[0].x += wi / 2;
                    bgeom.vertices[0].z += wi / 2;
                    bgeom.vertices[1].x += wi / 2;
                    bgeom.vertices[1].z -= wi / 2;
                    bgeom.vertices[4].x -= wi / 2;
                    bgeom.vertices[4].z -= wi / 2;
                    bgeom.vertices[5].x -= wi / 2;
                    bgeom.vertices[5].z += wi / 2;
                    cx = cx - 1;
                    addlayer = true;
                    cy += 1;
                    break;
                case 'r':
                    cx = cx + 1;
                    break;
                case 'l':
                    cx = cx - 1;
                    break;
            }
            if (addlayer) {
                var m = new THREE.Mesh(bgeom, bmat);

                // set the position and the rotation of each cube randomly
                m.position.x = width / 2;//(width - cx*(wi/2))/2;
                m.position.y = cy * hi - hi / 2;
                m.position.z = m.position.x;

                // add the cube to the container we first created
                bmesh.add(m);
            }
            ci += 1
        }

        bmesh.position.x = x; //-width/2;
        bmesh.position.y = 0 - height / 2;
        bmesh.position.z = z; //-length/2;
        bmesh.castShadow = true;
        bmesh.receiveShadow = true;

        return bmesh;
    }

    occurrences(string, subString) {

        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);

        var n = 0,
            pos = 0,
            step = subString.length;

        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }

    get2D(lsystemstring, x = 0, y = 0, z = 0, symmetry = true, width = 100, height = 100, depth = 100, place = true) {
        let cX = 0, cY = 0;

        let shape = new THREE.Shape();
        let i;

        // Left half
        for (i = 0; i < lsystemstring.length; i++) {
            switch (lsystemstring[i]) {
                case 'u':
                    cY += 1;
                    break;
                case 'r':
                    cX += 1;
                    break;
                case 'l':
                    cX -= 1;
                    break;
                case 'd':
                    cY -= 1;
                    break;
                case 'a':
                    cX += 1;
                    cY += 0.5;
                    break;
                case 'b':
                    cX -= 1;
                    cY += 0.5;
                    break;
            }
            shape.lineTo(cX, cY);
        }

        // Right half
        if (symmetry)
            for (i = lsystemstring.length - 1; i >= 0; i--) {
                switch (lsystemstring[i]) {
                    case 'u':
                        cY -= 1;
                        break;
                    case 'r':
                        cX += 1;
                        break;
                    case 'l':
                        cX -= 1;
                        break;
                    case 'd':
                        cY += 1;
                        break;
                    case 'a':
                        cX += 1;
                        cY -= 0.5;
                        break;
                    case 'b':
                        cX -= 1;
                        cY -= 0.5;
                        break;
                }
                shape.lineTo(cX, cY);
            }
        else {
            shape.lineTo(cX, 0);
        }

        shape.lineTo(0, 0);
        let extrudeSettings = {
            amount: 1,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.2,
            bevelThickness: 0.1
        };
        return this.addShape(shape, extrudeSettings, x, y, z, 0, 0, 0, width, height, depth, place)
    }

    addShape(shape, extrudeSettings, x, y, z, rx, ry, rz, sx, sy, sz, place = true) {
        // Extruded shape
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        //let geometry = new THREE.BoxGeometry(sx,sy,sz)
        geometry.computeBoundingBox();

        // Is pretty 0xf25346
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x576574,
            side: THREE.DoubleSide,
            // flatShading: THREE.FlatShading
        }));//,wireframe :true}) );
        //rx=0.5*Math.PI; //to rotate buildings
        
        
        var box = new THREE.Box3().setFromObject( mesh );
        let whd  = box.getSize();
        /*mesh.scale.x *= sx/whd.x;
        mesh.scale.y *= sy/whd.y;
        mesh.scale.z *= sz/whd.z;
        mesh.position.set(x -sx/2 , y - sy/2 , z -sz/2);*/
        mesh.scale.x *= sx/whd.x/2;
        mesh.scale.y *= sy/whd.y/2;
        mesh.scale.z *= sz/whd.z/2;
        mesh.position.set(x , y - whd.y* (sy/whd.y)/2, z );           
        mesh.rotation.set(rx, ry, rz);

        var mat = new THREE.MeshPhongMaterial({//original box
            color: 0x00ff00,
            wireframe:true});
        var objj = new THREE.Mesh(new THREE.BoxGeometry(whd.x+2,whd.y+2,whd.z+2),mat);
        //objj.scale.set(sx / whd.x, sy / whd.y, sz / whd.z);
        objj.scale.x *= (sx/whd.x)/2;
        objj.scale.y *= (sy/whd.y)/4;
        objj.scale.z *= (sz/whd.z)/2;
        //objj.position.set(x +whd.x*(sx/whd.x), y + whd.y* (sy/whd.y)/2, z +whd.z*(sz/whd.z));  
        objj.position.set(x , y + whd.y* (sy/whd.y)/2, z );              
        this.threejsWorld.scene.add(objj);//*/

       var mat = new THREE.MeshPhongMaterial({// goal bounding box
            color: 0xff0000,
            wireframe:true});
        var objj = new THREE.Mesh(new THREE.BoxGeometry(sx+2,sy+2,sz+2),mat);
        //objj.scale.set(sx , sy, sz);
        objj.position.set(x -1, y +sy/2 -1, z -1);        
        this.threejsWorld.scene.add(objj);//*/
        // this.threejsWorld.scene.add(mesh);
        mesh.castShadow = true;

        // Glitchy
        // mesh.receiveShadow = true;
        return mesh;
    }

    originToBottom ( geometry ) {

        //1. Find the lowest `y` coordinate
        var shift = geometry.boundingBox ? geometry.boundingBox.min.y : geometry.computeBoundingBox().min.y;
    
        //2. Then you translate all your vertices up 
        //so the vertical origin is the bottom of the feet :
        for ( var i = 0 ; i < geometry.vertices.length ; i++ ) {
            geometry.vertices[ i ].y -= shift;
        }
        //or as threejs implements (WestLangley's answer) : 
        geometry.translate( 0, -shift, 0);
    
        //finally
        geometry.verticesNeedUpdate = true;
    }


    // Return resulting string
    lsystem(axiom, iterations) {
        let changesMade = true;
        let counter = 0;
        while (changesMade && counter < iterations) {
            let newAxiom = axiom;
            for (let ri = 0; ri < this.lsystemWorld.rules.length; ri++) {
                const rule = this.lsystemWorld.rules[ri];
                const re = new RegExp(rule.key, "g");
                newAxiom = newAxiom.replace(re, `|${rule.val}|`);
            }

            if (newAxiom !== axiom) {
                changesMade = true;
                axiom = newAxiom.replace(/\|/g, "");
            }
            counter++;
        }
        return axiom;
    }


}