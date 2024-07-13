const dropZone = document.getElementById("dropzone");
const dragText = dropZone.querySelector("p");
const fileInput = dropZone.querySelector("input");
const browseButton = document.querySelector(".browse-btn");

let file;

browseButton.onclick = () => {
    fileInput.click();
}

fileInput.addEventListener("change", (e) => {
    file = e.target.files[0];
    checkSize(file);
    showFile(file);
    dropZone.classList.add("active");
})

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    //console.log("Hovering over drag and drop.");
    dragText.innerText = "Release Here";
    dropZone.classList.add("active");
})

dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    //console.log("Left from hovering over drag and drop.");
    dragText.innerText = "Drag and Drop the file or click to Browse Files";
    dropZone.classList.remove("active");
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    //console.log("Dropped over drag and drop.");
    file = e.dataTransfer.files[0];
    checkSize(file);
    showFile(file);
    dropZone.classList.add("active");
})

function checkSize(file){
    limit = 2000; //2MB
    const size = file.size/1024;
    if(size > limit){
        alert("File size greater than limit");
        fileInput.value = "";
    }
}

//function showFile(file){
    // let fileType = file.type;

    // let validExtensions = ["image/jpg", "image/jpeg", "image/png"];

    // if(validExtensions.includes(fileType)){
    //     let fileReader = new FileReader(); //creating new FileReader object
    //     fileReader.onload = () => {
    //         let fileURL = fileReader.result; //passing user file source in fileURL variable

    //         //console.log(fileURL);

    //         let imgTag = `<img src="${fileURL}" alt=''>`; //creating an ing tag and passing user selected file source inside src attribute dropArea.innerHTML = img Tag; //adding that created img tag
    //         dropZone.innerHTML = imgTag;
    //     }
    //     fileReader.readAsDataURL(file);
    //     console.log(fileType);
    // }
    // else{
    //     alert("The file type is not suported kindly see the supported one's in the instructions.");
    //     dragText.innerText = "Drag and Drop the file or click to Browse Files";
    //     dropZone.classList.remove("active");
    //     fileInput.value = "";   //clearing the selected file
    // }
//}

function showFile(file){
    let fileType = file.type;

    let validExtensions = ["image/jpg", "image/jpeg", "image/png"];

    if(validExtensions.includes(fileType)){
                
            // let fileURL = URL.createObjectURL(file); //passing user file source in fileURL variable

            // //console.log(fileURL);

            // let imgTag = `<img src="${fileURL}" alt=''>`; //creating an img tag and passing user selected file source inside src attribute dropArea.innerHTML = img Tag; //adding that created img tag
            // dropZone.innerHTML = imgTag;
        
        console.log(fileType);
    }
    else{
        alert("The file type is not suported kindly see the supported one's in the instructions.");
        dragText.innerText = "Drag and Drop the file or click to Browse Files";
        dropZone.classList.remove("active");
        fileInput.value = "";   //clearing the selected file
    }
}