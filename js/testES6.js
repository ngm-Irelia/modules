
var list = [
	{
	 fangxiang: "001"	
	},
	{
	 fangxiang: "001"	
	},
	{
	 fangxiang:"002"	
	},
	{
	 fangxiang: "003"	
	}
	
];
var map2 = new Map();

for(var i in list){
    if( map2.has(list[i].fangxiang)){
      map2.set(list[i].fangxiang , map2.get(list[i].fangxiang)+1)
    }else {
		map2.set(list[i].fangxiang , 1)
    }
}
console.log(map2);


class People {
	constructor(x,y) {
	    this.x = x;
			this.y = y;
	}
	toString(){
		console.log("People tostring...");
		return this.x;
	}
}

class Ngm extends People {
  constructor(x,y,z) {
		super(x,y);
		this.z = z;
  }
	
	toString(){
		console.log(super.toString())
		console.log("Ngm tostring...")
	}
}

let ngm = new Ngm(1,2,3);
ngm.toString();
//ngm.hasOwnProperty()

// class Ngm {
//   _count : 0;
//   get value() {
//     console.log('Getting the current value!');
//     return this._count;
//   }
//   increment() {
//     this._count++;
//   }
// }
// let ngm = new Ngm();
//console.log(ngm._count);


/*


var map2 = [];


var list = [
	{
	 fangxiang: "001"	
	},
	{
	 fangxiang: "001"	
	},
	{
	 fangxiang:"002"	
	},
	{
	 fangxiang: "003"	
	}
	
];

function checkjson(name){
	for(var i in map2){  
	  if(  map2[i].name === name){
	    return true;
	  }else {
		return false;
	  }
	}
}
function setjson(name){
	for(var i in map2){  
	  if( map2[i].name === name){
	    map2[i].num ++ ;
	  }
	}
}

  for(var i in list){
    if( map2.length>0 && checkjson( list[i].fangxiang )){
      setjson(list[i].fangxiang);
    }else {
		var newj = {
			name:list[i].fangxiang,
			num:1
		};
        map2.push(newj);
    }
  }
  
  console.log(map2)

*/