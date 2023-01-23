import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { ChargeBankTransfer, ChargeCardlessCredit, ChargeEMoney, ChargeInternetBanking, ChargeOverTheCounter, ChargeTransactionOnCard } from './types/midtrans.type';

@Injectable()
export class MidtransAPIService {
  private clientKey: string;
  private serverKey: string;
  private isProduction: boolean;

  private baseURL = {
      sandbox: {
        charge: "https://api.sandbox.midtrans.com/v2/charge",
        status: "https://api.sandbox.midtrans.com/v2/status",
      },
      production: {
        charge: "https://api.midtrans.com/v2/charge",
        status: "https://api.midtrans.com/v2/status",
      },
  }

  private usageURLS = {
    charge: "",
    status: ""
  };

  private headers = {}

  constructor() {
      this.clientKey = process.env.MIDTRANS_CLIENT_KEY;
      this.serverKey = process.env.MIDTRANS_SERVER_KEY;
      this.isProduction = process.env.ENV === "production" ? true : false;


      const base64 = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');
      this.headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${base64}`
      }

      this.usageURLS = this.isProduction ? this.baseURL.production : this.baseURL.sandbox;
  }

  async charge(payload: ChargeBankTransfer | ChargeInternetBanking | ChargeEMoney | ChargeOverTheCounter | ChargeCardlessCredit | ChargeTransactionOnCard): Promise<any>
  {
    try {
      const charge = axios.post(this.usageURLS.charge, {
        ...payload
      }, {
        headers: this.headers,
      }).then((response) => {
        return response.data;
      }).catch((error) => {
        console.log(error)
        throw new HttpException(error.message, error.status);
      });

      return charge;      
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async status(orderId: string): Promise<any>    
  {
    try {
      const status = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
        headers: this.headers
      }).then((response) => {
        return response.data;
      }).catch((error) => {
        throw new HttpException(error.message, error.status);
      });

      return status;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}