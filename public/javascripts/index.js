'use strict';

class App {
    constructor(elements) {
        this.elements = elements

        this.elements.snapButton.addEventListener("click", this.snapButtonClicked.bind(this))
    
        this.initializeUserMedia()
    }

    initializeUserMedia() {
        
        var constraints = {
            audio: false,
            video: true
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                // make stream available to browser console
                this.elements.camVideo.srcObject = stream;
            })
            .catch(err => {
                console.log('navigator.getUserMedia error: ', error);
            }
        )
    }

    snapButtonClicked(evt) {
        let w = this.elements.camVideo.videoWidth
        let h = this.elements.camVideo.videoHeight

        this.elements.picCanvas.width = w
        this.elements.picCanvas.height = h
        
        let ctx = this.elements.picCanvas.getContext('2d')
        ctx.drawImage(this.elements.camVideo, 0, 0, w, h)

        let img = this.elements.picCanvas.toDataURL()

        this.uploadImageToServer(img)
    }

    uploadImageToServer(img) {

        let formData = new FormData()
        formData.append("img", img)


        let fetchOptions = {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }

        fetch("/api/v1/image", fetchOptions)
    }
}

let elements = {
    camVideo: document.getElementById("camVideo"),
    snapButton: document.getElementById("snapButton"),
    picCanvas: document.getElementById("picCanvas")
}

const app = new App(elements)