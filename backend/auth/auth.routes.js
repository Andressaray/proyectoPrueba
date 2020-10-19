const Users     = require('./auth.controller');
const storage   = require('../config/multer');
const multer    = require('multer');
const path      = require('path');
const uploader  = multer({
  storage,
  fileFilter: function (req, file, cb) {
    let ext = path.extname(file.originalname)
    if(ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      cb(null, `${file.originalname}`);
    }
    return cb(null, false, new Error('goes wrong on the mimetype'));
  }
}).single('imageUrl');

module.exports  = (router) => {
  router.post('/register', Users.createUser);
  router.post('/login', Users.loginUser);
  router.post('/logout', Users.signout);
  router.post('/pets', Users.createPets);
  router.post('/uploadImagePet', uploader, Users.uploadImage);
  router.get('/getImagePet/:nameFile', Users.getImagePet);
  router.get('/showPets:id', Users.showPets);
  router.delete('/deletePets', Users.deletePets);
  router.put('/updatePets', Users.updatePets);
  router.post('/appointments', Users.createAppointments);
  router.get('/showAppointments:id', Users.showAppointments);
  router.get('/download:id/:name', Users.download);
  router.post('/createComment', Users.opinionCreateUsers);
  router.get('/showComments', Users.showOpinion);
  // Administrador
  router.post('/showPetsDoctor', Users.showPetsDoctor);
  router.post('/showPetsAppointmentsDoctor', Users.showPetsAppointmentsDoctor);
  router.post('/showAppointmentsDoctor', Users.showAppointmentsDoctor);
  router.put('/assentAppointmentDoctor', Users.assentAppointmentDoctor);
  router.put('/updateAppointmentsDoctor', Users.updateAppointmentsDoctor);
}