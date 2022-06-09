class node{
	nodePlayer=-1;
	nodeCount=0;
}
class modelQueue{
	arr=[];
	push(i,j){
		this.arr.push([i,j])
	}
	pop(){
		return this.arr.shift()
	}
	isEmpty(){
		if(this.arr.length>0) return false
		return true
	}
}


