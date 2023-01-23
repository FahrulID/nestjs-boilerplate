import { PaymentStatus } from "@prisma/client";

export type TransactionDetails = {
    order_id: string; // Note: Allowed Symbols are dash(-), underscore(_), tilde (~), and dot (.), max length 50
    gross_amount: number;
}

export type CreditCard = {
    token_id: string;
    bank?: "mandiri" | "bca" | "bni" | "bri" | "cimb" | "maybank";
    save_token_id?: boolean;
    installment_term?: number;
    bins?: string[];
    type?: "authorize" | string;
}

export type ItemDetails = {
    id?: string;
    price: number; // In IDR
    quantity: number;
    name: string;
    brand?: string;
    category?: string;
    merchant_name?: string;
    tenor?: number; // Integer(2)
    code_plan?: number; // Integer(3)
    mid?: number; // Integer(9)
    url?: string;
} // item_details is required for Akulaku and Kredivo payment type.

export type Address = {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string; // Note: Allowed characters are alphabets, numbers, dash (-), and space ().
    country_code?: string; // Note: Currently only IDN is supported.
}

export type CustomerDetails = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: Address;
    shipping_address?: Address;
}

export type SellerDetails = {
    id?: string;
    name?: string;
    email?: string;
    url?: string;
    address?: Address;
}

export type InquiryPayment = {
    id?: string;
    en?: string;
}

export type FreeText = {
    inquiry?: InquiryPayment[];
    payment?: InquiryPayment[];
}

export type BCA_VA = {
    sub_company_code?: string;
}

export type PERMATA_VA = {
    recipient_name?: string;
}

export type BankTransfer = {
    bank: "permata" | "bni" | "bri" | "bca";
    va_number?: string;
    free_text?: FreeText;
    bca?: BCA_VA;
    permata?: PERMATA_VA;
}

export type EChannel = {
    bill_info1?: string;
    bill_info2?: string;
    bill_info3?: string;
    bill_info4?: string;
    bill_info5?: string;
    bill_info6?: string;
    bill_info7?: string;
    bill_info8?: string;
    bill_key?: string;
}

export type VANumber = {
    bank: "bca" | "bni" | "bri" | "permata";
    va_number: string;
}

export type PaymentAmount = {
    paid_at?: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
    amount?: string; // Amount of payment in IDR.
}

export type BCAKlikPay = {
    description?: string;
    misc_fee?: number;
}

export type BCAKlikBCA = {
    description?: string;
    user_id?: string;
}

export type CIMBClicks = {
    description?: string;
}

export type ConvenienceStore = {
    store: "alfamart" | "indomaret" | string;
    message?: string;
    alfamart_free_text_1?: string;
    alfamart_free_text_2?: string;
    alfamart_free_text_3?: string;
}

export type Action = {
    name: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string;
    url: string;
    fields?: string[];
}

export type GoPay = {
    enable_callback?: boolean;
    callback_url?: string;
    account_id?: string;
    payment_option_token?: string;
    pre_auth?: boolean;
    reccuring?: boolean;
}

export type QRIS = {
    acquirer?: "gopay" | "airpay shopee" | string;
}

export type ShopeePay = {
    callback_url?: string;
}

export type SubscriptionSchedule = {
    interval: number;
    interval_unit: "month" | string;
    max_interval: number;
    current_interval: number;
    start_time: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
    previous_execution_at?: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
    next_execution_at?: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
}

export type CreateSubscription = {
    interval: number;
    interval_unit: "day" | "week" | "month" | string;
    max_interval: number;
    start_time: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
}

export type UpdateSubscription = {
    interval: number;
}

export type SubscriptionCustomerDetails = {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
}

export type SubscriptionGoPay = {
    account_id?: string;
}

export type CustomExpiry = {
    order_time?: string; // Timestamp of payment in ISO 8601 format. Time Zone: GMT+7.
    expiry_duration?: number;
    unit?: "second" | "minute" | "hour" | "day" | string;
}
export type PaymentType = "credit_card" | "bank_transfer" | "echannel" | "bca_klikpay" | "bca_klikbca" | "cimb_clicks" | "bri_epay" | "danamon_online" | "uob_ezpay" | "qris" | "gopay" | "shopeepay" | "cstore" | "akulaku" | "kredivo";

export type ChargeRequest = {
    payment_type: PaymentType;
    transaction_details: TransactionDetails;
    item_details?: ItemDetails[];
    customer_details?: CustomerDetails;
}

export type ChargeTransactionOnCard = ChargeRequest & {
    payment_type: "credit_card";
    credit_card: CreditCard;
}

export type BankTransferVA = ChargeRequest & {
    payment_type: "bank_transfer";
    bank_transfer: BankTransfer;
}

export type ChargeBankTransferPermataVA = BankTransferVA;
export type ChargeBankTransferBRI = BankTransferVA;
export type ChargeBankTransferBNI = BankTransferVA;
export type ChargeBankTransferBCA = BankTransferVA;

export type ChargeBankTransferMandiriBillPayment = ChargeRequest & {
    payment_type: "echannel";
    echannel: EChannel;
}

export type ChargeBankTransfer = ChargeBankTransferPermataVA | ChargeBankTransferBRI | ChargeBankTransferBNI | ChargeBankTransferBCA | ChargeBankTransferMandiriBillPayment;

export type ChargeInternetBankingBCAKlikpay = ChargeRequest & {
    payment_type: "bca_klikpay";
    bca_klikpay: BCAKlikPay;
}

export type ChargeInternetBankingBCAKlikBCA = ChargeRequest & {
    payment_type: "bca_klikbca";
    bca_klikbca: BCAKlikBCA;
}

export type ChargeInternetBankingCIMBClicks = ChargeRequest & {
    payment_type: "cimb_clicks";
    cimb_clicks: CIMBClicks;
}

export type ChargeInternetBankingBRImo = ChargeRequest & {
    payment_type: "bri_epay";
}

export type ChargeInternetBankingDanamonOnlineBanking = ChargeRequest & {
    payment_type: "danamon_online";
}

export type ChargeInternetBankingUOBEzPay = ChargeRequest & {
    payment_type: "uob_ezpay";
}

export type ChargeInternetBanking = ChargeInternetBankingBCAKlikpay | ChargeInternetBankingBCAKlikBCA | ChargeInternetBankingCIMBClicks | ChargeInternetBankingBRImo | ChargeInternetBankingDanamonOnlineBanking | ChargeInternetBankingUOBEzPay;

export type ChargeQRIS = ChargeRequest & {
    payment_type: "qris";
    qris: QRIS;
}

export type ChargeGoPay = ChargeRequest & {
    payment_type: "gopay";
    gopay: GoPay;
}

export type ChargeGoPayTokenization = {
    payment_type: "gopay";
    transaction_details: TransactionDetails;
    gopay: GoPay;
    callback_url?: string;
}

export type ChargeShopeePay = ChargeRequest & {
    payment_type: "shopeepay";
    shopeepay: ShopeePay;
}

export type ChargeEMoney = ChargeQRIS | ChargeGoPay | ChargeGoPayTokenization | ChargeShopeePay;

export type ChargeIndomaret = ChargeRequest & {
    payment_type: "cstore";
    cstore: ConvenienceStore;
}

export type ChargeAlfamart = ChargeIndomaret;

export type ChargeOverTheCounter = ChargeIndomaret | ChargeAlfamart;

export type ChargeAkulakuPayLater = ChargeRequest & {
    payment_type: "akulaku";
}

export type ChargeKredivo = ChargeRequest & {
    payment_type: "kredivo";
    seller_details?: SellerDetails;
    custom_expiry?: CustomExpiry;
}

export type ChargeCardlessCredit = ChargeAkulakuPayLater | ChargeKredivo;

export type  MidtransChargeResponse = {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    signature_key: string;
}

export type MidtransQRISChargeResponse = MidtransChargeResponse & {
    transaction_type: "on-us" | "off-us";
    issuer: string;
    actions: Action[];
    acquirer: string;
    merchant_id: string;
    currency: string;
}

export type PaymentStatusResponse = "capture" | "settlement" | "pending" | "deny" | "cancel" | "expire" | "refund" | "partial_refund" | "authorize" | PaymentStatus;