const sequelize = require('../src/config/db');
const AdminUser = require('../src/models/AdminUser');
const News = require('../src/models/News');
const { ShiftTemplate } = require('../src/models');
const { createBooking } = require('../src/services/booking.service');
const { toISODate, addDays } = require('../src/utils/time');
const SiteAsset = require('../src/models/SiteAsset');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync database
        await sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log('Database synced.');

        // Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await AdminUser.create({
            username: 'admin',
            password: hashedPassword,
        });
        console.log('Admin user created (user: admin, pass: admin123)');

        // Create Sample News
        await News.create({
            title: 'Nuovo Menu Autunnale',
            slug: 'nuovo-menu-autunno',
            content: 'Siamo lieti di presentare il nostro nuovo menu autunnale, ricco di sapori caldi e avvolgenti. Venite a provare il nostro risotto ai funghi porcini!',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        });

        await News.create({
            title: 'Serata Degustazione Vini',
            slug: 'serata-vini',
            content: 'Il prossimo venerdì ospiteremo una serata dedicata ai vini della Toscana. Prenotate subito il vostro tavolo per non perdere questa occasione unica.',
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        });
        console.log('Sample news created.');

        // Copy existing menu.pdf if present
        const sourceMenuPdf = path.join(__dirname, '..', '..', 'menu.pdf');
        const destMenuDir = path.join(__dirname, '..', 'uploads', 'menu');
        const destMenuPdf = path.join(destMenuDir, 'menu.pdf');

        if (fs.existsSync(sourceMenuPdf)) {
            if (!fs.existsSync(destMenuDir)) {
                fs.mkdirSync(destMenuDir, { recursive: true });
            }
            fs.copyFileSync(sourceMenuPdf, destMenuPdf);

            await SiteAsset.create({
                type: 'menu_pdf',
                filename: 'menu.pdf',
                originalName: 'menu.pdf',
                mimeType: 'application/pdf'
            });
            console.log('Menu PDF copied to uploads.');
        }

        // Schema settimanale di esempio: lunedì chiuso, pranzo + due cene.
        const shifts = [
            { name: 'Pranzo', startTime: '13:00' },
            { name: 'Cena 1', startTime: '19:30' },
            { name: 'Cena 2', startTime: '21:30' },
        ];
        for (let weekday = 0; weekday < 7; weekday += 1) {
            if (weekday === 1) continue;
            for (const shift of shifts) await ShiftTemplate.create({ weekday, ...shift });
        }
        console.log('Default weekly schedule created (Monday closed).');

        // Prenotazioni demo (da backoffice: niente finestra/cutoff/consenso)
        const demoDate = toISODate(addDays(new Date(), 3));
        const reservations = [
            { firstName: 'Marco', lastName: 'Rossi', email: 'marco@example.com', phone: '+39 333 1234567', startTime: '13:00', guests: 4 },
            { firstName: 'Laura', lastName: 'Bianchi', email: 'laura@example.com', phone: '+39 333 7654321', startTime: '19:30', guests: 6 },
            { firstName: 'Sofia', lastName: 'Verdi', email: 'sofia@example.com', phone: '+39 333 9876543', startTime: '21:30', guests: 2 },
        ];
        for (const r of reservations) {
            try {
                await createBooking({ ...r, date: demoDate }, { source: 'backoffice' });
            } catch (error) {
                console.warn(`Demo reservation skipped (${r.firstName}): ${error.message}`);
            }
        }
        console.log('Sample reservations created.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();