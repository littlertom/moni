// game.js

document.addEventListener('DOMContentLoaded', () => {
    showLobby();
});

function showLobby() {
    const lobby = document.getElementById('lobby');
    lobby.innerHTML = `
        <h1>Welcome to the Minipili</h1>
        <label>Number of Robots (1-6): <input type="number" id="botCount" value="1" min="1" max="6"></label><br>
        <label>Starting Money: <input type="number" id="startingMoney" value="1500"></label><br>
        <label>Your Color:
            <input type="color" id="playerColor" value="#ff0000">
        </label><br>
        <button id="startGame">Start Game</button>
    `;

    document.getElementById('startGame').addEventListener('click', setupPlayers);
}

function setupPlayers() {
    // Retrieve settings
    const botCount = parseInt(document.getElementById('botCount').value);
    const startingMoney = parseInt(document.getElementById('startingMoney').value);
    const playerColor = document.getElementById('playerColor').value;

    // Define possible bot colors
    const botColors = ['#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

    // Remove player's color from bot colors if present
    const botColorOptions = botColors.filter(color => color.toLowerCase() !== playerColor.toLowerCase());

    // Initialize players
    const players = [];
    // Human player
    players.push({
        id: 1,
        name: 'You',
        color: playerColor,
        money: startingMoney,
        position: 0,
        properties: [],
        isBot: false,
        inJail: false,
        hasGetOutOfJailFreeCard: false,
    });

    // Assign colors to bots
    for (let i = 0; i < botCount; i++) {
        const colorIndex = i % botColorOptions.length;
        const botColor = botColorOptions[colorIndex];
        players.push({
            id: i + 2,
            name: `Bot ${i + 1}`,
            color: botColor,
            money: startingMoney,
            position: 0,
            properties: [],
            isBot: true,
            inJail: false,
            hasGetOutOfJailFreeCard: false,
        });
    }

    startGame(players);
}

function startGame(players) {
    // Remove lobby
    document.getElementById('lobby').remove();

    // Create a container for the canvas
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvasContainer';

    // Create game canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';

    // Append canvas to the container
    canvasContainer.appendChild(canvas);

    // Append the container to the body
    document.body.appendChild(canvasContainer);

    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.id = 'messageContainer';

    const messageList = document.createElement('div');
    messageList.id = 'messageList';
    messageContainer.appendChild(messageList);

    document.body.appendChild(messageContainer);

    // Initialize game state
    const gameState = {
        players,
        currentPlayerIndex: 0,
        tiles: generateTiles(),
        chanceCards: generateChanceCards(),
        chestCards: generateChestCards(),
        lastDiceRoll: null, // Store the last dice roll
    };

    // Start the game loop
    drawBoard(gameState);
    takeTurn(gameState);
}

function generateTiles() {
    const tiles = [
        // Tiles with positions, types, names, prices, colors
        // Bottom row (0-10), right to left
        { type: 'go', name: 'GO', price: null, color: null, owner: null }, // Index 0

        // Brown Properties
        {
            type: 'property',
            name: 'Brown1 Street',
            price: 60,
            color: '#8B4513',
            owner: null,
            rent: 2,
            rentWithHouses: [10, 30, 90, 160],
            rentWithHotel: 250,
            houseCost: 50,
            houses: 0,
            hotel: false
        }, // Index 1
        { type: 'chest', name: 'Community Chest', price: null, color: null, owner: null }, // Index 2
        {
            type: 'property',
            name: 'Brown2 Street',
            price: 60,
            color: '#8B4513',
            owner: null,
            rent: 4,
            rentWithHouses: [20, 60, 180, 320],
            rentWithHotel: 450,
            houseCost: 50,
            houses: 0,
            hotel: false
        }, // Index 3
        { type: 'tax', name: 'Income Tax', amount: 200, price: null, color: null, owner: null }, // Index 4

        // Station
        {
            type: 'station',
            name: 'Station One',
            price: 200,
            color: '#FFFFFF',
            owner: null,
            rent: 25, // Base rent
            houses: 0,
            hotel: false
        }, // Index 5

        // Light Blue Properties
        {
            type: 'property',
            name: 'Lightblue1 Street',
            price: 100,
            color: '#ADD8E6',
            owner: null,
            rent: 6,
            rentWithHouses: [30, 90, 270, 400],
            rentWithHotel: 550,
            houseCost: 50,
            houses: 0,
            hotel: false
        }, // Index 6
        { type: 'chance', name: 'Chance', price: null, color: null, owner: null }, // Index 7
        {
            type: 'property',
            name: 'Lightblue2 Street',
            price: 100,
            color: '#ADD8E6',
            owner: null,
            rent: 6,
            rentWithHouses: [30, 90, 270, 400],
            rentWithHotel: 550,
            houseCost: 50,
            houses: 0,
            hotel: false
        }, // Index 8
        {
            type: 'property',
            name: 'Lightblue3 Street',
            price: 120,
            color: '#ADD8E6',
            owner: null,
            rent: 8,
            rentWithHouses: [40, 100, 300, 450],
            rentWithHotel: 600,
            houseCost: 50,
            houses: 0,
            hotel: false
        }, // Index 9
        { type: 'jail', name: 'Jail/Visiting Jail', price: null, color: null, owner: null }, // Index 10

        // Left column (11-20), bottom to top
        // Pink Properties
        {
            type: 'property',
            name: 'Pink1 Street',
            price: 140,
            color: '#FFC0CB',
            owner: null,
            rent: 10,
            rentWithHouses: [50, 150, 450, 625],
            rentWithHotel: 750,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 11
        {
            type: 'utility',
            name: 'Utility One',
            price: 150,
            color: '#FFFFFF',
            owner: null,
            rent: null, // Special rent rules for utilities
            houses: 0,
            hotel: false
        }, // Index 12
        {
            type: 'property',
            name: 'Pink2 Street',
            price: 140,
            color: '#FFC0CB',
            owner: null,
            rent: 10,
            rentWithHouses: [50, 150, 450, 625],
            rentWithHotel: 750,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 13
        {
            type: 'property',
            name: 'Pink3 Street',
            price: 160,
            color: '#FFC0CB',
            owner: null,
            rent: 12,
            rentWithHouses: [60, 180, 500, 700],
            rentWithHotel: 900,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 14

        // Station
        {
            type: 'station',
            name: 'Station Two',
            price: 200,
            color: '#FFFFFF',
            owner: null,
            rent: 25,
            houses: 0,
            hotel: false
        }, // Index 15

        // Orange Properties
        {
            type: 'property',
            name: 'Orange1 Street',
            price: 180,
            color: '#FFA500',
            owner: null,
            rent: 14,
            rentWithHouses: [70, 200, 550, 750],
            rentWithHotel: 950,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 16
        { type: 'chest', name: 'Community Chest', price: null, color: null, owner: null }, // Index 17
        {
            type: 'property',
            name: 'Orange2 Street',
            price: 180,
            color: '#FFA500',
            owner: null,
            rent: 14,
            rentWithHouses: [70, 200, 550, 750],
            rentWithHotel: 950,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 18
        {
            type: 'property',
            name: 'Orange3 Street',
            price: 200,
            color: '#FFA500',
            owner: null,
            rent: 16,
            rentWithHouses: [80, 220, 600, 800],
            rentWithHotel: 1000,
            houseCost: 100,
            houses: 0,
            hotel: false
        }, // Index 19
        { type: 'parking', name: 'Free Parking', price: null, color: null, owner: null }, // Index 20

        // Top row (21-30), left to right
        // Red Properties
        {
            type: 'property',
            name: 'Red1 Street',
            price: 220,
            color: '#FF0000',
            owner: null,
            rent: 18,
            rentWithHouses: [90, 250, 700, 875],
            rentWithHotel: 1050,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 21
        { type: 'chance', name: 'Chance', price: null, color: null, owner: null }, // Index 22
        {
            type: 'property',
            name: 'Red2 Street',
            price: 220,
            color: '#FF0000',
            owner: null,
            rent: 18,
            rentWithHouses: [90, 250, 700, 875],
            rentWithHotel: 1050,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 23
        {
            type: 'property',
            name: 'Red3 Street',
            price: 240,
            color: '#FF0000',
            owner: null,
            rent: 20,
            rentWithHouses: [100, 300, 750, 925],
            rentWithHotel: 1100,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 24

        // Station
        {
            type: 'station',
            name: 'Station Three',
            price: 200,
            color: '#FFFFFF',
            owner: null,
            rent: 25,
            houses: 0,
            hotel: false
        }, // Index 25

        // Yellow Properties
        {
            type: 'property',
            name: 'Yellow1 Street',
            price: 260,
            color: '#FFFF00',
            owner: null,
            rent: 22,
            rentWithHouses: [110, 330, 800, 975],
            rentWithHotel: 1150,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 26
        {
            type: 'property',
            name: 'Yellow2 Street',
            price: 260,
            color: '#FFFF00',
            owner: null,
            rent: 22,
            rentWithHouses: [110, 330, 800, 975],
            rentWithHotel: 1150,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 27
        {
            type: 'utility',
            name: 'Utility Two',
            price: 150,
            color: '#FFFFFF',
            owner: null,
            rent: null, // Special rent rules for utilities
            houses: 0,
            hotel: false
        }, // Index 28
        {
            type: 'property',
            name: 'Yellow3 Street',
            price: 280,
            color: '#FFFF00',
            owner: null,
            rent: 24,
            rentWithHouses: [120, 360, 850, 1025],
            rentWithHotel: 1200,
            houseCost: 150,
            houses: 0,
            hotel: false
        }, // Index 29
        { type: 'go_to_jail', name: 'Go To Jail', price: null, color: null, owner: null }, // Index 30

        // Right column (31-39), top to bottom
        // Green Properties
        {
            type: 'property',
            name: 'Green1 Street',
            price: 300,
            color: '#008000',
            owner: null,
            rent: 26,
            rentWithHouses: [130, 390, 900, 1100],
            rentWithHotel: 1275,
            houseCost: 200,
            houses: 0,
            hotel: false
        }, // Index 31
        {
            type: 'property',
            name: 'Green2 Street',
            price: 300,
            color: '#008000',
            owner: null,
            rent: 26,
            rentWithHouses: [130, 390, 900, 1100],
            rentWithHotel: 1275,
            houseCost: 200,
            houses: 0,
            hotel: false
        }, // Index 32
        { type: 'chest', name: 'Community Chest', price: null, color: null, owner: null }, // Index 33
        {
            type: 'property',
            name: 'Green3 Street',
            price: 320,
            color: '#008000',
            owner: null,
            rent: 28,
            rentWithHouses: [150, 450, 1000, 1200],
            rentWithHotel: 1400,
            houseCost: 200,
            houses: 0,
            hotel: false
        }, // Index 34

        // Station
        {
            type: 'station',
            name: 'Station Four',
            price: 200,
            color: '#FFFFFF',
            owner: null,
            rent: 25,
            houses: 0,
            hotel: false
        }, // Index 35

        { type: 'chance', name: 'Chance', price: null, color: null, owner: null }, // Index 36

        // Dark Blue Properties
        {
            type: 'property',
            name: 'Blue1 Street',
            price: 350,
            color: '#00008B',
            owner: null,
            rent: 35,
            rentWithHouses: [175, 500, 1100, 1300],
            rentWithHotel: 1500,
            houseCost: 200,
            houses: 0,
            hotel: false
        }, // Index 37
        { type: 'tax', name: 'Super Tax', amount: 100, price: null, color: null, owner: null }, // Index 38
        {
            type: 'property',
            name: 'Blue2 Street',
            price: 400,
            color: '#00008B',
            owner: null,
            rent: 50,
            rentWithHouses: [200, 600, 1400, 1700],
            rentWithHotel: 2000,
            houseCost: 200,
            houses: 0,
            hotel: false
        }, // Index 39
    ];

    return tiles;
}


// Helper functions for card actions
function advanceToTile(player, targetPosition, gameState, passGo = true) {
    if (player.position > targetPosition && passGo) {
        player.money += 200;
        addMessage(`${getPlayerName(player)} passes Go and collects $200.`);
    }
    player.position = targetPosition;
    addMessage(`${getPlayerName(player)} advances to ${gameState.tiles[targetPosition].name}.`);
    handleTile(player, gameState.tiles[player.position], gameState);
}

function movePlayerBack(player, spaces, gameState) {
    player.position -= spaces;
    if (player.position < 0) {
        player.position += gameState.tiles.length;
    }
    addMessage(`${getPlayerName(player)} moves back ${spaces} spaces.`);
    handleTile(player, gameState.tiles[player.position], gameState);
}

function advanceToNearestStation(player, gameState, doubleRent = false) {
    const stationIndices = [5, 15, 25, 35];
    let targetPosition = stationIndices.find(index => index > player.position);
    if (targetPosition === undefined) {
        targetPosition = stationIndices[0];
        player.money += 200;
        addMessage(`${getPlayerName(player)} passes Go and collects $200.`);
    }
    player.position = targetPosition;
    addMessage(`${getPlayerName(player)} advances to ${gameState.tiles[targetPosition].name}.`);
    handleTile(player, gameState.tiles[player.position], gameState, { doubleRent });
}

function advanceToNearestUtility(player, gameState) {
    const utilityIndices = [12, 28];
    let targetPosition = utilityIndices.find(index => index > player.position);
    if (targetPosition === undefined) {
        targetPosition = utilityIndices[0];
        player.money += 200;
        addMessage(`${getPlayerName(player)} passes Go and collects $200.`);
    }
    player.position = targetPosition;
    addMessage(`${getPlayerName(player)} advances to ${gameState.tiles[targetPosition].name}.`);
    handleTile(player, gameState.tiles[player.position], gameState, { specialUtilityRent: true });
}

function payEachPlayer(player, gameState, amount) {
    gameState.players.forEach(p => {
        if (p !== player) {
            player.money -= amount;
            p.money += amount;
            addMessage(`${getPlayerName(player)} pays $${amount} to ${getPlayerName(p)}.`);
        }
    });
}

function collectFromEachPlayer(player, gameState, amount) {
    let totalCollected = 0;
    gameState.players.forEach(p => {
        if (p !== player) {
            p.money -= amount;
            totalCollected += amount;
            addMessage(`${getPlayerName(p)} pays $${amount} to ${getPlayerName(player)}.`);
        }
    });
    player.money += totalCollected;
}

function drawBoard(gameState) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const margin = 40; // 20px margins on each side
    const availableWidth = window.innerWidth - margin;
    const availableHeight = window.innerHeight - margin;

    const boardSize = Math.min(availableWidth, availableHeight);

    // Define tile sizes
    const cornerTileSize = boardSize / 8;
    const sideTilesCount = 9;

    // Side tile dimensions
    const sideTileWidthHorizontal = (boardSize - 2 * cornerTileSize) / sideTilesCount;
    const sideTileHeightHorizontal = cornerTileSize;

    const sideTileWidthVertical = cornerTileSize;
    const sideTileHeightVertical = (boardSize - 2 * cornerTileSize) / sideTilesCount;

    // Adjust for high-DPI displays
    const ratio = window.devicePixelRatio || 1;

    canvas.width = boardSize * ratio;
    canvas.height = boardSize * ratio;
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Clear the canvas
    ctx.clearRect(0, 0, boardSize, boardSize);

    // Draw tiles
    gameState.tiles.forEach((tile, index) => {
        let x, y, width, height;

        if (index >= 0 && index <= 10) {
            // Bottom row (right to left)
            if (index === 0) {
                // GO corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = boardSize - cornerTileSize;
                y = boardSize - cornerTileSize;
            } else if (index === 10) {
                // Jail corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = 0;
                y = boardSize - cornerTileSize;
            } else {
                // Bottom side tiles
                width = sideTileWidthHorizontal;
                height = cornerTileSize;
                x = boardSize - cornerTileSize - sideTileWidthHorizontal * index;
                y = boardSize - cornerTileSize;
            }
        } else if (index >= 11 && index <= 20) {
            // Left column (bottom to top)
            if (index === 20) {
                // Free Parking corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = 0;
                y = 0;
            } else {
                // Left side tiles
                width = cornerTileSize;
                height = sideTileHeightVertical;
                x = 0;
                y = boardSize - cornerTileSize - sideTileHeightVertical * (index - 10);
            }
        } else if (index >= 21 && index <= 30) {
            // Top row (left to right)
            if (index === 30) {
                // Go to Jail corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = boardSize - cornerTileSize;
                y = 0;
            } else {
                // Top side tiles
                width = sideTileWidthHorizontal;
                height = cornerTileSize;
                x = cornerTileSize + sideTileWidthHorizontal * (index - 21);
                y = 0;
            }
        } else if (index >= 31 && index <= 39) {
            // Right column (top to bottom)
            width = cornerTileSize;
            height = sideTileHeightVertical;
            x = boardSize - cornerTileSize;
            y = cornerTileSize + sideTileHeightVertical * (index - 31);
        }

        // Draw tile rectangle
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, width, height);

        // Fill property color bar
        if (tile.type === 'property' && tile.color) {
            ctx.fillStyle = tile.color;

            // Determine where to draw the color bar based on tile position
            if (index >= 11 && index <= 19) {
                // Left column tiles (excluding corner at index 20)
                ctx.fillRect(x, y, width * 0.15, height); // Left edge
            } else if (index >= 31 && index <= 39) {
                // Right column tiles (excluding corner at index 30)
                ctx.fillRect(x + width * 0.85, y, width * 0.15, height); // Right edge
            } else {
                // Top and bottom rows (color bar at top)
                ctx.fillRect(x, y, width, height * 0.15); // Top edge
            }
        }

        // Draw ownership outline if owned
        if (tile.owner) {
            ctx.strokeStyle = tile.owner.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3);
            ctx.lineWidth = 1;
        }

        // Display tile name centered
        ctx.fillStyle = 'black';
        ctx.font = `${Math.min(width, height) * 0.1}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = x + width / 2;
        const textY = y + height / 2;

        wrapText(ctx, tile.name, textX, textY - 5, width - 10, height * 0.1);

        // Display tile price, if applicable, centered below the name
        if (tile.price) {
            ctx.font = `bold ${Math.min(width, height) * 0.1}px Arial`;
            ctx.fillText(`$${tile.price}`, textX, textY + height * 0.25);
        }
    });

    // Draw players
    drawPlayers(gameState, cornerTileSize, sideTileWidthHorizontal, sideTileHeightVertical, boardSize);

    // Draw HUD
    drawHUD(gameState);
}





function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());

    // Adjust y to center text vertically
    const totalHeight = lines.length * lineHeight;
    const startY = y - totalHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, startY + (i * lineHeight));
    }
}


function drawPlayers(gameState, cornerTileSize, sideTileWidthHorizontal, sideTileHeightVertical, boardSize) {
    const ctx = document.getElementById('gameCanvas').getContext('2d');

    // Group players by their position
    const positionMap = {};
    gameState.players.forEach(player => {
        const pos = player.position;
        if (!positionMap[pos]) {
            positionMap[pos] = [];
        }
        positionMap[pos].push(player);
    });

    // Draw players on each tile
    Object.keys(positionMap).forEach(positionIndex => {
        positionIndex = parseInt(positionIndex);
        const playersOnTile = positionMap[positionIndex];
        let x, y, width, height;

        if (positionIndex >= 0 && positionIndex <= 10) {
            // Bottom row (right to left)
            if (positionIndex === 0) {
                // GO corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = boardSize - cornerTileSize;
                y = boardSize - cornerTileSize;
            } else if (positionIndex === 10) {
                // Jail corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = 0;
                y = boardSize - cornerTileSize;
            } else {
                // Bottom side tiles
                width = sideTileWidthHorizontal;
                height = cornerTileSize;
                x = boardSize - cornerTileSize - sideTileWidthHorizontal * positionIndex;
                y = boardSize - cornerTileSize;
            }
        } else if (positionIndex >= 11 && positionIndex <= 20) {
            // Left column (bottom to top)
            if (positionIndex === 20) {
                // Free Parking corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = 0;
                y = 0;
            } else {
                // Left side tiles
                width = cornerTileSize;
                height = sideTileHeightVertical;
                x = 0;
                y = boardSize - cornerTileSize - sideTileHeightVertical * (positionIndex - 10);
            }
        } else if (positionIndex >= 21 && positionIndex <= 30) {
            // Top row (left to right)
            if (positionIndex === 30) {
                // Go to Jail corner
                width = cornerTileSize;
                height = cornerTileSize;
                x = boardSize - cornerTileSize;
                y = 0;
            } else {
                // Top side tiles
                width = sideTileWidthHorizontal;
                height = cornerTileSize;
                x = cornerTileSize + sideTileWidthHorizontal * (positionIndex - 21);
                y = 0;
            }
        } else if (positionIndex >= 31 && positionIndex <= 39) {
            // Right column (top to bottom)
            // Right side tiles
            width = cornerTileSize;
            height = sideTileHeightVertical;
            x = boardSize - cornerTileSize;
            y = cornerTileSize + sideTileHeightVertical * (positionIndex - 31);
        }

        // Calculate positions for multiple players on the same tile
        const offsets = [
            { dx: width * 0.25, dy: height * 0.25 },
            { dx: width * 0.75, dy: height * 0.25 },
            { dx: width * 0.25, dy: height * 0.75 },
            { dx: width * 0.75, dy: height * 0.75 },
            { dx: width * 0.5, dy: height * 0.5 },
            { dx: width * 0.75, dy: height * 0.5 },
        ];

        playersOnTile.forEach((player, idx) => {
            const offset = offsets[idx % offsets.length]; // Supports up to 6 players per tile
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(x + offset.dx, y + offset.dy, Math.min(width, height) * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
        });
    });
}



function drawHUD(gameState) {
    const existingHUD = document.getElementById('hud');
    if (existingHUD) existingHUD.remove();

    const hud = document.createElement('div');
    hud.id = 'hud';

    const playerInfoContainer = document.createElement('div');
    gameState.players.forEach((player, index) => {
        const playerInfo = document.createElement('div');
        playerInfo.innerHTML = `
            <div style="color: ${player.color}; font-weight: bold;">${player.name}</div>
            <div>Money: $${player.money}</div>
            ${player.inJail ? '<div><em>In Jail</em></div>' : ''}
             
            <hr>
        `;
        playerInfoContainer.appendChild(playerInfo);
    });
    hud.appendChild(playerInfoContainer);

    document.body.appendChild(hud);
}

function addMessage(message) {
    const messageList = document.getElementById('messageList');
    if (messageList) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerText = message;
        messageList.appendChild(messageElement);

        // Limit to last 10 messages
        const messages = messageList.getElementsByClassName('message');
        if (messages.length > 10) {
            messageList.removeChild(messages[0]); // Remove oldest message
        }

        // Scroll to the bottom of the message list
        messageList.scrollTop = messageList.scrollHeight;
    }
}

function getPlayerName(player) {
    return player.name;
}

function takeTurn(gameState) {
    const player = gameState.players[gameState.currentPlayerIndex];


    // Update Turn Indicator
    const turnIndicator = document.getElementById('turnIndicator');
    if (player.isBot) {
        // It's another player's turn
        turnIndicator.innerHTML = `It's <span class="player-name">${player.name}</span>'s Turn`;
        const playerNameSpan = turnIndicator.querySelector('.player-name');
        playerNameSpan.style.color = player.color;
    } else {
        // It's your turn
        turnIndicator.innerText = "It's your turn";
    }

    // Remove existing UI elements
    const existingPanel = document.getElementById('managementPanel');
    if (existingPanel) existingPanel.remove();

    // Update HUD
    drawHUD(gameState);

    if (player.inJail) {
        handlePlayerInJail(player, gameState);
        return;
    }

    if (player.isBot) {
        // Bot's turn
        botManageProperties(player, gameState);

        setTimeout(() => {
            // Bot rolls dice
            const diceRoll = rollDice();
            gameState.lastDiceRoll = diceRoll;
            animateDiceRoll(diceRoll, gameState, () => {
                // Move bot
                movePlayer(player, diceRoll.total, gameState, () => {
                    // Bot handles tile
                    botHandleTile(player, gameState.tiles[player.position], gameState);
                });
            });
        }, 1000);
    } else {
        // Human player's turn

        // Display property management options
        if (playerCanManageProperties(player)) {
            showPropertyManagementOptions(player, gameState);
        }

        // Show the Roll Dice button
        const rollButton = document.getElementById('rollDiceButton');
        rollButton.style.display = 'block';

        // Remove any existing event listeners
        rollButton.replaceWith(rollButton.cloneNode(true));
        const newRollButton = document.getElementById('rollDiceButton');

        // Add event listener
        newRollButton.addEventListener('click', () => {
            // Hide the button after clicking
            newRollButton.style.display = 'none';

            // Remove property management options if needed
            const existingPanel = document.getElementById('managementPanel');
            if (existingPanel) existingPanel.remove();

            // Roll dice
            const diceRoll = rollDice();
            gameState.lastDiceRoll = diceRoll;
            animateDiceRoll(diceRoll, gameState, () => {
                // Move player
                movePlayer(player, diceRoll.total, gameState, () => {
                    // Handle landing on tile
                    handleTile(player, gameState.tiles[player.position], gameState);
                });
            });
        });
    }
}



function proceedToNextTurn(player, gameState) {
    // Check for doubles
    const lastDiceRoll = gameState.lastDiceRoll;

    if (lastDiceRoll && lastDiceRoll.isDouble && !player.isBot && !player.inJail) {
        addMessage(`You rolled a double! You get another turn.`);
        takeTurn(gameState);
    } else {
        // Proceed to next player's turn
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        drawBoard(gameState);
        takeTurn(gameState);
    }
}

function rollDice() {
    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    return { die1, die2, total: die1 + die2, isDouble: die1 === die2 };
}

function animateDiceRoll(diceRoll, gameState, callback) {
    // Display the dice roll result
    const player = gameState.players[gameState.currentPlayerIndex];
    addMessage(`${getPlayerName(player)} rolled a ${diceRoll.die1} and a ${diceRoll.die2} (Total: ${diceRoll.total})`);
    // Call the callback to proceed
    callback();
}

function movePlayer(player, steps, gameState, callback) {
    // Animate player movement
    const totalTiles = gameState.tiles.length;
    let stepsMoved = 0;

    const moveInterval = setInterval(() => {
        player.position = (player.position + 1) % totalTiles;

        // Passing GO
        if (player.position === 0 && stepsMoved > 0) {
            player.money += 200; // Collect $200 when passing GO
            addMessage(`${getPlayerName(player)} passed GO and collected $200`);
        }

        stepsMoved++;
        drawBoard(gameState);

        // Optional: Play movement sound
        // ...

        if (stepsMoved >= steps) {
            clearInterval(moveInterval);
            // Defer the callback to ensure UI updates before handling the tile
            setTimeout(callback, 100);
        }
    }, 200); // Adjust speed as needed
}

function handleTile(player, tile, gameState, options = {}) {
    switch (tile.type) {
        case 'property':
        case 'station':
        case 'utility':
            if (!tile.owner) {
                // Offer to buy using custom modal
                showModal(`Do you want to buy ${tile.name} for $${tile.price}?`, [
                    {
                        text: 'Yes',
                        action: () => {
                            if (player.money >= tile.price) {
                                player.money -= tile.price;
                                tile.owner = player;
                                player.properties.push(tile);
                                drawBoard(gameState);
                                addMessage(`You bought ${tile.name}`);
                            } else {
                                addMessage(`You don't have enough money to buy ${tile.name}.`);
                            }
                            proceedToNextTurn(player, gameState);
                        },
                    },
                    {
                        text: 'No',
                        action: () => {
                            addMessage(`You decided not to buy ${tile.name}`);
                            proceedToNextTurn(player, gameState);
                        },
                    },
                ]);
            } else if (tile.owner !== player) {
                // Pay rent
                const rent = calculateRent(tile, gameState, options);
                player.money -= rent;
                tile.owner.money += rent;
                drawBoard(gameState);
                addMessage(`You landed on ${tile.name} owned by ${getPlayerName(tile.owner)}. Pay rent: $${rent}`);
                proceedToNextTurn(player, gameState);
            } else {
                // Own property
                addMessage(`You landed on your own property: ${tile.name}`);
                proceedToNextTurn(player, gameState);
            }
            break;
        case 'tax':
            player.money -= tile.amount;
            addMessage(`You paid ${tile.name}: $${tile.amount}`);
            drawBoard(gameState);
            proceedToNextTurn(player, gameState);
            break;
        case 'chance':
            drawChanceCard(player, gameState);
            // No need to call proceedToNextTurn here; it's handled after the card action
            break;
        case 'chest':
            drawChestCard(player, gameState);
            // No need to call proceedToNextTurn here; it's handled after the card action
            break;
        case 'go_to_jail':
            player.position = 10; // Jail position
            player.inJail = true;
            drawBoard(gameState);
            addMessage(`${getPlayerName(player)} goes directly to Jail!`);
            proceedToNextTurn(player, gameState);
            break;
        // Handle other tile types...
        default:
            proceedToNextTurn(player, gameState);
            break;
    }
}

function botHandleTile(player, tile, gameState) {
    switch (tile.type) {
        case 'property':
        case 'station':
        case 'utility':
            if (!tile.owner) {
                // Bot decides whether to buy the property
                if (player.money >= tile.price) {
                    const buyChance = Math.random();
                    if (buyChance > 0.5) { // 50% chance to buy
                        player.money -= tile.price;
                        tile.owner = player;
                        player.properties.push(tile);
                        drawBoard(gameState);
                        addMessage(`${getPlayerName(player)} bought ${tile.name}`);
                    } else {
                        addMessage(`${getPlayerName(player)} decided not to buy ${tile.name}`);
                    }
                }
            } else if (tile.owner !== player) {
                // Pay rent
                const rent = calculateRent(tile, gameState);
                player.money -= rent;
                tile.owner.money += rent;
                drawBoard(gameState);
                addMessage(`${getPlayerName(player)} landed on ${tile.name} owned by ${getPlayerName(tile.owner)}. Paying rent: $${rent}`);
            }
            break;
        case 'tax':
            player.money -= tile.amount;
            addMessage(`${getPlayerName(player)} paid ${tile.name}: $${tile.amount}`);
            drawBoard(gameState);
            break;
        case 'chance':
            drawChanceCard(player, gameState);
            break;
        case 'chest':
            drawChestCard(player, gameState);
            break;
        case 'go_to_jail':
            player.position = 10; // Jail position
            player.inJail = true;
            drawBoard(gameState);
            addMessage(`${getPlayerName(player)} goes directly to Jail!`);
            break;
        default:
            // Other tile types
            break;
    }
    // Proceed to next turn
    proceedToNextTurn(player, gameState);
}

function calculateRent(tile, gameState, options = {}) {
    let rent = 0;
    if (tile.type === 'property') {
        // Simplified rent calculation
        rent = tile.price * 0.1;
        // Check for monopolies
        const owner = tile.owner;
        const colorGroup = tile.color;
        const ownedProperties = owner.properties.filter(t => t.color === colorGroup);
        const totalPropertiesInGroup = gameState.tiles.filter(t => t.color === colorGroup).length;
        if (ownedProperties.length === totalPropertiesInGroup) {
            // Double rent for monopoly
            rent *= 2;
        }
    } else if (tile.type === 'station') {
        // Rent based on number of stations owned
        const owner = tile.owner;
        const stationsOwned = owner.properties.filter(t => t.type === 'station').length;
        rent = 25 * stationsOwned;
        if (options.doubleRent) {
            rent *= 2;
        }
    } else if (tile.type === 'utility') {
        const owner = tile.owner;
        const utilitiesOwned = owner.properties.filter(t => t.type === 'utility').length;
        let diceRollTotal = gameState.lastDiceRoll ? gameState.lastDiceRoll.total : 7; // Default to 7 if no dice roll recorded

        if (options.specialUtilityRent) {
            // Roll dice and pay ten times amount thrown
            const die1 = Math.ceil(Math.random() * 6);
            const die2 = Math.ceil(Math.random() * 6);
            diceRollTotal = die1 + die2;
            rent = diceRollTotal * 10;
            addMessage(`${getPlayerName(player)} rolls a ${die1} and a ${die2} for utility rent calculation.`);
        } else {
            rent = diceRollTotal * (utilitiesOwned === 1 ? 4 : 10);
        }
    }
    return rent;
}

function botManageProperties(player, gameState) {
    // Simple AI: If bot has enough money, buy houses on owned properties
    // Not implemented in this example
}

function generateChanceCards() {
    return [
        { text: "Advance to Go (Collect $200)", action: (player, gameState) => { player.position = 0; player.money += 200; addMessage(`${getPlayerName(player)} advances to Go and collects $200.`); handleTile(player, gameState.tiles[player.position], gameState); } },
        { text: "Advance to Pink2 Street. If you pass Go, collect $200", action: (player, gameState) => { advanceToTile(player, 13, gameState); } },
        { text: "Advance to Blue2 Street", action: (player, gameState) => { advanceToTile(player, 39, gameState, false); } },
        { text: "Advance to Red2 Street. If you pass Go, collect $200", action: (player, gameState) => { advanceToTile(player, 23, gameState); } },
        { text: "Advance to the nearest Station. If unowned, you may buy it. If owned, pay double rent.", action: (player, gameState) => { advanceToNearestStation(player, gameState, true); } },
        { text: "Advance token to nearest Utility. If unowned, you may buy it. If owned, throw dice and pay owner ten times amount thrown.", action: (player, gameState) => { advanceToNearestUtility(player, gameState); } },
        { text: "Bank pays you dividend of $50", action: (player, gameState) => { player.money += 50; addMessage(`${getPlayerName(player)} receives $50 dividend from bank.`); proceedToNextTurn(player, gameState); } },
        { text: "Get Out of Jail Free", action: (player, gameState) => { player.hasGetOutOfJailFreeCard = true; addMessage(`${getPlayerName(player)} receives a Get Out of Jail Free card.`); proceedToNextTurn(player, gameState); } },
        { text: "Go Back 3 Spaces", action: (player, gameState) => { movePlayerBack(player, 3, gameState); } },
        { text: "Go to Jail. Go directly to Jail, do not pass Go, do not collect $200", action: (player, gameState) => { player.position = 10; player.inJail = true; addMessage(`${getPlayerName(player)} goes directly to Jail.`); proceedToNextTurn(player, gameState); } },
        { text: "Make general repairs on all your property. $40 per house. $115 per hotel", action: (player, gameState) => { /* Implement repairs if houses/hotels are added */ proceedToNextTurn(player, gameState); } },
        { text: "Speeding fine $15", action: (player, gameState) => { player.money -= 15; addMessage(`${getPlayerName(player)} pays $15 speeding fine.`); proceedToNextTurn(player, gameState); } },
        { text: "Take a trip to Station Three. If you pass Go, collect $200", action: (player, gameState) => { advanceToTile(player, 25, gameState); } },
        { text: "You have been elected Chairman of the Board. Pay each player $50", action: (player, gameState) => { payEachPlayer(player, gameState, 50); proceedToNextTurn(player, gameState); } }
    ];
}

function generateChestCards() {
    return [
        { text: "Advance to Go (Collect $200)", action: (player, gameState) => { player.position = 0; player.money += 200; addMessage(`${getPlayerName(player)} advances to Go and collects $200.`); handleTile(player, gameState.tiles[player.position], gameState); } },
        { text: "Bank error in your favour. Collect $200", action: (player, gameState) => { player.money += 200; addMessage(`${getPlayerName(player)} collects $200 from bank error.`); proceedToNextTurn(player, gameState); } },
        { text: "Doctor’s fee. Pay $50", action: (player, gameState) => { player.money -= 50; addMessage(`${getPlayerName(player)} pays $50 doctor's fee.`); proceedToNextTurn(player, gameState); } },
        { text: "From sale of stock you get $50", action: (player, gameState) => { player.money += 50; addMessage(`${getPlayerName(player)} receives $50 from stock sale.`); proceedToNextTurn(player, gameState); } },
        { text: "Get Out of Jail Free", action: (player, gameState) => { player.hasGetOutOfJailFreeCard = true; addMessage(`${getPlayerName(player)} receives a Get Out of Jail Free card.`); proceedToNextTurn(player, gameState); } },
        { text: "Go to Jail. Go directly to jail, do not pass Go, do not collect $200", action: (player, gameState) => { player.position = 10; player.inJail = true; addMessage(`${getPlayerName(player)} goes directly to Jail.`); proceedToNextTurn(player, gameState); } },
        { text: "Holiday fund matures. Receive $100", action: (player, gameState) => { player.money += 100; addMessage(`${getPlayerName(player)} receives $100 from holiday fund.`); proceedToNextTurn(player, gameState); } },
        { text: "Income tax refund. Collect $20", action: (player, gameState) => { player.money += 20; addMessage(`${getPlayerName(player)} collects $20 income tax refund.`); proceedToNextTurn(player, gameState); } },
        { text: "It is your birthday. Collect $10 from every player", action: (player, gameState) => { collectFromEachPlayer(player, gameState, 10); proceedToNextTurn(player, gameState); } },
        { text: "Life insurance matures. Collect $100", action: (player, gameState) => { player.money += 100; addMessage(`${getPlayerName(player)} collects $100 from life insurance maturity.`); proceedToNextTurn(player, gameState); } },
        { text: "Pay hospital fees of $100", action: (player, gameState) => { player.money -= 100; addMessage(`${getPlayerName(player)} pays $100 hospital fees.`); proceedToNextTurn(player, gameState); } },
        { text: "Pay school fees of $50", action: (player, gameState) => { player.money -= 50; addMessage(`${getPlayerName(player)} pays $50 school fees.`); proceedToNextTurn(player, gameState); } },
        { text: "Receive $25 consultancy fee", action: (player, gameState) => { player.money += 25; addMessage(`${getPlayerName(player)} receives $25 consultancy fee.`); proceedToNextTurn(player, gameState); } },
        { text: "You are assessed for street repairs. $40 per house, $115 per hotel", action: (player, gameState) => { /* Implement repairs if houses/hotels are added */ proceedToNextTurn(player, gameState); } }
    ];
}


function drawChanceCard(player, gameState) {
    const cardIndex = Math.floor(Math.random() * gameState.chanceCards.length);
    const card = gameState.chanceCards.splice(cardIndex, 1)[0]; // Remove the card from the deck
    addMessage(`${getPlayerName(player)} drew a Chance Card: ${card.text}`);
    card.action(player, gameState);
    // If the card is not a Get Out of Jail Free card, return it to the bottom of the deck
    if (!card.text.includes('Get Out of Jail Free')) {
        gameState.chanceCards.push(card);
    }
    drawBoard(gameState);
}

function drawChestCard(player, gameState) {
    const cardIndex = Math.floor(Math.random() * gameState.chestCards.length);
    const card = gameState.chestCards.splice(cardIndex, 1)[0]; // Remove the card from the deck
    addMessage(`${getPlayerName(player)} drew a Community Chest Card: ${card.text}`);
    card.action(player, gameState);
    // If the card is not a Get Out of Jail Free card, return it to the bottom of the deck
    if (!card.text.includes('Get Out of Jail Free')) {
        gameState.chestCards.push(card);
    }
    drawBoard(gameState);
}

function playerCanManageProperties(player) {
    // Check if player owns any properties
    return player.properties && player.properties.length > 0;
}

function showPropertyManagementOptions(player, gameState) {
    // Create a management panel
    const managementPanel = document.createElement('div');
    managementPanel.id = 'managementPanel';
    managementPanel.style.position = 'absolute';
    managementPanel.style.left = '20px';
    managementPanel.style.top = '20px';
    managementPanel.style.padding = '10px';
    managementPanel.style.borderRadius = '5px';

    managementPanel.innerHTML = `
        <h3>Manage Your Properties</h3>
        <button id="buyHouse">Buy Houses</button>
        <button id="sellProperty">Sell Properties</button>
        <button id="trade">Trade</button>
    `;
    document.body.appendChild(managementPanel);

    // Add event listeners
    document.getElementById('buyHouse').addEventListener('click', () => {
        // Implement buying houses
        addMessage('Buying houses is not implemented yet.');
    });
    document.getElementById('sellProperty').addEventListener('click', () => {
        // Implement selling properties
        addMessage('Selling properties is not implemented yet.');
    });
    document.getElementById('trade').addEventListener('click', () => {
        // Implement trading
        addMessage('Trading is not implemented yet.');
    });
}



// Modal functions

function showModal(message, buttons) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalButtons = document.getElementById('modalButtons');

    modalContent.innerHTML = `<p>${message}</p>`;
    modalButtons.innerHTML = '';

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.innerText = button.text;
        btn.addEventListener('click', () => {
            closeModal();
            button.action();
        });
        modalButtons.appendChild(btn);
    });

    modalOverlay.style.display = 'flex';
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'none';
}

function handlePlayerInJail(player, gameState) {
    if (player.isBot) {
        // Bot attempts to roll doubles to get out of jail
        setTimeout(() => {
            const diceRoll = rollDice();
            addMessage(`${getPlayerName(player)} is attempting to roll doubles to get out of jail.`);
            addMessage(`${getPlayerName(player)} rolled a ${diceRoll.die1} and a ${diceRoll.die2}.`);
            if (diceRoll.isDouble) {
                player.inJail = false;
                addMessage(`${getPlayerName(player)} rolled doubles and is released from jail.`);
                gameState.lastDiceRoll = diceRoll;
                movePlayer(player, diceRoll.total, gameState, () => {
                    botHandleTile(player, gameState.tiles[player.position], gameState);
                });
            } else {
                addMessage(`${getPlayerName(player)} failed to roll doubles and remains in jail.`);
                proceedToNextTurn(player, gameState);
            }
        }, 1000);
    } else {
        // Human player options
        showModal('You are in jail. Choose an option:', [
            {
                text: 'Use Get Out of Jail Free Card',
                action: () => {
                    if (player.hasGetOutOfJailFreeCard) {
                        player.hasGetOutOfJailFreeCard = false;
                        player.inJail = false;
                        addMessage(`You used your Get Out of Jail Free card.`);
                        takeTurn(gameState);
                    } else {
                        addMessage(`You don't have a Get Out of Jail Free card.`);
                        handlePlayerInJail(player, gameState);
                    }
                }
            },
            {
                text: 'Pay $50 bail',
                action: () => {
                    if (player.money >= 50) {
                        player.money -= 50;
                        player.inJail = false;
                        addMessage(`You paid $50 bail and are released from jail.`);
                        takeTurn(gameState);
                    } else {
                        addMessage(`You don't have enough money to pay bail.`);
                        handlePlayerInJail(player, gameState);
                    }
                }
            },
            {
                text: 'Roll for Doubles',
                action: () => {
                    const diceRoll = rollDice();
                    addMessage(`You rolled a ${diceRoll.die1} and a ${diceRoll.die2}.`);
                    if (diceRoll.isDouble) {
                        player.inJail = false;
                        addMessage(`You rolled doubles and are released from jail.`);
                        gameState.lastDiceRoll = diceRoll;
                        movePlayer(player, diceRoll.total, gameState, () => {
                            handleTile(player, gameState.tiles[player.position], gameState);
                        });
                    } else {
                        addMessage(`You failed to roll doubles and remain in jail.`);
                        proceedToNextTurn(player, gameState);
                    }
                }
            }
        ]);
    }
}
