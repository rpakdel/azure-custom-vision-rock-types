'use strict';

class App {
    constructor(elements) {
        this.elements = elements

        this.elements.camVideo.addEventListener("click", this.snapButtonClicked.bind(this))
        this.elements.videoSelect.addEventListener("change", this.initializeUserMedia.bind(this))
        
    
        this.initializeDevices().then(() => this.initializeUserMedia())
    }

    initializeDevices() {
        while(this.elements.videoSelect.firstChild) {
            this.elements.videoSelect.removeChild(this.elements.videoSelect.firstChild)
        } 

        return navigator.mediaDevices.enumerateDevices()
        .then(deviceInfos => {
            deviceInfos.filter(d => d.kind === 'videoinput').forEach(deviceInfo => {
                let option = document.createElement('option');
                option.text = deviceInfo.label
                option.value = deviceInfo.deviceId
                this.elements.videoSelect.appendChild(option)
            })
        })
        .catch(err => {
            console.log(err)
        });
    }

    initializeUserMedia() {

        if (this.elements.camVideo.srcObject !== null) {
            this.elements.camVideo.srcObject.getTracks().forEach(track => track.stop())
        }
        
        let videoDeviceId = this.elements.videoSelect.value

        var constraints = {
            audio: false,
            video: { deviceId: videoDeviceId }
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                // make stream available to browser console
                this.elements.camVideo.srcObject = stream;
                this.initializeDevices();
            })
            .catch(err => {
                console.log('navigator.getUserMedia error: ', err);
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

        let imgDataURL = this.elements.picCanvas.toDataURL()

        this.uploadImageToServer(imgDataURL)
    }

    uploadImageToServer(imgDataURL) {

        fetch(imgDataURL).then(res => res.blob()).then(blob => {

            let formData = new FormData()        
            formData.append("blob", blob)


            let fetchOptions = {
                method: "POST",
                body: formData,
                
            }

            fetch("/api/v1/image", fetchOptions).then(res => res.json()).then(j => console.log(j))
        })
    }
}

let elements = {
    videoSelect: document.getElementById("videoSource"),
    camVideo: document.getElementById("camVideo"),
    snapButton: document.getElementById("snapButton"),
    picCanvas: document.getElementById("picCanvas")
}

const app = new App(elements)