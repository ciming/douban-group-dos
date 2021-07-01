import terminalImage from 'terminal-image';
import axios from 'axios'

// imageToAscii("https://asset.droidyue.com/image/2019_11/catimg_result.png", (err, converted) => {
//     console.log(err || converted);
// });


function renderImage(url) {
    axios.get(url,  { responseType: 'arraybuffer' })
        .then(response => {
            const buffer = Buffer.from(response.data, "utf-8")
            console.log(buffer);
        })
   
   
    // return terminalImage.buffer(buffer)
}

console.log(renderImage('https://asset.droidyue.com/image/2019_11/catimg_result.png'))