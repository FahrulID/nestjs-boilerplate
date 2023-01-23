import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { ChargeQRIS, CustomerDetails, ItemDetails, PaymentType, TransactionDetails } from '../../utils/midtrans/types/midtrans.type';
import { v4 as uuidv4 } from 'uuid'
import { MidtransAPIService } from '../../utils/midtrans/midtrans.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class MidtransService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly midtrans: MidtransAPIService,
    ) {}

    async createTransactionDetails(itemDetails: ItemDetails[]): Promise<TransactionDetails>
    {
        try {
            // Generate Order ID
            let orderId = uuidv4();
            
            // Calculate Gross Amount
            let grossAmount = 0;
            for (let i = 0; i < itemDetails.length; i++)
                grossAmount += itemDetails[i].price * itemDetails[i].quantity;

            let parameter: TransactionDetails = {
                order_id: orderId,
                gross_amount: grossAmount,
            };

            return parameter;
        }
        catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async charge(uid: string, paymentType: PaymentType, transactionDetails: TransactionDetails, itemDetails: ItemDetails[], customerDetails: CustomerDetails): Promise<any>
    {
        try {
            const order = await this.prisma.orders.create({
                data: {
                    id: transactionDetails.order_id,
                    total: transactionDetails.gross_amount,
                    user_id: uid,
                }
            });

            const charge = await this.midtrans.charge({
                payment_type: paymentType,
                transaction_details: transactionDetails,
                item_details: itemDetails,
                customer_details: customerDetails,
                qris: {
                    acquirer: "gopay",
                }
            } as ChargeQRIS)

            return charge;
        } catch (error) {
            throw new HttpException(error.message, error.status);
        }
    }

    async getStatus(orderId: string): Promise<any>    
    {
        try {
            const status = await this.midtrans.status(orderId);
            const order = await this.prisma.orders.findUnique({
                where: {
                    id: orderId,
                }
            });

            if (status.transaction_status !== order.status)
                await this.prisma.orders.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        status: status.transaction_status.toUpperCase() as PaymentStatus,
                    }
                });

            return status;
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, error.status);
        }
    }
}
