import { HttpStatus, Inject, Injectable, Logger, Scope } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { response } from "express";
import readXlsxFile from "read-excel-file/node";
import * as fs from "fs";
import * as sharp from "sharp";
const request = require("request-promise");
import * as moment from "moment";
import CustomResponse from "./custom-response";
import { CustomMessages } from "./custommessages";
import { CallApiService } from "./callapi.service";
export class ReportGenerationService {
  private readonly logger: Logger = new Logger();

  async generateReport(file: Express.Multer.File, data: any) {
    try {
      const map = {
        "Field Name": "fieldName",
        "#{Sr No}": "srNo",
        "${Client First Name}": "clientFirstName",
        "${Client Last Name}": "clientLastName",
        "${Mobile}": "mobile",
        "${Location}": "location",
        "${Plant Capacity}": "plantCapacity",
        "${Plant Commissioned On}": "plantCommissionedOn",
        "${Units Produced}": "unitsProduced",
        "${Unit Rate}": "unitRate",
        "${Total Savings}": "totalSavings",
        "${Lifetime Generation}": "lifetimeGeneration",
        "${Report Month}": "reportMonth",
        
      };
      
      var jsonData = (await readXlsxFile(file.buffer, { map })).rows;
      this.logger.log("======== Report Generation ========", JSON.stringify(jsonData));
      this.generateReportAsync(jsonData)
      // this.logger.log("======== Report Generation completed ========" )
      if (jsonData.length === 0) {
        
        return new CustomResponse(
            HttpStatus.BAD_REQUEST,
            "xml sheet has no data",
            {}
          );
      } else {
        return new CustomResponse( HttpStatus.OK, CustomMessages.SUCCESS, "Generating and sending reports for " + jsonData.length + " Users" );
      }
    } catch (error) {
      throw error;
    }
  }

  async generateReportAsync(jsonData: any[]) {
    for (let j = 0; j < jsonData.length; j++) {
      var customerInfo = jsonData[j];
      this.logger.log("======== Report Generation started for " + "customer Name: "  + customerInfo["clientFirstName"] + ", mobile: "  + customerInfo["mobile"]+" =======" );
     
      const asNum = Number(customerInfo["mobile"]);
      if (Number.isNaN(asNum) == false) {
       await this.generateImageAndSendNotification(customerInfo);
      }
      this.logger.log("======== Report Generation completed for " + "customer Name: "  + customerInfo["clientFirstName"] + ", mobile: "  + customerInfo["mobile"]+" =======" );
    }
  }
  
  async generateImageAndSendNotification(customerInfo: object) {
   

    var inputFilePath = "./public/template.svg"
    var outputFilePath = "./public/output.png"
    var html = fs.readFileSync(inputFilePath).toString();
    var htmlUpdated = html
      .replace("${Client First Name}", customerInfo["clientFirstName"])
      .replace("${Location}", customerInfo["location"] + " Metric Tons per Year")
      .replace("${Plant Capacity}", customerInfo["plantCapacity"] + " kW")
      .replace("${Plant Commissioned On}", "planting " + customerInfo["plantCommissionedOn"] + " Trees")
      .replace("${Lifetime Generation}", "₹ " + customerInfo["lifetimeGeneration"])
      .replace("${Total Savings}", "₹ " + customerInfo["totalSavings"])
      .replace("${Units Produced}", customerInfo["unitsProduced"] + " Units")

 
    var buf = Buffer.from(htmlUpdated, "utf8");
    
    await sharp(buf)
      // .resize(3000, 2500)
      .toFile(outputFilePath);
    const token =
      "Bearer " +
      (await this.createToken(
        process.env.client_id,
        process.env.username,
        process.env.password,
        process.env.realm,
        process.env.grant_type
      ));

    const formData: any = {
      files: {
        value: fs.createReadStream(outputFilePath),
        options: {
          filename: 'sys_generated_monthly_report_wa.png',
          contentType: null,
        },
      },
    };

    const uploadResponse = await new CallApiService().Multipartrequest(
      process.env.FILE_SERVICE_URL,
      formData,
      token
    );
    

    var _id = uploadResponse["result"][0]["_id"];
    var downloadUrl = process.env.FILE_SERVICE_URL + "/" + _id + "/?download=0";

    const urlResponse = await new CallApiService().makeRequestWithHeaders(
      "GET",
      downloadUrl,
      null,
      null
    );

    var fileUrl = urlResponse["result"]["file_id"];

    var whatsappNo = whatsappNo = "+91" + customerInfo["mobile"]
    var reportMonth = customerInfo["reportMonth"]
    // Create And send notification
    this.logger.log("===== File Url : " + fileUrl);
    var formattedMonth = moment(reportMonth).format("MMMM YYYY")
    await this.createAndSendWhatsAppNotification(customerInfo["clientFirstName"], whatsappNo, formattedMonth,fileUrl,token )
  }
  async createAndSendWhatsAppNotification(customerName: string,whatsappNo: string, formattedMonth: string,fileUrl : string, token: string, ){
   
    const headersObj: any = {
        authorization: token,
        "x-tenant-id": process.env.SSE_TENANT_ID,
      };
  const getEventResponse = await this.getEvent("amc_generation_report", headersObj)
  
  const eventId = getEventResponse?.[0]["_id"]
      const sendNotificationDto4: any = {
        eventName: "amc_generation_report",
        eventId: eventId,
        data: {
          params: [ customerName, formattedMonth],
          // params: customerInfo["clientFirstName"],
          attachments: [
            {
              mediaType: "image",
              url: fileUrl,
            },
          ],
        },
        users: [
          {
            phoneNumber: whatsappNo,
          },
        ],
      };
     
      var sendNotificationResponse = await this.sendNotification(
          eventId,
        "amc_generation_report",
        sendNotificationDto4,
        headersObj
      );
     
      // this.logger.log("======== Report Generation completed for " + "customer Name: "  + customerName + ", mobile: "  + whatsappNo+" =======" );
  this.logger.log("===== Notification result : " + JSON.stringify(sendNotificationResponse))
  }

  async getEvent(eventName, headersObj) {
    const getEventUrl = process.env.NOTIFICATION_URL + `/events?page=0&size=10&filters={"name":"${eventName}"}`
    const eventResponse = await new CallApiService().makeRequestWithHeaders(
      "GET",
      getEventUrl,
      {},
      headersObj
    );
    return eventResponse?.["result"]?.["data"]
  }

  async sendNotification(eventId, eventName, sendNotificationDto, headersObj) {
    const sendNotificationUrl = process.env.NOTIFICATION_URL + "/notifications";
    const notificationRsult = await new CallApiService().makeRequestWithHeaders(
      "POST",
      sendNotificationUrl,
      sendNotificationDto,
      headersObj
    );
    return notificationRsult;
  }


  async createToken(
    client_id: string,
    username: string,
    password: string,
    realm: string,
    grant_type: string
  ) {
    const url = `${process.env.KC_HOSTKC_URL}/realms/${realm}/protocol/openid-connect/token`;
    const result = await request.post(url, {
      form: {
        client_id,
        username,
        password,
        grant_type,
      },
    });
    const parsedData = JSON.parse(result);
    return parsedData.access_token;
  }
}
