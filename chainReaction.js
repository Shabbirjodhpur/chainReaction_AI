
class gameBoard{
	state=[];
	steps=0;
	size;
	domWrapper;
	player_colors=[];
	current_player = 0;
	number_of_players;
	
	constructor(size,number_of_players,domWrapper,gameStatus){
		this.size=size
		this.gameStatus = gameStatus
		this.number_of_players=number_of_players
		this.domWrapper=domWrapper
		//making sizexsize button matrix
		for(let i = 0;i < size;i++) {
			var new_div = document.createElement("div");
			this.state[i]=[];		
			for(let j = 0;j < size;j++) {
				var new_button = document.createElement("button");
				new_button.innerHTML = 0
				new_button.style.backgroundColor = `white`
				new_button.classList.add("button");

				new_button.addEventListener("click",this.button_click);
				new_div.appendChild(new_button);
				this.state[i].push(new node())
			}
			domWrapper.appendChild(new_div);
		}
		this.setColors(this.number_of_players,this.player_colors)
	}
	getRandomDarkColor(){
		let color = "#";
		for (let i = 0; i < 3; i++)
			color += ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2);
		return color;
	}
	setColors(n,player_colors){
		for(let i=0;i<n;i++){
			player_colors[i]=[];
			var randomColor = this.getRandomDarkColor()
			player_colors[i].push(this.newShade(randomColor,100))
			player_colors[i].push(this.newShade(randomColor,50))
			player_colors[i].push(randomColor)
		}
	}
	validChilds(i,j){
		var fourChilds = [
			[i+1,j],
			[i-1,j],
			[i,j+1],
			[i,j-1]
		]
		var valid = []
		for(let k=0;k<fourChilds.length;k++){
			if(this.legalCoordinates(fourChilds[k][0],fourChilds[k][1])) valid.push([fourChilds[k][0],fourChilds[k][1]])
		}
		return valid
	}
	delay(n) {  
		return new Promise(done => {
			setTimeout(() => {
				done();
			}, n);
		});
	}
	async updatePlayer(){
		await this.delay(250)

		this.current_player++;
		this.steps++;
		this.current_player = this.current_player%this.number_of_players;

		if(this.current_player==1 && this.steps>2 && !this.isTerminal()){
			let moveAndValue = minmax(this.state,1,3)

			//console.log({moveAndValue})

			this.input(moveAndValue[0][0],moveAndValue[0][1])
		}
		if(this.current_player==1 && this.steps>2 && this.isTerminal()) this.updateGameStatus()

		if(this.current_player==1 && this.steps<2){
			var possible_moves = this.getAllPossibleMoves(this.state,1)

			var random = this.getRandom(0,possible_moves.length-1)

			this.input(possible_moves[random][0],possible_moves[random][0])
		}
	}
	getRandom(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	getPlayer(){
		return this.current_player;
	}
	legalCoordinates(i,j){
		if(i <= -1 || i >= this.size || j <= -1 || j >= this.size) return false;
		return true;
	}
	getNodeCapacity(i,j){
		//corner piece
		if((i == 0 || i == this.size-1) && (j == 0 || j == this.size-1)) return 1;
		//edge piece
		if(i == 0 || i==this.size-1 || j==0 || j==this.size-1) return 2;
		//core piece
		return 3;
	}
	getWinningPlayer(state=this.state){
		var player_nodes = [];
		for(let i=0;i<this.number_of_players;i++) player_nodes.push(0)

		for(let i=0;i<state.length;i++){
			for(let j=0;j<state.length;j++){
				if(state[i][j].nodePlayer != -1) player_nodes[state[i][j].nodePlayer]++;
			}
		}
		var winning_player=-1;
		for(let i=0;i<this.number_of_players;i++){
			if(player_nodes[i]!=0 && winning_player==-1){
				winning_player=i;
			}else if(player_nodes[i]!=0 && winning_player!=-1) return false
		}
		return winning_player
	}
	isTerminal(state=this.state){
		var player_nodes = [];
		for(let i=0;i<this.number_of_players;i++) player_nodes.push(0)

		for(let i=0;i<state.length;i++){
			for(let j=0;j<state.length;j++){
				if(state[i][j].nodePlayer != -1) player_nodes[state[i][j].nodePlayer]++;
			}
		}
		var winning_player=-1;
		for(let i=0;i<this.number_of_players;i++){
			if(player_nodes[i]!=0 && winning_player==-1){
				winning_player=i;
			}else if(player_nodes[i]!=0 && winning_player!=-1) return false
		}
		//return winning_player
		return true
	}
	updateDomNode(i,j){
		var node = this.getDomNodeFromCoordinate(i,j)
		node.innerHTML=`${this.state[i][j].nodeCount}`

		//styling dom node
		if(this.state[i][j].nodeCount<4 && this.state[i][j].nodeCount>0){
			node.style.backgroundColor = `${this.player_colors[this.state[i][j].nodePlayer][this.state[i][j].nodeCount-1]}`
		}else{
			node.style.backgroundColor = `white`
		}
	}
	getDomNodeFromCoordinate(i,j){
		var node = this.domWrapper.childNodes[i].childNodes[j];
		return node;
	}
	getCoordinatesFromDomNode(domNode){
		var j=0;
		var i=0;

		var tempNode = domNode

		while(tempNode.previousElementSibling!=null){
			tempNode = tempNode.previousElementSibling
			j++
		}
		
		tempNode = domNode.parentElement
		while(tempNode.previousElementSibling!=null){
			tempNode = tempNode.previousElementSibling
			i++
		}
		return[i,j]
	}
	input(i,j){
		var player = this.getPlayer()
		if(this.state[i][j].nodePlayer==-1){
			this.state[i][j].nodePlayer = player
			this.state[i][j].nodeCount++
			this.updateDomNode(i,j)
			this.updatePlayer()
		}else if(this.state[i][j].nodePlayer == player){
			this.state[i][j].nodeCount++
			this.updateDomNode(i,j)
			var queue = new modelQueue()
			queue.push(i,j)
			while(!queue.isEmpty()){
				var coordinate = queue.pop();
				var x = coordinate[0]
				var y = coordinate[1]
				if(this.state[x][y].nodeCount > this.getNodeCapacity(x,y)){
					this.state[x][y].nodeCount=0
					var parentPlayer = this.state[x][y].nodePlayer
					this.state[x][y].nodePlayer=-1
					this.updateDomNode(x,y)					
	
					let childs = this.validChilds(x,y)
					for(let c=0;c<childs.length;c++){
						this.state[childs[c][0]][childs[c][1]].nodePlayer = parentPlayer
						this.state[childs[c][0]][childs[c][1]].nodeCount++
						this.updateDomNode(childs[c][0],childs[c][1])

						queue.push(childs[c][0],childs[c][1])
					}
				}
			}
			this.updatePlayer()
		}
	}
	updateGameStatus(){
		this.gameStatus.innerHTML = this.getWinningPlayer(this.state)==1?'AI outsmarted you!<p>Wanna give it another try?? Come on lets teach this AI a lesson!!</p>':'You outsmarted AI.<p>Thats the spirit, come lets beat it again!</p>'
	}
	button_click(){
		var coordinate = chainReaction.getCoordinatesFromDomNode(this)
		if(chainReaction.steps>2 && chainReaction.isTerminal()){
			chainReaction.updateGameStatus()
			return true;
		}
		chainReaction.input(coordinate[0],coordinate[1])
	}

	pseudo_input(move,s,player){
		var i =move[0]
		var j =move[1]
		var state = JSON.parse(JSON.stringify(s))
		if(state[i][j].nodePlayer==-1){
			state[i][j].nodePlayer = player
			state[i][j].nodeCount++
		}else if(state[i][j].nodePlayer == player){
			state[i][j].nodeCount++
			var queue = new modelQueue()
			queue.push(i,j)
			while(!queue.isEmpty()){
				var coordinate = queue.pop();
				var x = coordinate[0]
				var y = coordinate[1]
				if(state[x][y].nodeCount > this.getNodeCapacity(x,y)){
					state[x][y].nodeCount=0
					var parentPlayer = state[x][y].nodePlayer
					state[x][y].nodePlayer=-1
					
					let childs = this.validChilds(x,y)
					for(let c=0;c<childs.length;c++){
						state[childs[c][0]][childs[c][1]].nodePlayer = parentPlayer
						state[childs[c][0]][childs[c][1]].nodeCount++
						queue.push(childs[c][0],childs[c][1])
					}
				}
			}
		}
		return state
	}
	value(state,player){
		var one=0
		var two=0
		var three=0
		for(let i=0;i<this.size;i++){
			for(let j=0;j<this.size;j++){
				if(state[i][j].nodePlayer==player){
					if(state[i][j].nodeCount==1){ one++}
					else if(state[i][j].nodeCount==2){ two++}
					else if(state[i][j].nodeCount==3){ three++}
					else{}
				}
			}
		}
		return (10*one)+(20*two)+(10*three)
	}
	getAllPossibleMoves(state,player){
		var possibleMoves = [];
		for(let i=0;i<this.size;i++){
			for(let j=0;j<this.size;j++){
				if(state[i][j].nodePlayer==player) possibleMoves.push([i,j])
				if(state[i][j].nodePlayer==-1) possibleMoves.push([i,j])
			}
		}
		return possibleMoves
	}
	newShade(hexColor, magnitude){
		hexColor = hexColor.replace(`#`, ``);
		if (hexColor.length === 6) {
			const decimalColor = parseInt(hexColor, 16);
			let r = (decimalColor >> 16) + magnitude;
			r > 255 && (r = 255);
			r < 0 && (r = 0);
			let g = (decimalColor & 0x0000ff) + magnitude;
			g > 255 && (g = 255);
			g < 0 && (g = 0);
			let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
			b > 255 && (b = 255);
			b < 0 && (b = 0);
			return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
		} else {
			return hexColor;
		}
	}			
}
chainReaction = new gameBoard(5,2,document.getElementById('body'),document.getElementById('game-status'))
