const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

// this line creates servver then io bind socket with server
// basically it manage connection between http and express server
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let player = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
});

io.on("connection", function(uniquesocket) {
    console.log("connected socket io server");

    // this line get request from froentend and give responce on frontend
    //   uniquesocket.on("mysocket", function () {
    //     io.emit("Churan papdi");
    //   });

    //   uniquesocket.on("disconnect", function () {
    //     console.log("disconnected event trigrred by frontend");
    //   });

    if (!player.white) {
        player.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    } else if (!player.black) {
        player.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    } else {
        uniquesocket.emit("playerRole", "spectatorRole");
    }

    uniquesocket.on("move", (move) => {
        try {
            if (chess.turn() == "w" && uniquesocket.id !== player.white) return;
            if (chess.turn() == "b" && uniquesocket.id !== player.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                // here io.emit means frontend ma broadcast karse
                io.emit("move", move);
            } else {
                console.log("Invalid move", move);
                uniquesocket.emit("Invalid move", move);
            }
        } catch (error) {
            console.log(error);
            uniquesocket.emit("Invalid move", move);
        }
    });

    uniquesocket.on("disconnect", function() {
        if (uniquesocket.id == player.white) {
            delete player.white;
        } else if (uniquesocket.id == player.black) {
            delete player.black;
        }
    });

});

server.listen(3000, function(req, res) {
    console.log("App is running on port 3000");
});