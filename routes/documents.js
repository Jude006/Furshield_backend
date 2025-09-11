const express = require('express');
const {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(uploadDocument);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

module.exports = router;