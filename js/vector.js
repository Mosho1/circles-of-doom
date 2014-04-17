// From mr. doob
(function () {		
	function Vector(x, y, z)
    {
    	if (x instanceof Vector) {
    		this.x = x.x;
    	    this.y = x.y;
    	    this.z = x.z;
    	} else {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;		
		}
	}

	this.Vector = Vector;
	
	Vector.prototype = {	
		copy : function(v){
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			return this;
		},
		add : function(v){
			var ret = new Vector(this);
			ret.x += v.x;
			ret.y += v.y;
			ret.z += v.z;
			return ret;
		},
		sub : function(v){
			var ret = new Vector(this);
			ret.x -= v.x;
			ret.y -= v.y;
			ret.z -= v.z;
			return ret;
		},
		cross : function(v){
			this.tx = this.x;
			this.ty = this.y;
			this.tz = this.z;
			
			this.x = this.ty * v.z - this.tz * v.y;
			this.y = this.tz * v.x - this.tx * v.z;
			this.z = this.tx * v.y - this.ty * v.x;
			return this;
		},
		multiply : function(s){
			this.x *= s;
			this.y *= s;
			this.z *= s;
			return this;
		},
		divide : function(s){
			this.x /= s;
			this.y /= s;
			this.z /= s;
			return this;
		},
		distanceTo : function(v){
			this.dx = this.x - v.x;
			this.dy = this.y - v.y;
			this.dz = this.z - v.z;
			
			return Math.sqrt(this.dx * this.dx + this.dy * this.dy + this.dz * this.dz);
		},
		
		distanceToSquared : function(v){
			this.dx = this.x - v.x;
			this.dy = this.y - v.y;
			this.dz = this.z - v.z;
			
			return this.dx * this.dx + this.dy * this.dy + this.dz * this.dz;
		},
		
		length : function(){
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		},
		
		lengthSq : function(){
			return this.x * this.x + this.y * this.y + this.z * this.z;
		},

		normalize : function(){
			if (this.length() > 0)
				this.ool = 1.0 / this.length();
			else
				this.ool = 0;
				
			this.x *= this.ool;
			this.y *= this.ool;
			this.z *= this.ool;
			return this;
		},
		
		negate : function(){
			this.x = -this.x;
			this.y = -this.y;
			this.z = -this.z;
		},
		dot : function(v){
			return this.x * v.x + this.y * v.y + this.z * v.z;
		},
		
		clone : function(){
			return new Vector(this.x, this.y, this.z);
		},
		
		toString : function(){
			return '(' + this.x + ', ' + this.y + ', ' + this.z + ')';
		}
		
	};
})();