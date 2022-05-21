import express from 'express';
import cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import zlib from 'zlib';
import nodemailer from 'nodemailer';

const app = express();
const port = 3000;
let arr =[];

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const parse = async () => {
try {
    
    await axios.get('https://inventorsoft.co/careers')
        .then(res => res.data)
        .then(res => {
            let html = res
            const $ = cheerio.load(html);
            $(html).find('div.vacancy__container').each((index, element) => {
                let item = {
                    vacName: $(element).find('h3.vacancy__title').text(),
                    vacSeniority: $(element).find('p.vacancy__seniority').text(),
                    vacLocation: $(element).find('div.vacancy__location').text()
                }
                arr.push(item);
            })
        })
    fs.writeFile('careers.json', JSON.stringify(arr), (error) => {
        if(error) throw error
        console.log('Saved Carrers');
    })
    const inp = fs.createReadStream('careers.json');
        const out = fs.createWriteStream('carrers.json.gz');
        const cZIP = zlib.createGzip();

        inp.pipe(cZIP).pipe(out);

        console.log('Create ZIP file');
    sendMail();
} catch (error) {
    console.log("Error - " + error);
}
}

async function sendMail() {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "bar@example.com, baz@example.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "All careers", // plain text body
        html: "<b>All careers</b>", // html body
        attachments: [
            {
                filename: "carrers.json.gz",
            }
        ]
      });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

parse();