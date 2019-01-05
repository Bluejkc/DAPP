
var holdArr = [0,0,0,0,0];
var cardsOnHand = [0,0,0,0,0];
var CORE_SYMBOL = "EOS"; //EOS
var MAX_BET = 5;
var cardsDrawn = false;
var currentBet = 0.2;
var walletBalance = 0;
var numBets = "1";
var pauseHold = true;
var currentDouble = 0;

var currentHoldCards;
var currentBetAmount;
var currentFinalCards;
var currentWinAmount;
var currentWinType;
var totalGameWin; 
var drawing = false;
var dealing = false;
var doubling = false;
var cardInterval = new Array();

$(document).ready(function() {
	for (let i=0; i<5; i++) {
		$("#carddiv"+i).flip({axis:'x', trigger:'manual'});
	}
	let currentLoc = location.protocol + "//" + location.host + window.location.pathname.substr(0,window.location.pathname.lastIndexOf("/"));
	preload(
		currentLoc+"/images/back.fw.png",
		currentLoc+"/images/mh1.fw.png",
		currentLoc+"/images/mh2.fw.png",
		currentLoc+"/images/mh3.fw.png",
		currentLoc+"/images/mh4.fw.png",
		currentLoc+"/images/mh5.fw.png",
		currentLoc+"/images/mh6.fw.png",
		currentLoc+"/images/mh7.fw.png",
		currentLoc+"/images/mh8.fw.png",
		currentLoc+"/images/mh9.fw.png",
		currentLoc+"/images/mh10.fw.png",
		currentLoc+"/images/mh11.fw.png",
		currentLoc+"/images/mh12.fw.png",
		currentLoc+"/images/mh13.fw.png",
		currentLoc+"/images/fk1.fw.png",
		currentLoc+"/images/fk2.fw.png",
		currentLoc+"/images/fk3.fw.png",
		currentLoc+"/images/fk4.fw.png",
		currentLoc+"/images/fk5.fw.png",
		currentLoc+"/images/fk6.fw.png",
		currentLoc+"/images/fk7.fw.png",
		currentLoc+"/images/fk8.fw.png",
		currentLoc+"/images/fk9.fw.png",
		currentLoc+"/images/fk10.fw.png",
		currentLoc+"/images/fk11.fw.png",
		currentLoc+"/images/fk12.fw.png",
		currentLoc+"/images/fk13.fw.png",
		currentLoc+"/images/hx1.fw.png",
		currentLoc+"/images/hx2.fw.png",
		currentLoc+"/images/hx3.fw.png",
		currentLoc+"/images/hx4.fw.png",
		currentLoc+"/images/hx5.fw.png",
		currentLoc+"/images/hx6.fw.png",
		currentLoc+"/images/hx7.fw.png",
		currentLoc+"/images/hx8.fw.png",
		currentLoc+"/images/hx9.fw.png",
		currentLoc+"/images/hx10.fw.png",
		currentLoc+"/images/hx11.fw.png",
		currentLoc+"/images/hx12.fw.png",
		currentLoc+"/images/hx13.fw.png",
		currentLoc+"/images/ht1.fw.png",
		currentLoc+"/images/ht2.fw.png",
		currentLoc+"/images/ht3.fw.png",
		currentLoc+"/images/ht4.fw.png",
		currentLoc+"/images/ht5.fw.png",
		currentLoc+"/images/ht6.fw.png",
		currentLoc+"/images/ht7.fw.png",
		currentLoc+"/images/ht8.fw.png",
		currentLoc+"/images/ht9.fw.png",
		currentLoc+"/images/ht10.fw.png",
		currentLoc+"/images/ht11.fw.png",
		currentLoc+"/images/ht12.fw.png",
		currentLoc+"/images/ht13.fw.png"
	)
});

var images = new Array()
function preload() {
	for (i = 0; i < preload.arguments.length; i++) {
		images[i] = new Image()
		images[i].src = preload.arguments[i]
	}
}


document.addEventListener('scatterLoaded', scatterExtension => {
    
		const scatter = window.scatter
		window.scatter = null
		
		//Scatter detected
		$("#check-scatter").html("Checking scatter...");
				
		let checkJackpot = () => {
			eos.getTableRows({
				code: 'vpoker.code',
				scope: 'vpoker.code',
				table: "jackpot",
				json: true
			}).then(data => {				
				if (data.rows.length>0) {
					//console.log(data.rows[0]);
					$("#jackpot").html(data.rows[0].jackpotAmt / 10000 + " EOS*");
				}
			}).catch(e => {
				console.error(e);
				$("#jackpot").html("loading");
			});
		}
		
		let updateBalance = () => {
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
			eos.getCurrencyBalance('eosio.token', account.name, CORE_SYMBOL)
				.then(result => {
					//console.log(result);
					$("#wallet-eos").show();
					$("#eos-in-wallet").html(result);
					if (result == "") {
						$("#eos-in-wallet").html("0");
					}
					var balance = result+"";
					balance = balance.substring(0,balance.indexOf(CORE_SYMBOL));								
					if ((result == "")){										
						walletBalance = 0;
					} else {
						walletBalance = balance;
					}
				}).catch(error => {
					console.error(error)
				});
		}
		
		let checkUnfinishedGame = () => {
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
			eos.getTableRows({
				code: 'vpoker.code',
				scope: account.name,
				table: "playergame",
				json: true
			}).then(data => {				
				if ((data.rows.length>0) && (data.rows[0].finalCards.length==0)) {
					//console.log(data.rows[0]);
					cardsDrawn = true;
					toggleInput(false);
					totalGameWin = 0;
					$("#deal-btn").hide();					
					$("#draw-btn").show();
					$("#total-bet").html(((data.rows[0].betAmount[0]/10000)*data.rows[0].betAmount.length).toFixed(4));
					$("#total-win").html("0");
					
					$("#message").html("Click on card to hold/unhold.");
					showHint(data.rows[0].dealtCards);
					
					for (let i=0; i<5; i++) {
						stopRotateShow(i, data.rows[0].dealtCards[i]);
						//$("#card"+i).attr("src","images/"+data.rows[0].dealtCards[i]+".png");
						cardsOnHand[i] = data.rows[0].dealtCards[i];
					}
										
					$("#numhands").val(data.rows[0].betAmount.length);
					$("#currentbet").val(data.rows[0].betAmount[0]/10000);
					updateBet();
					setNumHands();
					
					pauseHold = false;
				} else {
					$("#message").html("Click DEAL to start game.");
				}
			}).catch(e => {
				console.error(e);
				$("#deal-btn").prop("disabled",false);
			});
		}
		
		let dealcards = () => {
			if (walletBalance<currentBet*numBets) {
				$("#message").html("Not enough EOS to play");
				return;
			}
			if (dealing) {
				return;
			}			
			dealing = true;
			$("#deal-btn").addClass("play-btn-disabled");
			toggleInput(false);
			stopRotateReset();
			resetCards();
			
			$("#total-bet").html((currentBet*numBets).toFixed(4));
			$("#total-win").html("0");
			
			for (let i=0; i<5; i++) {
				animateRotate(i);
			}
			
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
			//console.log(account);
			const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
			
			eos.transfer(account.name, 'vpoker.code', (currentBet*numBets).toFixed(4)+" "+CORE_SYMBOL, numBets+" hands", transactionOptions).then(trx => {            
				//console.log(`Transaction ID: ${trx.transaction_id}`);
				//console.log(`Transaction ID: ${JSON.stringify(trx)}`);
				cardsDrawn = true;
				totalGameWin = 0;
				eos.getTableRows({
					code: 'vpoker.code',
					scope: account.name,
					table: "playergame",
					json: true
				}).then(data => {
					checkJackpot();
					
					updateBalance();
					
					//console.log(data.rows[0]);
					dealing = false;
					$("#deal-btn").removeClass("play-btn-disabled");
					$("#deal-btn").hide();
					$("#draw-btn").show();
					
					$("#message").html("Click on card to hold/unhold.");
					showHint(data.rows[0].dealtCards);
					
					for (let i=0; i<5; i++) {
						stopRotateShow(i, data.rows[0].dealtCards[i]);
						//$("#card"+i).attr("src","images/"+data.rows[0].dealtCards[i]+".png");
						cardsOnHand[i] = data.rows[0].dealtCards[i];
					}
					$(".card-img").addClass("not-held");
					pauseHold = false;					
				}).catch(e => {
					console.error(e);
					dealing = false;
					for (let i=0; i<5; i++) {
						stopRotateReset(i);
					}
					$("#deal-btn").removeClass("play-btn-disabled");
					toggleInput(true);
				});
			}).catch(error => {
				console.error(error);
				alert(JSON.parse(error).error.details[0].message);
				dealing = false;
				for (let i=0; i<5; i++) {
					stopRotateReset(i);
				}
				$("#deal-btn").removeClass("play-btn-disabled");
				toggleInput(true);
			});	
		}
		
		
		let drawcards = () => {
			if (drawing) {
				return;
			}
			drawing = true;
			$("#draw-btn").addClass("play-btn-disabled");
			pauseHold = true;
			
			$("#message").html("");
			
			currentHoldCards = holdArr;
			
			for (let i=0; i<5; i++) {
				if (holdArr[i]!=1) {
					animateRotate(i);
					$("#card"+i).attr("src","images/back_down.png");
				}
			}
			
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')			
			const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
				
			eos.transaction({
				actions: [
				  {
					account: "vpoker.code",
					name: "drawcards",
					authorization: [
					  {
						actor: account.name,
						permission: account.authority
					  }
					],
					data: {
					  account: account.name,
					  cards_choice: holdArr
					}
				  }
				]
			  })
			  .then(trx => {
					//console.log(`Transaction ID: ${JSON.stringify(trx)}`);
					$(".card-img").removeClass("not-held");
					cardsDrawn = false;
					eos.getTableRows({
						code: 'vpoker.code',
						scope: account.name,
						table: "playergame",
						json: true
					}).then(data => {					
						//console.log(data.rows[0]);
						
						//$("#deal-btn").prop("disabled",false);
						
						//$("#gameover").show();
						
						checkJackpot();
						
						currentBetAmount = data.rows[0].betAmount;
						currentFinalCards = data.rows[0].finalCards;
						currentWinAmount = data.rows[0].winAmount;
						currentWinType = data.rows[0].winType;
						totalGameWin = data.rows[0].canDoubleAmount/10000;
						animateResults();
						/*
						for (var j=0; j<data.rows[0].betAmount.length; j++){
							for (var i=0; i<5; i++) {
								$("#card"+i).attr("src","images/"+data.rows[0].finalCards[i+(j*5)]+".png");
								cardsOnHand[i] = data.rows[0].finalCards[i+(j*5)];
							}
							if (data.rows[0].winAmount[j] > 0) {
								//setTimeout(function(){
									$("#message").html("You won "+data.rows[0].winAmount[j]/10000+" EOS");
								//}, 500);
							}
						}
						*/
						
					}).catch(e => {
						console.error(e);
						drawing = false;
						$("#draw-btn").removeClass("play-btn-disabled");
						$("#message").html("Click on card to hold/unhold.");
					});
			  }).catch(error => {
				  console.error(error);
				  alert(JSON.parse(error).error.details[0].message);
				  drawing = false;
				  $("#draw-btn").removeClass("play-btn-disabled");
				  $("#message").html("Click on card to hold/unhold.");
				  for (let i=0; i<5; i++) {
					  if (holdArr[i]!=1) {
						stopRotateShow(i, cardsOnHand[i]);
						//$("#card"+i).attr("src","images/"+cardsOnHand[i]+".png");
					  }
				  }
			  });
		}
		
		let animateResults = () => {
			
			for (let j=0; j<currentBetAmount.length; j++){
				
				if (j==(currentBetAmount.length-1)){
					setTimeout(showCards, 3000*j, j, true);
					setTimeout(function(){if (totalGameWin > 0) {
											$("#goto-double-up-btn").show();
										};
										toggleInput(true);
										$("#draw-btn").hide();
										drawing = false;
										$("#draw-btn").removeClass("play-btn-disabled");
										$("#deal-btn").show();
								}, 3000*j);
					
					const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')			
					const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
										
					setTimeout(function(){						
							updateBalance();
						}, (3000*j)+1000);
					
				} else {
					setTimeout(showCards, 3000*j, j, false);
				}
			}
		}
		
		let showGame = () => {
			resetCards();
			$(".control-btn").hide();
			$("#deal-btn").show();
			$("#message").html("Click DEAL to start game.");
		}
		
		let showDoubleUp = () => {
			if (walletBalance<totalGameWin) {
				$("#message").html("Not enough EOS to play");
				return;
			}
			resetCards();
			
			currentDouble = 0;
			
			$(".card-img").removeClass("not-held");
			
			$("#goto-double-up-btn").hide();
			$("#show-double-up-btn").show();
			
			$("#claim-btn").show();
			
			$("#double-up-title").show();
			
			$("#card0").attr("src","images/33.png");
			
			$("#message").html("You won "+totalGameWin+" EOS. Double up to win "+totalGameWin*2+" EOS");
		}
		
		
		let doubleUp = () => {
			if (walletBalance<totalGameWin) {
				$("#message").html("Not enough EOS to play");
				return;
			}
			if (doubling) {
				return;
			}
			doubling = true;
			animateRotate(currentDouble+1);
			$("#show-double-up-btn").addClass("play-btn-disabled");
			
			if (currentDouble!=0) {
				$("#card"+currentDouble).addClass("not-current-double");
			}
						
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
			//console.log(account);
			const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
			
			eos.transfer(account.name, 'vpoker.code', (totalGameWin).toFixed(4)+" "+CORE_SYMBOL, "double up", transactionOptions).then(trx => {
				//console.log(`Transaction ID: ${trx.transaction_id}`);
				//console.log(`Transaction ID: ${JSON.stringify(trx)}`);
				//cardsDrawn = true;
				eos.getTableRows({
					code: 'vpoker.code',
					scope: account.name,
					table: "playergame",
					json: true
				}).then(data => {
					
					for (let i=0; i<data.rows[0].doubleupCards.length; i++) {
						if (i == currentDouble) {							
							stopRotateShow(i+1, data.rows[0].doubleupCards[i]);
							$("#card"+(i+1)).removeClass("not-current-double");
						} else {
							$("#card"+(i+1)).attr("src","images/"+data.rows[0].doubleupCards[i]+".png");
						}
						//cardsOnHand[i] = data.rows[0].dealtCards[i];
					}
					currentDouble =data.rows[0].doubleupCards.length;
					
					doubling = false;
					
					if (data.rows[0].canDoubleAmount>0) {						
						$("#show-double-up-btn").removeClass("play-btn-disabled");
						totalGameWin = data.rows[0].canDoubleAmount/10000;
						$("#message").html("You won "+totalGameWin+" EOS. Double up to win "+totalGameWin*2+" EOS");
						$("#total-win").html(totalGameWin.toFixed(4));
					} else {
						$("#show-double-up-btn").hide();
						$("#claim-btn").hide();
						$("#deal-btn").show();
						$("#show-double-up-btn").removeClass("play-btn-disabled");
						if (data.rows[0].doubleupCards.length ==4) {
							if (getRank(data.rows[0].doubleupCards[3]) > 8) {
								$("#message").html("Well Done! You reached the max of Double Up!");
								$("#total-win").html((totalGameWin*2).toFixed(4));
							} else {
								$("#message").html("Better luck next time.");
								$("#total-win").html("0");
							}
						} else {
							$("#message").html("Better luck next time.");
							$("#total-win").html("0");
						}
					}
					
					checkJackpot();
					
					setTimeout(function(){
						updateBalance();
					}, 500);
					
				}).catch(e => {
					console.error(e);
					doubling = false;
					$("#show-double-up-btn").removeClass("play-btn-disabled");
				});
			}).catch(error => {
				console.error(error);
				alert(JSON.parse(error).error.details[0].message);
				doubling = false;
				$("#show-double-up-btn").removeClass("play-btn-disabled");
			});	
		}
		
		
		let setIdentity = (identity) => {
			//console.log(identity, "identityFound")
			$("#check-scatter").html("Welcome "+identity.name);
			$("#login").hide();
			$(".controls-dialog").fadeIn(1000);
			$("#deal-btn").fadeIn(1000);
			
			const account = scatter.identity.accounts.find(account => account.blockchain === 'eos')
			const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };				
			updateBalance();
			
			$("#deal-btn").on("click", dealcards);
			$("#draw-btn").on("click", drawcards);
			
			$("#goto-double-up-btn").on("click", showDoubleUp);
			$("#show-double-up-btn").on("click", doubleUp);
			$("#claim-btn").on("click", showGame);
							
			checkUnfinishedGame();
			
			checkJackpot();
			
			$("#deal-btn").show();
		}
		
		
		const network = {
			blockchain:'eos',
			host:'178.128.121.116',
			port:8888,
			protocol:'http',
			chainId:'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
		}
				
		const eosOptions = {}

		const eos = scatter.eos( network, Eos, eosOptions, 'http' )
		
		const requiredFields = { accounts:[network] };
				
		let getIdentity = () => {			
			scatter.getIdentity(requiredFields).then(identity => {
				setIdentity(identity);
				
			}).catch(error => {
				console.log(error, "User denied!")
				// User "Deny" action
			})
		}
		
		//No need to login if already did
		if(scatter.identity!=null) {
			setIdentity(scatter.identity);
		} else {
			$("#check-scatter").html("Please login");
			$("#login").on("click", function(){ getIdentity(); });
			$("#login").show();
		}
		
})

var animateRotate = (cardNum) => {
	$("#card"+cardNum).removeClass("not-held");
	
	$("#carddiv"+cardNum).flip('toggle');	
	
	clearInterval(cardInterval[cardNum]);
	cardInterval[cardNum] = setInterval(function(){$("#carddiv"+cardNum).flip('toggle');}, 600);	
}

var stopRotateReset = (cardNum) => {
	clearInterval(cardInterval[cardNum]);
	
	$("#card"+cardNum).attr("src","images/back_down.png"); 
	
	$("#carddiv"+cardNum).flip(false);
	
	$("#card"+cardNum).addClass("not-held");
}

var stopRotateShow = (cardNum, cardId) => {
	clearInterval(cardInterval[cardNum]); 
	
	$("#card"+cardNum).attr("src","images/"+cardId+".png"); 
	
	$("#carddiv"+cardNum).flip(true);
	
	$("#card"+cardNum).addClass("not-held");
}

var showHint = (hand) => {
	var hasWin = matchwin(hand);
	if (hasWin >= 0){
		var displayStr = " (hint: Jacks or Better)";
		if (hasWin==1){
			displayStr = " (hint: Two pairs)";
		} else if (hasWin==2){
			displayStr = " (hint: Three of a kind)";
		} else if (hasWin==3){
			displayStr = " (hint: Straight)";
		} else if (hasWin==4){
			displayStr = " (hint: Flush)";
		} else if (hasWin==5){
			displayStr = " (hint: Full house)";
		} else if (hasWin==6){
			displayStr = " (hint: Four of a kind)";
		} else if (hasWin==7){
			displayStr = " (hint: Straight Flush)";
		} else if (hasWin==8){
			displayStr = " (hint: Royal Flush)";
		}
		$("#message").html($("#message").html()+displayStr);
	}
}

var showCards = (j, finalHand) => {
	for (let i=0; i<5; i++) {
		if (holdArr[i]!=1) {
			stopRotateShow(i, currentFinalCards[i+(j*5)]);
			//$("#card"+i).attr("src","images/"+currentFinalCards[i+(j*5)]+".png");
			$(".card-img").removeClass("not-held");
		}
		cardsOnHand[i] = currentFinalCards[i+(j*5)];
	}
	if (currentWinAmount[j] > 0) {
		var displayStr = "<span>Jacks or Better! ";
		if (currentWinType[j]==1){
			displayStr = "<span>Two pairs! ";
		} else if (currentWinType[j]==2){
			displayStr = "<span>Three of a kind! ";
		} else if (currentWinType[j]==3){
			displayStr = "<span class='payout-third'>Straight! ";
		} else if (currentWinType[j]==4){
			displayStr = "<span class='payout-third'>Flush! ";
		} else if (currentWinType[j]==5){
			displayStr = "<span class='payout-third'>Full house! ";
		} else if (currentWinType[j]==6){
			displayStr = "<span class='payout-second'>Four of a kind!! ";
		} else if (currentWinType[j]==7){
			displayStr = "<span class='payout-second'>Straight Flush!!! ";
		} else if (currentWinType[j]==8){
			displayStr = "<span class='payout-first'>Royal Flush!!!! ";
		}
		
		$("#message").html(displayStr+"You won "+currentWinAmount[j]/10000+" EOS.</span>");
		$("#total-win").html((Number($("#total-win").html())+((currentWinAmount[j])/10000)).toFixed(4));
	} else {
		$("#message").html("Oops!");
	}
	
	if (!finalHand){
		setTimeout(function(){ 
			for (let i=0; i<5; i++) {
				if (currentHoldCards[i]!=1) {					
					animateRotate(i);
					$("#card"+i).attr("src","images/back_down.png");
				}
			}
			$("#message").html("");
		  }, 2500);
	} else {
		$("#deal-btn").prop("disabled",false);
		//$("#gameover").show();
		//$("#message").html($("#message").html()+" Bet round has ended.");
		if (totalGameWin > 0) {			
			$("#message").html($("#message").html()+" (Total win is "+totalGameWin+" EOS. Double up to win "+totalGameWin*2+" EOS)");
		} else {
			$("#message").html("Better luck next time.");
		}
	}
}

var holdCard = (cardNo) => {
	if (!pauseHold){
		if (cardsDrawn) {
			if (holdArr[cardNo] == 1){
				holdArr[cardNo] = 0;
				$("#card"+cardNo).addClass("not-held");
				$("#card-hold-"+cardNo).css("opacity", 0);
			} else if (holdArr[cardNo] == 0){
				holdArr[cardNo] = 1;
				$("#card"+cardNo).removeClass("not-held");
				$("#card-hold-"+cardNo).css("opacity", 100);
			}
		}
	}
}

var toggleInput = (enable) => {
	if (enable) {
		$("#numhands").prop("disabled", false);
		$("#currentbet").prop("disabled", false);
	} else {
		$("#numhands").prop("disabled", true);
		$("#currentbet").prop("disabled", true);
	}
}

var resetCards = () => {
	$("#show-double-up-btn").hide();
	$("#goto-double-up-btn").hide();
	$("#message").html("");
	//$("#gameover").hide();
	updateBet();
	setNumHands();
	
	holdArr = [0,0,0,0,0];
	cardsOnHand = [0,0,0,0,0];
	for (let i=0; i<5; i++) {
		$("#card"+i).attr("src","images/back_down.png");
		$("#card"+i).addClass("not-held");
		$("#card"+i).removeClass("not-current-double");
	}
	$(".hold-display").css("opacity", 0);;
	pauseHold = true;
}

var updateBet = () => {
	currentBet = $("#currentbet").val();
}

var setNumHands = () => {
	numBets = $("#numhands").val();
}

var getRank = (card) => {
	var returnRank = ((card+1)%13);
	if (returnRank==0){ //K
		returnRank=13;
	}
	return returnRank;
}

var getsuit = (card) => {
	var returnChar;
	var suit = Math.floor(card/13);
	if (suit==0) {
		returnChar='C';
	} else if (suit==1) {
		returnChar='D';
	} else if (suit==2) {
		returnChar='H';
	} else {
		returnChar='S';
	}
	return returnChar;
}

var isroyal = (cardranks) => {
	return (cardranks[0]==1&&cardranks[1]==10&&cardranks[2]==11&&cardranks[3]==12&&cardranks[4]==13);
}

var isfourkind = (cardranks) => {
	return (cardranks[0] == cardranks[3] || cardranks[1] == cardranks[4]);
}

var isfullhouse = (cardranks) => {
	return ((cardranks[0] == cardranks[1] && cardranks[2] == cardranks[4]) || (cardranks[0] == cardranks[2] && cardranks[3] == cardranks[4]));
}

var isflush = (cardsuits) => {
	return (cardsuits[0]==cardsuits[1] && cardsuits[0]==cardsuits[2] && cardsuits[0]==cardsuits[3] && cardsuits[0]==cardsuits[4]);	
}

var isstraight = (cardranks) => {
	if (isroyal(cardranks)) {
		return true;
	}
	for (var i = 0; i<cardranks.length-1; i++) {
		if (cardranks[i] != (cardranks[i+1]-1)) {
			return false;
		}
	}
	return true;
}

var isthreekind = (cardranks) => {
	return (cardranks[0] == cardranks[2] || cardranks[1] == cardranks[3] || cardranks[2] == cardranks[4]);
}

var istwopair = (cardranks) => {
	return ((cardranks[0] == cardranks[1] && (cardranks[2] == cardranks[3] || cardranks[3] == cardranks[4])) || //cards are sorted so no need to check 2 against 4
				(cardranks[1] == cardranks[2] && cardranks[3] == cardranks[4]));	
}

var isjacks = (cardranks) => {
	for (var i = 0; i<cardranks.length-1; i++) {
		if (((cardranks[i]==1) || (cardranks[i]==11) || (cardranks[i]==12) || (cardranks[i]==13)) &&
			(cardranks[i] == cardranks[i+1])) { //should always be the following card if matches since sorted
				return true;
			}
	}
	return false;
}

function sortNumber(a,b) {
    return a - b;
}

var matchwin = (finalCards) => {
	var cardsuits = [getsuit(finalCards[0]), getsuit(finalCards[1]), getsuit(finalCards[2]), getsuit(finalCards[3]), getsuit(finalCards[4])];
	var cardranks = [getRank(finalCards[0]), getRank(finalCards[1]), getRank(finalCards[2]), getRank(finalCards[3]), getRank(finalCards[4])];
	cardranks.sort(sortNumber);
		
	if (isflush(cardsuits) && isroyal(cardranks)){
		return 8;
	} else if (isstraight(cardranks) && isflush(cardsuits)){
		return 7;
	} else if (isfourkind(cardranks)){
		return 6;
	} else if (isfullhouse(cardranks)){
		return 5;
	} else if (isflush(cardsuits)){
		return 4;
	} else if (isstraight(cardranks)){
		return 3;
	} else if (isthreekind(cardranks)){
		return 2;
	} else if (istwopair(cardranks)){
		return 1;
	} else if (isjacks(cardranks)){
		return 0;
	} 
	
	return -1; //nowins
}





// 内容背景
function bgaction(){
	var bgTop = document.querySelector(".bg-top");
	var bgAction = document.querySelector(".bgaction");
	var bgHeight = bgTop.style.height+"px";
	bgAction.style.height = bgHeight;

}
bgaction();


// 内容按钮
function btnTop(){
	var btnOn = document.querySelector(".btnOn");
	var btnOff = document.querySelector(".btnOff");
	btnOn.onclick = function(){
		btnOn.style.display = "none";
		btnOff.style.display = "block";
	}
	btnOff.onclick = function(){
		btnOn.style.display = "block";
		btnOff.style.display = "none";
	}

	var btnA = document.querySelector(".btnA");
	var btnL = document.querySelector(".btnL");
	btnA.onclick = function(){
		btnA.style.display = "none";
		btnL.style.display = "block";
	}
	btnL.onclick = function(){
		btnA.style.display = "block";
		btnL.style.display = "none";
	}
}
btnTop();


// 圆盘按钮
function btnRedius(){
	//deal按钮
	var dealA = document.querySelector(".ab4").children[0];
	var dealL = document.querySelector(".ab4").children[1];
	dealA.onclick = function(){
		dealA.style.display = "none";
		dealL.style.display = "block";
	}
	dealL.onclick = function(){
		dealA.style.display = "block";
		dealL.style.display = "none";
	}

	// drwa按钮
	var drwaA = document.querySelector(".ab5").children[0];
	var drwaL = document.querySelector(".ab5").children[1];
	drwaA.onclick = function(){
		drwaA.style.display = "none";
		drwaL.style.display = "block";
	}
	drwaL.onclick = function(){
		drwaA.style.display = "block";
		drwaL.style.display = "none";
	}

	//double按钮
	var doubleA = document.querySelector(".ab6").children[0];
	var doubleL = document.querySelector(".ab6").children[1];
	doubleA.onclick = function(){
		doubleA.style.display = "none";
		doubleL.style.display = "block";
	}
	doubleL.onclick = function(){
		doubleA.style.display = "block";
		doubleL.style.display = "none";
	}
}
btnRedius();


//BET AMOUNT 选择数量  /HAND
function betNum(){
	let ab1Li = document.querySelectorAll(".ab1Ul li");
	console.log(ab1Li.length)
	let eosLogo = document.createElement("img");
	eosLogo.setAttribute("class","eosLogo");
	eosLogo.style.src = "../images/eos-logo.png";
	eosLogo.style.width = "15%";
	eosLogo.style.height = "100%";
	eosLogo.style.position = "absolute";
	eosLogo.style.left = "5%";
	eosLogo.style.top = 0;

	ab1Li.onmouseover = function(){
		for(let i=0;i<ab1Li.length;i++){
			ab1Li[i].appendChild(eosLogo);
		}
		console.log(6666)
	}
	// ab1Li.onmouseout = function(){
	// 	ab1Li.removeChild(eosLogo);

	// }
}
betNum();


// 底部数据表
function dataList(){
	var tab = document.getElementsByClassName('footer')[0];
			var tabItems = tab.children[0].children;
			var tabContents = tab.children[1].children;


			// 初始化
			
			for(var i=0;i<tabItems.length;i++){
				if(i===0){
					// 高亮第一个table
					tabItems[i].className = 'active';
				}else{
					// * 隐藏除第一样以外的数据
					tabContents[i].style.display = 'none';
				}

				// 给html元素添加idx属性，保存对应索引值
				// tabItems[i].idx = i;
				tabItems[i].setAttribute('idx',i);

				// 点击切换
				tabItems[i].onclick = function(){
					// 获取点击的索引值
					var idx = this.getAttribute('idx');

					for(var i=0;i<tabItems.length;i++){
						if(i == idx){
							// 高亮当前tab
							tabItems[i].className = 'active';

							// 显示当前数据
							tabContents[i].style.display = 'block';
						}else{
							// 隐藏其他高亮
							tabItems[i].className = '';
							
							// 先隐藏其他数据
							tabContents[i].style.display = 'none';
						}
					}


				}
			}
}
dataList();