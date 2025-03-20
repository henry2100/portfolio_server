const express = require('express');
const router = express.Router();
const {
    createService,
    getService,
    getAllServices,
    updateService,
    deleteService,
} = require('../controllers/serviceController');
const authSession = require('../middlewares/authSession');
const roleManager = require('../middlewares/roleManager');

router.get('/', getAllServices);
router.get('/:id', getService);
router.post('/add', createService );
router.put('/edit/:id', updateService );
router.delete('/delete/:id', deleteService );

module.exports = router;