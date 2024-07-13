const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {v4: uuidv4} = require("uuid");
const path = require("path");
require("dotenv").config();
//--------------------------Twilio Setup------------------------
const accountSid = process.env.TWILIO_ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHN_NUMBER;

const client = require('twilio')(accountSid, authToken);


//---------------------------DB------------------------------

const user = require("../models/user");
const userVerification = require("../models/userVerification");
const otpVerification = require("../models/otpVerfication");

//---------------------------------------API---------------------------------------------------------

//--------------------Nodemailer Transporter------------------------------------

let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});
// testing transporter
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } 
    else {
        console.log("Transporter Ready");
        console.log(success);
    }
});

//-------------------------------------send verification email----------------------------------

const sendVerificationEmail = ( {_id, email}, res ) => {

    // url to be used in the email
    const currentUrl = "http://localhost:5000/";
    const uniqueString = uuidv4() +_id;

    // mail options
    const mailOptions = {
        from: {
            name: "NodemailerXI Project",
            address: process.env.AUTH_EMAIL
        },
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup process.</p><p>This link <b>expires in
        6 hours.</b></p><p>Press <a href=${currentUrl + "user/verify/" + id + "/" + uniqueString}>
        here</a> to proceed.k/p>`
    }

        const saltRounds = 10;
        bcrypt.hash (uniqueString, saltRounds)
        .then((hashedUniqueString) => {

            // set values in userVerification collection
            const newVerification = new userVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt : Date.now() + 21600000
            })

            newVerification.save()
            .then( () => {
                transporter.sendMail(mailOptions)
                .then( () => {
                    res.json({
                        Status: "PENDING",
                        Message: "Verification mail sent."
                    })
                })
                .catch( (error)=>{
                    console.log(error);
                    res.json({
                        Status: "FAILED",
                        Message: "ERROR occured while sending mail."
                    })
                })
            })
            .catch( (error) => {
                console.log(error);
                res.json({
                    Status: "FAILED",
                    Message: "ERROR occured while saving user verification data."
                })
            })
        })
        .catch( () =>{
            res.json({
                Status: "FAILED",
                Message: "ERROR occured while hashing email data."
            })
        })

}

//-------------------------------Verify Email from Link------------------------------

router.get("/verify/:userId/:uniqueString", (req, res) => {

    let { userId, uniqueString } = req.params;

    //Checking if the user data is in userVerification database
    userVerification.find( {userId} )
    .then((result) => {

        if (result.length > 0) {

            // user verification record exists so we proceed
            const {expiresAt} = result[0];
            const hashedUniqueString = result[0].uniqueString;

            // checking for expired unique string
            if (expiresAt < Date.now()) {

                // record has expired so we delete it
                userVerification.deleteOne( {userId} )
                .then( result => {
                    //deleting from uesr database
                    user.deleteOne( {_id: userId} )
                    .then(() => {
                    let message = "Link has expired. Please sign up again.";
                    res.redirect(`/user/signup`);
                    })
                    .catch(error => {
                        let message = "Clearing user with expired unique string failed";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
                })  
                .catch((error) => {
                    console.log(error);
                    let message = "An error occurred while clearing expired user verification record";
                    res.redirect(`/user/verified/error=true&message=${message}`);
                })
            }
            else{

                //the link has not expired
                bcrypt.compare(uniqueString, hashedUniqueString)
                .then(result => {
                    if (result) {
                        // strings match
                        user.updateOne({_id: userId}, {verified: true})
                        .then(() => {
                            userVerification.deleteOne( {userId} )
                            .then( () => {
                                res.sendFile(path.join(__dirname, "./../Frontend/verified.html"));
                            })
                            .catch(error => {
                                console.log(error);
                                let message = "An error occurred while finalizing successful verification.";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            })
                        })
                        .catch(error => {
                            console.log(error);
                            let message = "An error occurred while updating user record to show verified.";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                    } 
                    else {
                        // existing record but incorrect verification details passed.
                        let message = "Invalid verification details passed. Check your inbox.";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    }
                })
            }
        }
        else {
            // user verification record doesn't exist
            let message = "Account record doesn't exist or has been verified already. Please sign up or log in.";
            res.redirect(`/user/verified/error=true&message=${message}`);
        }
    })
    .catch((error) => {
        console.log(error);
        let message = "ERROR occurred while checking for existing user verification record";
        res.redirect(`/user/verified/error=true&message=${message}`);
    })
    });

    // Verified page route
    router.get("/verified", (req, res) => {
        res.sendFile(path.join(__dirname, "./../Frontend/verified.html"));
    })
    

//-------------------------------SIGNUP API-------------------------------------

router.post("/signup", (req, res)=>{
    let { name, email, password, dateOfBirth, phone } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();
    phone = phone.trim();

    if(name == "" || email == "" || password == "" || dateOfBirth == "" || phone == ""){
        res.json({
            Status: "FAILED",
            Message: "Fields Empty"
        })
    }
    else if (!/^[a-zA-Z]*$/.test(name)) {
        res.json({
        Status: "FAILED",
        Message: "Invalid name entered"
    })
    } else if (!/^[\w-\-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
        Status: "FAILED",
        Message: "Invalid email entered"
    })
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
        Status: "FAILED",
        Message: "Invalid date of birth entered"
    })
    } else if (password.length < 8) {
        res.json({
        Status: "FAILED",
        Message: "Password is too short!"
    })
    } else {
        // Checking if user already exists
        user.find( {email} )
        .then(result => {
        if (result.length) {
            // A user already exists
            res.json({
            Status: "FAILED",
            Message: "User with the provided email already exists"
            })
        }
        else {
            // Try to create new user from signup
            const saltRounds = 10;
            bcrypt.hash (password, saltRounds)
            .then(hashedPassword => {
                const newUser = new user({
                name: name,
                email: email,
                password: hashedPassword,
                dateOfBirth: dateOfBirth,
                phone: phone,
                verified: false,
                otpVerified: false
            });
                newUser.save()
                .then(result => {
                    //handle account verification
                    sendVerificationEmail(result, res);
                    // res.json({
                    // Status: "SUCCESS",
                    // Message: "Signup successful",
                    // data: result,
                    // })
                })
                .catch(err => {
                    res.json({
                    Status: "FAILED",
                    Message: "ERROR occurred while saving user account!"
                    })
                })
                })
            .catch(err => {
                res.json({
                Status: "FAILED",
                Message: "ERROR occurred while hashing password!"
                })
            })
        }
        })
        .catch(err => {
            console.log(err);
            res.json({
            Status: "FAILED",
            Message: "An error occurred while checking for existing user!"
            })
        })
    }
});

//---------------------------------SIGNIN API-----------------------------------------------

router.post("/signin", (req, res) => {
    let { email, password } = req.body;
    email = email.trim();   // trim to remove any whitespaces from both ends
    password = password.trim();

    if( email == "" || password == "" ){
        res.json({
            Status: "FAILED",
            Message: "Field/s Empty"
        })
    }
    else{
        user.find( {email} )
        .then( data => {
            if( data.length ){
                //user exists
                if( (!data[0].verified) || (!data[0].otpVerified) ){
                    res.json({
                        Status: "FAILED",
                        Message: "User email or phone number not verified."
                    })
                }
                else{
                    const hashedPassword = data[0].password;
                    bcrypt.compare (password, hashedPassword)
                    .then(result => {
                        if (result) {
                            // Password match
                            res.json({
                                Status: "SUCCESS",
                                Message: "Signin Successful",
                                data: data
                            })
                        } 
                        else{
                            res.json({
                                Status: "FAILED",
                                Message: "Incorrect password entered!"
                            })
                        }
                    })
                    .catch( err => {
                        res.json({
                        Status: "FAILED",
                        Message: "ERROR occurred while comparing passwords"
                        })
                    })
                }   
            }  
            else{
                res.json({
                Status: "FAILED",
                Message: "Invalid Credentials"
                })
            }
        })
        .catch( err => {
            res.json({
                Status: "FAILED",
                Message: "Could not find user"
            })
        })
    }
});

//------------------linking otp--------------------

    router.post("/verifyphone", (req, res) => {
        res.sendFile(path.join(__dirname, "./../Frontend/index2.html"));
    })

//------------------send OTP-------------------

router.post('/sendotp', async (req, res) => {

    try {

        const { phone } = req.body;

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Send the OTP using Twilio
        await client.messages.create({
            body: `Your verification code is ${otp}`,
            from: twilioPhoneNumber,
            to: phone
        });

        // Save the OTP in the database
        const otpDBEntry = new otpVerification({
            phone: phone,
            otp: otp,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        });

        await otpDBEntry.save()
        .then( () => {
            res.status(200).json({ message: 'OTP sent successfully' });
        })
        .catch((error) => {
            res.json({
                Status: "FAILED",
                Message: "ERROR saving user in otp database"
            })
            console.log(error);
        })

        
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error });
    }
});
    
//-------------------verify OTP-------------------

    router.post("/verify/:phone/:otp", async (req, res) => {

        let { phone, otp } = req.params;

        //search otp database with phone number 
        otpVerification.find( {phone} )
        .then( (result) => {

            if (result.length > 0) {
                // user verification record exists so we proceed

                const {expiresAt} = result[0];
                //const hashedUniqueString = result[0].uniqueString;
    
                // checking for expired unique string
                if (expiresAt < Date.now()) {
    
                    // record has expired so we delete it from otpVerification
                    otpVerification.deleteOne( {phone} )
                    .then( result => {
                        //deleting from user database
                        user.deleteOne( {phone: phone} )
                        .then(() => {
                            let message = "Link has expired. Please sign up again.";
                            console.log(message);
                            res.redirect(`/user/signup`);
                        })
                        .catch(error => {
                            console.log(error);
                            let message = "Clearing user with expired unique string failed";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                    })  
                    .catch((error) => {
                        console.log(error);
                        let message = "An error occurred while clearing expired user verification record";
                        res.redirect(`/user/verified/error=true&message=${message}`);
                    })
                }
                else{
                    //the OTP has not expired

                    //otpVerification.findOne( { phone: phone } )
                    //.then( otpData => {
                        //bcrypt.compare(uniqueString, hashedUniqueString)
                        //.then(result => {
                        if (result[0].otp === otp) {
                            user.updateOne( {phone: phone}, {otpVerified: true} )
                            .then(() => {
                                otpVerification.deleteOne( {phone} )
                                .then( () => {
                                    res.sendFile(path.join(__dirname, "./../Frontend/verified.html"));
                                })
                                .catch(error => {
                                    console.log(error);
                                    let message = "An error occurred while finalizing successful verification.";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                            })
                            .catch(error => {
                                console.log(error);
                                let message = "An error occurred while updating user record to show verified.";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            })
                        } 
                        else {
                            // existing record but incorrect verification details passed.
                            let message = "Invalid OTP passed. Check your OTP again.";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        }
                    //})
                    //})
                    // .catch( err =>{
                    //     console.log(err);
                    //         res.json({
                    //             Status: "FAILED",
                    //             Message: "ERROR finding the user in database"
                    //         })
                    // })
                    
                }

            }
            else {
                // user verification record doesn't exist
                let message = "Account record doesn't exist or has been verified already. Please signup again or login.";
                res.redirect(`/user/verified/error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "ERROR occurred while checking for existing user verification record";
            res.redirect(`/user/verified/error=true&message=${message}`);
        })
    
    })


module.exports = router;