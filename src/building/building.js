import * as THREE from "three";

export default class BuildingController {
    constructor(threejsWorld) {
        this.threejsWorld = threejsWorld;

        // L-system rules
        this.lsystemWorld = {
            variables: 'urldab',
            rules: [
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
        };

        // Sort rule keys from large to small
        this.lsystemWorld.rules = this.lsystemWorld.rules.sort(function (a, b) {
            return a.key.length < b.key.length;
        });
    }

    generateMultiple(nrOfbuidlings = 1, width = 100, height = 100, depth = 100, x = 0, y = 0, z = 0) {
        let arrToReturn = [];
        for (let i = 0; i < nrOfbuidlings; i++) {
            arrToReturn.push(this.get2D(this.lsystem(this.randomString(),3), x, y, z, true, width, height, depth));
        }
        return arrToReturn;
    }

    generateBoudingBox(width, height, depth, x, y, z) {
        return this.get2D("ur", x, y, z, true, width, height, depth)
    }

    generate(width, height, depth, x, y, z,L_iteration=3, L_lenghtmin =1, L_lenghtmax=4) {
        return this.get2D(this.lsystem(this.randomString(L_lenghtmin,L_lenghtmax),L_iteration), x, y, z, true, width, height, depth);
    } 

    randomString(L_lenghtmin =1, L_lenghtmax=4)
    {
        var lstring = '';
        var length = Math.floor(Math.random()*L_lenghtmax)  + L_lenghtmin;
        var possible = this.lsystemWorld.variables;
        var possibleBegin = 'ur'
        lstring +=possibleBegin[Math.floor(Math.random() * possibleBegin.length)];
        for (var i = 0; lstring.length < length; i++) {
            lstring += possible[Math.floor(Math.random() * possible.length)];
        }
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

    get2D(lsystemstring, x = 0, y = 0, z = 0, symmetry = true, width = 100, height = 100, depth = 100) {
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
        return this.addShape(shape, extrudeSettings, x, y, z, 0, 0, 0, width, height, depth)
    }

    addShape(shape, extrudeSettings, x, y, z, rx, ry, rz, sx, sy, sz) {
        // Extruded shape
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.computeBoundingBox();

        // Is pretty 0xf25346
        let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x576574,
            side: THREE.DoubleSide,
            shading: THREE.FlatShading
        }));//,wireframe :true}) );
        //rx=0.5*Math.PI; //to rotate buildings
        let whd = geometry.boundingBox.getSize();
        mesh.position.set(x, y - sy / 2, z);
        mesh.rotation.set(rx, ry, rz);
        mesh.scale.set(sx / whd.x, sy / whd.y, sz / whd.z);

        this.threejsWorld.scene.add(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }


    // Return resulting string
    lsystem(axiom, iterations)
    {
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