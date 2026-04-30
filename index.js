const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "!";
let data = {};

try {
    data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
} catch {
    data = {};
}

function save() {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).split(" ");
    const command = args.shift().toLowerCase();

    const user = message.author.username.toLowerCase();
    const boss = args.join(" ").toLowerCase();

    // ➕ AJOUTER UNE CAPTURE
    if (command === "capture") {
        if (!boss) return message.reply("Tu dois préciser un boss !");

        if (!data[user]) data[user] = {};
        if (!data[user][boss]) data[user][boss] = 0;

        data[user][boss]++;
        save();

        return message.reply(`➕ ${boss} ajouté ! Total : ${data[user][boss]}`);
    }

    // ➖ RETIRER UNE CAPTURE
    if (command === "uncapture") {
        if (!boss) return message.reply("Tu dois préciser un boss !");

        if (!data[user] || !data[user][boss]) {
            return message.reply("Tu n'as pas cette capture !");
        }

        data[user][boss]--;

        if (data[user][boss] <= 0) {
            delete data[user][boss];
        }

        save();

        return message.reply(`➖ ${boss} retiré !`);
    }

    // 📊 VOIR SES CAPTURES
    if (command === "captures") {
        if (!data[user] || Object.keys(data[user]).length === 0) {
            return message.reply("Tu n'as aucune capture.");
        }

        let msg = `**Captures de ${message.author.username} :**\n`;

        for (let boss in data[user]) {
            msg += `- ${boss} : ${data[user][boss]}\n`;
        }

        return message.reply(msg);
    }
});

client.login(process.env.TOKEN);