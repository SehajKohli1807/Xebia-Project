require('./config/db');
const path = require("path");

const multer = require("multer");

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname , "./Frontend/")))

const cors = require('cors');
app.use(cors());

const PORT = 5000;

const bodyParser = require('express').json;
app.use(bodyParser());

const userRouter = require('./api/user');
app.use('/user', userRouter);

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname + "/Frontend/index.html"));
})

app.get("/documentverify", (req, res) => {
    res.sendFile(path.join(__dirname + "/Frontend/documentVerify.html"))
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname + "/tmp"))
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '--' + file.originalname )
    }
})

const maxSize = 2 * 1024 * 1024; //2MB

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            cb(null, true);
        } 
        else { 
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: {
        fileSize: maxSize
    }
})//.single("validDocument") //array(fieldname, maxCount) for multiple files

app.post("/documentverify", upload.single("validDocument"), (req, res) => {
    if(!req.file){
        console.log("No file selected");
        res.send("Please select a file");
    }
    else{
        // upload(req, res, function (err) {
        //     if (err instanceof multer.MulterError) {
        //     // A Multer error occurred when uploading.
        //     res.send(err);
        //     } else if (err) {
        //     // An unknown error occurred when uploading.
        //     res.send(err);
        //     }
            
        //     // Everything went fine.
        //     console.log("File Uploaded");
        //     console.log(req.file);
        //     res.send("File Uploaded");
        // }) 
        console.log("File Uploaded");
        console.log(req.file);
        res.send("File Uploaded");
    }  
})

app.listen(PORT, ()=>{
    console.log(`Server started on http://localhost:${PORT}`);
})