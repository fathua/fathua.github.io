function tParticle() {
    this.initialize.apply(this, arguments);
}

tParticle.prototype.set= function(v){
    this._pos.x = v._pos.x;
    this._pos.y = v._pos.y;
    this._startPos.x = v._startPos.x;
    this._startPos.y = v._startPos.y;
    this._color.r = v._color.r;
    this._color.g = v._color.g;
    this._color.b = v._color.b;
    this._color.a = v._color.a;

    this._deltaColor.r = v._deltaColor.r;
    this._deltaColor.g = v._deltaColor.g;
    this._deltaColor.b = v._deltaColor.b;
    this._deltaColor.a = v._deltaColor.a;
 
    this._size = v._size;
    this._deltaSize = v._deltaSize;
    this._rotation = v._rotation;
    this._deltaRotation = v._deltaRotation;
    this._timeToLive = v._timeToLive;
    this._atlasIndex = v._atlasIndex;
    this._startsize = v._startsize;

    this.modeA.dirx = v.modeA.dirx;
    this.modeA.diry = v.modeA.diry;
    this.modeA.radialAccel = v.modeA.radialAccel;
    this.modeA.tangentialAccel = v.modeA.tangentialAccel;

    this.modeB.angle = v.modeB.angle;
    this.modeB.degreesPerSecond = v.modeB.degreesPerSecond;
    this.modeB.radius = v.modeB.radius;
    this.modeB.deltaRadius = v.modeB.deltaRadius;
   

}

tParticle.prototype.initialize = function() {
	this._pos = {
		x: 0,
		y: 0
	};
	this._startPos = {
		x: 0,
		y: 0
	};;
	this._color = {
		r : 0,
		g : 0,
		b : 0,
		a : 0
	};
	this._deltaColor ={
		r : 0,
		g : 0,
		b : 0,
		a : 0
	};
	this._size = 0;
	this._deltaSize = 0;
	this._rotation =0;
	this._deltaRotation = 0;
	this._timeToLive = 0;
	this._atlasIndex = 0;
    this._startsize = 0;
	this.modeA = {
		dirx : 0,
		diry : 0,
		radialAccel : 0,
		tangentialAccel : 0
	};
	this.modeB = {
		angle : 0,
		degreesPerSecond : 0,
		radius : 0,
		deltaRadius : 0
	};
	this._sprite = null;
}





function ParticleRpg() {
    this.initialize.apply(this, arguments);
}
ParticleRpg.prototype = Object.create(PIXI.Container.prototype);
ParticleRpg.prototype.constructor = ParticleRpg;
ParticleRpg.prototype.initialize = function(name,texname) {
	PIXI.Container.call(this);
	this._emitterMode=0;//0 GRAVITY 1 RADIUS
	this._totalParticles = 0;
	this._particles = null;
	this._isActive = false;
	this._isAutoRemoveOnFinish = false;
	this._emissionRate = 0;
	this._particleCount = 0;
	this._emitCounter = 0;
	this._elapsed = 0;
    this.simpleShader = null;
 
	this.loadDataFile(name);
    this.sprites = null;
    this.blendMode = 1;
    this.texname = texname;

}

ParticleRpg.prototype.setUp = function(data) {
    //this._atlasIndex = 0;
	var dictionary = {};
	var node = data.getElementsByTagName("dict")[0].childNodes;
	for(var i = 0; i < node.length; i++) {
   //如果是文本节点，并且值为空，则删除该节点
   		if(node[i].nodeType == 3 && /\s/.test(node[i].nodeValue)) {
      		node[i].parentNode.removeChild(node[i]);       
   		}
	}
	var length = node.length/2;
	for(var i = 0; i < length; i++) {
		var k = node[i*2].firstChild.nodeValue;
		var v = node[i*2+1].firstChild.nodeValue;
		if (k != "textureFileName"){
			dictionary[k]= Number(v);
		}
		else{
			dictionary[k]=v;
		}
	}
    if(this.texname != null){
        this._texture = ImageManager.loadPicture(this.texname);
    }
    else{
        this.texname = dictionary["textureFileName"];
        var spos = this.texname.indexOf(".png");
        this.texname = this.texname.substring(0,spos);
        this._texture = ImageManager.loadPicture(this.texname);
    }


	var maxParticles = dictionary["maxParticles"];

    this.sprites = new PIXI.particles.ParticleContainer(maxParticles, {  
            scale: true,  
            position: true,  
            rotation: true,  
            uvs: true,  
            alpha: true
    });
    this.sprites.blendMode   = this.blendMode ;
    this.addChild(this.sprites);

	this.initWithTotalParticles(maxParticles);
	this._angle = dictionary["angle"];
    this._angleVar = dictionary["angleVariance"];
    this._duration = dictionary["duration"];
    this._blendFuncSrc = dictionary["blendFuncSource"];
    this._blendFuncDst = dictionary["blendFuncDestination"];
    this._startColor = {
    	r : dictionary["startColorRed"],
    	g : dictionary["startColorGreen"],
    	b : dictionary["startColorBlue"],
    	a : dictionary["startColorAlpha"]
    };
    this._startColorVar = {
 		r : dictionary["startColorVarianceRed"],
        g : dictionary["startColorVarianceGreen"],
        b : dictionary["startColorVarianceBlue"],
        a : dictionary["startColorVarianceAlpha"]
    };

    this._endColor = {
 		r : dictionary["finishColorRed"],
        g : dictionary["finishColorGreen"],
        b : dictionary["finishColorBlue"],
        a : dictionary["finishColorAlpha"]
    };

    this._endColorVar = {
 		r : dictionary["finishColorVarianceRed"],
        g : dictionary["finishColorVarianceGreen"],
        b : dictionary["finishColorVarianceBlue"],
        a : dictionary["finishColorVarianceAlpha"]
    };

     // particle size
    this._startSize = dictionary["startParticleSize"];
    this._startSizeVar = dictionary["startParticleSizeVariance"];
    this._endSize = dictionary["finishParticleSize"];
    this._endSizeVar = dictionary["finishParticleSizeVariance"];

    // position
    var x = dictionary["sourcePositionx"];
    var y = dictionary["sourcePositiony"];
    // this.x += x;
    // this.y += (SceneManager._screenHeight- y); 
    this._posVar ={
    	x : dictionary["sourcePositionVariancex"],
    	y : dictionary["sourcePositionVariancey"]
    }

    // Spinning
    this._startSpin = dictionary["rotationStart"];
    this._startSpinVar = dictionary["rotationStartVariance"];
    this._endSpin= dictionary["rotationEnd"];
    this._endSpinVar= dictionary["rotationEndVariance"];

    this._emitterMode = dictionary["emitterType"];
    if(this._emitterMode==0){
    	this.modeA = {
    		gravityx : dictionary["gravityx"],
            gravityy : dictionary["gravityy"],
            // speed
            speed : dictionary["speed"],
            speedVar : dictionary["speedVariance"],
            // radial acceleration
            radialAccel : dictionary["radialAcceleration"],
            radialAccelVar : dictionary["radialAccelVariance"],
             // tangential acceleration
            tangentialAccel : dictionary["tangentialAcceleration"],
            tangentialAccelVar : dictionary["tangentialAccelVariance"],
            rotationIsDir : false
    	};

  		if(dictionary["rotationIsDir"]!=null){
  		 	this.modeA.rotationIsDir= dictionary["rotationIsDir"];
         }

    }
    else{
    	this.modeB ={
            startRadiusVar : dictionary["maxRadiusVariance"],
    		startRadius : dictionary["maxRadius"],
    		endRadius : dictionary["minRadius"],
    		endRadiusVar : 0,
    		rotatePerSecond : dictionary["rotatePerSecond"],
    		rotatePerSecondVar : dictionary["rotatePerSecondVariance"]
    	} 
    	if(dictionary["minRadiusVariance"]!=null){
  		 	this.modeB.endRadiusVar= dictionary["minRadiusVariance"];
        }
    }

    this._life = dictionary["particleLifespan"];
    if(this._life == 0){
        this._life = 0.1;
    }
    this._lifeVar = dictionary["particleLifespanVariance"];
    this._emissionRate = this._totalParticles / this._life;
    //alert(this._totalParticles);

}



ParticleRpg.prototype.loadDataFile = function(src) {
	var ccc = this
    var xhr = new XMLHttpRequest();
    var url = 'img/particle/' + src;
    xhr.open('GET', url);
    xhr.responseType = "document";
    xhr.onload = function() {
        if (xhr.status < 400) {
        	ccc.setUp(xhr.responseXML);
        };
    };
    xhr.onerror = function() {
        
    };
    // window[name] = null;
    xhr.send();
};


ParticleRpg.prototype.initWithTotalParticles = function(numberOfParticles){
	this._totalParticles = numberOfParticles;
	this._allocatedParticles = numberOfParticles;
	this._particles = new Array();
	this._isActive = true;
	this._emitterMode = 0;
	this._isAutoRemoveOnFinish = false;
	for (var i=0;i<numberOfParticles;i++){
		var tp = new tParticle();
		tp._atlasIndex = i;
		this._particles[i]=tp;
	}
}

function CCRANDOM_MINUS1_1(){
	return Math.random()*2-1;
}
function CC_DEGREES_TO_RADIANS(ag){
	return 0.01745329252 * ag;
}
function normalize(xx, yy){
	var res = {
		x : xx,
		y : yy,
	};
	var n = xx * xx + yy * yy;
    // Already normalized.
    if (n == 1.0){
        return res;  
    }
    n = Math.sqrt(n);
    // Too close to zero.
    if (n < 0.000001){
        return res;
    }
    
    n = 1.0 / n;
    xx *= n;
    yy *= n;

    res.x = xx;
    res.y = yy;

    return res
}
function clampf(value, min_inclusive ,max_inclusive){
	if (min_inclusive > max_inclusive) {
		var t = min_inclusive;
		min_inclusive = max_inclusive;
		max_inclusive = t;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive? value : max_inclusive;
}


ParticleRpg.prototype.initParticle = function(particle){

	particle._timeToLive = this._life + this._lifeVar * CCRANDOM_MINUS1_1();
	particle._timeToLive = Math.max(0.1,particle._timeToLive);




	particle._pos.x = this._posVar.x * CCRANDOM_MINUS1_1();
	particle._pos.y = this._posVar.y * CCRANDOM_MINUS1_1();
	var start = {
		r : clampf(this._startColor.r + this._startColorVar.r * CCRANDOM_MINUS1_1(), 0, 1),
		g : clampf(this._startColor.g + this._startColorVar.g * CCRANDOM_MINUS1_1(), 0, 1),
		b : clampf(this._startColor.b + this._startColorVar.b * CCRANDOM_MINUS1_1(), 0, 1),
		a : clampf(this._startColor.a + this._startColorVar.a * CCRANDOM_MINUS1_1(), 0, 1)
	}
	var end ={
		r : clampf(this._endColor.r + this._endColorVar.r * CCRANDOM_MINUS1_1(), 0, 1),
		g : clampf(this._endColor.g + this._endColorVar.g * CCRANDOM_MINUS1_1(), 0, 1),
		b : clampf(this._endColor.b + this._endColorVar.b * CCRANDOM_MINUS1_1(), 0, 1),
		a : clampf(this._endColor.a + this._endColorVar.a * CCRANDOM_MINUS1_1(), 0, 1)
	}
	particle._color.r = start.r;
	particle._color.g = start.g;
	particle._color.b = start.b;
	particle._color.a = start.a;

	particle._deltaColor.r = (end.r - start.r) / particle._timeToLive;
	particle._deltaColor.g = (end.g - start.g) / particle._timeToLive;
	particle._deltaColor.b = (end.b - start.b) / particle._timeToLive;
	particle._deltaColor.a = (end.a - start.a) / particle._timeToLive;

	var startS = this._startSize + this._startSizeVar * CCRANDOM_MINUS1_1();
    startS = Math.max(0, startS);
    particle._size = startS;
    if(this._endSize == -1){
    	particle._deltaSize = 0;
    }
    else{
    	var endS = this._endSize + this._endSizeVar * CCRANDOM_MINUS1_1();
        endS = Math.max(0, endS); // No negative values
        particle._deltaSize = (endS - startS) / particle._timeToLive;
    }


    // rotation
    var startA = this._startSpin + this._startSpinVar * CCRANDOM_MINUS1_1();
    var endA = this._endSpin + this._endSpinVar * CCRANDOM_MINUS1_1();
    particle._rotation = startA;
    particle._deltaRotation = (endA - startA) / particle._timeToLive;

    // position
    particle._startPos.x = 0;
    particle._startPos.y = 0;

    // direction
    var a = CC_DEGREES_TO_RADIANS( this._angle + this._angleVar * CCRANDOM_MINUS1_1() );   
    if(this._emitterMode==0){
    	var vx = Math.cos(a);
    	var vy = Math.sin(a);
    	var s = this.modeA.speed + this.modeA.speedVar * CCRANDOM_MINUS1_1();
    	particle.modeA.dirx = vx * s;
    	particle.modeA.diry = vy * s;
    	 // radial accel
        particle.modeA.radialAccel = this.modeA.radialAccel + this.modeA.radialAccelVar * CCRANDOM_MINUS1_1();
 
        // tangential accel
        particle.modeA.tangentialAccel = this.modeA.tangentialAccel + this.modeA.tangentialAccelVar * CCRANDOM_MINUS1_1();

    }
    else{
    	  // Set the default diameter of the particle from the source position
        var startRadius = this.modeB.startRadius + this.modeB.startRadiusVar * CCRANDOM_MINUS1_1();
        var endRadius = this.modeB.endRadius + this.modeB.endRadiusVar * CCRANDOM_MINUS1_1();

        particle.modeB.radius = startRadius;

        if (this.modeB.endRadius == -1)
        {
            particle.modeB.deltaRadius = 0;
        }
        else
        {
            particle.modeB.deltaRadius = (endRadius - startRadius) / particle._timeToLive;
        }

        particle.modeB.angle = a;
        particle.modeB.degreesPerSecond = CC_DEGREES_TO_RADIANS(this.modeB.rotatePerSecond + this.modeB.rotatePerSecondVar * CCRANDOM_MINUS1_1());
    }
}


ParticleRpg.prototype.addParticle = function(){
	if (this._particleCount == this._totalParticles)
    {
        return;
    }
    var particle = this._particles[this._particleCount];
    this.initParticle(particle);
    this._particleCount++;
}

ParticleRpg.prototype.stopSystem = function(){
	this._isActive = false;
    this._elapsed = this._duration;
    this._emitCounter = 0;
}
function rgb2hex(rgb) {
     return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + (rgb[2] * 255 | 0);
}
ParticleRpg.prototype.update = function() {
    if(this.sprites == null){
        return;
    }
	var dt = SceneManager._deltaTime;
	if(this._isActive==true && this._emissionRate != 0 ){
		var rate = 1.0 /this._emissionRate;
        //alert(rate);
		if (this._particleCount < this._totalParticles)
        {
            this._emitCounter += dt;
        }
        while (this._particleCount < this._totalParticles && this._emitCounter > rate) 
        {
            this.addParticle();
            this._emitCounter -= rate;
        }
        this._elapsed += dt;
        if (this._duration != -1 && this._duration < this._elapsed)
        {
            this.stopSystem();
        }
	}


	var _particleIdx = 0;
	 while (_particleIdx < this._particleCount){
	 	var p = this._particles[_particleIdx];
	
	 	p._timeToLive -= dt;
	 	if (p._timeToLive > 0) 
        {
                // Mode A: gravity, direction, tangential accel & radial accel
        	if (this._emitterMode == 0)
        	{
                var tmp = {
                    x : 0,
                    y : 0
                }
                var radial = {
                    x : 0,
                    y : 0
                }
                var tangential = {
                    x : 0,
                    y : 0
                }

                    // radial acceleration
                if (p._pos.x != 0 || p._pos.y != 0)
                {
                     radial = normalize(p._pos.x,p._pos.y);
                }
                tangential.x = radial.x;
                tangential.y = radial.y;
                radial.x = radial.x * p.modeA.radialAccel;
                radial.y = radial.y * p.modeA.radialAccel;

                 // tangential acceleration
                var newy = tangential.x;
                tangential.x = -tangential.y;
                tangential.y = newy;
                tangential.x = tangential.x * p.modeA.tangentialAccel;
                tangential.y = tangential.y * p.modeA.tangentialAccel;
                tmp.x = radial.x + tangential.x + this.modeA.gravityx;
                tmp.y = radial.y + tangential.y + this.modeA.gravityy;
                tmp.x = tmp.x * dt;
                tmp.y = tmp.y * dt;
              
                p.modeA.dirx = p.modeA.dirx + tmp.x;
                p.modeA.diry = p.modeA.diry + tmp.y;
                    

                tmp.x = p.modeA.dirx * dt;
                tmp.y = p.modeA.diry * dt;
                // alert(tmp.x);
                // alert(tmp.y);
                p._pos.x = p._pos.x + tmp.x;
                p._pos.y = p._pos.y + tmp.y;
                }

                // Mode B: radius movement
                else 
                {                
                    // Update the angle and radius of the particle.
                    p.modeB.angle += p.modeB.degreesPerSecond * dt;
                    p.modeB.radius += p.modeB.deltaRadius * dt;

                    p._pos.x = - Math.cos(p.modeB.angle) * p.modeB.radius;
                    p._pos.y = - Math.sin(p.modeB.angle) * p.modeB.radius;


                   
				}

                // color
                p._color.r += (p._deltaColor.r * dt);
                p._color.g += (p._deltaColor.g * dt);
                p._color.b += (p._deltaColor.b * dt);
                p._color.a += (p._deltaColor.a * dt);

                // size
                p._size += (p._deltaSize * dt);
                p._size = Math.max( 0, p._size );
                // angle
                p._rotation += (p._deltaRotation * dt);

          		if(p._sprite == null){
                    p._sprite = new Sprite(this._texture); 
     				this.sprites.addChild(p._sprite);
          		}
          		p._sprite.x = p._pos.x;
          		p._sprite.y =  - p._pos.y;
               
                
          		var sc = p._size  /  p._sprite._bitmap.width;
          	     p._sprite.scale.x = sc;
          	     p._sprite.scale.y = sc;
                 p._sprite.blendMode = this.blendMode;

                p._sprite.rotation = p._rotation;
                p._sprite.tint = rgb2hex([p._color.r,p._color.g,p._color.b]);
                p._sprite.alpha = p._color.a;
              
                ++_particleIdx;
            } 
            else 
            {
      
                // life < 0
                var currentIndex = p._atlasIndex;
                if( _particleIdx != this._particleCount-1 )
                {
                    this._particles[_particleIdx].set(this._particles[this._particleCount-1]);
        
                }
                if (true)
                {
 
                    //switch indexes
                    this._particles[this._particleCount-1]._atlasIndex = currentIndex;
                }


                --this._particleCount;

                if( this._particleCount == 0 && this._isAutoRemoveOnFinish )
                {

                    this.sprites.removeChildren();
                    this.sprites = null;
                    return;
                }
            }

	 }
     if(this._isActive == false){
        if(this._particleCount == 0){
            this.sprites.removeChildren();
            this.sprites = null;
            return;
        }
        for(var i =this._particleCount; i<this._totalParticles ;i++){
            if(this._particles[i]._sprite){
                this._particles[i]._sprite.scale.x = 0;
                this._particles[i]._sprite.scale.y = 0;
            }
            else{
                break;
            }
        }
    }



	
	//alert(SceneManager._deltaTime);
}

