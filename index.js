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

// 🔄 Chargement des données
try {
    data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
} catch {
    data = {};
}

// 💾 Sauvegarde
function save() {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

// ✅ Bot prêt
client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// 📩 Messages
client.on('messageCreate', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).split(" ");
    const command = args.shift().toLowerCase();

    const user = message.author.username.toLowerCase();
    const boss = args.join(" ").toLowerCase();

    // ➕ ajouter capture
    if (command === "capture") {
        if (!boss) return message.reply("Tu dois préciser un boss !");

        if (!data[user]) data[user] = {};
        if (!data[user][boss]) data[user][boss] = 0;

        data[user][boss]++;
        save();

        return message.reply(`➕ ${boss} ajouté ! Total : ${data[user][boss]}`);
    }

    // ➖ retirer capture
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

    // 📊 captures serveur (TOUT LE MONDE)
    if (command === "captures") {
        if (!data || Object.keys(data).length === 0) {
            return message.reply("Aucune capture enregistrée.");
        }

        let msg = "**📊 Captures du serveur :**\n";

        for (let user in data) {
            msg += `\n👤 **${user}**\n`;

            for (let boss in data[user]) {
                msg += `- ${boss} : ${data[user][boss]}\n`;
            }
        }

        return message.reply(msg);
    }
});

// 🔐 login
client.login(process.env.TOKEN);