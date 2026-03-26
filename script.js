document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.querySelector('.terminal .output');
    const openTerminalBtn = document.getElementById('open-terminal-btn');
    const terminalWindow = document.getElementById('terminal-window');
    const closeButton = terminalWindow.querySelector('.close');
    const minimizeButton = terminalWindow.querySelector('.minimize');
    const expandButton = terminalWindow.querySelector('.expand');
    const promptSpan = document.querySelector('.prompt');

    let isDragging = false;
    let offsetX, offsetY;
    let isMaximized = false;
    let originalSize = { width: '600px', height: '400px', top: '50px', left: '50px' };
    let clickCount = 0;
    let lastLoginTime = null;
    let isMinimized = false;
    let isFirstOpen = true;

    // --- COMMAND HISTORY ---
    let commandHistory = [];
    let historyIndex = -1;
    let savedInput = '';

    // --- DIRECTORY STATE ---
    let currentDirectory = '~';

    // --- DATA ---
    const poems = {
        "Yasamaya_Deger.txt": "Hayat belki de,\nBir bardak süttü.\nKırmızı oyuncak araba.\nKabuğu kopmuş diz yarası,\nDenizde sektirilen düz taş parçası.\nAlkışların koptuğu perde arası,\nAyrılık sonrası akan gözyaşı...",
        "Ask.txt": "Gözlerim dans ediyor,\nGörmüyor musun?\n\nVücudum gevşiyor,\nHissetmiyor musun?\n\nGöğüslerinde uyumak istiyorum,\nAnlamıyor musun?\n___\n\nGerek kalmadı,\nGeç de olsa anladım.\n\nAşk acıtmaz,\nSadece gerçek değilsin.\n\nÖldüm ve yeniden doğdum,\nUmut ve Hayal Kırıklığı,\nSen ve Ben,\nArtık yok.",
    };

    const rootFiles = [
        "about.txt",
        "projects.txt",
        "contact.txt",
        "cv.pdf",
        "poems/",
        "chess/"
    ];

    const greetingArt = `
 ██████╗ █████╗ ███╗   ██╗███████╗    ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔════╝██╔══██╗████╗  ██║██╔════╝    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██║     ███████║██╔██╗ ██║███████╗    ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██║     ██╔══██║██║╚██╗██║╚════██║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
╚██████╗██║  ██║██║ ╚████║███████║    ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`;

    const displayLastLogin = () => {
        if (lastLoginTime) {
            addOutput(`Last login: ${lastLoginTime}`, false);
        }
    };

    const displayGreeting = () => {
        addOutput("Welcome to the terminal! Type 'help' for commands.", false);
    };

    const addOutput = (message, isCommand = false) => {
        if (typeof message === 'string') {
            const lines = message.split('\n');
            lines.forEach(lineText => {
                const line = document.createElement('div');
                line.className = isCommand ? 'command-line' : 'output-line';
                if (isCommand) {
                    line.textContent = `user@portfolio:${currentDirectory}$ ${lineText}`;
                } else {
                    line.textContent = lineText === '' ? '\u00A0' : lineText;
                }
                terminalOutput.appendChild(line);
            });
        } else {
            const line = document.createElement('div');
            line.className = isCommand ? 'command-line' : 'output-line';
            line.appendChild(message);
            terminalOutput.appendChild(line);
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const addGreetingOutput = (greeting) => {
        const lines = greeting.split('\n');
        lines.forEach(lineText => {
            const line = document.createElement('div');
            line.className = 'output-line';
            line.textContent = lineText;
            terminalOutput.appendChild(line);
        });
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    const initializeTerminal = () => {
        terminalOutput.innerHTML = '';
        currentDirectory = '~';
        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
        displayLastLogin();
        displayGreeting();
        isFirstOpen = false;
    };

    openTerminalBtn.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 2) {
            terminalWindow.classList.remove('hidden');
            clickCount = 0;
            if (!isMinimized) {
                initializeTerminal();
            }
            isMinimized = false;
            updateLastLogin();
        }
    });

    closeButton.addEventListener('click', () => {
        terminalWindow.classList.add('hidden');
        terminalOutput.innerHTML = '';
        isMinimized = false;
        isFirstOpen = true;
        updateLastLogin();
    });

    minimizeButton.addEventListener('click', () => {
        terminalWindow.classList.add('hidden');
        isMinimized = true;
    });

    expandButton.addEventListener('click', () => {
        if (isMaximized) {
            terminalWindow.style.width = originalSize.width;
            terminalWindow.style.height = originalSize.height;
            terminalWindow.style.top = originalSize.top;
            terminalWindow.style.left = originalSize.left;
            terminalWindow.classList.remove('maximized');
        } else {
            originalSize = {
                width: terminalWindow.style.width,
                height: terminalWindow.style.height,
                top: terminalWindow.style.top,
                left: terminalWindow.style.left
            };
            terminalWindow.style.width = '98%';
            terminalWindow.style.height = '97%';
            terminalWindow.style.top = '1.5%';
            terminalWindow.style.left = '1%';
            terminalWindow.classList.add('maximized');
        }
        isMaximized = !isMaximized;
    });

    const titleBar = terminalWindow.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', (e) => {
        if (isMaximized) return;
        isDragging = true;
        offsetX = e.clientX - terminalWindow.getBoundingClientRect().left;
        offsetY = e.clientY - terminalWindow.getBoundingClientRect().top;
        terminalWindow.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && !isMaximized) {
            const screenRect = document.querySelector('.screen').getBoundingClientRect();
            const windowRect = terminalWindow.getBoundingClientRect();
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            newLeft = Math.max(screenRect.left, Math.min(newLeft, screenRect.left + screenRect.width - windowRect.width));
            newTop = Math.max(screenRect.top, Math.min(newTop, screenRect.top + screenRect.height - windowRect.height));
            terminalWindow.style.left = `${newLeft - screenRect.left}px`;
            terminalWindow.style.top = `${newTop - screenRect.top}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            terminalWindow.style.cursor = '';
        }
    });

    // --- HELPER FOR CASE INSENSITIVE FILE FINDING ---
    const findPoemKey = (inputName) => {
        return Object.keys(poems).find(key => key.toLowerCase() === inputName.toLowerCase());
    };

    // ================================================================
    // CHESS MODULE
    // ================================================================

    const CHESS_USERNAME = 'cankucukyilmaz';

    // Unicode chess pieces: color (w/b) + type (k/q/r/b/n/p)
    const PIECE_UNICODE = {
        wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
        bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
    };

    // Centipawn piece values
    const PIECE_VALS = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

    // Piece-square tables from white's perspective
    // Index [0] = rank 8, [7] = rank 1 (matches chess.js board() output)
    const PSQ = {
        p: [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [ 50, 50, 50, 50, 50, 50, 50, 50],
            [ 10, 10, 20, 30, 30, 20, 10, 10],
            [  5,  5, 10, 25, 25, 10,  5,  5],
            [  0,  0,  0, 20, 20,  0,  0,  0],
            [  5, -5,-10,  0,  0,-10, -5,  5],
            [  5, 10, 10,-20,-20, 10, 10,  5],
            [  0,  0,  0,  0,  0,  0,  0,  0]
        ],
        n: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        b: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        r: [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [  5, 10, 10, 10, 10, 10, 10,  5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [  0,  0,  0,  5,  5,  0,  0,  0]
        ],
        q: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        k: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ]
    };

    let chessState = {
        game: null,
        active: false,
        botColor: 'b',      // 'w' or 'b'
        userColor: 'w',     // 'w' or 'b'
        flipped: false,
        openingBook: {},
        bookLoaded: false,
        thinking: false
    };

    // Get a position key (ignores halfmove/fullmove clocks for transpositions)
    function chessFENKey(chess) {
        return chess.fen().split(' ').slice(0, 4).join(' ');
    }

    // Render board to array of strings
    function renderChessBoard(chess, flipped) {
        const board = chess.board(); // [0][0]=a8, [7][7]=h1
        const files = ['a','b','c','d','e','f','g','h'];
        const lines = [];

        const fileRow = (flipped ? [...files].reverse() : files).join(' ');
        lines.push(`    ${fileRow}`);
        lines.push('  +' + '-'.repeat(17) + '+');

        for (let dr = 0; dr < 8; dr++) {
            const r = flipped ? 7 - dr : dr;
            const rankNum = 8 - r;
            let row = `${rankNum} |`;

            for (let dc = 0; dc < 8; dc++) {
                const c = flipped ? 7 - dc : dc;
                const sq = board[r][c];
                if (!sq) {
                    row += ' ·';
                } else {
                    row += ' ' + PIECE_UNICODE[sq.color + sq.type];
                }
            }

            row += ` | ${rankNum}`;
            lines.push(row);
        }

        lines.push('  +' + '-'.repeat(17) + '+');
        lines.push(`    ${fileRow}`);
        return lines;
    }

    // Static evaluation (positive = good for white)
    function evaluateChess(chess) {
        if (chess.in_checkmate()) {
            return chess.turn() === 'w' ? -99999 : 99999;
        }
        if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition() || chess.insufficient_material()) {
            return 0;
        }

        let score = 0;
        const board = chess.board();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const sq = board[r][c];
                if (!sq) continue;
                const val = PIECE_VALS[sq.type] || 0;
                const pst = PSQ[sq.type];
                // For white: use table as-is. For black: mirror vertically.
                const pstVal = pst ? (sq.color === 'w' ? pst[r][c] : pst[7 - r][c]) : 0;
                score += sq.color === 'w' ? (val + pstVal) : -(val + pstVal);
            }
        }
        return score;
    }

    // Alpha-beta minimax
    function minimax(chess, depth, alpha, beta, maximizingWhite) {
        if (depth === 0 || chess.game_over()) {
            return evaluateChess(chess);
        }

        const moves = chess.moves();
        // Move ordering: captures first for better pruning
        moves.sort((a, b) => (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0));

        if (maximizingWhite) {
            let maxEval = -Infinity;
            for (const move of moves) {
                chess.move(move);
                const score = minimax(chess, depth - 1, alpha, beta, false);
                chess.undo();
                if (score > maxEval) maxEval = score;
                if (score > alpha) alpha = score;
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                chess.move(move);
                const score = minimax(chess, depth - 1, alpha, beta, true);
                chess.undo();
                if (score < minEval) minEval = score;
                if (score < beta) beta = score;
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    // Get best bot move (opening book → minimax)
    function getBotMove(chess, openingBook, botColor) {
        const key = chessFENKey(chess);

        // Check opening book
        if (openingBook && openingBook[key] && openingBook[key].length > 0) {
            const bookMoves = openingBook[key];
            return bookMoves[Math.floor(Math.random() * bookMoves.length)];
        }

        const legalMoves = chess.moves();
        if (legalMoves.length === 0) return null;

        // Shuffle for variety in equal positions
        const shuffled = [...legalMoves].sort(() => Math.random() - 0.5);

        let bestMove = legalMoves[0];
        let bestScore = botColor === 'b' ? Infinity : -Infinity;

        for (const move of shuffled) {
            chess.move(move);
            // After bot makes a move: if bot is black (minimizing), it's now white's turn (maximizing)
            const score = minimax(chess, 2, -Infinity, Infinity, botColor === 'b');
            chess.undo();

            if (botColor === 'b' && score < bestScore) {
                bestScore = score;
                bestMove = move;
            } else if (botColor === 'w' && score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    // Clean chess.com PGN (remove clock annotations, comments, NAGs)
    function cleanPGN(pgn) {
        return pgn
            .replace(/\{[^}]*\}/g, '')   // remove { comments }
            .replace(/\$\d+/g, '')        // remove $NAG symbols
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Build opening book from chess.com games
    async function buildOpeningBook(username, botColor) {
        try {
            addOutput(`  Loading games from chess.com...`);
            const archRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
            if (!archRes.ok) {
                addOutput(`  Could not reach chess.com. Bot will play without opening book.`);
                return {};
            }
            const archData = await archRes.json();
            const archives = archData.archives || [];
            if (archives.length === 0) {
                addOutput(`  No archived games found. Bot will play without opening book.`);
                return {};
            }

            // Fetch last 3 months of games
            const recent = archives.slice(-3);
            let allGames = [];

            for (const url of recent) {
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    allGames = allGames.concat(data.games || []);
                } catch (e) { /* skip failed months */ }
            }

            const book = {};
            let gamesUsed = 0;

            for (const game of allGames) {
                if (!game.pgn) continue;

                // Only use games where user played as botColor
                const userPlayedAs = (game.white.username || '').toLowerCase() === username.toLowerCase() ? 'w' : 'b';
                if (userPlayedAs !== botColor) continue;

                try {
                    const tempChess = new Chess();
                    const loaded = tempChess.load_pgn(cleanPGN(game.pgn), { sloppy: true });
                    if (!loaded) continue;

                    const history = tempChess.history();
                    const replayChess = new Chess();

                    // Record bot's moves for the first 18 half-moves (9 full moves)
                    for (let i = 0; i < Math.min(history.length, 18); i++) {
                        if (replayChess.turn() === botColor) {
                            const key = chessFENKey(replayChess);
                            if (!book[key]) book[key] = [];
                            book[key].push(history[i]);
                        }
                        const result = replayChess.move(history[i], { sloppy: true });
                        if (!result) break;
                    }
                    gamesUsed++;
                } catch (e) { /* skip malformed PGN */ }
            }

            addOutput(`  Opening book built from ${gamesUsed} games. Bot is ready!`);
            return book;
        } catch (e) {
            addOutput(`  Failed to load opening book. Bot will rely on pure calculation.`);
            return {};
        }
    }

    // Display board + game status
    function displayBoard() {
        const chess = chessState.game;
        const boardLines = renderChessBoard(chess, chessState.flipped);
        boardLines.forEach(line => addOutput(line));

        if (chess.in_checkmate()) {
            const winner = chess.turn() === 'w' ? 'Black' : 'White';
            addOutput(`\n  Checkmate! ${winner} wins.`);
        } else if (chess.in_check()) {
            addOutput(`  Check!`);
        } else if (chess.in_stalemate()) {
            addOutput(`  Stalemate — it's a draw.`);
        } else if (chess.in_draw() || chess.in_threefold_repetition() || chess.insufficient_material()) {
            addOutput(`  Draw.`);
        }
    }

    // Trigger bot move with "thinking" delay
    function doBotMove() {
        if (!chessState.active || chessState.game.game_over()) return;
        if (chessState.game.turn() !== chessState.botColor) return;

        chessState.thinking = true;
        addOutput(`\n  Bot is thinking...`);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;

        setTimeout(() => {
            const botMove = getBotMove(chessState.game, chessState.openingBook, chessState.botColor);
            if (botMove) {
                chessState.game.move(botMove);
                addOutput(`  Bot plays: ${botMove}`);
            }
            displayBoard();

            if (chessState.game.game_over()) {
                chessState.active = false;
                addOutput(`\n  Type 'play' for a new game or 'cd ..' to exit.`);
            } else {
                addOutput(`\n  Your turn (${chessState.userColor === 'w' ? 'White ♙' : 'Black ♟'}). Enter move or 'help'.`);
            }
            chessState.thinking = false;
        }, 300);
    }

    // Start a new chess game
    async function startChessGame(userColor) {
        chessState.userColor = userColor;
        chessState.botColor = userColor === 'w' ? 'b' : 'w';
        chessState.game = new Chess();
        chessState.active = true;
        chessState.flipped = (userColor === 'b');

        addOutput(`\n  Starting game — you play ${userColor === 'w' ? 'White ♙' : 'Black ♟'}, bot plays ${userColor === 'w' ? 'Black ♟' : 'White ♙'}.`);

        // Build opening book if not already loaded
        if (!chessState.bookLoaded) {
            chessState.openingBook = await buildOpeningBook(CHESS_USERNAME, chessState.botColor);
            chessState.bookLoaded = true;
        }

        displayBoard();

        if (chessState.botColor === 'w') {
            // Bot moves first
            doBotMove();
        } else {
            addOutput(`\n  Your turn! Enter a move (e.g. e4, Nf3, O-O). Type 'help' for commands.`);
        }
    }

    // Handle commands while in chess mode
    function handleChessCommand(rawInput) {
        const cmd = rawInput.trim().toLowerCase();

        if (chessState.thinking) {
            addOutput("  Bot is still thinking...");
            return;
        }

        // --- Commands available regardless of game state ---
        if (cmd === 'help') {
            if (chessState.active) {
                addOutput("  Chess commands (game in progress):");
                addOutput("  [move]   - Make a move (e.g. e4, Nf3, O-O, exd5)");
                addOutput("  board    - Redisplay the board");
                addOutput("  moves    - Show all legal moves");
                addOutput("  flip     - Flip the board orientation");
                addOutput("  resign   - Resign the current game");
                addOutput("  help     - Show this help");
            } else {
                addOutput("  Chess commands:");
                addOutput("  play          - Start a game (you play White)");
                addOutput("  play white    - Start a game as White");
                addOutput("  play black    - Start a game as Black");
                addOutput("  cd ..         - Exit to home directory");
            }
            return;
        }

        if (cmd === 'cd ..' || cmd === 'cd' || cmd === 'cd ~') {
            if (chessState.active) {
                addOutput("  Resign first before leaving ('resign'), or stay and play!");
            } else {
                currentDirectory = '~';
                promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
                addOutput("  Returned to home directory.");
            }
            return;
        }

        // --- Commands for when no game is active ---
        if (!chessState.active) {
            if (cmd === 'play' || cmd === 'play white') {
                startChessGame('w');
            } else if (cmd === 'play black') {
                startChessGame('b');
            } else {
                addOutput(`  Unknown command: ${rawInput}`);
                addOutput("  Type 'play' to start a game or 'help' for commands.");
            }
            return;
        }

        // --- Commands for when a game is active ---
        if (cmd === 'board') {
            displayBoard();
            return;
        }

        if (cmd === 'moves') {
            const legal = chessState.game.moves();
            addOutput(`  Legal moves (${legal.length}): ${legal.join('  ')}`);
            return;
        }

        if (cmd === 'flip') {
            chessState.flipped = !chessState.flipped;
            displayBoard();
            return;
        }

        if (cmd === 'resign') {
            chessState.active = false;
            const winner = chessState.botColor === 'w' ? 'White (bot)' : 'Black (bot)';
            addOutput(`  You resigned. ${winner} wins.`);
            addOutput("  Type 'play' for a new game or 'cd ..' to exit.");
            return;
        }

        // --- Treat as a chess move ---
        if (chessState.game.turn() !== chessState.userColor) {
            addOutput("  It's not your turn yet.");
            return;
        }

        // Normalize castling: accept "0-0" as "O-O"
        let moveInput = rawInput.trim()
            .replace(/^0-0-0$/i, 'O-O-O')
            .replace(/^0-0$/i, 'O-O');

        const result = chessState.game.move(moveInput, { sloppy: true });

        if (!result) {
            addOutput(`  Illegal move: "${rawInput}". Type 'moves' to see legal moves.`);
            return;
        }

        addOutput(`  You played: ${result.san}`);

        if (chessState.game.game_over()) {
            displayBoard();
            chessState.active = false;
            addOutput("\n  Type 'play' for a new game or 'cd ..' to exit.");
            return;
        }

        // Bot's turn
        doBotMove();
    }

    // Enter chess directory
    function enterChessDirectory() {
        currentDirectory = '~/chess';
        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
        addOutput("  ♟  Welcome to Can's Chess Terminal  ♟");
        addOutput("  ─────────────────────────────────────");
        addOutput("  The bot is trained on Can's chess.com games.");
        addOutput("  It plays openings from his actual game history,");
        addOutput("  then calculates the best moves it can find.");
        addOutput(" ");
        addOutput("  Type 'play'       to start (you play White)");
        addOutput("  Type 'play black' to play as Black");
        addOutput("  Type 'help'       for all commands");
        addOutput("  Type 'cd ..'      to exit");
    }

    // ================================================================
    // COMMAND INPUT HANDLER
    // ================================================================
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            if (historyIndex === -1) {
                savedInput = terminalInput.value;
                historyIndex = commandHistory.length - 1;
            } else if (historyIndex > 0) {
                historyIndex--;
            }
            terminalInput.value = commandHistory[historyIndex];
            setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex === -1) return;
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = savedInput;
            }
            setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            return;
        }

        if (e.key === 'Enter') {
            const rawInput = terminalInput.value.trim();
            const command = rawInput.toLowerCase();
            terminalInput.value = '';

            if (rawInput && commandHistory[commandHistory.length - 1] !== rawInput) {
                commandHistory.push(rawInput);
            }
            historyIndex = -1;
            savedInput = '';

            if (rawInput) {
                addOutput(rawInput, true);

                // === MODE: CHESS DIRECTORY ===
                if (currentDirectory === '~/chess') {
                    handleChessCommand(rawInput);
                }

                // === MODE: POEMS DIRECTORY ===
                else if (currentDirectory === '~/poems') {
                    const directPoemKey = findPoemKey(command);

                    if (command === 'ls') {
                        addOutput("Available poems:");
                        Object.keys(poems).forEach(title => {
                            addOutput(`  ${title}`);
                        });
                    } else if (command === 'cd ..' || command === 'cd' || command === 'cd ~') {
                        currentDirectory = '~';
                        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
                        addOutput("Returned to home directory.");
                    } else if (command === 'help') {
                        addOutput("Poem Directory Commands:");
                        addOutput("  ls        - List available poems");
                        addOutput("  cat [file]- Read a poem (e.g. 'cat Aşk.txt')");
                        addOutput("  cd ..     - Go back to home");
                    } else if (command.startsWith('cat ')) {
                        const fileName = command.replace('cat ', '').trim();
                        const poemKey = findPoemKey(fileName);
                        if (poemKey) {
                            addOutput(`Reading ${poemKey}...`);
                            addOutput("--------------------------");
                            addOutput(poems[poemKey]);
                            addOutput("--------------------------");
                        } else {
                            addOutput(`File not found: ${fileName}`);
                        }
                    } else if (directPoemKey) {
                        addOutput(`Reading ${directPoemKey}...`);
                        addOutput("--------------------------");
                        addOutput(poems[directPoemKey]);
                        addOutput("--------------------------");
                    } else {
                        addOutput(`Command not found: ${command}`);
                        addOutput(`Type 'ls' to see list, or 'cd ..' to exit.`);
                    }
                }

                // === MODE: HOME DIRECTORY ===
                else {
                    if (command === 'help') {
                        addOutput("Available commands:");
                        addOutput("  ls       - List files and directories");
                        addOutput("  cd poems - Enter poems directory");
                        addOutput("  cd chess - Enter chess game");
                        addOutput("  greeting - Show welcome art");
                        addOutput("  contact  - Show contact information");
                        addOutput("  cv       - Download my CV/Resume");
                        addOutput("  clear    - Clear the terminal");
                    } else if (command === 'ls') {
                        addOutput(`files: ${rootFiles.join('  ')}`);
                    } else if (command === 'clear') {
                        terminalOutput.innerHTML = '';
                    } else if (command === 'greeting') {
                        addGreetingOutput(greetingArt);
                    } else if (command === 'cd poems' || command === 'poems') {
                        currentDirectory = '~/poems';
                        promptSpan.textContent = `user@portfolio:${currentDirectory}$`;
                        addOutput("Directory changed to ~/poems");
                        addOutput("Type 'ls' to see my poems.");
                        addOutput("Type 'cat [filename]' to read one.");
                        addOutput("Type 'cd ..' to go back.");
                    } else if (command === 'cd chess' || command === 'chess') {
                        enterChessDirectory();
                    } else if (command === 'contact') {
                        const contactButtons = document.createElement('div');
                        contactButtons.className = 'contact-buttons';
                        contactButtons.innerHTML = `
                            <a href="https://github.com/cankucukyilmaz" target="_blank" class="contact-btn github">
                                <i class="fab fa-github"></i> <span> GitHub </span>
                            </a>
                            <a href="https://www.instagram.com/kucukyilmaz.can/" target="_blank" class="contact-btn instagram">
                                <i class="fab fa-instagram"></i> <span> Instagram</span>
                            </a>
                            <a href="https://leetcode.com/u/canthecomputerscientist/" target="_blank" class="contact-btn leetcode">
                                <i class="fas fa-code"></i> <span> LeetCode</span>
                            </a>
                            <a href="https://www.linkedin.com/in/can-kucukyilmaz/" target="_blank" class="contact-btn linkedin">
                                <i class="fab fa-linkedin"></i> <span> LinkedIn </span>
                            </a>
                        `;
                        addOutput("Here's how you can reach me:");
                        addOutput(contactButtons);
                    } else if (command === 'cv') {
                        addOutput("Preparing CV download...", false);
                        setTimeout(() => {
                            const link = document.createElement('a');
                            link.href = 'src/CV_Can_Kucukyilmaz.pdf';
                            link.download = 'Can_Kucukyilmaz.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            addOutput("✓ CV download started. Check your downloads folder.", false);
                        }, 800);
                    } else {
                        addOutput(`Command not found: ${command}`);
                    }
                }
            }
        }
    });

    // --- RESIZE HANDLE ---
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    terminalWindow.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    resizeHandle.addEventListener('mousedown', (e) => {
        if (isMaximized) return;
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(terminalWindow).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(terminalWindow).height, 10);
        startLeft = parseInt(document.defaultView.getComputedStyle(terminalWindow).left, 10);
        startTop = parseInt(document.defaultView.getComputedStyle(terminalWindow).top, 10);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing && !isMaximized) {
            const screenRect = document.querySelector('.screen').getBoundingClientRect();
            const windowRect = terminalWindow.getBoundingClientRect();
            const minWidth = 300;
            const minHeight = 200;

            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);

            newWidth = Math.max(minWidth, newWidth);
            newHeight = Math.max(minHeight, newHeight);
            const maxWidth = screenRect.width - windowRect.left;
            const maxHeight = screenRect.height - windowRect.top;
            newWidth = Math.min(newWidth, maxWidth);
            newHeight = Math.min(newHeight, maxHeight);

            terminalWindow.style.width = `${newWidth}px`;
            terminalWindow.style.height = `${newHeight}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

    function updateLastLogin() {
        const now = new Date();
        lastLoginTime = now.toLocaleString();
    }
});
