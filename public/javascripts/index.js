'use strict';

class App {
    constructor(elements) {
        this.elements = elements

        this.elements.camVideo.addEventListener("click", this.snapButtonClicked.bind(this))
        this.elements.videoSelect.addEventListener("change", this.onVideoSourceChange.bind(this))
        
    
        this.initializeDevices()
            .then(this.initializeUserMedia(true))
    }

    onVideoSourceChange() {
        this.initializeUserMedia(false)
    }

    initializeDevices() {

        let children = Array.prototype.slice.call(this.elements.videoSelect.children)

        return navigator.mediaDevices.enumerateDevices()
        .then(deviceInfos => {
            deviceInfos.filter(d => d.kind === 'videoinput').forEach(deviceInfo => {
                let option = children.find(o => o.value === deviceInfo.deviceId)

                if (!option) {
                    option = document.createElement('option')
                    option.value = deviceInfo.deviceId
                    this.elements.videoSelect.appendChild(option)
                }
                option.text = deviceInfo.label
            })
        })
        .catch(err => {
            console.log(err)
        });
    }

    initializeUserMedia(initializeDevices) {

        if (this.elements.camVideo.srcObject !== null) {
            this.elements.camVideo.srcObject.getTracks().forEach(track => track.stop())
        }
        
        let videoSource = this.elements.videoSelect.value

        let constraints = {
            audio: false,
            video: { 
                // if video source is defined, exactly match it
                deviceId: videoSource ? { exact: videoSource } : undefined,
                // if video source is not defined, start with back camera
                facingMode: videoSource ? undefined : { ideal: "environment" }
            }
        }

        return navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                // make stream available to browser console
                this.elements.camVideo.srcObject = stream;

                if (initializeDevices) {
                    this.initializeDevices()
                }
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