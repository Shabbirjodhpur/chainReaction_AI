
function minmax(state,AI,depth){
	//console.log(1)
	if(chainReaction.isTerminal()){
		if(chainReaction.getWinningPlayer()==1){ return [[-1,-1],10000] }
		else{return [[-1,-1],-10000] }
	}
	if(depth==0) return [[-1,-1],chainReaction.value(state,1)];
	if(AI){
		var possible_moves = chainReaction.getAllPossibleMoves(state,AI)
		var max = -1000;
		var max_move;
		for(let i=0;i<possible_moves.length;i++){
			var after_state = chainReaction.pseudo_input(possible_moves[i],state,AI)
			var moveAndValue = minmax(after_state,!AI,depth-1)

			var value = moveAndValue[1]
			if(value>max){
				max=value
				max_move = possible_moves[i]
			}
		}
		return [max_move,value]
	}else{
		var possible_moves = chainReaction.getAllPossibleMoves(state,AI)
		var min = 1000;
		var min_move;
		for(let i=0;i<possible_moves.length;i++){
			var after_state = chainReaction.pseudo_input(possible_moves[i],state,AI)
			var moveAndValue = minmax(state,!AI,depth-1)
			
			var value = moveAndValue[1]
			if(value<min){
				min=value
				min_move = possible_moves[i]
			}
		}
		return [min_move,value]
	}

}




