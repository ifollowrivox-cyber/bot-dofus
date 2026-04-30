const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const PREFIX = "!";
let data = {};

try {
    data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
} catch (err) {
    data = {};
}

client.on('clientReady', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).split(" ");
    const command = args.shift().toLowerCase();

    if (command === "capture") {
        const boss = args.join(" ").toLowerCase();

        if (!boss) {
            return message.reply("Tu dois préciser un boss !");
        }

        if (!data[boss]) data[boss] = 0;
        data[boss]++;

        fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));

        message.reply(`Capture ajoutée pour ${boss} ! Total: ${data[boss]}`);
    }

    if (command === "captures") {
        if (Object.keys(data).length === 0) {
            return message.reply("Aucune capture.");
        }

        let msg = "**Captures :**\n";
        for (let boss in data) {
            msg += `- ${boss} : ${data[boss]}\n`;
        }

        message.reply(msg);
    }
});

client.login('MTQ5OTM4NDY4MDYxOTk2NjU2NA.GyEUh_.QSEM8b30kkcKhhKt26MUKjqVZGVGihC7Qtf5AY');