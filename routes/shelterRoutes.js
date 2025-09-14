const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardData,
  getShelterPets,
  getPet,
  addPet,
  updatePet,
  deletePet,
  addCareLog,
  getCareLogs,
  getAdoptionInterests,
  respondToInterest,
  updateShelterProfile,
} = require('../controllers/petsShelterController');

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/pets', protect, getShelterPets);
router.get('/pets/:id', protect, getPet);
router.post('/pets', protect, addPet);
router.put('/pets/:id', protect, updatePet);
router.delete('/pets/:id', protect, deletePet);
router.post('/pets/:petId/care-logs', protect, addCareLog);
router.get('/pets/:petId/care-logs', protect, getCareLogs);
router.get('/pets/:petId/interests', protect, getAdoptionInterests);
router.put('/interests/:interestId', protect, respondToInterest);
router.put('/profile', protect, updateShelterProfile);

module.exports = router;