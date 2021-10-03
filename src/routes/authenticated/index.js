const express = require('express');
const multer = require('multer');
const path = require('path');

const validator = require('../../middlewares/validator');

const EventController = require('../../controllers/EventController');
const GroupController = require('../../controllers/GroupController');
const UserController = require('../../controllers/UserController');
const createEventSchema = require('../../validationSchemas/createEvent');
const updateEventSchema = require('../../validationSchemas/updateEvent');
const joinEventSchema = require('../../validationSchemas/joinEvent');
const disjoinEventSchema = require('../../validationSchemas/disjoinEvent');
const createGroupSchema = require('../../validationSchemas/createGroup');
const updateGroupSchema = require('../../validationSchemas/updateGroup');
const joinGroupSchema = require('../../validationSchemas/joinGroup');
const addUserToGroupSchema = require('../../validationSchemas/addUserToGroup');
const disjoinGroupSchema = require('../../validationSchemas/disjoinGroup');
const updateEmailSchema = require('../../validationSchemas/updateEmail');
const updatePasswordSchema = require('../../validationSchemas/updatePassword');
const acceptFriendRequestSchema = require('../../validationSchemas/acceptFriendRequest');
const declineFriendRequestSchema = require('../../validationSchemas/declineFriendRequest');
const cancelFriendRequestSchema = require('../../validationSchemas/cancelFriendRequest');
const sendFriendRequestSchema = require('../../validationSchemas/sendFriendRequest');

const routes = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

routes.get('/me', (request, response) => UserController.me(request, response));
routes.get('/me/friend', (request, response) =>
  UserController.getMyFriends(request, response)
);
routes.get('/me/friend/:id/status', (request, response) =>
  UserController.getFriendStatus(request, response)
);
routes.delete('/me/friend/:id', (request, response) =>
  UserController.removeMyFriend(request, response)
);
routes.get('/me/event/:eventId/reviews', (request, response) =>
  UserController.getMyReviewsByEvent(request, response)
);
routes.get('/me/rating', (request, response) =>
  UserController.getMyRating(request, response)
);
routes.get('/me/event', (request, response) =>
  EventController.getMyEvents(request, response)
);
routes.get('/me/group', (request, response) =>
  GroupController.getMyGroups(request, response)
);
routes.put('/me', upload.single('profile_image'), (request, response) =>
  UserController.update(request, response)
);
routes.put(
  '/me/update-email',
  validator(updateEmailSchema),
  (request, response) => UserController.updateEmail(request, response)
);
routes.put(
  '/me/update-password',
  validator(updatePasswordSchema),
  (request, response) => UserController.updatePassword(request, response)
);

routes.get('/user', (request, response) =>
  UserController.findAll(request, response)
);

routes.post(
  '/friend-request',
  validator(sendFriendRequestSchema),
  (request, response) => UserController.sendFriendRequest(request, response)
);
routes.get('/friend-request/sent', (request, response) =>
  UserController.getSentFriendRequests(request, response)
);
routes.get('/friend-request/received', (request, response) =>
  UserController.getReceivedFriendRequests(request, response)
);
routes.get('/friend-request/received/total', (request, response) =>
  UserController.getTotalReceivedFriendRequests(request, response)
);
routes.post(
  '/friend-request/accept',
  validator(acceptFriendRequestSchema),
  (request, response) => UserController.acceptFriendRequest(request, response)
);
routes.post(
  '/friend-request/decline',
  validator(declineFriendRequestSchema),
  (request, response) => UserController.declineFriendRequest(request, response)
);
routes.post(
  '/friend-request/cancel',
  validator(cancelFriendRequestSchema),
  (request, response) => UserController.cancelFriendRequest(request, response)
);
routes.post('/event', validator(createEventSchema), (request, response) =>
  EventController.create(request, response)
);
routes.put('/event/:id', validator(updateEventSchema), (request, response) =>
  EventController.update(request, response)
);
routes.get('/event/:id', (request, response) =>
  EventController.findById(request, response)
);
routes.delete('/event/:id', (request, response) =>
  EventController.delete(request, response)
);
routes.get('/event', (request, response) =>
  EventController.findAll(request, response)
);
routes.post('/event/join', validator(joinEventSchema), (request, response) =>
  EventController.joinUser(request, response)
);
routes.post(
  '/event/disjoin',
  validator(disjoinEventSchema),
  (request, response) => EventController.disjoinUser(request, response)
);
routes.post('/event/review-users', (request, response) =>
  EventController.reviewUsers(request, response)
);
routes.delete('/event/:event_id/user/:user_id', (request, response) =>
  EventController.removeUser(request, response)
);

routes.post(
  '/group',
  upload.single('group_image'),
  validator(createGroupSchema),
  (request, response) => GroupController.create(request, response)
);
routes.put(
  '/group/:id',
  upload.single('group_image'),
  validator(updateGroupSchema),
  (request, response) => GroupController.update(request, response)
);
routes.get('/group/:id', (request, response) =>
  GroupController.findById(request, response)
);
routes.delete('/group/:id', (request, response) =>
  GroupController.delete(request, response)
);
routes.get('/group', (request, response) =>
  GroupController.findAll(request, response)
);
routes.post('/group/join', validator(joinGroupSchema), (request, response) =>
  GroupController.joinUser(request, response)
);
routes.post(
  '/group/add-user',
  validator(addUserToGroupSchema),
  (request, response) => GroupController.addUser(request, response)
);
routes.post(
  '/group/disjoin',
  validator(disjoinGroupSchema),
  (request, response) => GroupController.disjoinUser(request, response)
);
routes.delete('/group/:group_id/user/:user_id', (request, response) =>
  GroupController.removeUser(request, response)
);

module.exports = routes;
