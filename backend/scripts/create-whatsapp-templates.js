// Crea sul tuo account Twilio i template WhatsApp (Content API, tipo twilio/text) e stampa
// la configurazione per Setting.whatsappTemplates. NON richiede l'approvazione Meta:
// vanno bene per la sandbox. Per la produzione vanno poi sottoposti ad approvazione.
//
// Uso (da backend/): node scripts/create-whatsapp-templates.js
// Richiede TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN in backend/.env. Idempotente per nome:
// un template già esistente non viene ricreato.
require('dotenv').config();
const twilio = require('twilio');

// `variables` = ordine dei valori (vedi buildVariables in services/notifications/templates.js);
// `sample` = valori d'esempio richiesti da Twilio per ogni segnaposto.
const TEMPLATES = [
    {
        event: 'confirmation',
        name: 'taverna_confirmation',
        body: 'Ciao {{1}}, la tua prenotazione da Taverna Raphael è confermata: {{2}} alle {{3}} per {{4}} persone. Ti aspettiamo!',
        variables: ['name', 'date', 'time', 'guests'],
        sample: ['Mario', 'sabato 27 settembre', '20:00', '4'],
    },
    {
        event: 'reminder_24h',
        name: 'taverna_reminder_24h',
        body: 'Ciao {{1}}, ti ricordiamo la tua prenotazione da Taverna Raphael: {{2}} alle {{3}}. A presto!',
        variables: ['name', 'date', 'time'],
        sample: ['Mario', 'sabato 27 settembre', '20:00'],
    },
    {
        event: 'reminder_morning',
        name: 'taverna_reminder_morning',
        body: 'Buongiorno {{1}}, ti aspettiamo oggi alle {{2}} da Taverna Raphael. A stasera!',
        variables: ['name', 'time'],
        sample: ['Mario', '20:00'],
    },
    {
        event: 'cancellation',
        name: 'taverna_cancellation',
        body: 'Ciao {{1}}, la tua prenotazione da Taverna Raphael di {{2}} alle {{3}} è stata annullata.',
        variables: ['name', 'date', 'time'],
        sample: ['Mario', 'sabato 27 settembre', '20:00'],
    },
    {
        event: 'bulk_cancellation',
        name: 'taverna_bulk_cancellation',
        body: 'Ciao {{1}}, da Taverna Raphael: {{2}}',
        variables: ['name', 'message'],
        sample: ['Mario', 'Purtroppo dobbiamo annullare la tua prenotazione.'],
    },
    {
        event: 'owner_new_reservation',
        name: 'taverna_owner_new_reservation',
        body: 'Nuova prenotazione: {{1}}, {{2}} alle {{3}}, {{4}} persone. Contatta il cliente: {{5}}',
        variables: ['name', 'date', 'time', 'guests', 'waLink'],
        sample: ['Mario', 'sabato 27 settembre', '20:00', '4', 'https://wa.me/393331234567'],
    },
];

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        console.error(`Manca ${name} in backend/.env`);
        process.exit(1);
    }
    return value;
}

async function main() {
    const client = twilio(requireEnv('TWILIO_ACCOUNT_SID'), requireEnv('TWILIO_AUTH_TOKEN'));
    const existing = await client.content.v1.contents.list({ limit: 200 });
    const bySid = new Map(existing.map((c) => [c.friendlyName, c.sid]));

    const config = {};
    for (const tpl of TEMPLATES) {
        let sid = bySid.get(tpl.name);
        if (sid) {
            console.log(`= ${tpl.name} esiste già (${sid})`);
        } else {
            const created = await client.content.v1.contents.create({
                friendlyName: tpl.name,
                language: 'it',
                variables: Object.fromEntries(tpl.sample.map((v, i) => [String(i + 1), v])),
                types: { 'twilio/text': { body: tpl.body } },
            });
            sid = created.sid;
            console.log(`+ ${tpl.name} creato (${sid})`);
        }
        config[tpl.event] = { contentSid: sid, variables: tpl.variables };
    }

    console.log('\nwhatsappTemplates (da incollare nel tab Impostazioni):\n');
    console.log(JSON.stringify(config, null, 2));
}

main().catch((error) => {
    console.error(`Errore Twilio: ${error.code ?? ''} ${error.message}`);
    process.exit(1);
});
