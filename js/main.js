var x = 150;
var y = 150;
var dx = 2;
var dy = 4;
var ctx;
var WIDTH; 
var HEIGHT;
var frame;
var circles = [];
var enemies = [];
var explosions = [];
var base = [];
var isPaused = false;
var terrainPattern;
var firePattern;
var gameTime = 0;
var lastTime = 0;
var enemySpeed = 50;
var circleSpd = 5;
var circleAcc = -0.1;
var score = 0;
var posX, posY;
var grpId = 0;
var gameOver = false;

function distance(x1, y1, x2, y2) {

  var distX = Math.pow(x1 - x2, 2),
      distY = Math.pow(y1 - y2, 2),
      distance = distX + distY;

  return distance;
}


var linearScale = function(source, target) {
  var targetRange = target[1] - target[0],
      sourceRange = source[1] - source[0],
      slope = targetRange / sourceRange,
      offset = target[0] - slope * source[0] ;
  return function(val) {
       return val * slope + offset;
  };
}

 
function drawCircle(x,y,r,start,end) {

  start = start || 0;
  end = end || Math.PI * 2;

  ctx.beginPath();
  ctx.lineWidth=2;
 // console.log(start,end);
  ctx.arc(x, y, r, start, end);
  ctx.strokeStyle = firePattern;
  ctx.stroke();

}



function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}
 
function updateCircles(circles) {

  var i, j, k, c, c1, c2;
  for (i = 0; i < circles.length; i++) {
    var c = circles[i];
    c.ngls = [];
    c.r +=  c.speed += c.acceleration
    
    if (c.r < 0) {
      circles.splice(i, 1);
      return;
    }

      
  };
  

  for (i = 0; i < circles.length; i++) {
    var c1 = circles[i];
    
    for (j = 0; j < circles.length; j++) {
      if (i < j) {

        var c2 = circles[j];
        var slope = -(c1.x - c2.x)/(c1.y - c2.y),
            offset = ((c1.r * c1.r - c2.r * c2.r) - (c1.x * c1.x - c2.x * c2.x) - (c1.y *c1.y - c2.y * c2.y)) / (-2 * (c1.y - c2.y)),
            a = 1 + slope * slope,
            b = -2 * c1.x + 2 * slope * offset - 2 * slope * c1.y,
            c = c1.x * c1.x + offset * offset - 2 * offset * c1.y + c1.y * c1.y - c1.r * c1.r,
        
            x1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
            x2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

        if (x1 && x2) { 
        
          var y1 = slope * x1 + offset, 
              y2 = slope * x2 + offset;
          

          if (c1.y - c2.y >= 0) {
            c1.pnts = [[x1, y1], [x2, y2]];
            c2.pnts = [[x2, y2], [x1, y1]]; 
          } else {
            c2.pnts = [[x1, y1], [x2, y2]];
            c1.pnts = [[x2, y2], [x1, y1]]; 
          }

          c1.ngls.push([Math.PI - Math.atan2(c1.pnts[0][1] - c1.y, c1.x - c1.pnts[0][0]), Math.PI - Math.atan2(c1.pnts[1][1] - c1.y, c1.x - c1.pnts[1][0])]);
          c2.ngls.push([Math.PI - Math.atan2(c2.pnts[0][1] - c2.y, c2.x - c2.pnts[0][0]), Math.PI - Math.atan2(c2.pnts[1][1] - c2.y, c2.x - c2.pnts[1][0])]);

         

          c1.group = c2.group = c1.group || c2.group || grpId++;

        } else { 
          c1.group = c2.group = null;
        }
      }
    }
  };

  for (i = 0; i < circles.length; i++) {
    c = circles[i];
    if (c.ngls.length > 1) {
      c.ngls.sort(function(a, b) { return a[0] - b[0]; }) 
      for (j = 0; j < c.ngls.length; j++) {
        for (k = 0; k < c.ngls.length; k++) {
          if (j !== k) {
            var ng1 = c.ngls[j];
            var ng2 = c.ngls[k];
            if (ng1 && ng2) {
              if (isBetween(ng1[1], ng2[1], ng1[0]) && isBetween(ng1[1], ng2[0], ng1[0])) {
                  c.ngls.splice(k, 1);
                  j = 0;
                  k = 0;
                } 
              if (isBetween(ng1[0], ng2[1], ng1[1]) && !isBetween(ng1[0], ng2[0], ng1[1])) {
                  c.ngls.splice(j, 1, [ng1[0], ng2[1]]);
                  c.ngls.splice(k, 1);
                  k = 0;
                  j = 0;
                }
            }        
          }
        }
      }
    }   
  };
  
  
}

 function updateEntities(dt) {

    updateCircles(circles);

    // Update all the enemies
    for(var i=0; i<enemies.length; i++) {
        enemies[i].pos.x += enemySpeed * dt * enemies[i].direction.x;
        enemies[i].pos.y += enemySpeed * dt * enemies[i].direction.y;
        enemies[i].sprite.update(dt);

        // Remove if offscreen
        if(enemies[i].pos.x < 0 || enemies[i].pos.x > WIDTH || enemies[i].pos.y < 0 || enemies[i].pos.y > HEIGHT  ) {
            enemies.splice(i, 1);
            i--;
        }
    }

    // Update all the explosions
    for(var i=0; i<explosions.length; i++) {
        explosions[i].sprite.update(dt);

        // Remove if animation is done
        if(explosions[i].sprite.done) {
            explosions.splice(i, 1);
            i--;
        }
    }
}

function collidesR(x1, y1, x2, y2, r) {
    return r * r > distance(x1,y1,x2,y2) ;
}

function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
    return collides(pos.x, pos.y,
                    pos.x + size[0], pos.y + size[1],
                    pos2.x, pos2.y,
                    pos2.x + size2[0], pos2.y + size2[1]);
}

function circleCollides(pos, size, pos2, rad) {
    return collidesR(pos.x, pos.y,
                    pos2[0], pos2[1],
                    rad);
}

function destroyEntity(pos, i) {

   // Remove the enemy
        enemies.splice(i, 1);
        // Add an explosion
        explosions.push({
            pos: pos,
            sprite: new Sprite('img/sprites.png',
                               [0, 117],
                               [39, 39],
                               16,
                               [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                               null,
                               true)
        });
}

var checkCollision = {
  circle: function(pos, size, pos2, rad, pnts, i) {
    if(circleCollides(pos, size, pos2, rad)) {
        // Remove the enemy
        if (i !== undefined)
          destroyEntity(pos, i);
        // Add score
        score += pnts;
        return true;
    }
  },
  box: function(pos, size, pos2, size2, pnts, i) {
    if(boxCollides(pos, size, pos2, size2)) {
        // Remove the enemy
        if (i !== undefined)
          destroyEntity(pos, i);
        // Add score
        score += pnts;
        return true;
    }
  }

}

function checkCollisions() {
    var i, j;
    // Run collision detection for all enemies and circles
    for(i=0; i<enemies.length; i++) {
        var pos = enemies[i].pos.sub(enemies[i].center);
        var size = enemies[i].sprite.size;

        for(j=0; j<circles.length; j++) {
            var pos2 = [circles[j].x, circles[j].y];
            var rad = circles[j].r;

            if (checkCollision.circle(pos, size, pos2, rad, 100, i)) {i--; break;}

        }

    //run collision detection for enemies and base
    checkCollision.box(pos, size, base[0].pos.add(new Vector(100,100)), [base[0].sprite.size[0]/4, base[0].sprite.size[1]/4], -1000, i)

    }

    for(i = 0; i<circles.length; i++) {
      var pos = [circles[i].x, circles[i].y];
      var rad = circles[i].r;
      checkCollision.circle(base[0].pos.add(new Vector(100,100)), [base[0].sprite.size[0]/4, base[0].sprite.size[1]/4], pos, rad, -1000)
    }
}

function update(dt) {
    gameTime += dt;

    updateEntities(dt);

    // It gets harder over time by adding enemies using this
    // equation: 1-.993^gameTime
    if(Math.random() < 1 - Math.pow(.993, gameTime)) {
        var t = Math.random() * (HEIGHT*2 + WIDTH*2),
            pos = t < HEIGHT + WIDTH ? t < HEIGHT ? new Vector(t, 0) : new Vector(0, t - WIDTH) : t < HEIGHT*2 + WIDTH ? new Vector(t - HEIGHT*2, HEIGHT) : new Vector(WIDTH, t - WIDTH*2 - HEIGHT),
            direction = (new Vector(WIDTH/2, HEIGHT/2)).sub(pos).normalize(),
            angle = Math.atan(direction.y/direction.x) + (direction.x < 0 ? 0 : Math.PI),
            sprite = new Sprite('img/sprites.png', [0, 78], [80, 39],
                               6, [0, 1, 2, 3, 2, 1]),
            center = new Vector(sprite.size[0] * direction.x / 2, sprite.size[1] * direction.y / 2);
         
        enemies.push({
            pos: pos,
            center: center,
            direction: direction,
            angle: angle,
            sprite: sprite
        });


    }

    checkCollisions();

    scoreEl.text(score);
};

//is b between a and c on a circle going clockwise where (R,0) is 0 degrees
function isBetween(a, b, c) {
  return (b < c && (c < a || a < b)) || (c < a && b > a);
}

function renderCircles(circles) {
  var c, i, j, ngl;
  for (i = 0; i < circles.length; i++) {
    c = circles[i];
    if (c.ngls.length) {
      for (j = 0; j < c.ngls.length; j++) {
        var ng = c.ngls[j],
            ng2 = c.ngls[(j + 1) % c.ngls.length][1];
        drawCircle(c.x, c.y, c.r, ng[0], ng2);  
      }
    } else {
      drawCircle(c.x, c.y, c.r);  
    }
  };
}

function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}

function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos.x, entity.pos.y);
    ctx.rotate(entity.angle);
    entity.sprite.render(ctx);
    ctx.restore();
}

function render() {
  ctx.fillStyle = terrainPattern;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);


  renderEntities(base)
  renderCircles(circles);
  renderEntities(enemies);
  renderEntities(explosions);
}

function drawNextFrame() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;
  clear();

  update(dt);
  render();

  if (score < 0)
    gameOver = true;

  lastTime = now;
  
  if (!isPaused && !gameOver)
    requestAnimationFrame(drawNextFrame);
  else if (!isPaused) scoreEl.text('Game over, noob');
}

function init() {
  $('#canvas').click(onClick);
  posX = $('#canvas').offset().left;
  posY = $('#canvas').offset().top;
  ctx = $('#canvas')[0].getContext("2d");
  scoreEl = $('#score');
  WIDTH = $("#canvas").width()
  HEIGHT = $("#canvas").height()
  frame = new Vector(WIDTH, HEIGHT);
  terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');
  firePattern = ctx.createPattern(resources.get('img/fire.png'), 'repeat');
  base.push({
    pos: new Vector(WIDTH/2 - 110, HEIGHT/2 - 87.5),
    sprite: new Sprite('img/base.gif', [35, 60], [220, 175] )
  });

  lastTime = Date.now();

  requestAnimationFrame(drawNextFrame);
}

function onClick(evt) {
  if (circles.length < 10) {
    var innerClick = false, dist, circle,
        pX = evt.pageX-5-posX, pY = evt.pageY-5-posY; 
    for (var i = 0; i < circles.length; i++) {
       c = circles[i];
       dist = (c.x - pX) * (c.x - pX) + (c.y -  pY) * (c.y -  pY);  
       if (c.r * c.r > dist) {
         if (c.speed < circleSpd/2) c.speed = circleSpd/2; 
         if (c.group) {
            for (var j = 0; j < circles.length; j++) {
                c2 = circles[j];
                if (c2.group === c.group && c2.speed < circleSpd/2)
                   c2.speed = circleSpd/2; 
            }

         }
         innerClick = true;
       }
    }
    if (!innerClick) {
      circle = {x: pX, y: pY, r: 1, speed: circleSpd, acceleration: circleAcc, pnts: [], ngls: [], inner: false}
      circles.push(circle);
      
    }
     
  }
}



function freeze(evt) {
  if (evt.keyCode == 81) {
    isPaused = !isPaused;
    if (!isPaused)
      requestAnimationFrame(drawNextFrame);
  }
}

$(document).keyup(freeze);
 
//$().ready(init);

resources.load([
    'img/sprites.png',
    'img/terrain.png',
    'img/fire.png',
    'img/base.gif'
]);
resources.onReady(init);