const express = require('express');
const {
  getInsurancePolicies,
  getInsurancePolicy,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  addInsuranceClaim,
  uploadInsuranceDocument
} = require('../controllers/insuranceController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
  
router.use(protect);

router.route('/')
  .get(getInsurancePolicies)
  .post(createInsurancePolicy);

router.route('/:id')
  .get(getInsurancePolicy)
  .put(updateInsurancePolicy)
  .delete(deleteInsurancePolicy);

router.route('/:id/claims')
  .post(addInsuranceClaim);

router.route('/:id/documents')
  .post(uploadInsuranceDocument);

module.exports = router;