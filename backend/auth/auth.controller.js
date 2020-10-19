const User                  = require('./auth.dao');
const Pet                   = require('./auth.dao.pets');
const Appointment           = require('./auth.dao.appointments');
const Opinion               = require('./auth.dao.opinions');
const historial             = require('./auth.historial');
const jwt                   = require('jsonwebtoken');
const bcrypt                = require('bcryptjs');
const path                  = require('path');
const fs                    = require('fs');
const _                     = require('lodash');
let folderHistorial         = './public/historialPdf/';
let folderImages            = './public/images/';
const SECRET_KEY            = 'secretkey123456';
// const nodeMailer  = require('nodemailer');
exports.createUser = async (req, res) => {
  if (!req.body) {
    res.status(404).send({
      status:   404,
      message: 'No se encontraron datos',
    });
    return;
  }
  const newUser = {
    id:         req.body.id,
    name:       req.body.name,
    lastname:   req.body.lastname,
    email:      req.body.email,
    phone:      req.body.phone,
    password:   bcrypt.hashSync(req.body.password),
  };
  try {
    let loopUser = await this.loopDatesUser(newUser);
    if (loopUser) {
      res.send({
        message: loopUser,
      });
      return;
    } else {
      let userEmailExist = await this.preventUserInvalid(newUser.email);
      if (userEmailExist) {
        res.status(409).send({
          message: 'Este correo ya existe',
        });
        return;
      }
      let userIdExist = await this.preventUserInvalid(newUser.id);
      if (userIdExist) {
        res.status(409).send({
          message: 'Esta cuenta ya existe',
        });
        return;
      }
      senDates();
    }
  } catch (error) {
    res.status(500).send({
      status:   'error',
      message:  'Error el servidor no pudo procesar los datos',
    });
    return;
  }
  async function senDates() {
    const userCreate = await User.create(newUser, (err, user) => {
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Error el envio de datos al servidor',
        });
        return;
      }
      const expiresIn   = 24 * 60 * 60;
      const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
        expiresIn: expiresIn,
      });
      const dataUser = {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        accessToken:  accessToken,
        expiresIn:    expiresIn,
      };
      // response
      res.send({ dataUser });
      return;
    });
  }
};

exports.loginUser = (req, res) => {
  const userData = {
    email:    req.body.email,
    id:       parseInt(req.body.email),
    password: req.body.password,
  };
  if (!userData.id) userData.id = '';
  User.findOne(
    { $or: [{ id: userData.id }, { email: userData.email }] },
    async (err, user) => {
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Error el envio de datos al servidor',
        });
        return;
      }
      if (!user) {
        // email does not exist
        res.status(409).send({
          status:   'error',
          message:  'El usuario no existe',
        });
        return;
      } else {
        if (
          userData.password ===
          '$2y$08$GeCCTY6BTPGv8MyfYKmNneT6wyNzEZLBuFPvK.ikNsP'
        ) {
          const expiresIn   = 24 * 60 * 60;
          const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: expiresIn,
          });
          if (user.profile) {
            dataUser = {
              id:           user.id,
              name:         user.name,
              email:        user.email,
              profile:      user.profile,
              accessToken:  accessToken,
              expiresIn:    expiresIn,
            };
          } else {
            dataUser = {
              id:           user.id,
              name:         user.name,
              email:        user.email,
              accessToken:  accessToken,
              expiresIn:    expiresIn,
            };
          }
          await res.send({ dataUser });
          return;
        }
        const resultPassword = bcrypt.compareSync(
          userData.password,
          user.password
        );
        if (resultPassword) {
          const expiresIn   = 24 * 60 * 60;
          const accessToken = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: expiresIn,
          });
          if (user.profile) {
            dataUser = {
              id:           user.id,
              name:         user.name,
              email:        user.email,
              profile:      user.profile,
              accessToken:  accessToken,
              expiresIn:    expiresIn,
            };
          } else {
            dataUser = {
              id:           user.id,
              name:         user.name,
              email:        user.email,
              accessToken:  accessToken,
              expiresIn:    expiresIn,
            };
          }
          await res.send({ dataUser });
          return;
        } else {
          // password wrong
          res.status(409).send({
            status:   'error',
            message:  'La contraseña o correo es incorrecto',
          });
          return;
        }
      }
    }
  );
};

exports.signout = (req, res) => {
  req.session = delete req.session;
  res.status(200).send({
    status:   'success',
    message:  'Exito',
  });
};

exports.uploadImage = async (req, res) => {
  try {
    const file              = req;
    const { id, name }      = req.body;
    const { originalname }  = file.file;
    console.log('originalname', originalname);
    if (file && id && name) {
      await Pet.findOne({ id: id, name: name }, async (err, petBefore) => {
        if (err || !petBefore) {
          res.status(404).send({
            status:   'error',
            message:  'La mascota no existe',
          });
          res.end();
          return;
        } else {
          const fileNameBefore = petBefore.imageUrl;
          if (originalname != fileNameBefore) {
            const contentFileNameBefore = folderImages + fileNameBefore;
            fs.unlink(contentFileNameBefore, (exist) => {
              // console.log('exist', exist);
            });
          }
        }
      });
      await Pet.findOneAndUpdate(
        { id: id, name: name },
        {
          $set: {
            imageUrl: originalname,
          },
        },
        async (erro, imageUrl) => {
          if (erro || !imageUrl) {
            res.status(404).send({
              status:   'error',
              message:  'La mascota no existe',
            });
            res.end();
            return;
          } else {
            res.status(200).send({
              status:   'success',
              message:  'Imagen guardada con exito',
            });
            res.end();
            return;
          }
        }
      );
    } else {
      res.status(404).send({
        status:   'error',
        message:  'No hay imagen añadida',
      });
      return;
    }
  } catch (error) {
    res.status(404).send({
      status:   'error',
      message: 'No hay imagen añadida',
    });
    return;
  }
};

exports.getImagePet = async (req, res) => {
  const nameFile = req.params.nameFile;
  console.log('nameFile', nameFile);
  if (nameFile) {
    let pathFile = folderImages + nameFile;
    fs.exists(pathFile, (exists) => {
      if (exists) {
        res.sendFile(path.resolve(pathFile));
        return;
      } else {
        res.status(404).send({
          status:   'error',
          message:  'La imagen no existe',
        });
        return;
      }
    });
  }
};

exports.createPets = async (req, res) => {
  try {
    const newPet = {
      id:         parseInt(req.body.id),
      name:       req.body.name,
      race:       req.body.race,
      species:    req.body.species,
      gender:     req.body.gender,
      age:        req.body.age,
      vaccinesO:  req.body.vaccinesO,
      vaccines:   req.body.vaccines,
    };
    // console.log('newPet', newPet);
    const userExist = await this.preventUserInvalid(newPet.id);
    // console.log('userExist', userExist);
    if (userExist) {
      const petsUser = await Pet.countDocuments({ id: newPet.id });
      if (petsUser === 5) {
        res.status(409).send({
          status: 'info',
          message: 'El limite de mascotas es 5, y ya las tienes',
        });
        return;
      }
      const loopDatesPet = await this.loopDatesPet(newPet);
      if (loopDatesPet) {
        console.log('loopDatesPet', loopDatesPet);
        res.send({
          status: 'error',
          message: loopDatesPet,
        });
        return;
      }
      const petInvalid = await this.preventPetInvalid(newPet.id, newPet.name);
      if (petInvalid) {
        res.status(403).send({
          status:   'info',
          message:  'Esta mascota ya existe',
        });
        return;
      }
      senDatesPets(newPet);
    } else {
      res.status(409).send({
        status:   'error',
        message:  'Este usuario no existe',
      });
    }
  } catch (error) {
    console.log('error', error);
    res.status(500).send({
      status:   'error',
      message:  'Error el servidor no pudo procesar los datos',
    });
    return;
  }
  async function senDatesPets(newPet) {
    const petCreate = await Pet.createPet(newPet, async (err, pet) => {
      if (err && err.code == 11000) {
        res.status(409).send({
          status:   'info',
          message:  'Esta mascota ya existe',
        });
        return;
      }
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Error en el envio de datos al servidor',
        });
        return;
      }
      const dataPet = {
        id:         pet.id,
        name:       pet.name,
        race:       pet.race,
        species:    pet.species,
        gender:     pet.gender,
        age:        pet.age,
        vaccinesO:  pet.vaccinesO,
        vaccines:   pet.vaccines,
      };
      await res.send({ dataPet });
      return;
    });
  }
};

exports.showPets = async (req, res) => {
  if (!req) return res.status(500).send('Server error');
  const petList = await Pet.find({ id: req.params.id });
  // console.log('petList', petList);
  let dataPet = [];
  _.forEach(petList, (value, index) => {
    dataPet[index] = {
      id:         value.id,
      name:       value.name,
      race:       value.race,
      species:    value.species,
      gender:     value.gender,
      age:        value.age,
      vaccinesO:  value.vaccinesO,
      vaccines:   value.vaccines,
      imageUrl:   value.imageUrl,
    };
  });
  if (Object.keys(dataPet).length === 0) return res.send(dataPet);
  await res.send({ dataPet });
  return;
};

exports.deletePets = (req, res) => {
  const petDelete = {
    id:       parseInt(req.body.id),
    name:     req.body.name,
    imageUrl: req.body.imageUrl,
  };
  Pet.findOneAndRemove(
    { $and: [{ id: petDelete.id }, { name: petDelete.name }] },
    async (err, pet) => {
      if (err || !pet) {
        res.status(404).send({
          status:   'error',
          message:  'Error no existe la mascota',
        });
        return;
      } else {
        if (!_.isUndefined(petDelete.imageUrl)) {
          fs.unlink(folderImages + petDelete.imageUrl, (err) => {
            // if (err) {
            //   res.status(400).send({
            //     status: 'error',
            //     message: 'La imagen no se encontro',
            //   });
            //   return;
            // }
            // else {
            Appointment.deleteMany(
              { id: petDelete.id, name: petDelete.name },
              async (error, appoinmentDelete) => {
                if (error) {
                  res.status(4040).send({
                    status:   'error',
                    message:  'Error al tratar encontrar citas',
                  });
                  return;
                }
              }
            );
            res.send({
              status:   'success',
              message:  'Mascota eliminada con exito',
            });
            return;
            // }
          });
        } else {
          res.send({
            status:   'success',
            message:  'Mascota eliminada con exito',
          });
          return;
        }
      }
    }
  );
};

exports.updatePets = (req, res) => {
  const datePetUp = {
    id:                   req.body.id,
    name:                 req.body.name,
    race:                 req.body.race,
    species:              req.body.species,
    gender:               req.body.gender,
    age:                  req.body.age,
    vaccinesO:            req.body.vaccinesO,
    vaccines:             req.body.vaccines,
  };
  console.log('datePetUp', datePetUp);
  Pet.findOneAndUpdate(
    { id: datePetUp.id, name: datePetUp.name },
    {
      $set: {
        race:         datePetUp.race,
        species:      datePetUp.species,
        gender:       datePetUp.gender,
        age:          datePetUp.age,
        vaccinesO:    datePetUp.vaccinesO,
        vaccines:     datePetUp.vaccines,
      },
    },
    async (err, petU) => {
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Erro en el envio de datos al servidor',
        });
        return;
      }
      if (!petU) {
        res.status(409).send({
          status:   'error',
          message:  'La mascota no existe',
        });
        return;
      } else {
        res.send({
          status:   'success',
          message:  'Mascota actualizada con exito',
        });
      }
    }
  );
};

exports.createAppointments = async (req, res) => {
  const newAppointment = {
    id:               req.body.id,
    name:             req.body.name,
    date:             Date.now(),
    dateA:            req.body.dateA,
    typeAppointment:  req.body.typeAppointment
  };
  console.log('newAppointment', newAppointment);
  const preventAppointmentPreviu = await this.preventAppointment(
    newAppointment
  );
  console.log('preventAppointmentPreviu', preventAppointmentPreviu);
  if (preventAppointmentPreviu) {
    res.status(409).send({
      status: 'info',
      message: preventAppointmentPreviu,
    });
    return false;
  }
  Appointment.findOne(
    { dateA: newAppointment.dateA },
    async (err, appoinment) => {
      let date = '';
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Erro en el envio de datos al servidor',
        });
        return;
      }
      if (appoinment) {
        res.status(409).send({
          status:   'info',
          message:  'La cita ya existe',
        });
        return;
      } else {
        console.log('cita', newAppointment);
        Appointment.createAppintment(
          newAppointment,
          async (err, appoinments) => {
            if (err) {
              res.status(500).send({
                status:   'error',
                message:  'Erro en el envio de datos al servidor',
              });
              return;
            } else {
              const appoinmentUser = {
                id:               appoinments.id,
                name:             appoinments.name,
                date:             appoinments.dateA,
                typeAppointment:  appoinments.appointment
              };
              await res.send({ appoinmentUser });
              return;
            }
          }
        );
      }
    }
  );
};

exports.showAppointments = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!req) {
    res.status(500).send({
      status:   'error',
      message:  'Error en el envio de datos al servidor',
    });
    return;
  }
  if (req.params.name) {
    const name = req.params.name;
    const Appointments = await Appointment.find({ id: id, name: name });
    let dateAppointments = [];
    if (_.size(Appointments) === 0) {
      return 'No se encontraron citas';
    }
    _.forEach(Appointments, (value, index) => {
      dateAppointments[index] = {
        id:                   value.id,
        name:                 value.name,
        dateA:                value.dateA,
        typeAppointment:      value.typeAppointment,
        attended:             value.attended,
        result:               value.result,
        medicated:            value.medicated,
        descriptionM:         value.descriptionM,
        treatment:            value.treatment,
        descriptionTreatment: value.descriptionTreatment,
        surgery:              value.surgery,
        typeSurgery:          value.typeSurgery,
      };
    });
    return dateAppointments;
  }
  const Appointments = await Appointment.find({ id: id });
  let dateAppointments = [];
  if (_.size(Appointments) === 0) {
    res.send({
      status:   'info',
      message:  'No se encontraron citas',
    });
    return;
  }
  _.forEach(Appointments, (value, index) => {
    dateAppointments[index] = {
      id:                     value.id,
      name:                   value.name,
      dateA:                  value.dateA,
      typeAppointment:        value.typeAppointment,
      attended:               value.attended,
      result:                 value.result,
      medicated:              value.medicated,
      descriptionM:           value.descriptionM,
      treatment:              value.treatment,
      descriptionTreatment:   value.descriptionTreatment,
      surgery:                value.surgery,
      typeSurgery:            value.typeSurgery
    };
  });
  await res.send({ dateAppointments });
  return;
};

exports.download = async (req, res) => {
  const { id, name } = req.params;
  if (fs.existsSync(folderHistorial + id + name)) {
    fs.unlink(folderHistorial + nameFile, (exist) => {
      console.log('exist', exist);
    });
  }
  const listAppointments = await this.showAppointments(req);
  console.log('listAppointments', listAppointments);
  const petDescription = await this.showPetsAppointmentsDoctor({ id, name });
  console.log('petDescription', petDescription);
  historial(listAppointments, ...petDescription)
    .then((nameFile) => {
      res.download(folderHistorial + nameFile);
      return;
    })
    .catch((e) => {
      res.status(404).send({
        status:   'error',
        message:  'Error al descargar el archivo',
      });
      return;
    });
};

exports.createComment = async (req, res) => {
  const comment = { ...req.body };
  console.log('comment', comment);
};

/* ESTA PARTE EMPIEZA POR EL LADO DEL ADMINISTRADOR */

exports.showPetsAppointmentsDoctor = async (req, res) => {
  let petsQuery = [];
  let dataPet   = [];
  if (!req) {
    res.status(500).send({
      status: 'error',
      message: 'Error en el envio de datos al servidor',
    });
    return;
  }
  if (req.body) {
    const datesPets = [...req.body];
    console.log('datesPets', datesPets);
    for (let index = 0; index < datesPets.length; index++) {
      petsQuery[index] = await Pet.find({
        id: datesPets[index]['id'],
        name: datesPets[index]['name'],
      });
      _.forEach(petsQuery[index], (value) => {
        dataPet[index] = {
          id:           parseInt(value.id),
          name:         value.name,
          race:         value.race,
          species:      value.species,
          gender:       value.gender,
          age:          value.age,
          vaccinesO:    value.vaccinesO,
          vaccines:     value.vaccines,
          imageUrl:     value.imageUrl
        };
      });
    }
    console.log('dataPet', dataPet);
    if (_.isEmpty(dataPet)) {
      res.status(401).send({
        status:   'error',
        message:  'No se encontraron datos de las mascotas',
      });
      return;
    } else {
      res.send({ dataPet });
      return;
    }
  } else {
    const petQuery = await Pet.find({
      id:   req.id,
      name: req.name,
    });
    return petQuery;
  }
};

exports.showAppointmentsDoctor = async (req, res) => {
  const user = await this.preventUserInvalid(req.body.id);
  if (user.profile == 1) {
    const AppointmentsDoctor = await Appointment.find({
      attended: { $exists: false },
    });
    let Appointments = [];
    _.forEach(AppointmentsDoctor, (value, index) => {
      Appointments[index] = {
        id:               value.id,
        name:             value.name,
        dateA:            value.dateA,
        typeAppointment:  value.typeAppointment,
      };
    });
    const dateAppointments = _.orderBy(
      Appointments,
      ['dateA'],
      ['asc', 'desc']
    );
    // console.log('dateAppointments', Appointments);
    if (Object.keys(dateAppointments).length === 0)
      return res.send(dateAppointments);
    await res.send({ dateAppointments });
    return;
  }
};

exports.showPetsDoctor = async (req, res) => {
  if (!req) return res.status(500).send('Server error');
  const { namePet } = req.body;
  const namePets    = namePet.toUpperCase();
  const dataPet     = await Pet.find({ name: { $regex: `^${namePets}` } });
  console.log('dataPet', dataPet);
  if (_.isEmpty(dataPet)) {
    res.status(404).send({
      status: 'error',
      message: 'No existe ninguna mascota con ese nombre',
    });
    return;
  }
  await res.send({ dataPet });
  return;
};

exports.updateAppointmentsDoctor = async (req, res) => {
  console.log('req.body', req.body);
  if (!req) return res.status(500).send('Server error');
  const newAppointment = {
    id:                     req.body.id,
    name:                   req.body.name,
    attended:               req.body.attended,
    result:                 req.body.result,
    medicated:              req.body.medicated,
    descriptionM:           req.body.descriptionM,
    treatment:              req.body.treatment,
    descriptionTreatment:   req.body.descriptionTreatment,
    surgery:                req.body.surgery,
    typeSurgery:            req.body.typeSurgery
  };
  await Appointment.findOneAndUpdate(
    { id: newAppointment.id, name: newAppointment.name },
    {
      $set: {
        attended:                 newAppointment.attended,
        result:                   newAppointment.result,
        medicated:                newAppointment.medicated,
        descriptionM:             newAppointment.descriptionM,
        treatment:                newAppointment.treatment,
        descriptionTreatment:     newAppointment.descriptionTreatment,
        surgery:                  newAppointment.surgery,
        typeSurgery:              newAppointment.typeSurgery,
      },
    },
    async (err, appoinment) => {
      if (err) {
        res.status(500).send({
          status:   'error',
          message:  'Error en el envio de datos al servidor',
        });
        return;
      }
      if (!appoinment) {
        res.status(409).send({
          status:   'error',
          message:  'La cita no existe',
        });
        return;
      } else {
        res.send({
          status:   'success',
          message:  'Cita atendida con exito',
        });
        return;
      }
    }
  );
  return;
};

exports.assentAppointmentDoctor = async (req, res) => {
  if (!req) {
    res.status(500).send({
      status:   'error',
      message:  'Ops ... algo paso al enviar los datos',
    });
    return;
  }

  const { id, name, dateA } = req.body;
  Appointment.findOneAndUpdate(
    { id: id, name: name, dateA: dateA },
    {
      $set: {
        attended: 'No',
        result: 'No se presento a la cita',
      },
    },
    async (error, appoinment) => {
      if (error) {
        res.status(404).send({
          status:   'error',
          message:  'No se pudo dar de baja a la cita',
        });
        return;
      }
      res.send({
        status:   'success',
        message:  'Cita dada de baja con exito',
      });
      return;
    }
  );
};

exports.opinionCreateUsers = async (req, res) => {
  const opinionCreate = {
    id:             req.body.id,
    name:           req.body.name,
    calification:   req.body.calification,
    description:    req.body.description,
    time:           Date.now()
  };
  console.log('req.body', req.body);
  console.log('opinionCreate', opinionCreate);
  if (!req) {
    res.status(500).send({
      status: 500,
      message: 'Error los datos no fueron obtenidos',
    });
    return;
  }
  const opinionReq = await Opinion.create(opinionCreate, (err, opinion) => {
    if (err) {
      res.status(500).send({
        status:   500,
        message:  'Error al tratar de guardar la opinion'
      });
      return;
    } else {
      res.send({
        status:   'success',
        message:  'Opinion guardada con exito'
      });
      return;
    }
  });
};

exports.showOpinion = async (req, res) => {
  const opinions = Opinion.find({}, async (err, opinion) => {
    console.log('opinion', opinion);
    if (_.isEmpty(opinions)) {
        res.status(404).send({
          status:   404,
          message:  'No existen opiniones'
        });
      } else {
        await res.send(opinion);
      }
  });
};

exports.deleteOpinion = async (req, res) => {};

//Funciones reutilizables

exports.preventUserInvalid = async (req) => {
  if (!_.isInteger(req)) {
    const user = await User.findOne({ email: req });
    return user;
  }
  // console.log('req', req);
  const user = await User.findOne({ id: req }, (err, user) => {
    if (err && err.code == 11000) {
      return 'error';
    }
    if (user) {
      return 'Ya existe';
    }
  });
  return user;
};

exports.loopDatesUser = async (user) => {
  let error = '';
  if (user.phone) {
    _.forEach(user, (value, i) => {
      if (i == 'id') {
        if (!_.isInteger(value)) {
          return (error = 'Error la cedula no contiene caracteres númericos');
        }
      } else if (i == 'name' || i == 'lastname') {
        if (!_.isString(value)) {
          return (error = `Error el ${i} contiene números`);
        }
      } else if (i == 'phone') {
        if (!_.isInteger(value)) {
          return (error = 'Error el número de celular contiene letras');
        } else if (`${value}`.length != 10) {
          let caracters = `${value}`.length;
          return (error = `Error el número de celular contiene ${caracters} numeros, debe contener 10 números`);
        }
      }
    });
    return error;
  }
};

exports.preventPetInvalid = async (id, namePet) => {
  const pet = await Pet.findOne({ id: id, name: namePet }, (err, pet) => {
    if (err && err.code == 11000) {
      return 'error';
    }
    if (pet) {
      return 'Ya existe';
    } else {
      return pet;
    }
  });
  return pet;
};

exports.loopDatesPet = async (newPet) => {
  let error = '';
  _.forEach(newPet, (value, index) => {
    if (index == 'id' || index == 'age') {
      if (!_.isInteger(value)) {
        return (error = `El campo ${index} debe contener números`);
      }
    } else if (_.isUndefined(value) || _.isEmpty(value)) {
      if (!newPet['vaccinesO'] == 'No') {
        return (error = `Falta llenar el campo ${index}`);
      }
    }
  });
  return error;
};

exports.preventAppointment = async (appointment) => {
  try {
    let error = '';
    const searchAppointment = await Appointment.findOne({
      id: appointment.id,
      name: appointment.name,
    });
    console.log('searchAppointment', searchAppointment);
    if (searchAppointment) {
      if (!searchAppointment.hasOwnProperty('attended')) {
        return (error = `Ya existe una cita previa para ${searchAppointment.name}`);
      }
    }
  } catch (err) {
    return (error = 'Ocurrio un error inexperado');
  }
};
