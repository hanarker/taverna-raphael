const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AdminUser = require('../models/AdminUser');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body ?? {};
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if user exists
        const user = await AdminUser.findOne({ where: { username } });
        if (!user) {
            // For initial setup/demo purposes, if no admin exists, create one specific admin on fly if credentials match a hardcoded secret or just fail.
            // Better approach for this task: Pre-seed or allow creation via script. 
            // For simplicity in this demo, let's just return error.
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token });
    } catch (error) {
        console.error('[login]', error);
        res.status(500).json({ message: 'Errore interno. Riprova.' });
    }
};

// Initial setup helper (normally wouldn't expose this publically but for local dev setup)
exports.createInitialAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const exists = await AdminUser.findOne({ where: { username } });
        if (exists) return res.status(400).json({ message: 'Admin already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await AdminUser.create({
            username,
            password: hashedPassword
        });
        res.json({ message: 'Admin created', id: admin.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
