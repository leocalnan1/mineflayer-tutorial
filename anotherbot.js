const mineflayer = require("mineflayer");

var settings = {
    username: "TestMachine",
    host: "localhost",
    port: 25565,
    version: '1.19.4'
};

const bot = mineflayer.createBot(settings);

bot.once("spawn", ()=>{
    bot.chat("Hello everyone!");
});

bot.on("move", ()=>{
    let friend = bot.nearestEntity();

    if (friend) {
        bot.lookAt(friend.position.offset(0, friend.height, 0));
    }
});

var walking = false;

bot.on("entityHurt", (entity)=>{
    if (entity != bot.entity) return;
    walking = !walking;
    bot.setControlState("forward", walking);
});

bot.on('spawn', () => {
    console.log('Bot has spawned in the game.')
    const position = bot.entity.position
    console.log(`Bot is at: ${position}`)
    bot.chat(`I am at: ${position}`)
  })
  
  bot.on('chat', (username, message) => {
    if (message === 'coords') {
      const position = bot.entity.position
      bot.chat(`My coordinates are: ${position}`)
    }
  })

  async function digDown() {
    let blockPosition = bot.entity.position.offset(0, -1, 0);
    let block = bot.blockAt(blockPosition);

    await bot.dig(block, false);
    bot.chat("Dug.");
}

function isGoldBlock(block) {
    return block.name === "gold_block";
}

function digGold() {
    let block = bot.findBlock({
        matching: isGoldBlock,
        maxDistance: 5,
    });

    if (block) bot.dig(block, false);
    else bot.chat("i can't reach ;-;");
}

async function buildUp() {
    // Start Jump
    bot.setControlState("jump", true);

    // Wait until the bot is high enough
    while (true) {
        let positionBelow = bot.entity.position.offset(0, -0.5, 0);
        let blockBelow = bot.blockAt(positionBelow);

        if (blockBelow.name === "air") break;
        await bot.waitForTicks(1);
    }

    // Place a block
    let sourcePosition = bot.entity.position.offset(0, -1.5, 0);
    let sourceBlock = bot.blockAt(sourcePosition);
    
    let faceVector = {x:0, y:1, z:0};

    await bot.placeBlock(sourceBlock, faceVector);

    // Stop jump
    bot.setControlState("jump", false);
}

bot.on("chat", (username, text)=>{
    if (username === bot.username) return;

    if (text === "down") digDown();
    else if (text === "gold") digGold();
    else if (text === "up") buildUp();
    else bot.chat("I don't understand.");
});