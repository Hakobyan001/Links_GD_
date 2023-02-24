const express = require("express")

const {  test,addLinks,deleteUrls ,getLiveUrls,getCrawled, addChange, fullOnlyStatus,getFailed, getCrawledById, getCrawledLinksCountById, getChangesById} = require('../controllers/urls.controller');
const router = express.Router();

router.get('/urls/live',getLiveUrls)
router.post('/urls/links', addLinks);
router.post('/urls/test',test);
router.delete('/urls',deleteUrls);
router.get('/urls/crawled/all',getCrawled)
router.get('/urls/crawled',getCrawledById)
router.get('/urls/crawled/count/links',getCrawledLinksCountById)
router.get('/urls/getFailed', getFailed)
router.get('/urls/changes', getChangesById);
router.post('/urls/freeRequest', fullOnlyStatus);
router.post('/urls/change', addChange)

module.exports = router;