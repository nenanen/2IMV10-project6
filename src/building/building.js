import * as THREE from "three";
//import CSG from "three-js-csg"

export default class BuildingController {
    constructor(threejsWorld, lsystem = "") {
        this.threejsWorld = threejsWorld;

        this.lsystemWorld = {
            variables: 'urldab',
            rules: []
        };
        
        if (lsystem !=""&&!new RegExp("[^\n\s>" + this.lsystemWorld.variables + "]").test(lsystem)){
            try{
                this.lsystemWorld.rules = this.processRules(lsystem)
            }
            catch(err)
            {
                console.log('could not process given rules: '+err)
                console.log('default rules are used')
            }
        }
        else{//no given rules or known invalid
            this.lsystemWorld.rules = this.getDefaultRules();
            console.log('given rules where invalid, default are used');
        }

        // Sort rule keys from large to small
        this.lsystemWorld.rules = this.lsystemWorld.rules.sort(function (a, b) {
            return a.key.length < b.key.length;
        });


    }

    processRules(rawRules){
        var lines = rawRules.split('\n');
        var newRules = [];
        var lineswords;
        for(var i = 0; i< lines.length;i++)
        {
            lineswords = lines[i].split('>');
            if (lineswords.length ==2)
                newRules.push({key:lineswords[0], val:lineswords[1]});
        }
        return newRules
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

    generate(width, height, depth, x, y, z,rules = {}, L_iteration = 3, L_lenghtmin = 2, L_lenghtmax = 6, chance3D = 0.05) {
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
                m.geometry.center();

                // set the position and the rotation of each cube randomly
                let p = BuildingController.computeProperties(bmesh);
                m.position.x = p.center.x;
                m.position.y = cy * hi - hi / 2;
                m.position.z = p.center.z;

                // add the cube to the container we first created
                bmesh.add(m);
            }
            ci += 1
        }

        let props = BuildingController.computeProperties(bmesh);
        bmesh.position.x = x;
        bmesh.position.y = y;
        bmesh.position.z = z;
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
        return this.addShape(shape, extrudeSettings, x, y, z, width, height, depth, place)
    }

    static computeProperties(mesh) {
        // Compute bounding box: has a min and max.
        // mesh.geometry.computeBoundingBox();
        // let boundingBox = mesh.geometry.boundingBox;
        // let min = boundingBox.min;
        // let max = boundingBox.max;

        // Calculate box from object: has a size and center
        let box = new THREE.Box3().setFromObject(mesh);
        let size = box.getSize();
        let center = box.getCenter();

        return {
            // min: min,
            // max: max,
            size: size,
            center: center
        }
    }

    addShape(shape, extrudeSettings, x, y, z, width, height, depth) {
        // Extruded shape
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // Is pretty 0xf25346
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x576574,
            side: THREE.DoubleSide,
        }));

        // https://stackoverflow.com/questions/28848863/threejs-how-to-rotate-around-objects-own-center-instead-of-world-center
        mesh.geometry.center();

        let props = BuildingController.computeProperties(mesh);
        let center = props.center;
        let scaleX = width / props.size.x;
        let scaleY = height / props.size.y;

        let scaleZ = depth / props.size.z;
        mesh.position.set(x - center.x * scaleX, y - center.y * scaleY + height / 2, z - center.z * scaleZ);
        mesh.scale.x *= scaleX;
        mesh.scale.y *= scaleY;
        mesh.castShadow = true;
        mesh.scale.z *= scaleZ;
        return mesh;
    }

    originToBottom(geometry) {

        //1. Find the lowest `y` coordinate
        var shift = geometry.boundingBox ? geometry.boundingBox.min.y : geometry.computeBoundingBox().min.y;

        //2. Then you translate all your vertices up 
        //so the vertical origin is the bottom of the feet :
        for (var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].y -= shift;
        }
        //or as threejs implements (WestLangley's answer) : 
        geometry.translate(0, -shift, 0);

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

    getDefaultRules(){//kept in array form, it is easier to read
        return [
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
        ];
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
    }


}