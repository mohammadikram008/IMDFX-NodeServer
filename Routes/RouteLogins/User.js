const express = require('express');
const router = express.Router();
const { User } = require("../../modals/Logins/UserLogin");
const { doctordetails } = require("../../modals/DoctorDetails/Index")
const { BookingAppointment } = require("../../modals/BookAppointment/BookAppointment")
const { ConformAppointment } = require("../../modals/ConformAppointment/ConformAppointment")
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // for handling file uploads
const upload = multer({ dest: 'uploads/' });
const app = express();
const cors = require("cors");

const { authenticateToken } = require('../../authentication');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

router.use((req, res, next) => {
  // Middleware logic here
  next();
});


const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex');
};




// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // console.log("username, email, password", username, email, password)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json('User with this email already exists');
    }

    const user = new User({ username, email, password });
    await user.save();

    res.status(200).json('Signup successful');
  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});

// user Login  route
router.post('/login', async (req, res) => {

  try {
    const { email, password } = req.body;
    // console.log(" email, password", email, password)
    const user = await User.findOne({ email }).exec();

    if (!user) {
      return res.status(404).json('User not found');
    }

    if (user.password !== password) {
      return res.status(401).json('Invalid password');
    }
    const secretKey = generateSecretKey();
    // console.log(secretKey);

    const token = jwt.sign({ email: user._id }, secretKey);
    // console.log(token);
    res.status(200).json(user._id);
  } catch (error) {
    res.status(500).json('Error finding user');
  }
});

// Doctor Login route
router.post('/doctorlogin', async (req, res) => {

  try {
    const { email, password } = req.body;
    // console.log(" email, password", email, password)
    const doctor = await doctordetails.findOne({ email }).exec();

    if (!doctor) {
      return res.status(404).json('Doctor not found');
    }

    if (doctor.password !== password) {
      return res.status(401).json('Invalid password');
    }
    const secretKey = generateSecretKey();
    // console.log(secretKey);

    const token = jwt.sign({ email: doctor._id }, secretKey);
    // console.log(token);
    res.status(200).json(doctor._id);
  } catch (error) {
    res.status(500).json('Error finding user');
  }
});

//getpatient
router.get('/getpatient/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Find the doctor details based on the ID
    const patientdetail = await User.findOne({ _id: id });

    if (!patientdetail) {
      return res.status(404).json({ error: 'patient not found' });
    }

    // Send the doctor details as a JSON response
    res.status(200).json(patientdetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving patient details', details: error.message });
  }
});


//add doctor  details
router.post('/doctorpersnoldetails', upload.single('image'), async (req, res) => {
  try {
    const { body, file } = req;
    // console.log("body", body)
    const { email } = body.email
    const doctordetail = await doctordetails.find({ email });

    if (doctordetail.length > 0) {
      return res.status(200).json({ message: 'Doctor is already registered!' });
    }
    // Create a new doctordetails instance with the received data
    const newDoctorDetails = new doctordetails({
      image: file ? file.path : null, // Assuming you want to store the file path
      name: body.name,
      email: body.email,
      password: body.password,
      specialization: body.specialization,
      conditionstreated: body.conditionstreated,
      aboutself: body.aboutself,
      education: body.education,
      college: body.college,
      license: body.license,
      yearofexperience: body.yearofexperience,
      once: {
        date: body['once.date'],
        timefrom: body['once.timefrom'],
        timetill: body['once.timetill'],
        consultationfees: body['once.consultationfees'],
      },
      daily: {
        datefrom: body['daily.datefrom'],
        datetill: body['daily.datetill'],
        timefrom: body['daily.timefrom'],
        timetill: body['daily.timetill'],
        consultationfees: body['daily.consultationfees'],
      },
      weekly: {
        day: body['weekly.day'],
        timefrom: body['weekly.timefrom'],
        timetill: body['weekly.timetill'],
        consultationfees: body['weekly.consultationfees'],
      },
    });

    // Save the data to the database
    await newDoctorDetails.save();
    res.status(200).json('Registration successful');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

});

//get DoctorDetails
router.get("/doctorpersnoldetails", async (req, res) => {
  try {
    const doctordetail = await doctordetails.find();
    res.status(200).json(doctordetail);
  } catch (error) {
    res.send(error);
  }
});

//store BookAppointment
router.post('/bookappointment', async (req, res) => {
  try {

    const {
      bookingType,
      gender,
      patientAge,
      expiryYear,
      expiryMonth,
      cvv,
      cardNumber,
      cardName,
      cardType,
      selectedDate,
      selectedTimeSlot,
      doc_id, bookingDate, userId } = req.body;

    // console.log(
    //   bookingType,
    //   gender,
    //   patientAge,
    //   expiryYear,
    //   expiryMonth,
    //   cvv,
    //   cardNumber,
    //   cardName,
    //   cardType,
    //   selectedDate,
    //   selectedTimeSlot,
    //   doc_id)
    // const existingUser = await User.findOne({ _id:id });
    const newBookAppointment = new BookingAppointment({
      doc_id: doc_id,
      bookingType: bookingType,
      gender: gender,
      patientAge: patientAge,
      expiryYear: expiryYear,
      expiryMonth: expiryMonth,
      cvv: cvv,
      cardNumber: cardNumber,
      cardName: cardName,
      cardType: cardType,
      selectedDate: selectedDate,
      selectedTimeSlot: selectedTimeSlot,
      bookingDate: bookingDate,
      userId, userId
    });
    console.log("newBookAppointment", newBookAppointment);
    await newBookAppointment.save();

    res.status(200).json('Book appointment successfully');
    // if (existingUser) {

    // }else{
    //   return res.status(400).json('User with this email Not exists');
    // }

  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});


// get BookAppointment with Doctor details
router.get("/appointments/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all appointments for the user
    const userAppointments = await BookingAppointment.find({ userId: userId });

    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithDoctors = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.doc_id);

      // Create an object with appointment and doctor details
      const appointmentWithDoctor = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
      };

      // Add the object to the array
      appointmentsWithDoctors.push(appointmentWithDoctor);
    }

    res.status(200).json(appointmentsWithDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// signle doctor detail
router.get('/getDoctorDetail/:id', async (req, res) => {
  try {
    const doctorId = req.params.id;

    // Find the doctor details based on the ID
    const doctorDetail = await doctordetails.findOne({ _id: doctorId });

    if (!doctorDetail) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Send the doctor details as a JSON response
    res.status(200).json(doctorDetail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving doctor details', details: error.message });
  }
});


// get BookAppointment with patient Id  details
router.get("/doc_appointments/:docId", async (req, res) => {

  try {
    const docId = req.params.docId;
    console.log("docId", docId);
    // Fetch all appointments for the user
    const userAppointments = await BookingAppointment.find({ doc_id: docId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const PatietnDetails = await User.findById(appointment.userId);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        PatietnDetails: PatietnDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// conform Appointment 
router.post('/conformappointment/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    // console.log("docId", docId);
    const { appoimentdetail } = req.body;
    // Step 1: Delete from BookingAppointment
    await BookingAppointment.deleteOne({ _id: appoimentdetail._id });
    console.log("user", req.body);
    // console.log("username, email, password", username, email, password)
    // const existingdoctor = await ConformAppointment.findOne({ userId });

    // if (existingdoctor) {
    //   return res.status(400).json('Appointment with this Patient already exists');
    // }
    const userId=appoimentdetail.userId;

    const appointment = new ConformAppointment({ docId,userId });
    await appointment.save();

    res.status(200).json('Appointment Booked successful');
  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});
router.post('/cancelappointment/:id', async (req, res) => {
  try {
    const id = req.params.id;
   
    await BookingAppointment.deleteOne({ _id:id });
  
    res.status(200).json('Appointment Cancel successful');
  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});

// get mypatient details, doctor id  
router.get("/mypatient/:docId", async (req, res) => {

  try {
    const docId = req.params.docId;
    console.log("docId", docId);
    // Fetch all appointments for the user
    const userAppointments = await ConformAppointment.find({ docId: docId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const PatietnDetails = await User.findById(appointment.userId);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        PatietnDetails: PatietnDetails,
      };

      // Add the object to the array
      appointmentsWithPatient.push(appointmentWithPatient);
    }

    res.status(200).json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;