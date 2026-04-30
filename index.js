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

// 🔍 Récupère tous les boss connus dans les données
function getAllKnownBosses() {
    const bosses = new Set();
    for (const user in data) {
        for (const boss in data[user]) {
            bosses.add(boss);
        }
    }
    return [...bosses];
}

// 🔍 Autocomplétion : trouve le boss le plus proche
function autocomplete(input) {
    const known = getAllKnownBosses();
    const match = known.find(b => b.startsWith(input) || b.includes(input));
    return match || input;
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
    const rawBoss = args.join(" ").toLowerCase();
    const boss = rawBoss ? autocomplete(rawBoss) : "";

    // ➕ ajouter capture
    if (command === "capture") {
        if (!rawBoss) return message.reply("Tu dois préciser un boss !");

        const wasAutocompleted = boss !== rawBoss;

        if (!data[user]) data[user] = {};
        if (!data[user][boss]) data[user][boss] = 0;
        data[user][boss]++;
        save();

        const autocompleteNote = wasAutocompleted ? ` *(autocomplétion : **${rawBoss}** → **${boss}**)*` : "";
        return message.reply(`➕ **${boss}** capturé par **${user}** ! Total : ${data[user][boss]}${autocompleteNote}`);
    }

    // ➖ retirer capture
    if (command === "uncapture") {
        if (!rawBoss) return message.reply("Tu dois préciser un boss !");
        if (!data[user] || !data[user][boss]) {
            return message.reply(`Tu n'as pas de capture pour **${boss}** !`);
        }
        data[user][boss]--;
        if (data[user][boss] <= 0) {
            delete data[user][boss];
        }
        save();
        return message.reply(`➖ **${boss}** retiré pour **${user}** !`);
    }

    // 📊 captures serveur (liste globale par boss)
    if (command === "captures") {
        // Regrouper par boss → liste des joueurs
        const byBoss = {};
        for (const u in data) {
            for (const b in data[u]) {
                if (!byBoss[b]) byBoss[b] = [];
                for (let i = 0; i < data[u][b]; i++) {
                    byBoss[b].push(u);
                }
            }
        }

        if (Object.keys(byBoss).length === 0) {
            return message.reply("Aucune capture enregistrée.");
        }

        let msg = "**📊 Captures du serveur :**\n";
        for (const b in byBoss) {
            const players = byBoss[b].join(", ");
            msg += `\n🐉 **${b}**\n`;
            byBoss[b].forEach(p => {
                msg += `  - ${p}\n`;
            });
        }

        return message.reply(msg);
    }
});

// 🔐 login
client.login(process.env.TOKEN);