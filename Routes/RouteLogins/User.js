const express = require('express');
const router = express.Router();
const { User } = require("../../modals/Logins/UserLogin");
const { doctordetails } = require("../../modals/DoctorDetails/Index")
const { BookingAppointment } = require("../../modals/BookAppointment/BookAppointment")
const { ConformAppointment } = require("../../modals/ConformAppointment/ConformAppointment")
const { Notification } = require("../../modals/Notification/Notification")
const { PatientProfile } = require("../../modals/PaitentProfile/PatientProfile")
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

//getpatient with id
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

//getpatient
router.get('/getpatient', async (req, res) => {
  
  try {
    const patientdetail = await User.find();
    res.status(200).json(patientdetail);
  } catch (error) {
    res.send(error);
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
//get appointments
router.get("/getallbookappointment", async (req, res) => {
  try {
    const appoimentdetail = await BookingAppointment.find();
    res.status(200).json(appoimentdetail);
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
      holderName,
      cardType,
      selectedDate,
      selectedTimeSlot,
      bookingFor,
      doc_id, 
      bookingDate,
       userId } = req.body;

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
      holderName: holderName,
      cardType: cardType,
      selectedDate: selectedDate,
      selectedTimeSlot: selectedTimeSlot,
      bookingDate: bookingDate,
      bookingFor:bookingFor,
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


//Doctor  conform  Appointment 
router.post('/conformappointment/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    const { appoimentdetail } = req.body;

    // Step 1: Delete from BookingAppointment
    await BookingAppointment.deleteOne({ _id: appoimentdetail._id });

    // Step 2: Save to ConformAppointment
    const userId = appoimentdetail.userId;
    const appointment = new ConformAppointment({ docId, userId });
    await appointment.save();

    // Step 3: Save to Notification
    const message = 'Your appointment has been confirmed.';
    const newNotification = new Notification({ userId, message });
    await newNotification.save();

    res.status(200).json('Appointment Booked successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json('Error confirming appointment');
  }
});

// Fetch all notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to mark a notification as read
router.post('/markAsRead/:notificationId', async (req, res) => {
  try {
    const notificationId = req.params.notificationId;

    // Update the notification in the database to mark it as read
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true } // Return the updated notification
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification: updatedNotification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//Cancel doctor appointment
router.post('/cancelappointment/:id', async (req, res) => {
  try {
    const id = req.params.id;
   
    await BookingAppointment.deleteOne({ _id:id });
  
    res.status(200).json('Appointment Cancel successful');
  } catch (error) {
    res.status(500).json('Error saving user to the database');
  }
});

// get mypatient details, doctor id  for doctor dashboard
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

// get mydoctor details, patient id  for patient dashboard
router.get("/mydoctor/:userId", async (req, res) => {

  try {
    const userId = req.params.userId;
  
    // Fetch all appointments for the user
    const userAppointments = await ConformAppointment.find({ userId: userId });
    // console.log("userAppointments", userAppointments);
    if (!userAppointments || userAppointments.length === 0) {
      return res.status(404).json({ error: 'Appointments not found' });
    }

    // Prepare an array to store appointment details with doctor information
    const appointmentsWithPatient = [];

    // Iterate through each appointment
    for (const appointment of userAppointments) {
      // Fetch doctor details for each appointment
      const doctorDetails = await doctordetails.findById(appointment.docId);

      // Create an object with appointment and doctor details
      const appointmentWithPatient = {
        appointmentDetails: appointment,
        doctorDetails: doctorDetails,
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

// API endpoint for updating the profile
router.post('/update-patient-profile/:userId',upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("body",req.body);
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      mobile,
      address,
      city,
      state,
      zipCode,
      country,
      file
    } = req.body;

    // Find the user by ID
    const user = await User.findOne({ _id: userId });
    ;

    if (!user) {
      return res.status(200).json({ message: 'Patient Profile  is Not Found!' });
    }
   // Create a new doctordetails instance with the received data
   const patientProfile = new PatientProfile({
    image: file ? file.path : null, // Assuming you want to store the file path
     firstName : firstName,
     lastName : lastName,
     dateOfBirth : dateOfBirth,
     email : email,
     mobile : mobile,
     address : address,
     city : city,
     state : state,
     zipCode : zipCode,
     country : country,
   
  });

  // Save the data to the database
  await patientProfile.save();
   

    res.status(200).json('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json('Error updating profile');
  }
});

router.post('/update-doctor-profile/:docId',upload.single('image'), async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("body",req.body);
    const {
      firstName,
      lastName,
      dateOfBirth,
      email,
      mobile,
      address,
      city,
      state,
      zipCode,
      country,
      file
    } = req.body;

    // Find the user by ID
    const user = await User.findOne({ _id: userId });
    ;

    if (!user) {
      return res.status(200).json({ message: 'Patient Profile  is Not Found!' });
    }
   // Create a new doctordetails instance with the received data
   const patientProfile = new PatientProfile({
    image: file ? file.path : null, // Assuming you want to store the file path
     firstName : firstName,
     lastName : lastName,
     dateOfBirth : dateOfBirth,
     email : email,
     mobile : mobile,
     address : address,
     city : city,
     state : state,
     zipCode : zipCode,
     country : country,
   
  });

  // Save the data to the database
  await patientProfile.save();
   

    res.status(200).json('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json('Error updating profile');
  }
});


// change password of user
router.post("/change-user-password/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from the database
    const user = await User.findById(userId);

    // Check if the old password matches the stored password
    if (user && user.password === oldPassword) {
      // Update the password if old password matches
      user.password = newPassword;
      await user.save();
      res.status(200).json("Password changed successfully");
    } else {
      res.status(400).json("Old password is incorrect");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json("Error changing password");
  }
});
// change password of doctor
router.post("/change-doctor-password/:doc_Id", async (req, res) => {
  try {
    const doc_Id = req.params.doc_Id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Fetch user from the database
    const user = await doctordetails.findById(doc_Id);

    // Check if the old password matches the stored password
    if (user && user.password === oldPassword) {
      // Update the password if old password matches
      user.password = newPassword;
      await user.save();
      res.status(200).json("Password changed successfully");
    } else {
      res.status(400).json("Old password is incorrect");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json("Error changing password");
  }
});


// search doctor  by specialization

router.get('/doctors-by-specialty/:specialty', async (req, res) => {
  try {
    const specialization = req.params.specialty;
    const doctors = await doctordetails.find({ specialization });
   
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json('Error fetching doctors by specialty');
  }
});

module.exports = router;
