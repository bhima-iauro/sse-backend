import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';
import * as sgMail from '@sendgrid/mail';
var axios = require('axios');
import * as fs from "fs";
@Injectable()
export class EmailService {
 
  async saveDetailsAndSendEmail(data: any) {
    try {
        var response = null;
        if (data.connector != null) {
            response = await axios(data.connector.config)
        }
      if (response == null) {
        return {
          statusCode: 200,
          message: 'failure',
          result: null,
        };
      } else {
        this.sendEmail(data)
        return response.data;
      }
    } catch (error) {
        return {
            statusCode: 200,
            message: 'failure',
            result: error,
          };
    }
  }
  async sendEmail(data: any) {
    console.log(data)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        var fileContent = `<!doctype html>
        <html>
        <body>
        <p>Hi `+data.user_name+`,
        </br>
        Your transaction was successful!
        </br>
        </br>
        Payment Details:
        Amount: `+data.amount+`
        </br>
        Amout For: `+data.amount_for+`
        </br>
        </br>
        We advise to keep this email for future reference.
        </br>    
        Transaction reference: `+data.transaction_reference+`
        </br>
        Order date: `+data.order_date+`</p></body>
        </html>`
        
        const msg = {
        to: data.email, // Change to your recipient
        from: 'bhimrao.patange@iauro.com', // Change to your verified sender
        subject: 'Payment Receipt for successful transaction on Sringeri App',
        // text: 'and easy to do anywhere, even with Node.js',
         html: fileContent,
        }
         sgMail.send(msg)
        // console.log("Email Service Response ", result)
  }
}
