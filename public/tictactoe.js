$(function () {
    var firebaseConfig = {
        apiKey: "AIzaSyD2Z5s3xjnW1I8Y6RT_-kCIgLpi460BBaw",
        authDomain: "tictactoe-56334.firebaseapp.com",
        databaseURL: "https://tictactoe-56334.firebaseio.com",
        projectId: "tictactoe-56334",
        storageBucket: "tictactoe-56334.appspot.com",
        messagingSenderId: "367597571916",
        appId: "1:367597571916:web:be64b31dc0b87637"
    }

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig)

    var oTurn = true
    var board = Array(10).fill(" ")
    var gameOver = -1
    var player1, player2, myPlayer, oPlayer, gameID, player1Score, player2Score, pointSet

    var db = firebase.firestore();
    var gameRef

    function main() {
        var boardDiv = $("#board")
        var row = $($.parseHTML("<div class='row'></div>")[0])
        for(let i = 0; i < 9; i++) {
            row.append("<div id='" + i + "' class='square'>" + board[i] + "</div>")
            if((i+1) % 3 == 0) {
                boardDiv.append(row)
                row = $($.parseHTML("<div class='row'></div>")[0])
            }
        }

        $(".square").click(squareClicked)
        $("#newGame").click(newGame)
        $("#createGame").click(createGame)
    }

    function setNames() {
        $("#player1").text(player1 + " as " + (oPlayer === player1 ? "O" : "X"))
        $("#player2").text(player2 + " as " + (oPlayer === player2 ? "O" : "X"))
    }

    function setGameState() {
        if(gameOver === -1) {
            $("#status").text("Ongoing Game")
            return
        }
        if(!pointSet) {
            switch(gameOver) {
                case "X":
                    if(oPlayer !== player1) {
                        player1Score++
                    } else {
                        player2Score++
                    }
                    $("#status").text("X Wins")
                    break;
                case "O":
                    if(oPlayer === player1) {
                        player1Score++
                    } else {
                        player2Score++
                    }
                    $("#status").text("O Wins")
                    break;
                case 0:
                    player1Score+=0.5
                    player2Score+=0.5
                    $("#status").text("Tie Game")
                    break;
            }
            gameRef.update({player1Score: player1Score, player2Score: player2Score, pointSet: true})
        }
    }

    function setScores() {
        $("#player1Score").text("Score: " + player1Score)
        $("#player2Score").text("Score: " + player2Score)
    }

    function updateBoard() {
        for(let i = 0; i < 9; i++) {
            var square = $("#"+i)
            square.text(board[i])
        }
    }

    function squareClicked(element) {
        var square = $("#"+element.target.id)
        if(oTurn && myPlayer === oPlayer || !oTurn && myPlayer !== oPlayer) {
            if(square.text() == " ") {
                square.text(oTurn ? "O" : "X")
                board[element.target.id] = oTurn ? "O" : "X"
                oTurn = !oTurn
            }
            gameRef.update({board: board, oTurn: oTurn, gameOver: isGameOver()})
        }
    }

    function newGame() {
        gameRef.update({board: Array(9).fill(" "), oTurn: true, oPlayer: oPlayer == player1 ? player2 : player1, gameOver: -1, pointSet: false})
    }

    function generateUniqueName() {
        const animals = ["Cat", "Bird", "Snake", "Dog", "Bear"]
        const adjectives = ["Calm", "Ambitious", "Brave", "Calm", "Eager"]

        return adjectives[Math.floor(Math.random()*adjectives.length)] + " " + animals[Math.floor(Math.random()*animals.length)]
    }

    function createGame() {
        db.collection("game").add(
            {
                board: Array(9).fill(" "),
                oTurn: true,
                gameOver: -1,
                player1Score: 0,
                player2Score: 0,
                pointSet: false
            })
        .then(function(docRef) {
            console.log(docRef)
            $("#gameURL").attr("href", window.location.origin + "/" + docRef.id)
            $("#gameURL").text("Join Game")
            $("#gameShare").text("Share to play someone " + window.location.origin + "/" + docRef.id)
        })
    }

    function isGameOver() {
        var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
        for(var line of lines) {
            if(board[line[0]] !== " " && board[line[0]] === board[line[1]] && board[line[0]] === board[line[2]]) {
                console.log(board[line[0]], "Wins!")
                return board[line[0]]
            }
        }
        for(let i = 0; i < board.length; i++) {
            if(board[i] === " ") {
                return -1
            }
        }

        return 0; //stalemate
    }

    function revealGame() {
        $("#gameContainer").show()
        $("#createContainer").hide()
    }

    function getCookie(cname) {
        var name = cname + ":";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

    function findGame(gameId) {
        gameRef = db.collection("game").doc(gameId)
        gameRef.get().then((doc) => { 
            console.log(doc.data())
            console.log(doc.data()["board"])
            board = doc.data()["board"]
            player1 = doc.data()["player1"]
            player2 = doc.data()["player2"]
            oPlayer = doc.data()["oPlayer"]
            console.log(gameId)
            var cookieValue = getCookie(gameId)
            console.log(cookieValue)
            if(cookieValue === '') {
                if(player1 === undefined) {
                    player1 = generateUniqueName()
                    oPlayer = player1
                    gameRef.update({player1: player1, oPlayer: player1, player1Score: 0})
                    myPlayer = player1
                    document.cookie = gameId + ":" + myPlayer + ";"
                }
                else if(player2 === undefined) {
                    player2 = generateUniqueName()
                    gameRef.update({player2: player2, player2Score: 0})
                    myPlayer = player2
                    document.cookie = gameId + ":" + myPlayer + ";"
                }
            } else {
                myPlayer = cookieValue
                $("#myPlayer").text("You are playing as " + myPlayer)
            }
            updateBoard()
            setNames()
            revealGame()
            setGameState()
            setScores()
        }).catch(function(error) {
            console.log("Error getting document:", error);
        }).finally(function() {
            db.collection("game").doc(gameId)
                .onSnapshot(function (doc) {
                    console.log("Current data: ", doc.data());
                    board = doc.data()["board"]
                    oTurn = doc.data()["oTurn"]
                    oPlayer = doc.data()["oPlayer"]
                    player1 = doc.data()["player1"]
                    player2 = doc.data()["player2"]
                    player1Score = doc.data()["player1Score"]
                    player2Score = doc.data()["player2Score"]
                    gameOver = doc.data()["gameOver"]
                    pointSet = doc.data()["pointSet"]
                    updateBoard()
                    setNames()
                    setGameState()
                    setScores()
                });
        });
    }

    gameID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
    if(gameID) {
        findGame(gameID)
    }  
    main()
})

