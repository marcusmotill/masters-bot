const common = {
    rory: 'Rory McIlroy',
    spieth: 'Jordan Spieth',
    jt: 'Justin Thomas',
    tiger: 'Tiger Woods',
    dj: 'Dustin Johnson'
};

var entries = [
    {
        name: 'Macus',
        selections: [common.spieth, common.jt, common.dj, common.tiger]
    },
    {
        name: 'Holdr',
        selections: [common.jt, common.rory, common.spieth, common.dj]
    },
    {
        name: 'gabe',
        selections: [common.dj, common.rory, common.tiger, common.spieth]
    },
    {
        name: 'white',
        selections: ['Phil Mickelson', common.rory, common.jt, common.spieth]
    },
    {
        name: 'alvey',
        selections: [common.tiger, common.spieth, 'Rickie Fowler', 'Bubba Watson']
    }
];

module.exports = entries;
