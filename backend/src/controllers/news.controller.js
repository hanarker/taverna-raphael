const News = require('../models/News');

exports.createNews = async (req, res) => {
    try {
        const news = await News.create(req.body);
        res.status(201).json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const news = await News.findAll({ order: [['publishedAt', 'DESC']] });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const news = await News.findOne({ where: { slug } });
        if (!news) return res.status(404).json({ message: 'News article not found' });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.findByPk(id);
        if (!news) return res.status(404).json({ message: 'News article not found' });

        await news.update(req.body);
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await News.findByPk(id);
        if (!news) return res.status(404).json({ message: 'News article not found' });

        await news.destroy();
        res.json({ message: 'News article deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
