const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessBoard");

let draggedPiece = null;
let sourseSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  // row ans column=square laine square wali pattern create thay che w & b vadi
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        console.log(`Piece class: ${pieceElement.className}`);

        // we get piece emenet by uniwue element
        pieceElement.innerText = getPieceUnique(square);

        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            draggedPiece.classList.add("dragging");
            sourseSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece.classList.remove("dragging");
          draggedPiece = null;
          sourseSquare = null;
        });
        squareElement.append(pieceElement);
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourseSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  socket.emit("move", move);
};

const getPieceUnique = (piece) => {
  const unicodePieces = {
    p: "♙", // Black Pawn
    r: "♜", // Black Rook
    n: "♞", // Black Knight
    b: "♝", // Black Bishop
    q: "♛", // Black Queen
    k: "♚", // Black King

    P: "♙", // White Pawn
    R: "♖", // White Rook
    N: "♘", // White Knight
    B: "♗", // White Bishop
    Q: "♕", // White Queen
    K: "♔", // White King
  };
  // Map type based on color for correct symbol
  const key = piece.color === "w" ? piece.type.toUpperCase() : piece.type;
  return unicodePieces[key] || "";
};

socket.on("playerRole", function (role) {
  playerRole = role;
  console.log("w=white and b=black Your role is", role);
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

renderBoard();

// this line gave request to backend
// socket.emit("mysocket");
// This line get responce of upper line mysocket and print after getting reqponce
// socket.on("Churan papdi", function() {
// console.log("churan received on frontend");
// });
