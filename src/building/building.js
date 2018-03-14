import * as THREE from "three";

let lsystemWorld = { //singleton object
    variablez:'urldab',
    rules:[
        {key:"uuu",val:"uuua"},
        {key:"uua",val:"uuuba"},
        {key:"uu",val:"uuu"},
        {key:"rl",val:"rdrul"},
        {key:"lr",val:"ldlur"},
        {key:"ud",val:"urd"},
        {key:"du",val:"dru"},
        {key:"a",val:"aa"},
        {key:"aaa",val:"aua"},
        {key:"r",val:"rr"},
        {key:"rrr",val:"arr"},
        {key:"ur",val:"urur"},
        {key:"ururur",val:"ururdr"},
    ]
};
    

export default class BuildingController {
  constructor(threejsWorld) {
      this.threejsWorld = threejsWorld;
      //sort rule keys from large to small
      lsystemWorld.rules = lsystemWorld.rules.sort(function(a,b){
          return a.key.length< b.key.length;
      })
      String.prototype.replaceAll = function(str1, str2, ignore) 
        {
            return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
        } 
  }
  
  buildingBlob(){

        //symmetry on
        this.get2D("uuburarubluaar");//urabulur        
        this.get2D("uruuburrdr",250,0,0);    
        this.get2D("uuruurrruuuuuuuubuudrrrrrru",-300,0,0);
        this.get2D("ua",550,0,0);
        this.get2D("baa",-600,0,0);

        //symmetry off
        this.get2D("uuburarubluaar",0,0,300,false);//urabulur        
        this.get2D("uruuburrdr",250,0,300,false);    
        this.get2D("uuruurrruuuuuuuubuudrrrrrru",-300,0,300,false);
        this.get2D("ua",550,0,300,false);
        this.get2D("baa",-600,0,300,false);
        
        var newS = this.lsystem("ud",1);
        //console.log(newS);
        this.get2D(newS,0,0,600);
    }

    get2D(lsystemstring,x=0,y=0,z=0, symmetry =true)
    {
        var width = 50,height = 50,depth =50;
        var cX = 0,cY = 0;

        var shape = new THREE.Shape();
        var i;
        //left half
        for(i = 0;i<lsystemstring.length;i++)
        {
            switch(lsystemstring[i]){
                case 'u':
                    cY+=1;
                    break;                
                case 'r':
                    cX+=1;
                    break;                
                case 'l':
                    cX-=1;
                    break;                
                case 'd':
                    cY-=1;
                    break;                
                case 'a':
                    cX+=1;
                    cY+=0.5;
                    break;                
                case 'b':
                    cX-=1;
                    cY+=0.5;
                    break;
            }
            shape.lineTo(cX,cY);
        }

        //right half
        if(symmetry)
            for(i = lsystemstring.length-1;i>=0;i--)
            {
                switch(lsystemstring[i]){
                    case 'u':
                        cY-=1;
                        break;                
                    case 'r':
                        cX+=1;
                        break;                
                    case 'l':
                        cX-=1;
                        break;                
                    case 'd':
                        cY+=1;
                        break;                
                    case 'a':
                        cX+=1;
                        cY-=0.5;
                        break;                
                    case 'b':
                        cX-=1;
                        cY-=0.5;
                        break;
                }
                shape.lineTo(cX,cY);
            }
        else shape.lineTo(cX,0)

        shape.lineTo(0,0);
        var extrudeSettings = { amount: 1, bevelEnabled: false, bevelSegments: 1, steps: 1, bevelSize: 0.2, bevelThickness: 0.1 };
        this.addShape( shape,       extrudeSettings,   x, y, z, 0, 0, 0, 100,100,100 )
    }

    addShape( shape, extrudeSettings, x, y, z, rx, ry, rz, sx,sy,sz ) {
					// extruded shape
					var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );                    
                    geometry.computeBoundingBox();

                    //is pretty 0xf25346
					var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0xf25346, side: THREE.DoubleSide, shading:THREE.FlatShading}));//,wireframe :true}) );
					//rx=0.5*Math.PI; //to rotate buidlings
                    var whd = geometry.boundingBox.getSize();
                    mesh.position.set( x,y, z );
					mesh.rotation.set( rx, ry, rz );
					mesh.scale.set( sx/whd.x, sy/whd.y, sz/whd.z );

					this.threejsWorld.scene.add( mesh );
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
				}

    
    
    
    lsystem(axiom,iterations)//return resulting string
    {
        var changesMade= true;
        var counter = 0;
        while(changesMade && counter<iterations){
            var newaxiom = axiom;
            for(var ri =0; ri<lsystemWorld.rules.length;ri++)
            {
                newaxiom = newaxiom.replaceAll(lsystemWorld.rules[ri].key,"|"+lsystemWorld.rules[ri].val+"|")
                //console.log(newaxiom)
            }

            if(newaxiom!=axiom)
            {
                changesMade = true;
                axiom = newaxiom.replaceAll("|","");
                //console.log("-----------------")
                //console.log(newaxiom)
                //console.log("-----------------")
            }
            counter++;
        }
        return axiom;
    }
}