// Carica tutti i modelli (e le associazioni) in un unico punto.
module.exports = {
    ShiftTemplate: require('./ShiftTemplate'),
    ShiftOverride: require('./ShiftOverride'),
    ShiftSlot: require('./ShiftSlot'),
    Reservation: require('./Reservation'),
    NoShowFlag: require('./NoShowFlag'),
    Setting: require('./Setting'),
    NotificationLog: require('./NotificationLog'),
    StatsDaily: require('./StatsDaily'),
    AdminUser: require('./AdminUser'),
    News: require('./News'),
    SiteAsset: require('./SiteAsset'),
};
